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

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Rehabilitation route is working' });
});

router.post('/assessment', authenticateToken, async (req, res) => {
  try {
    // Get user profile data
    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId }
    });

    if (!profile) {
      return res.status(400).json({ error: 'Please complete your profile first' });
    }

    const { injury_type } = req.body;

    if (!injury_type) {
      return res.status(400).json({ error: 'Injury type is required' });
    }

    // Calculate age from DOB
    const age = profile.dob ? 
      Math.floor((new Date() - new Date(profile.dob)) / (365.25 * 24 * 60 * 60 * 1000)) : 
      30; // default age if not set

    // Prepare Python script options
    const options = {
      mode: 'json',
      pythonPath: 'python',
      scriptPath: path.join(__dirname, '../../ml/models'),
      args: [
        injury_type,
        age.toString(),
        profile.gender || 'male',
        profile.height?.toString() || '170',
        profile.weight?.toString() || '70'
      ]
    };

    // Run Python script
    const result = await new Promise((resolve, reject) => {
      PythonShell.run('generate_plan.py', options, (err, results) => {
        if (err) reject(err);
        resolve(results[0]); // Get first result as it's JSON
      });
    });

    // Save assessment to database
    const assessment = await prisma.rehabilitationAssessment.create({
      data: {
        userId: req.userId,
        injuryType: injury_type,
        assessmentData: result,
        date: new Date()
      }
    });

    res.json(result);
  } catch (error) {
    console.error('Rehabilitation assessment error:', error);
    res.status(500).json({ error: 'Failed to generate rehabilitation plan' });
  }
});

// Get previous assessments
router.get('/assessments', authenticateToken, async (req, res) => {
  try {
    const assessments = await prisma.rehabilitationAssessment.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' }
    });
    res.json(assessments);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

export default router; 