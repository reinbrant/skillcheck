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
    // 1. Explicitly check if they have a row already
    const { data: existing, error: fetchError } = await supabase
        .from('quiz_attempts')
        .select('id, score, completed_difficulties') // Grab the exact ID of the row
        .eq('quiz_id', quizId)
        .eq('user_id', userId)
        .maybeSingle();

    if (fetchError) throw fetchError;

    if (existing) {
        // 2. They exist! Calculate new totals and explicitly UPDATE
        const newTotalScore = (existing.score || 0) + sessionScore;
        const difficulties = existing.completed_difficulties ? [...existing.completed_difficulties] : [];
        
        if (!difficulties.includes(difficulty)) {
            difficulties.push(difficulty);
        }

        const { error: updateError } = await supabase
            .from('quiz_attempts')
            .update({
                score: newTotalScore,
                completed_difficulties: difficulties,
                updated_at: new Date().toISOString()
            })
            .eq('id', existing.id); // Safe, exact update using the row ID

        if (updateError) throw updateError;

    } else {
        // 3. They don't exist yet! Explicitly INSERT
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
};