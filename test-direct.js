// Direct test of Groq API integration without Express server
import dotenv from 'dotenv';
import generateTextHandler from './api/generate-text.js';

// Load environment variables
dotenv.config();

console.log('🧪 Direct Groq API Test (without Express)\n');

// Mock request and response objects
const mockReq = {
  body: {
    prompt: "Eco-friendly water bottle for athletes",
    tone: "playful",
    temperature: 0.7
  }
};

const mockRes = {
  json: (data) => {
    console.log('✅ Response received:');
    console.log(JSON.stringify(data, null, 2));
    console.log('\n🎉 Test completed successfully!');
  },
  status: (code) => ({
    json: (data) => {
      console.log(`❌ Error response (${code}):`);
      console.log(JSON.stringify(data, null, 2));
    }
  })
};

console.log('📝 Test request:');
console.log(JSON.stringify(mockReq.body, null, 2));
console.log('\n🔑 Environment check:');
console.log(`GROQ_API_KEY configured: ${!!process.env.GROQ_API_KEY}`);
console.log(`API Key preview: ${process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 8) + '...' : 'Not set'}`);
console.log('\n🚀 Calling Groq API...\n');

// Call the handler directly
try {
  await generateTextHandler(mockReq, mockRes);
} catch (error) {
  console.error('❌ Direct test failed:', error.message);
  console.error('Stack trace:', error.stack);
}
