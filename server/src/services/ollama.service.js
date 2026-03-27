const env = require('../config/env');

const SYSTEM_PROMPT = `You are an expert perfume consultant at PerfStore. You help customers find the perfect fragrance based on their preferences, occasion, season, budget, and personality.

You have deep knowledge of fragrance families (floral, oriental, woody, fresh, gourmand, aromatic), notes composition (top, middle, base notes), longevity, sillage, and all major perfume houses.

Be warm, knowledgeable, and concise. When recommending perfumes, focus on:
- Understanding what the customer is looking for
- Suggesting specific fragrance families and notes that match their preferences
- Explaining why certain scents work for certain occasions or seasons
- Providing 2-3 specific recommendations when possible

Keep responses conversational and under 200 words unless the customer asks for detailed information.`;

async function* streamChat(messages) {
  const response = await fetch(`${env.OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: env.OLLAMA_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split('\n').filter(Boolean)) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.message?.content) {
          yield parsed.message.content;
        }
      } catch {
        // skip malformed lines
      }
    }
  }
}

async function checkHealth() {
  try {
    const response = await fetch(`${env.OLLAMA_URL}/api/tags`);
    return response.ok;
  } catch {
    return false;
  }
}

module.exports = { streamChat, checkHealth, SYSTEM_PROMPT };
