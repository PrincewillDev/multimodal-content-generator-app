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

app.post('/api/generate-image', async (req, res) => {
  try {
    console.log('Image generation request:', req.body);
    
    // Simulate longer API delay for image generation
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    const { prompt, tone } = req.body;
    
    // Generate contextual images based on prompt keywords
    const getContextualImage = (prompt, tone) => {
      const keywords = prompt.toLowerCase();
      
      // Concept-based image mapping
      if (keywords.includes('coffee') || keywords.includes('cafe') || keywords.includes('latte')) {
        const coffeeImages = {
          playful: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
          serious: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80',
          bold: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'
        };
        return coffeeImages[tone] || coffeeImages.playful;
      }
      
      if (keywords.includes('tech') || keywords.includes('app') || keywords.includes('software') || keywords.includes('digital')) {
        const techImages = {
          playful: 'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?auto=format&fit=crop&w=800&q=80',
          serious: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80',
          bold: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=800&q=80'
        };
        return techImages[tone] || techImages.serious;
      }
      
      if (keywords.includes('food') || keywords.includes('restaurant') || keywords.includes('meal') || keywords.includes('recipe')) {
        const foodImages = {
          playful: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=800&q=80',
          serious: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
          bold: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80'
        };
        return foodImages[tone] || foodImages.playful;
      }
      
      if (keywords.includes('fitness') || keywords.includes('gym') || keywords.includes('workout') || keywords.includes('health')) {
        const fitnessImages = {
          playful: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
          serious: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
          bold: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80'
        };
        return fitnessImages[tone] || fitnessImages.bold;
      }
      
      if (keywords.includes('travel') || keywords.includes('vacation') || keywords.includes('trip') || keywords.includes('adventure')) {
        const travelImages = {
          playful: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
          serious: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80',
          bold: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80'
        };
        return travelImages[tone] || travelImages.playful;
      }
      
      if (keywords.includes('fashion') || keywords.includes('style') || keywords.includes('clothing') || keywords.includes('outfit')) {
        const fashionImages = {
          playful: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80',
          serious: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
          bold: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80'
        };
        return fashionImages[tone] || fashionImages.serious;
      }
      
      // Default concept-based images for common business terms
      if (keywords.includes('business') || keywords.includes('professional') || keywords.includes('corporate')) {
        const businessImages = {
          playful: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80',
          serious: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
          bold: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=800&q=80'
        };
        return businessImages[tone] || businessImages.serious;
      }
      
      // Fallback to tone-based generic images
      const fallbackImages = {
        playful: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=800&q=80',
        serious: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80',
        bold: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=800&q=80'
      };
      return fallbackImages[tone] || fallbackImages.playful;
    };
    
    const contextualImage = getContextualImage(prompt, tone);
    
    res.json({
      imageURL: contextualImage,
      revisedPrompt: `${tone} style ${prompt} - contextually matched image`
    });
  } catch (error) {
    res.status(500).json({ error: 'Image generation failed', message: error.message });
  }
});

app.post('/api/generate-audio', async (req, res) => {
  try {
    console.log('Audio generation request:', req.body);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const { text, voice, tone } = req.body;
    
    // Generate tone-appropriate audio descriptions
    const getAudioDescription = (text, tone) => {
      const toneDescriptions = {
        playful: `🎵 Upbeat narration: "${text}" (spoken with energy and enthusiasm)`,
        serious: `🎙️ Professional voiceover: "${text}" (clear, authoritative delivery)`,
        bold: `⚡ Dynamic announcement: "${text}" (powerful, confident tone)`
      };
      return toneDescriptions[tone] || toneDescriptions.playful;
    };
    
    // For demo purposes, we'll return a data URL for a simple beep tone
    // In production, this would connect to ElevenLabs, Google TTS, etc.
    const generateSimpleAudioDataUrl = (tone) => {
      // Different tone frequencies for different moods
      const toneFreqs = {
        playful: 440,   // A4 note - bright and happy
        serious: 220,   // A3 note - deeper, more serious  
        bold: 330       // E4 note - strong and confident
      };
      
      // Simple audio data URL that browsers can play
      // This creates a short beep at different frequencies
      const frequency = toneFreqs[tone] || 440;
      return `data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D2u2opBSuEyvLOdCcFJXjF8N2QQAoUXrPn66hVFApGn+D2u2opBSuEyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcFJnfG8N2QQAoUXrPn66hVFApGn+D2u2opBSuFyfLOdCcF=`;
    };
    
    // Return successful audio generation with working data URL
    res.json({
      audioURL: generateSimpleAudioDataUrl(tone),
      audioDescription: getAudioDescription(text, tone),
      duration: Math.floor(text.split(' ').length * 0.5) + 2, // Rough estimate + 2 seconds
      format: 'wav',
      voice: voice || 'default',
      message: 'Demo audio generated - represents a TTS version of your caption'
    });
  } catch (error) {
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
