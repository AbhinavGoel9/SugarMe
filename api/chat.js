export default async function handler(req, res) {
  // Allow cross-origin requests (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { messages } = req.body;
    
    // 1. Separate the system prompt from the conversation history
    let systemInstruction = "";
    const geminiContents = [];

    messages.forEach(msg => {
      if (msg.role === 'system') {
        systemInstruction = msg.content;
      } else if (msg.role === 'user') {
        geminiContents.push({
          role: 'user',
          parts: [{ text: msg.content }]
        });
      } else if (msg.role === 'assistant') {
        geminiContents.push({
          role: 'model',
          parts: [{ text: msg.content }]
        });
      }
    });

    // 2. Call the Gemini 1.5 Flash API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: geminiContents,
        
        // 3. SAFETY SETTINGS: Allows romantic, flirty, and suggestive roleplay
        // while still blocking illegal/harmful content required by law.
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ],
        
        // 4. Generation Config for creative, natural responses
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 150
        }
      })
    });
    
    const data = await response.json();
    
    // Handle API errors gracefully
    if (data.error) {
      console.error("Gemini API Error:", data.error);
      return res.status(500).json({ error: data.error.message });
    }
    
    // Extract the text from Gemini's response
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to respond to that.";
    
    // 5. Format the response to match OpenAI/OpenRouter format 
    // so your frontend code doesn't need to change at all!
    res.status(200).json({
      choices: [{ message: { content: aiText } }]
    });
    
  } catch(e) {
    console.error("Backend Fetch Error:", e);
    res.status(500).json({ error: e.message });
  }
}
