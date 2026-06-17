// pages/api/chat.js - Simplified version for testing
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For testing - return a simple response
    res.status(200).json({ 
      reply: "VANCE is ready! (Testing mode - API key not configured yet)" 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
