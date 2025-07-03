// Simple integration test to verify Groq API is working
// Run with: node quick-test.js

import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/api';

async function quickTest() {
  console.log('🧪 Running Quick Groq API Test...\n');
  
  try {
    // 1. Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_URL}/health`);
    const health = await healthResponse.json();
    
    if (health.status === 'OK') {
      console.log('✅ Health check passed');
      console.log(`   Groq API Key configured: ${health.env.hasGroqToken}`);
    } else {
      throw new Error('Health check failed');
    }
    
    if (!health.env.hasGroqToken) {
      throw new Error('GROQ_API_KEY not configured');
    }
    
    // 2. Text generation test
    console.log('\n2. Testing text generation with Groq...');
    const textResponse = await fetch(`${API_URL}/generate-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Smart water bottle',
        tone: 'playful',
        temperature: 0.7
      })
    });
    
    const textResult = await textResponse.json();
    
    if (textResult.headline && textResult.caption) {
      console.log('✅ Text generation successful');
      console.log(`   Headline: "${textResult.headline}"`);
      console.log(`   Caption: "${textResult.caption}"`);
      
      if (textResult.fallback) {
        console.log('   ⚠️  Note: This was a fallback response');
      }
    } else {
      throw new Error('Invalid text generation response');
    }
    
    console.log('\n🎉 All tests passed! Your Groq API integration is working.');
    console.log('\nNext steps:');
    console.log('1. Start the frontend: npm run dev');
    console.log('2. Open http://localhost:8080');
    console.log('3. Test the full application');
    
  } catch (error) {
    console.log(`\n❌ Test failed: ${error.message}`);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure API server is running: npm run api');
    console.log('2. Check your .env file has GROQ_API_KEY configured');
    console.log('3. Verify your internet connection');
    console.log('4. Ensure your Groq API key is valid');
    console.log('5. See GROQ_SETUP_GUIDE.md for more help');
    process.exit(1);
  }
}

quickTest();
