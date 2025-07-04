// Minimal server to test Groq API functionality
import http from 'http';
import url from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import the API handlers
import generateTextHandler from './api/generate-text.js';
import generateImageHandler from './api/generate-image.js';

const PORT = 3002;

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  
  // Health check endpoint
  if (parsedUrl.pathname === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'OK',
      timestamp: new Date().toISOString(),
      env: {
        hasGroqToken: !!process.env.GROQ_API_KEY,
        hasHfToken: !!process.env.HUGGING_FACE_API_KEY,
        nodeEnv: process.env.NODE_ENV || 'development'
      }
    }));
    return;
  }
  
  // Image generation endpoint
  if (parsedUrl.pathname === '/api/generate-image' && req.method === 'POST') {
    console.log('🖼️ Received image generation request');
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        console.log('📋 Request body:', body);
        const requestData = JSON.parse(body);
        console.log('🎯 Parsed request:', requestData);
        
        // Create mock Express-like req/res objects
        const mockReq = {
          method: 'POST',
          body: requestData
        };
        
        const mockRes = {
          status: (code) => ({
            json: (data) => {
              console.log(`📤 Sending response (${code}):`, data);
              res.writeHead(code, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(data));
            }
          }),
          json: (data) => {
            console.log('📤 Sending success response:', data);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
          }
        };
        
        // Call the image generation handler
        await generateImageHandler(mockReq, mockRes);
        
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }
  
  // Text generation endpoint
  if (parsedUrl.pathname === '/api/generate-text' && req.method === 'POST') {
    console.log('📝 Received text generation request');
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        console.log('📋 Request body:', body);
        const requestData = JSON.parse(body);
        console.log('🎯 Parsed request:', requestData);
        
        // Create mock Express-like req/res objects
        const mockReq = {
          method: 'POST',
          body: requestData
        };
        
        const mockRes = {
          status: (code) => ({
            json: (data) => {
              console.log(`📤 Sending response (${code}):`, data);
              res.writeHead(code, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(data));
            }
          }),
          json: (data) => {
            console.log('📤 Sending success response:', data);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
          }
        };
        
        // Call the Groq handler
        await generateTextHandler(mockReq, mockRes);
        
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }
  
  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`🚀 Minimal Groq API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 Text generation: http://localhost:${PORT}/api/generate-text`);
  console.log(`🖼️ Image generation: http://localhost:${PORT}/api/generate-image`);
  console.log(`🔑 Groq API Key configured: ${!!process.env.GROQ_API_KEY}`);
  console.log(`🔑 HuggingFace API Key configured: ${!!process.env.HUGGING_FACE_API_KEY}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});
