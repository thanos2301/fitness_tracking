import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import fetch from 'node-fetch';
import FormData from 'form-data';

const router = express.Router();
const upload = multer();

// ML service URL - using local FastAPI server
const ML_SERVICE_URL = 'http://127.0.0.1:8000';

router.post('/process', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const exercise = req.body.exercise || 'squat';
    console.log('Processing exercise:', exercise);  // Debug log

    const formData = new FormData();
    formData.append('file', Buffer.from(req.file.buffer), {
      filename: 'frame.jpg',
      contentType: 'image/jpeg'
    });
    formData.append('exercise', exercise);

    console.log('Sending request to ML service:', ML_SERVICE_URL);

    try {
      const mlResponse = await fetch(`${ML_SERVICE_URL}/process`, {
        method: 'POST',
        body: formData
      });

      if (!mlResponse.ok) {
        const errorText = await mlResponse.text();
        console.error('ML service error:', errorText);
        throw new Error(`ML service responded with status: ${mlResponse.status}`);
      }

      const data = await mlResponse.json();
      console.log('ML service response:', data);
      res.json(data);
    } catch (error) {
      console.error('ML service error:', error);
      res.json({
        exercise: exercise,
        form_feedback: "Form analysis temporarily unavailable",
        rep_count: 0,
        stage: 'unknown',
        prev_stage: 'unknown'
      });
    }
  } catch (error) {
    console.error('Form check error:', error);
    res.status(500).json({ error: 'Error processing form check: ' + error.message });
  }
});

// Add a test route to verify the router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Form check router is working' });
});

export default router; 