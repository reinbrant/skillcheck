const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY!;

export const generateQuizFromText = async (documentText: string) => {
  const prompt = `You are an expert programming instructor and technical assessment designer. 
Your task is to analyze the provided document text and generate a comprehensive assessment.

### STRICT INSTRUCTIONS:
1. Detect the primary programming language or technology discussed.
2. Generate between 10 to 15 questions based STRICTLY on the concepts found in the text. 
3. Include a mix of "multiple-choice" and "fill-in-the-blank" questions.
4. For multiple-choice: Provide exactly 4 choices and a 0-based correctIndex. Distractors must be highly plausible.
5. For fill-in-the-blank: Use "___" to represent the blank in the question. The correctAnswer MUST be a single, specific word or short phrase.
6. Assign a difficulty level ("basic", "beginner", "intermediate", or "advanced"). Generate roughly an equal amount for each difficulty.

### EDGE CASES:
- If the document is NOT about programming, technology, or computer science, return exactly this: { "language": "None", "questions": [] }
- If the document is completely empty or unintelligible, return exactly this: { "language": "None", "questions": [] }

### OUTPUT FORMAT:
You must output ONLY valid, minified JSON. Do NOT wrap the output in markdown code blocks. 
Use this exact schema (mixing the objects in the questions array as needed):
{
  "language": "string",
  "questions": [
    {
      "type": "multiple-choice",
      "question": "string",
      "choices": ["string", "string", "string", "string"],
      "correctIndex": number,
      "difficulty": "basic|beginner|intermediate|advanced"
    },
    {
      "type": "fill-in-the-blank",
      "question": "string",
      "correctAnswer": "string",
      "difficulty": "basic|beginner|intermediate|advanced"
    }
  ]
}

Document Text:
${documentText}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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