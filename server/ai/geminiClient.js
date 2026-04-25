const DEFAULT_REASON_FALLBACK =
  "Your recent vibe and budget suggest this is the smartest tasty pick right now.";

function buildFortunePrompt({ mood, city, dish, budget, diet, healthGoal }) {
  return [
    "You are a witty food assistant. Write one short line (max 18 words).",
    "Tone: fun, warm, mildly playful, no sarcasm.",
    `Mood: ${mood}`,
    `City: ${city}`,
    `Recommended dish: ${dish}`,
    `Budget INR: ${budget}`,
    `Diet: ${diet}`,
    `Health goal: ${healthGoal}`,
    "Output only the single sentence."
  ].join("\n");
}

function extractText(payload) {
  const candidate = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  return candidate ? String(candidate).trim() : "";
}

export function createGeminiClient(config) {
  const apiKey = config.gemini.apiKey;
  const model = config.gemini.model;
  const baseUrl = config.gemini.baseUrl;

  if (!apiKey) {
    return {
      enabled: false,
      async generateFortuneReason() {
        return DEFAULT_REASON_FALLBACK;
      }
    };
  }

  return {
    enabled: true,
    async generateFortuneReason(context) {
      try {
        const prompt = buildFortunePrompt(context);
        const endpoint = `${baseUrl}/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }]
              }
            ]
          })
        });

        if (!response.ok) {
          return DEFAULT_REASON_FALLBACK;
        }

        const payload = await response.json();
        return extractText(payload) || DEFAULT_REASON_FALLBACK;
      } catch {
        return DEFAULT_REASON_FALLBACK;
      }
    }
  };
}

