import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

//
// Enhanced API endpoints that use real APIs when available, fallback to mock
app.post('/api/generate-text', async (req, res) => {
  try {
    console.log('Text generation request:', req.body);
    
    const { prompt, model = 'gpt-4' } = req.body;
    
    // Try real API first if key is available
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
      try {
        console.log('Using real OpenAI API...');
        
        // Add timeout to the fetch call
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [{
              role: 'user',
              content: `${prompt}

Please respond with ONLY a valid JSON object containing "headline" and "caption" fields. No other text or formatting.

The headline should be catchy, under 10 words, and include an appropriate emoji.
The caption should be engaging, under 50 words, and describe the product benefits.

Example format:
{"headline": "🎉 Amazing Product Name!", "caption": "Experience incredible benefits with this revolutionary product that changes everything."}`
            }],
            temperature: 0.7,
            max_tokens: 200
          })
        });
        
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const content = data.choices[0].message.content.trim();
          
          try {
            const parsed = JSON.parse(content);
            return res.json(parsed);
          } catch (parseError) {
            console.log('Failed to parse JSON, extracting text...');
            // Fallback to text extraction
            const lines = content.split('\n').filter(line => line.trim());
            return res.json({
              headline: lines[0]?.replace(/^[^a-zA-Z0-9emoji]*/, '') || 'Generated Headline',
              caption: lines[1]?.replace(/^[^a-zA-Z0-9]*/, '') || 'Generated caption content.'
            });
          }
        }
      } catch (apiError) {
        console.log('OpenAI API failed, using mock response:', apiError.message);
        // Continue to fallback mock response
      }
    }
    
    // Fallback to mock responses
    console.log('Using mock text generation...');
    await new Promise(resolve => setTimeout(resolve, 500)); // Reduced delay for testing
    
    const tone = prompt.includes('playful') ? 'playful' : 
                 prompt.includes('serious') ? 'serious' : 'bold';
    
    // Enhanced mock responses based on tone
    const mockResponses = {
      playful: {
        headline: `🎉 Fun & Exciting ${prompt.split('"')[1] || 'Product'}!`,
        caption: `Get ready for an amazing experience with our playful approach to ${prompt.split('"')[1] || 'innovation'}. It's going to be awesome and bring joy to your daily routine!`
      },
      serious: {
        headline: `💼 Professional ${prompt.split('"')[1] || 'Solution'} for Business`,
        caption: `Our reliable and professional ${prompt.split('"')[1] || 'product'} delivers exceptional value for serious professionals who demand quality and results.`
      },
      bold: {
        headline: `⚡ Revolutionary ${prompt.split('"')[1] || 'Innovation'} Unleashed`,
        caption: `Break boundaries with our bold and powerful ${prompt.split('"')[1] || 'solution'} that changes everything. Experience the future today.`
      }
    };
    
    res.json(mockResponses[tone] || mockResponses.bold);
  } catch (error) {
    console.error('Text generation error:', error);
    res.status(500).json({ error: 'Text generation failed', message: error.message });
  }
});

// Simplified image generation with concept matching
app.post('/api/generate-image', async (req, res) => {
  try {
    console.log('Image generation request:', req.body);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000)); // Reduced from 4 seconds
    
    const { prompt = '', tone = 'playful' } = req.body;
    const keywords = prompt.toLowerCase();
    
    // Simplified concept-based image mapping
    let selectedImage;
    
    if (keywords.includes('coffee')) {
      const coffeeImages = {
        playful: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
        serious: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80',
        bold: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'
      };
      selectedImage = coffeeImages[tone] || coffeeImages.playful;
    } else if (keywords.includes('tech') || keywords.includes('app')) {
      const techImages = {
        playful: 'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?auto=format&fit=crop&w=800&q=80',
        serious: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80',
        bold: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=800&q=80'
      };
      selectedImage = techImages[tone] || techImages.serious;
    } else if (keywords.includes('food')) {
      const foodImages = {
        playful: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=800&q=80',
        serious: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
        bold: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80'
      };
      selectedImage = foodImages[tone] || foodImages.playful;
    } else {
      // Default tone-based images
      const fallbackImages = {
        playful: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=800&q=80',
        serious: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80',
        bold: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=800&q=80'
      };
      selectedImage = fallbackImages[tone] || fallbackImages.playful;
    }
    
    console.log(`Selected image for "${prompt}" with tone "${tone}": ${selectedImage}`);
    
    res.json({
      imageURL: selectedImage,
      revisedPrompt: `${tone} style ${prompt} - contextually matched`
    });
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ error: 'Image generation failed', message: error.message });
  }
});

// Fixed audio generation with working data URLs
app.post('/api/generate-audio', async (req, res) => {
  try {
    console.log('Audio generation request:', req.body);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500)); // Reduced from 3 seconds
    
    const { text = '', tone = 'playful' } = req.body;
    
    // Create actual working audio data URLs with different tones
    const createAudioDataUrl = (tone) => {
      // Simple beep audio data for different tones - this actually works
      const audioData = {
        playful: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D2u2opBSuEyvLOdCcFJXjF8N2QQAoUXrPn66hVFApGn+D2u2opBSuEyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcF',
        serious: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D2u2opBSuEyvLOdCcFJXjF8N2QQAoUXrPn66hVFApGn+D2u2opBSuEyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcF',
        bold: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D2u2opBSuEyvLOdCcFJXjF8N2QQAoUXrPn66hVFApGn+D2u2opBSuEyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcF'
      };
      return audioData[tone] || audioData.playful;
    };
    
    const audioDescription = {
      playful: `🎵 Cheerful TTS: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
      serious: `🎙️ Professional narration: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
      bold: `⚡ Dynamic voiceover: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`
    };
    
    console.log(`Generated ${tone} audio for text: ${text.substring(0, 30)}...`);
    
    res.json({
      audioURL: createAudioDataUrl(tone),
      audioDescription: audioDescription[tone] || audioDescription.playful,
      duration: Math.max(2, Math.floor(text.split(' ').length * 0.3)), // Minimum 2 seconds
      format: 'wav',
      tone: tone,
      message: `Demo ${tone} audio generated successfully`
    });
  } catch (error) {
    console.error('Audio generation error:', error);
    res.status(500).json({ error: 'Audio generation failed', message: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mock API server is running' });
});

// Serve static files (for mock audio files)
app.use('/static', express.static(join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`🚀 Mock API server running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   POST /api/generate-text`);
  console.log(`   POST /api/generate-image`);
  console.log(`   POST /api/generate-audio`);
  console.log(`   GET  /health`);
});
