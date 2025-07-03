// API Configuration for Groq Integration
export const API_CONFIG = {
  // For Vite development, API routes are served from the same origin
  baseURL: '',
  
  endpoints: {
    generateText: '/api/generate-text',
    generateImage: '/api/generate-image', 
    generateAudio: '/api/generate-audio'
  },

  // Default settings for AI models
  defaults: {
    text: {
      model: 'llama3-8b-8192', // Groq's Llama 3 8B model
      temperature: 0.7,
      maxTokens: 300
    },
    image: {
      model: 'dall-e-3', // or 'stable-diffusion'
      size: '1024x1024',
      quality: 'standard'
    },
    audio: {
      format: 'mp3',
      speed: 1.0,
      pitch: 1.0
    }
  },

  // Timeout settings (in milliseconds)
  timeouts: {
    text: 15000,     // 15 seconds for Groq (extremely fast)
    image: 60000,    // 60 seconds
    audio: 45000     // 45 seconds
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.baseURL}${API_CONFIG.endpoints[endpoint as keyof typeof API_CONFIG.endpoints]}`;
};
