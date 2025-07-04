#!/usr/bin/env node

/**
 * Test Regenerate Functionality
 * This script tests the regenerate button functionality by simulating user interactions
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_CASES = [
  {
    name: "Text Regeneration Test",
    description: "Test regenerating text content multiple times",
    endpoint: '/api/generate-text',
    payload: {
      prompt: 'eco-friendly water bottle',
      tone: 'playful',
      temperature: 0.7
    }
  },
  {
    name: "Image Regeneration Test", 
    description: "Test regenerating image content",
    endpoint: '/api/generate-image',
    payload: {
      prompt: 'eco-friendly water bottle, colorful, fun, vibrant, cartoon-like style, cheerful, bright colors, high quality, detailed, product photography',
      tone: 'playful',
      model: 'stabilityai/stable-diffusion-xl-base-1.0',
      size: '1024x1024',
      quality: 'high'
    }
  }
];

async function testRegenerate() {
  console.log('🔄 Testing Regenerate Functionality\n');
  
  const baseUrl = 'http://localhost:3002';
  const results = [];

  for (const testCase of TEST_CASES) {
    console.log(`📋 ${testCase.name}`);
    console.log(`   ${testCase.description}\n`);
    
    const testResults = {
      name: testCase.name,
      endpoint: testCase.endpoint,
      attempts: [],
      success: 0,
      failed: 0
    };

    // Test 3 regenerations to check for uniqueness
    for (let i = 1; i <= 3; i++) {
      console.log(`   Attempt ${i}/3...`);
      
      try {
        const startTime = Date.now();
        
        const response = await fetch(`${baseUrl}${testCase.endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testCase.payload),
        });

        const endTime = Date.now();
        const duration = endTime - startTime;

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`HTTP ${response.status}: ${error}`);
        }

        const data = await response.json();
        
        testResults.attempts.push({
          attempt: i,
          success: true,
          duration,
          data: data,
          timestamp: new Date().toISOString()
        });
        
        testResults.success++;
        
        console.log(`   ✅ Success (${duration}ms)`);
        
        // Log relevant content to check for uniqueness
        if (testCase.endpoint === '/api/generate-text') {
          console.log(`      Headline: "${data.headline?.substring(0, 50)}..."`);
          console.log(`      Caption: "${data.caption?.substring(0, 50)}..."`);
        } else if (testCase.endpoint === '/api/generate-image') {
          const imageType = data.imageURL?.startsWith('data:') ? 'base64' : 'url';
          console.log(`      Image: ${imageType} (${data.imageURL?.length || 0} chars)`);
        }
        
      } catch (error) {
        testResults.attempts.push({
          attempt: i,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        testResults.failed++;
        console.log(`   ❌ Failed: ${error.message}`);
      }
      
      // Wait 1 second between attempts
      if (i < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    results.push(testResults);
    console.log(`\n   Summary: ${testResults.success}/3 successful, ${testResults.failed}/3 failed\n`);
  }

  // Generate detailed report
  console.log('📊 REGENERATE TEST RESULTS');
  console.log('=' .repeat(50));
  
  let totalSuccess = 0;
  let totalAttempts = 0;
  
  for (const result of results) {
    console.log(`\n${result.name}:`);
    console.log(`  Endpoint: ${result.endpoint}`);
    console.log(`  Success Rate: ${result.success}/${result.attempts.length} (${((result.success/result.attempts.length)*100).toFixed(1)}%)`);
    
    totalSuccess += result.success;
    totalAttempts += result.attempts.length;
    
    // Check for content uniqueness in text generation
    if (result.endpoint === '/api/generate-text' && result.success > 1) {
      const headlines = result.attempts
        .filter(a => a.success)
        .map(a => a.data.headline)
        .filter(h => h);
        
      const captions = result.attempts
        .filter(a => a.success)
        .map(a => a.data.caption)
        .filter(c => c);
      
      const uniqueHeadlines = new Set(headlines);
      const uniqueCaptions = new Set(captions);
      
      console.log(`  Content Variation:`);
      console.log(`    Headlines: ${uniqueHeadlines.size}/${headlines.length} unique`);
      console.log(`    Captions: ${uniqueCaptions.size}/${captions.length} unique`);
      
      if (uniqueHeadlines.size === headlines.length && uniqueCaptions.size === captions.length) {
        console.log(`    ✅ All content is unique (regenerate working properly)`);
      } else {
        console.log(`    ⚠️  Some content is identical (possible regenerate issue)`);
      }
    }
  }
  
  console.log(`\nOverall Success Rate: ${totalSuccess}/${totalAttempts} (${((totalSuccess/totalAttempts)*100).toFixed(1)}%)`);
  
  // Save detailed results
  const reportPath = path.join(__dirname, 'regenerate-test-results.json');
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed results saved to: ${reportPath}`);
  
  if (totalSuccess === totalAttempts) {
    console.log('\n🎉 All regenerate tests passed!');
    return true;
  } else {
    console.log('\n❌ Some regenerate tests failed. Check the results above.');
    return false;
  }
}

// Health check first
async function healthCheck() {
  console.log('🏥 Performing health check...\n');
  
  try {
    const response = await fetch('http://localhost:3002/api/health');
    const data = await response.json();
    
    console.log('Server Status:', data.status);
    console.log('Groq API:', data.env?.hasGroqToken ? '✅ Connected' : '❌ Not configured');
    console.log('HuggingFace API:', data.env?.hasHfToken ? '✅ Connected' : '❌ Not configured');
    console.log('');
    
    if (!response.ok || data.status !== 'OK') {
      throw new Error('Server health check failed');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    console.log('Make sure the server is running: node server-minimal.js\n');
    return false;
  }
}

// Main execution
async function main() {
  try {
    const healthy = await healthCheck();
    if (!healthy) {
      process.exit(1);
    }
    
    const success = await testRegenerate();
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { testRegenerate, healthCheck };
