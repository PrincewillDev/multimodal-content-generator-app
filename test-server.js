import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

app.post('/api/generate-text', async (req, res) => {
  console.log('Request received:', req.body);
  
  try {
    // Simple mock response without delays
    const response = {
      headline: "🎉 Test Headline",
      caption: "This is a test caption to verify the API is working."
    };
    
    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate text' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Test server running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
});
