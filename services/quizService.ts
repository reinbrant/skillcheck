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

  async submitAttempt(quizId: string, userId: string, score: number) {
    const { error } = await supabase
      .from('quiz_attempts')
      .insert({ quiz_id: quizId, user_id: userId, score });
      
    if (error) throw error;
  },

  async getLeaderboard(quizId: string) {
    const { data: rawScores, error: rawErr } = await supabase
        .from('quiz_attempts')
        .select(`score, user_id, auth.users!inner(raw_user_meta_data)`)
        .eq('quiz_id', quizId)
        .order('score', { ascending: false })
        .limit(20);

    if (rawErr) throw rawErr;
    return rawScores;
  }
};