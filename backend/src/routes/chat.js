import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authenticateToken } from '../middleware/auth.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-pro"
});

// Test route to verify the router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Chat route is working' });
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Processing message for user:', req.userId);
    console.log('Message:', message);

    try {
      const prompt = `You are a fitness and nutrition expert. Please provide a helpful response to: ${message}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Empty response from AI');
      }

      console.log('AI Response:', text);
      return res.json({ message: text });
    } catch (aiError) {
      console.error('Gemini API Error:', aiError);
      return res.status(500).json({ 
        error: 'AI service error',
        details: aiError.message 
      });
    }
  } catch (error) {
    console.error('Route Error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      details: error.message 
    });
  }
});

export default router; 