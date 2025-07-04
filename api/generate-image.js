// Stable Diffusion XL API integration for image generation
// This API route handles image generation with tone-aware prompts using Hugging Face Inference API

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, tone = 'playful', style = 'product' } = req.body;

    
    // Get Hugging Face API key from environment
    const HF_API_KEY = process.env.HUGGING_FACE_API_KEY;
    if (!HF_API_KEY || HF_API_KEY === 'your_hugging_face_api_key_here') {
      console.log('⚠️ Hugging Face API key not configured, using fallback');
      return res.status(200).json({
        imageURL: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=512&h=512&fit=crop',
        fallback: true,
        message: 'Using placeholder image - configure HUGGING_FACE_API_KEY for AI generation'
      });
    }

    // Create tone-aware image style prompts
    const toneStyles = {
      playful: {
        styleModifiers: "bright vibrant colors, fun cartoon-like style, cheerful and energetic, playful design elements, pop art inspired",
        lighting: "bright natural lighting, cheerful atmosphere",
        mood: "joyful, fun, energetic"
      },
      serious: {
        styleModifiers: "professional minimalist design, clean lines, sophisticated color palette, modern business style",
        lighting: "soft professional lighting, clean studio setup",
        mood: "professional, trustworthy, elegant"
      },
      bold: {
        styleModifiers: "dynamic high-contrast colors, striking bold design, dramatic composition, powerful visual impact",
        lighting: "dramatic lighting, strong shadows and highlights",
        mood: "powerful, confident, impactful"
      }
    };

    const selectedStyle = toneStyles[tone] || toneStyles.playful;

    // Create enhanced product image prompt
    const enhancedPrompt = `A high-quality product photograph of ${prompt}, ${selectedStyle.styleModifiers}, ${selectedStyle.lighting}, ${selectedStyle.mood} mood, product photography, commercial quality, detailed textures, sharp focus, professional composition, 4k resolution, studio lighting setup`;

    // Add negative prompts to improve quality
    const negativePrompt = "blurry, low quality, distorted, text, watermark, signature, bad anatomy, poorly drawn, amateur photography, dark shadows, overexposed";

    console.log('🎨 Generating image with Stable Diffusion XL...');
    console.log('📝 Enhanced prompt:', enhancedPrompt);
    console.log('🎭 Tone style:', tone);

    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout

    try {
      // Call Hugging Face Stable Diffusion XL API
      const response = await fetch(
        'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: enhancedPrompt,
            parameters: {
              negative_prompt: negativePrompt,
              num_inference_steps: 25, // Reduced for faster generation
              guidance_scale: 7.5,
              width: 1024,
              height: 1024,
              scheduler: "DPMSolverMultistepScheduler"
            },
            options: {
              wait_for_model: true,
              use_cache: false
            }
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🚨 Hugging Face API error:', response.status, errorText);
        
        // Check if model is loading
        if (response.status === 503) {
          return res.status(200).json({
            imageURL: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1024&h=1024&fit=crop',
            fallback: true,
            message: 'AI model is loading, using placeholder. Try again in a few moments.',
            modelLoading: true
          });
        }
        
        throw new Error(`Hugging Face API request failed: ${response.statusText}`);
      }

      // Get the generated image as blob
      const imageBlob = await response.blob();
    
    // Convert blob to base64 data URL for easy frontend handling
    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const imageDataURL = `data:image/jpeg;base64,${base64}`;

    console.log('✅ Image generated successfully');
    console.log('📏 Image size:', (base64.length * 0.75 / 1024).toFixed(1), 'KB');

    return res.status(200).json({
      imageURL: imageDataURL,
      prompt: enhancedPrompt,
      tone: tone,
      style: selectedStyle,
      metadata: {
        model: 'stable-diffusion-xl-base-1.0',
        size: '1024x1024',
        steps: 25,
        guidance: 7.5
      }
    });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('🚨 Hugging Face fetch error:', fetchError);
      
      // Handle specific timeout errors
      if (fetchError.name === 'AbortError') {
        console.log('⏰ Request timed out - model may be loading');
        throw new Error('Image generation timed out - please try again');
      }
      
      throw fetchError;
    }

  } catch (error) {
    console.error('🚨 Image generation error:', error);
    
    // Provide tone-appropriate fallback images from Unsplash
    const fallbackImages = {
      playful: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1024&h=1024&fit=crop',
      serious: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1024&h=1024&fit=crop',
      bold: 'https://images.unsplash.com/photo-1541807084-5bf52138f0d6?w=1024&h=1024&fit=crop'
    };

    return res.status(200).json({
      imageURL: fallbackImages[tone] || fallbackImages.playful,
      fallback: true,
      error: error.message,
      message: 'Using fallback image due to generation error'
    });
  }
}
