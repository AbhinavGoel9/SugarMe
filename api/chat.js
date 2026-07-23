export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    // Changed to OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://sugarme-seven.vercel.app", // Required by OpenRouter
        "X-Title": "SugarMe" // Required by OpenRouter
      },
      body: JSON.stringify(req.body)
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
