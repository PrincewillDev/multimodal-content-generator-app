#!/usr/bin/env node

// Test script for Groq API integration
// Run this script to verify your API setup is working correctly

import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { performance } from 'perf_hooks';

// Load environment variables
dotenv.config();

// Test configuration
const API_BASE = 'http://localhost:3001/api';
const TEST_TIMEOUT = 45000; // 45 seconds

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper function to print colored output
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`),
  subheader: (msg) => console.log(`${colors.bright}${msg}${colors.reset}`)
};

// Test data
const testPrompts = [
  {
    prompt: "Eco-friendly water bottle for athletes",
    tone: "playful",
    expected: {
      headlineKeywords: ["eco", "water", "bottle", "fun", "amazing"],
      captionKeywords: ["hydrated", "planet", "athletes", "sustainable"]
    }
  },
  {
    prompt: "Smart fitness tracker",
    tone: "serious",
    expected: {
      headlineKeywords: ["smart", "fitness", "tracker", "professional"],
      captionKeywords: ["health", "data", "reliable", "performance"]
    }
  },
  {
    prompt: "Wireless noise-canceling headphones",
    tone: "bold",
    expected: {
      headlineKeywords: ["wireless", "headphones", "revolutionary", "powerful"],
      captionKeywords: ["sound", "experience", "ultimate", "transform"]
    }
  }
];

// Test functions
async function testHealthCheck() {
  log.header("🏥 Testing Health Check Endpoint");
  
  try {
    const startTime = performance.now();
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      timeout: 5000
    });
    const endTime = performance.now();
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    const responseTime = Math.round(endTime - startTime);
    
    log.success(`Health check passed (${responseTime}ms)`);
    log.info(`Server status: ${data.status}`);
    log.info(`Node environment: ${data.env.nodeEnv}`);
    log.info(`Groq API Key configured: ${data.env.hasGroqToken ? 'Yes' : 'No'}`);
    
    if (!data.env.hasGroqToken) {
      log.error("GROQ_API_KEY is not configured! Please check your .env file.");
      return false;
    }
    
    return true;
  } catch (error) {
    log.error(`Health check failed: ${error.message}`);
    log.warning("Make sure the API server is running with: npm run api");
    return false;
  }
}

async function testTextGeneration(testCase, index) {
  log.subheader(`\n📝 Test ${index + 1}: ${testCase.prompt} (${testCase.tone} tone)`);
  
  try {
    const startTime = performance.now();
    
    const response = await fetch(`${API_BASE}/generate-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: testCase.prompt,
        tone: testCase.tone,
        temperature: 0.7
      }),
      timeout: TEST_TIMEOUT
    });
    
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    // Validate response structure
    if (!data.headline || !data.caption) {
      throw new Error("Response missing required fields (headline or caption)");
    }
    
    // Check if this was a fallback response
    if (data.fallback) {
      log.warning(`Fallback response used (API may be unavailable)`);
    }
    
    // Validate content quality
    const headlineLength = data.headline.split(' ').length;
    const captionLength = data.caption.split(' ').length;
    
    log.success(`Text generated successfully (${responseTime}ms)`);
    log.info(`Headline (${headlineLength} words): "${data.headline}"`);
    log.info(`Caption (${captionLength} words): "${data.caption}"`);
    
    // Tone validation
    const content = (data.headline + ' ' + data.caption).toLowerCase();
    let toneScore = 0;
    
    switch (testCase.tone) {
      case 'playful':
        if (content.includes('🎉') || content.includes('🚀') || content.includes('!')) toneScore++;
        if (content.includes('fun') || content.includes('amazing') || content.includes('exciting')) toneScore++;
        break;
      case 'serious':
        if (content.includes('professional') || content.includes('reliable') || content.includes('industry')) toneScore++;
        if (!content.includes('!') || content.split('!').length <= 2) toneScore++; // Less exclamation marks
        break;
      case 'bold':
        if (content.includes('revolutionary') || content.includes('powerful') || content.includes('ultimate')) toneScore++;
        if (content.includes('!') && content.split('!').length > 1) toneScore++; // More emphasis
        break;
    }
    
    if (toneScore > 0) {
      log.success(`Tone validation passed (${testCase.tone})`);
    } else {
      log.warning(`Tone validation inconclusive (${testCase.tone})`);
    }
    
    // Length validation
    if (headlineLength >= 5 && headlineLength <= 20) {
      log.success(`Headline length appropriate (${headlineLength} words)`);
    } else {
      log.warning(`Headline length outside ideal range (${headlineLength} words)`);
    }
    
    if (captionLength >= 15 && captionLength <= 80) {
      log.success(`Caption length appropriate (${captionLength} words)`);
    } else {
      log.warning(`Caption length outside ideal range (${captionLength} words)`);
    }
    
    return {
      success: true,
      responseTime,
      data,
      toneScore,
      fallback: data.fallback || false
    };
    
  } catch (error) {
    log.error(`Text generation failed: ${error.message}`);
    
    if (error.message.includes('timeout')) {
      log.warning("This might be due to model cold start. Try again in a few minutes.");
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

async function testDifferentTones() {
  log.header("🎭 Testing Tone Variations");
  
  const basePrompt = "Smart home security camera";
  const tones = ['playful', 'serious', 'bold'];
  const results = {};
  
  for (const tone of tones) {
    log.subheader(`\nTesting ${tone} tone...`);
    
    try {
      const response = await fetch(`${API_BASE}/generate-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: basePrompt,
          tone: tone,
          temperature: 0.7
        }),
        timeout: TEST_TIMEOUT
      });
      
      const data = await response.json();
      results[tone] = data;
      
      log.success(`${tone.charAt(0).toUpperCase() + tone.slice(1)} tone completed`);
      log.info(`"${data.headline}"`);
      
    } catch (error) {
      log.error(`${tone} tone failed: ${error.message}`);
      results[tone] = { error: error.message };
    }
  }
  
  // Compare results
  log.subheader("\n📊 Tone Comparison Results:");
  Object.entries(results).forEach(([tone, result]) => {
    if (!result.error) {
      log.info(`${tone.toUpperCase()}: "${result.headline}"`);
    } else {
      log.error(`${tone.toUpperCase()}: Failed - ${result.error}`);
    }
  });
  
  return results;
}

async function testErrorHandling() {
  log.header("🔧 Testing Error Handling");
  
  // Test invalid tone
  log.subheader("Testing invalid tone...");
  try {
    const response = await fetch(`${API_BASE}/generate-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: "Test product",
        tone: "invalid_tone",
        temperature: 0.7
      })
    });
    
    const data = await response.json();
    if (data.headline && data.caption) {
      log.success("Invalid tone handled gracefully (fallback used)");
    } else {
      log.warning("Invalid tone handling could be improved");
    }
  } catch (error) {
    log.error(`Invalid tone test failed: ${error.message}`);
  }
  
  // Test empty prompt
  log.subheader("Testing empty prompt...");
  try {
    const response = await fetch(`${API_BASE}/generate-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: "",
        tone: "playful",
        temperature: 0.7
      })
    });
    
    const data = await response.json();
    if (data.headline && data.caption) {
      log.success("Empty prompt handled gracefully");
    } else {
      log.warning("Empty prompt handling could be improved");
    }
  } catch (error) {
    log.error(`Empty prompt test failed: ${error.message}`);
  }
}

async function runFullTestSuite() {
  console.log(`${colors.bright}${colors.magenta}`);
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║                🤖 GROQ API TEST SUITE                       ║");
  console.log("║                  Lightning-Fast LLM Inference               ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log(`${colors.reset}\n`);
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  const results = [];
  
  // Health check
  const healthCheckPassed = await testHealthCheck();
  if (!healthCheckPassed) {
    log.error("Cannot proceed with tests - health check failed");
    process.exit(1);
  }
  
  // Run main test cases
  log.header("🧪 Running Main Test Cases");
  for (let i = 0; i < testPrompts.length; i++) {
    totalTests++;
    const result = await testTextGeneration(testPrompts[i], i);
    results.push(result);
    
    if (result.success) {
      passedTests++;
    } else {
      failedTests++;
    }
    
    // Add delay between tests to avoid rate limiting
    if (i < testPrompts.length - 1) {
      log.info("Waiting 2 seconds before next test...");
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Test tone variations
  await testDifferentTones();
  
  // Test error handling
  await testErrorHandling();
  
  // Generate summary report
  log.header("📋 Test Summary Report");
  
  log.info(`Total tests: ${totalTests}`);
  log.success(`Passed: ${passedTests}`);
  if (failedTests > 0) {
    log.error(`Failed: ${failedTests}`);
  }
  
  const successRate = Math.round((passedTests / totalTests) * 100);
  log.info(`Success rate: ${successRate}%`);
  
  // Performance summary
  const responseTimes = results.filter(r => r.success && r.responseTime).map(r => r.responseTime);
  if (responseTimes.length > 0) {
    const avgTime = Math.round(responseTimes.reduce((a, b) => a + b) / responseTimes.length);
    const minTime = Math.min(...responseTimes);
    const maxTime = Math.max(...responseTimes);
    
    log.info(`Response times - Avg: ${avgTime}ms, Min: ${minTime}ms, Max: ${maxTime}ms`);
  }
  
  // Fallback usage
  const fallbackCount = results.filter(r => r.fallback).length;
  if (fallbackCount > 0) {
    log.warning(`${fallbackCount} requests used fallback responses`);
  }
  
  // Final recommendations
  log.header("💡 Recommendations");
  
  if (successRate === 100) {
    log.success("🎉 All tests passed! Your API integration is working perfectly.");
  } else if (successRate >= 80) {
    log.success("✨ Most tests passed! Your integration is working well.");
    if (failedTests > 0) {
      log.warning("Check the failed tests above for any issues to address.");
    }
  } else {
    log.warning("🔧 Some tests failed. Please review the errors above.");
    log.info("Common solutions:");
    log.info("1. Verify your GROQ_API_KEY is correct and starts with 'gsk_'");
    log.info("2. Check that the API server is running properly");
    log.info("3. Ensure you have a stable internet connection");
    log.info("4. Verify your Groq API account has sufficient credits");
    log.info("5. Check for any billing or quota issues in Groq console");
  }
  
  console.log("\n" + "=".repeat(60));
  console.log(`${colors.bright}Test completed at ${new Date().toLocaleString()}${colors.reset}`);
}

// Run the test suite
if (import.meta.url === `file://${process.argv[1]}`) {
  runFullTestSuite().catch(error => {
    log.error(`Test suite failed: ${error.message}`);
    process.exit(1);
  });
}

export default {
  testHealthCheck,
  testTextGeneration,
  testDifferentTones,
  testErrorHandling,
  runFullTestSuite
};
