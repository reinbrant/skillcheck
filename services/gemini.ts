const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY!;

export const generateQuizFromText = async (documentText: string) => {
  const prompt = `You are an expert programming instructor and technical assessment designer. 
Your task is to analyze the provided document text and generate a comprehensive multiple-choice quiz.

### STRICT INSTRUCTIONS:
1. Detect the primary programming language or technology discussed.
2. Generate between 10 to 15 questions based STRICTLY on the concepts found in the text. If the text is too short to yield 10 questions, generate as many high-quality questions as the text supports.
3. Every question must have exactly 4 choices.
4. Distractors (wrong answers) must be highly plausible and test common misconceptions. Avoid obvious throwaway answers or relying on "All of the above".
5. Provide the correct answer using a 0-based index (0, 1, 2, or 3).
6. Assign a difficulty level ("basic", "beginner", "intermediate", or "advanced") based on the complexity of the concept. Generate roughly an equal amount of questions for each difficulty.
### EDGE CASES:
- If the document is NOT about programming, technology, or computer science, return exactly this: { "language": "None", "questions": [] }
- If the document is completely empty or unintelligible, return exactly this: { "language": "None", "questions": [] }

### OUTPUT FORMAT:
You must output ONLY valid, minified JSON. Do NOT wrap the output in markdown code blocks (e.g., do not use \`\`\`json). Do not include any explanations, greetings, or conversational text. 

Use this exact schema:
{
  "language": "string",
  "questions": [
    {
      "question": "string",
      "choices": ["string", "string", "string", "string"],
      "correctIndex": number,
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