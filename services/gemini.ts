const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY!;

export const generateQuizFromText = async (documentText: string) => {
  const prompt = `You are an expert programming instructor.
From the following document text, generate a quiz JSON.
Requirements:
1. Detect the programming language discussed
2. Generate 10–15 multiple choice questions
3. Each question must have 4 choices
4. Provide the correct answer (0-3 index)
5. Assign difficulty: easy | medium | hard

Output ONLY valid JSON in this format:
{
  "language": "string",
  "questions": [
    {
      "question": "string",
      "choices": ["A", "B", "C", "D"],
      "correctIndex": number,
      "difficulty": "easy|medium|hard"
    }
  ]
}

Document Text:
${documentText}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const data = await response.json();
  const rawText = data.candidates[0].content.parts[0].text;
  
  // Strip markdown formatting if Gemini included it
  const jsonString = rawText.replace(/```json\n?|```/g, '').trim();
  return JSON.parse(jsonString);
};