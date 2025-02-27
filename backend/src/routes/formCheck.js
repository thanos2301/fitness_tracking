import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { PythonShell } from 'python-shell';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post('/analyze', authenticateToken, async (req, res) => {
  try {
    const { exercise_type } = req.body;

    if (!exercise_type) {
      return res.status(400).json({ error: 'Exercise type is required' });
    }

    const options = {
      mode: 'json',
      pythonPath: 'python',
      scriptPath: path.join(__dirname, '../../ml/models'),
      args: [exercise_type]
    };

    PythonShell.run('form_check.py', options, (err, results) => {
      if (err) {
        console.error('Form check error:', err);
        return res.status(500).json({ error: 'Failed to analyze form' });
      }
      res.json(results[0]);
    });
  } catch (error) {
    console.error('Form check error:', error);
    res.status(500).json({ error: 'Failed to analyze form' });
  }
});

export default router; 