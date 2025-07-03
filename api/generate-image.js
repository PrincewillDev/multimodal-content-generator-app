// Example API route for image generation
// This would typically be in your backend (Express.js, Next.js API routes, etc.)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, model = 'dall-e-3', size = '1024x1024', quality = 'standard' } = req.body;

    // Example integration with OpenAI DALL-E 3
    if (model === 'dall-e-3') {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // Set in .env
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: size,
          quality: quality,
          response_format: 'url'
        })
      });

      const data = await response.json();
      
      if (data.data && data.data[0] && data.data[0].url) {
        return res.status(200).json({
          imageURL: data.data[0].url,
          revisedPrompt: data.data[0].revised_prompt
        });
      }
    }

    // Example integration with Stability AI (Stable Diffusion)
    if (model === 'stable-diffusion') {
      const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`, // Set in .env
        },
        body: JSON.stringify({
          text_prompts: [{
            text: prompt,
            weight: 1
          }],
          cfg_scale: 7,
          width: 1024,
          height: 1024,
          samples: 1,
          steps: 30
        })
      });

      const data = await response.json();
      
      if (data.artifacts && data.artifacts[0]) {
        // Convert base64 to URL (you'd typically upload to cloud storage)
        const base64Image = data.artifacts[0].base64;
        const imageURL = `data:image/png;base64,${base64Image}`;
        
        return res.status(200).json({
          imageURL: imageURL
        });
      }
    }

    return res.status(400).json({ error: 'Unsupported model or generation failed' });

  } catch (error) {
    console.error('Image generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate image',
      message: error.message 
    });
  }
}
