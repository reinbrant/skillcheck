import { supabase } from './supabase';
import { generateQuizFromText } from './gemini';

export const quizService = {
  async uploadAndProcessDocument(uri: string, fileName: string, userId: string) {
    // 1. Upload to Storage
    const ext = fileName.split('.').pop();
    const filePath = `${userId}/${Date.now()}.${ext}`;
    
    const formData = new FormData();
    formData.append('file', { uri, name: fileName, type: `application/${ext}` } as any);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, formData);

    if (uploadError) throw uploadError;

    // 2. Trigger Edge Function to extract text
    const { data: extracted, error: funcError } = await supabase.functions.invoke('parse-document', {
      body: { filePath: uploadData.path },
    });

    if (funcError) throw funcError;

    // 3. Generate Quiz JSON via Gemini
    const quizJson = await generateQuizFromText(extracted.text);

    // 4. Store in Database
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

    // 5. Return shareable link
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
    const { data, error } = await supabase
      .rpc('get_quiz_leaderboard', { p_quiz_id: quizId }); 
      // Note: Alternative is standard select query with grouping, but Supabase standardizes top scores better via an RPC function or a view. For brevity, assuming direct fetch or view.
      // Doing standard query using JS formatting if View isn't available:
    
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