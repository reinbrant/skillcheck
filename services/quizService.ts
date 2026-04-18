import { supabase } from './supabase';
import { generateQuizFromText } from './gemini';

export const quizService = {
  async uploadAndProcessDocument(uri: string, fileName: string, userId: string) {
    // 1. Prepare File Path & Type
    const ext = fileName.split('.').pop()?.toLowerCase();
    const filePath = `${userId}/${Date.now()}.${ext}`;
    const contentType = ext === 'pdf' ? 'application/pdf' 
                      : ext === 'txt' ? 'text/plain' 
                      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    // 2. Native fetch to convert the local URI into raw binary data
    // This completely bypasses base64 memory crashes and the Expo file system
    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();

    // 3. Upload raw ArrayBuffer to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, arrayBuffer, {
          contentType: contentType,
      });

    if (uploadError) throw uploadError;

    // 4. Trigger Edge Function to extract text
    const { data: extracted, error: funcError } = await supabase.functions.invoke('parse-document', {
      body: { filePath: uploadData.path },
    });

    if (funcError) throw funcError;
    
    if (!extracted?.text) {
        throw new Error("Failed to extract text. The file might be empty or unreadable.");
    }

    // 5. Generate Quiz JSON via Gemini
    const quizJson = await generateQuizFromText(extracted.text);

    // 6. Store in Database
    const { data: quizData, error: dbError } = await supabase
      .from('quizzes')
      .insert({
        owner_id: userId,
        language: quizJson.language,
        quiz_json: quizJson,
      })
      .select('id')
      .single();

    if (dbError) throw dbError;

    // 7. Return shareable link
    return `myapp://quiz/${quizData.id}`;
  },

  async fetchQuiz(quizId: string) {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();
      
    if (error) throw error;
    return data;
  },

  // Note: We added the 'difficulty' parameter here!
  async submitAttempt(quizId: string, userId: string, sessionScore: number, difficulty: string) {
    // ---------------------------------------------------------
    // 1. Handle Quiz Attempts (Leaderboard & Quiz Completion)
    // ---------------------------------------------------------
    const { data: existing, error: fetchError } = await supabase
        .from('quiz_attempts')
        .select('id, score, completed_difficulties')
        .eq('quiz_id', quizId)
        .eq('user_id', userId)
        .maybeSingle();

    if (fetchError) throw fetchError;

    if (existing) {
        const newTotalScore = (existing.score || 0) + sessionScore;
        const difficulties = existing.completed_difficulties ? [...existing.completed_difficulties] : [];
        if (!difficulties.includes(difficulty)) difficulties.push(difficulty);

        const { error: updateError } = await supabase
            .from('quiz_attempts')
            .update({
                score: newTotalScore,
                completed_difficulties: difficulties,
                updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);

        if (updateError) throw updateError;
    } else {
        const { error: insertError } = await supabase
            .from('quiz_attempts')
            .insert({
                quiz_id: quizId,
                user_id: userId,
                score: sessionScore,
                completed_difficulties: [difficulty]
            });

        if (insertError) throw insertError;
    }

    // ---------------------------------------------------------
    // 2. Handle User Progression (EXP, Level Ups, and Stats)
    // ---------------------------------------------------------
    
    // Step A: We need the quiz language to track language mastery
    const { data: quizData } = await supabase
        .from('quizzes')
        .select('language')
        .eq('id', quizId)
        .single();
        
    const language = quizData?.language || "Unknown";

    // Step B: Fetch the user's current profile data
    const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('exp, level, stats')
        .eq('id', userId)
        .single();

    if (profileErr) throw profileErr;

    // Step C: Calculate Level Ups
    let currentExp = (profile.exp || 0) + sessionScore;
    let currentLevel = profile.level || 1;
    let expNeededToLevelUp = currentLevel * 100; // Matches your UI logic!

    // If they gained enough EXP to level up (even multiple times)
    while (currentExp >= expNeededToLevelUp) {
        currentExp -= expNeededToLevelUp; // Carry over the remainder
        currentLevel += 1;
        expNeededToLevelUp = currentLevel * 100; // Calculate requirement for next level
    }

    // Step D: Update the complex JSONB Stats object
    // Provide safe fallbacks just in case the DB has nulls
    const stats = profile.stats || { 
        languages: {}, 
        weeklyActivity: { sessions: 0, expGained: 0, exercisesFinished: 0 }, 
        achievements: [] 
    };

    // --- NEW: WEEKLY RESET LOGIC ---
    const now = new Date();
    // If they have never played before, pretend their last activity was in 1970
    const lastActivityStr = stats.weeklyActivity.lastActivityDate;
    const lastActivity = lastActivityStr ? new Date(lastActivityStr) : new Date(0);

    // Helper function to find the "Monday" of a given date
    const getMonday = (d: Date) => {
        const date = new Date(d);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sundays
        date.setDate(diff);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
    };

    // If the Monday of this week is newer than the Monday of their last activity, RESET!
    if (getMonday(now) > getMonday(lastActivity)) {
        stats.weeklyActivity.sessions = 0;
        stats.weeklyActivity.expGained = 0;
        stats.weeklyActivity.exercisesFinished = 0;
    }

    // Now, add the current session's data
    stats.weeklyActivity.sessions += 1;
    stats.weeklyActivity.expGained += sessionScore;
    stats.weeklyActivity.exercisesFinished += 1;
    stats.weeklyActivity.lastActivityDate = now.toISOString(); // Stamp it for next time!

    // Update Language Mastery (Flat +10% mastery per completion, capped at 100%)
    const currentLangProgress = stats.languages[language] || 0;
    stats.languages[language] = Math.min(currentLangProgress + 10, 100);

    // Step E: Save it all back to the profiles table
    const { error: profileUpdateErr } = await supabase
        .from('profiles')
        .update({
            exp: currentExp,
            level: currentLevel,
            stats: stats
        })
        .eq('id', userId);

    if (profileUpdateErr) throw profileUpdateErr;
  },
  
  async getLeaderboard(quizId: string) {
    const { data: rawScores, error: rawErr } = await supabase
        .from('quiz_attempts')
        .select(`score, user_id, profiles!inner(username)`) 
        .eq('quiz_id', quizId)
        .order('score', { ascending: false })
        .limit(20);

    if (rawErr) throw rawErr;
    return rawScores;
  },

  // 1. Generates the deep link string
  getShareableLink(quizId: string) {
    // This creates a link like: skillcheck://quiz/12345...
    return `skillcheck://quiz/${quizId}`;
  },

  // 2. Clones a shared quiz into the current user's account
  async importSharedQuiz(sharedQuizId: string, currentUserId: string) {
    // Fetch the original quiz
    const { data: originalQuiz, error: fetchErr } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', sharedQuizId)
        .single();

    if (fetchErr) throw new Error("Could not find that shared quiz.");
    if (originalQuiz.owner_id === currentUserId) return originalQuiz.id; // Already owns it!

    // Clone it by removing the specific IDs and swapping the owner
    const newQuiz = {
        owner_id: currentUserId,
        language: originalQuiz.language,
        quiz_json: originalQuiz.quiz_json,
        // Let updated_at and created_at default themselves
    };

    const { data: insertedQuiz, error: insertErr } = await supabase
        .from('quizzes')
        .insert(newQuiz)
        .select('id')
        .single();

    if (insertErr) throw insertErr;
    return insertedQuiz.id; // Return the NEW cloned ID
  },

  async deleteQuiz(quizId: string) {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId);

    if (error) throw error;
  }
};