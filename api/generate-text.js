// Groq API integration for text generation
// This API route handles text generation with tone-aware prompting using Groq

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, tone, temperature = 0.7 } = req.body;
    
    // Get Groq API key from environment
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is required');
    }

    // Create tone-aware system prompts
    const tonePrompts = {
      playful: {
        systemPrompt: "You are a creative, fun-loving marketing expert who writes in an engaging, playful style. Use emojis, casual language, and exciting energy. Make everything sound fun and approachable.",
        style: "playful, energetic, and fun with emojis"
      },
      serious: {
        systemPrompt: "You are a professional marketing strategist who writes authoritative, trustworthy content. Focus on credibility, benefits, and professional language. Be confident but not overly casual.",
        style: "professional, authoritative, and credible"
      },
      bold: {
        systemPrompt: "You are a bold, confident marketing expert who writes powerful, action-oriented content. Use strong language, make confident claims, and create urgency. Be impactful and direct.",
        style: "bold, confident, and action-oriented"
      }
    };

    const selectedTone = tonePrompts[tone] || tonePrompts.playful;
    
    // Construct messages for Groq API (OpenAI-compatible format)
    const messages = [
      {
        role: "system",
        content: `${selectedTone.systemPrompt}

Your task: Create marketing content for the given product/idea. You must respond with EXACTLY this JSON format:
{
  "headline": "A catchy headline (10-15 words max)",
  "caption": "An engaging caption (2-3 sentences, 30-50 words)"
}

Make the content ${selectedTone.style}. Do not include any other text outside the JSON.`
      },
      {
        role: "user",
        content: `Create marketing content for: ${prompt}`
      }
    ];

    // Call Groq API (OpenAI-compatible endpoint)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: messages,
        temperature: temperature,
        max_tokens: 300,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      throw new Error(`Groq API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle Groq API response format (OpenAI-compatible)
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Unexpected response format from Groq API');
    }

    const generatedContent = data.choices[0].message.content;

    // Try to parse JSON response directly
    try {
      const parsed = JSON.parse(generatedContent);
      if (parsed.headline && parsed.caption) {
        return res.status(200).json({
          headline: parsed.headline,
          caption: parsed.caption
        });
      }
    } catch (parseError) {
      console.log('JSON parsing failed, attempting fallback extraction');
    }

    // Fallback: extract content using patterns
    let headline = '';
    let caption = '';

    // Try to find JSON-like content in the response
    const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        headline = parsed.headline || '';
        caption = parsed.caption || '';
      } catch (e) {
        console.log('Fallback JSON parsing also failed');
      }
    }

    // If JSON extraction failed, use line-based extraction
    if (!headline || !caption) {
      const lines = generatedContent.split('\n').filter(line => line.trim());
      
      // Look for headline and caption patterns
      for (const line of lines) {
        if (line.toLowerCase().includes('headline') && !headline) {
          headline = line.replace(/.*headline[":]\s*/i, '').replace(/[",]/g, '').trim();
        }
        if (line.toLowerCase().includes('caption') && !caption) {
          caption = line.replace(/.*caption[":]\s*/i, '').replace(/[",]/g, '').trim();
        }
      }
      
      // Final fallback
      if (!headline) {
        headline = `${tone.charAt(0).toUpperCase() + tone.slice(1)} ${prompt}`;
      }
      if (!caption) {
        caption = `Experience the ${tone} innovation of ${prompt}.`;
      }
    }

    return res.status(200).json({
      headline: headline,
      caption: caption
    });

  } catch (error) {
    console.error('Text generation error:', error);
    
    // Enhanced fallback content based on tone
    const { prompt, tone } = req.body;
    const fallbacks = {
      playful: {
        headline: `🎉 Amazing ${prompt} Just Dropped!`,
        caption: `Get ready for the most fun ${prompt} experience ever! 🚀 This is going to change everything!`
      },
      serious: {
        headline: `Professional ${prompt} Solution`,
        caption: `Discover the reliable, industry-leading ${prompt} that delivers proven results for your business.`
      },
      bold: {
        headline: `Revolutionary ${prompt} Changes Everything`,
        caption: `The most powerful ${prompt} solution available. Don't settle for less—demand excellence.`
      }
    };

    const fallback = fallbacks[tone] || fallbacks.playful;
    
    return res.status(200).json({
      headline: fallback.headline,
      caption: fallback.caption,
      fallback: true
    });
  }

}
