export default async function handler(req, res) {
  // Allow cross-origin requests (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    // Call OpenRouter instead of Groq
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // This securely grabs the key from Vercel Environment Variables
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        // OpenRouter requires these two headers for free/cheap tiers:
        "HTTP-Referer": "https://sugarme-seven.vercel.app", 
        "X-Title": "SugarMe" 
      },
      body: JSON.stringify(req.body) // Passes the message from the frontend
    });
    
    const data = await response.json();
    
    // Check if OpenRouter returned an error
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }
    
    res.status(200).json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
