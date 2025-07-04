#!/usr/bin/env node

/**
 * Simple Regenerate Test
 * Tests the regenerate functionality with a quick verification
 */

async function testRegenerateQuick() {
  console.log('🔄 Quick Regenerate Test\n');
  
  const baseUrl = 'http://localhost:3002';
  const testPayload = {
    prompt: 'eco-friendly water bottle',
    tone: 'playful',
    temperature: 0.7
  };

  console.log('Testing text regeneration (3 attempts)...\n');
  
  const responses = [];
  
  for (let i = 1; i <= 3; i++) {
    console.log(`Attempt ${i}...`);
    
    try {
      const response = await fetch(`${baseUrl}/api/generate-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
      });
      
      if (response.ok) {
        const data = await response.json();
        responses.push(data);
        console.log(`✅ Success: "${data.headline?.substring(0, 40)}..."`);
      } else {
        console.log(`❌ Failed: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    // Wait 1 second between requests
    if (i < 3) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n📊 Results:');
  console.log(`Total responses: ${responses.length}/3`);
  
  if (responses.length > 1) {
    const headlines = responses.map(r => r.headline).filter(h => h);
    const uniqueHeadlines = new Set(headlines);
    
    console.log(`Unique headlines: ${uniqueHeadlines.size}/${headlines.length}`);
    
    if (uniqueHeadlines.size === headlines.length) {
      console.log('✅ All content is unique - Regenerate working correctly!');
      return true;
    } else {
      console.log('⚠️  Some content is identical - Possible regenerate issue');
      return false;
    }
  } else {
    console.log('❌ Not enough responses to test uniqueness');
    return false;
  }
}

// Health check
async function quickHealthCheck() {
  try {
    const response = await fetch('http://localhost:3002/api/health');
    const data = await response.json();
    
    if (response.ok && data.status === 'OK') {
      console.log('🏥 Server is healthy\n');
      return true;
    } else {
      console.log('❌ Server health check failed\n');
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot reach server. Make sure it\'s running: node server-minimal.js\n');
    return false;
  }
}

async function main() {
  const healthy = await quickHealthCheck();
  if (!healthy) {
    process.exit(1);
  }
  
  const success = await testRegenerateQuick();
  
  if (success) {
    console.log('\n🎉 Regenerate functionality is working correctly!');
    console.log('The regenerate buttons should work in the frontend.');
  } else {
    console.log('\n⚠️  There may be an issue with regenerate functionality.');
  }
  
  process.exit(success ? 0 : 1);
}

main();
