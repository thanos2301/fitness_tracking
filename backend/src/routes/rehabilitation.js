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
  console.log('Test route hit');
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

// Get rehabilitation progress
router.get('/progress', authenticateToken, async (req, res) => {
  try {
    // Get user ID from token
    const userId = req.user?.userId || req.userId;
    console.log('Progress route hit for user:', userId);

    if (!userId) {
      console.log('No user ID found in token');
      return res.status(401).json({ error: 'User ID not found in token' });
    }

    // Get exercises from rehabilitation plans
    const exercises = await prisma.rehabilitationPlan.findMany({
      where: { userId },
      select: {
        exercise: true,
        progress: true,
        painLevel: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${exercises.length} exercises for user ${userId}`);

    // Return default data if no exercises found
    if (!exercises || exercises.length === 0) {
      return res.json({
        exercises: [{ name: 'No exercises yet', progressScore: 0 }],
        painHistory: [{ date: new Date(), level: 0 }],
        overallProgress: 0,
        currentPainLevel: 0
      });
    }

    const formattedData = {
      exercises: exercises.map(ex => ({
        name: ex.exercise,
        progressScore: ex.progress
      })),
      painHistory: exercises.map(ex => ({
        date: ex.createdAt,
        level: ex.painLevel
      })),
      overallProgress: Math.round(
        exercises.reduce((acc, curr) => acc + curr.progress, 0) / exercises.length
      ),
      currentPainLevel: exercises[0].painLevel
    };

    console.log('Sending formatted data');
    res.json(formattedData);
  } catch (error) {
    console.error('Error in /progress route:', error);
    res.status(500).json({
      error: 'Failed to fetch rehabilitation progress',
      details: error.message
    });
  }
});

export default router; 