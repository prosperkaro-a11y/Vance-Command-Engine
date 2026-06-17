// pages/api/chat.js
import { Anthropic } from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, system, webSearchQuery } = req.body;

  let finalSystem = system || 'You are VANCE, a helpful assistant.';

  if (webSearchQuery && process.env.SERPAPI_KEY) {
    try {
      const serpResults = await performSerpSearch(webSearchQuery);
      if (serpResults) {
        finalSystem += `\n\nWeb search results for "${webSearchQuery}":\n${serpResults}`;
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: finalSystem,
      messages: messages.slice(-20),
    });

    const reply = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');

    res.status(200).json({ reply });
  } catch (error) {
    console.error('Anthropic error:', error);
    res.status(500).json({ error: error.message || 'AI service unavailable' });
  }
}

async function performSerpSearch(query) {
  if (!process.env.SERPAPI_KEY) return null;
  const url = `https://serpapi.com/search?q=${encodeURIComponent(query)}&api_key=${process.env.SERPAPI_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  const snippets = data.organic_results?.slice(0, 5).map(r => r.snippet).filter(Boolean) || [];
  return snippets.join('\n');
}
