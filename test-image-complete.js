#!/usr/bin/env node

/**
 * Image Generation Test - Comprehensive HF API Testing
 */

async function testImageGeneration() {
  console.log('🖼️ Testing Image Generation with Hugging Face API\n');
  console.log('=================================================\n');

  // Test 1: Health Check
  console.log('1️⃣ Health Check...');
  try {
    const healthResponse = await fetch('http://localhost:3002/api/health');
    const healthData = await healthResponse.json();
    
    console.log('   Server Status:', healthData.status);
    console.log('   HF API Key:', healthData.env?.hasHfToken ? '✅ Configured' : '❌ Missing');
    
    if (!healthData.env?.hasHfToken) {
      console.log('❌ Hugging Face API key not detected\n');
      return false;
    }
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return false;
  }

  console.log('✅ Health check passed\n');

  // Test 2: Image Generation via Our API
  console.log('2️⃣ Testing Image Generation...');
  
  const testCases = [
    { prompt: 'simple red apple', tone: 'playful', timeout: 30000 },
    { prompt: 'coffee cup', tone: 'serious', timeout: 30000 }
  ];

  let successCount = 0;
  
  for (const testCase of testCases) {
    console.log(`   Testing: "${testCase.prompt}" (${testCase.tone} tone)`);
    
    try {
      const startTime = Date.now();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), testCase.timeout);
      
      const response = await fetch('http://localhost:3002/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: testCase.prompt,
          tone: testCase.tone
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        
        if (data.fallback) {
          console.log(`   ⚠️  Fallback used: ${data.message}`);
          if (data.modelLoading) {
            console.log('   💡 Model is loading - this is normal for first use');
          }
        } else {
          console.log(`   ✅ Success! AI image generated (${duration}ms)`);
          console.log(`   📏 Image type: ${data.imageURL?.startsWith('data:') ? 'Base64' : 'URL'}`);
          successCount++;
        }
      } else {
        console.log(`   ❌ Failed: HTTP ${response.status}`);
      }
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`   ⏰ Timeout after ${testCase.timeout/1000}s`);
      } else {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n📊 Results Summary:');
  console.log(`   AI Generated: ${successCount}/${testCases.length}`);
  console.log(`   Fallbacks: ${testCases.length - successCount}/${testCases.length}`);

  if (successCount > 0) {
    console.log('\n🎉 Hugging Face integration is working!');
    console.log('   Your API key is valid and generating images.');
    return true;
  } else {
    console.log('\n⚠️  No AI images generated, but system is using fallbacks.');
    console.log('   This could be due to:');
    console.log('   - Model loading (first use takes time)');
    console.log('   - Network connectivity issues');
    console.log('   - API rate limiting');
    console.log('\n💡 Try again in a few minutes.');
    return false;
  }
}

// Test a simple fetch to verify connectivity
async function testConnectivity() {
  console.log('🌐 Testing connectivity to Hugging Face...');
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch('https://huggingface.co/', {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log('✅ Can reach Hugging Face servers');
    return true;
  } catch (error) {
    console.log('❌ Cannot reach Hugging Face:', error.message);
    return false;
  }
}

async function main() {
  console.log('🧪 Hugging Face Image Generation Test\n');
  
  // Test basic connectivity first
  const connected = await testConnectivity();
  if (!connected) {
    console.log('\n❌ Network connectivity issue detected.');
    console.log('Check your internet connection and try again.');
    process.exit(1);
  }
  
  console.log('');
  const success = await testImageGeneration();
  
  console.log('\n🔍 Next Steps:');
  if (success) {
    console.log('✅ Test the image generation in your app: http://localhost:8082');
    console.log('✅ Try the regenerate buttons - they should work now!');
  } else {
    console.log('⏳ Wait 2-3 minutes for the model to warm up, then try again');
    console.log('🔄 The regenerate functionality will still work with fallback images');
  }
  
  process.exit(success ? 0 : 1);
}

main().catch(console.error);
