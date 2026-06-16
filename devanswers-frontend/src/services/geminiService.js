const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent';
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const geminiHeaders = {
  'Content-Type': 'application/json',
  'x-goog-api-key': API_KEY,
};

async function callGemini(prompt) {
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: geminiHeaders,
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

export async function improveQuestion(title, description, tags) {
  const prompt = `You are a developer community expert helping improve Stack Overflow-style questions.
Improve the following question's title, description, and tags to make them clearer, more specific, and easier to answer.
Return ONLY a valid JSON object — no markdown, no code blocks, no extra text.

Title: ${title}
Description: ${description}
Tags: ${tags}

Return JSON in exactly this format:
{"title": "improved title here", "description": "improved description here", "tags": "tag1, tag2, tag3"}`;

  const text = await callGemini(prompt);
  // Strip any accidental markdown fences before parsing
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

export async function summarizeAnswers(questionTitle, questionDescription, answers) {
  const answerTexts = answers
    .map((a, i) => `Answer ${i + 1}: ${a.answerText}`)
    .join('\n\n');

  const prompt = `You are a developer community expert. Summarize the following answers to a programming question in 3 to 5 concise plain-text sentences. Focus on the key solutions and any consensus between answers. Do not use markdown, bullet points, or headers — plain text only.

Question title: ${questionTitle}
Question description: ${questionDescription}

${answerTexts}`;

  const text = await callGemini(prompt);
  return text.trim();
}
