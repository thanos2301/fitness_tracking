import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { startOfDay, endOfDay, subDays, format, eachDayOfInterval } from 'date-fns';

const router = express.Router();
const prisma = new PrismaClient();

// Add a meal
router.post('/meals', authenticateToken, async (req, res) => {
  try {
    const { foodName, quantity, calories, protein, carbs, fats, fiber, date } = req.body;
    
    console.log('Creating meal:', {
      foodName,
      quantity,
      calories,
      userId: req.userId,
      date
    });

    const meal = await prisma.meal.create({
      data: {
        foodName,
        quantity: parseFloat(quantity),
        calories: parseFloat(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fats: parseFloat(fats),
        fiber: parseFloat(fiber),
        date: new Date(date),
        userId: req.userId
      }
    });

    console.log('Meal created:', meal);
    res.json(meal);
  } catch (error) {
    console.error('Error adding meal:', error);
    res.status(500).json({ error: 'Failed to add meal', details: error.message });
  }
});

// Get meals for a date
router.get('/meals/:date', authenticateToken, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const meals = await prisma.meal.findMany({
      where: {
        userId: req.userId,
        date: {
          gte: startOfDay(date),
          lt: endOfDay(date)
        }
      }
    });
    res.json(meals);
  } catch (error) {
    console.error('Error fetching meals:', error);
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

// Get weekly summary
router.get('/weekly-summary', authenticateToken, async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = subDays(endDate, 7);

    const meals = await prisma.meal.findMany({
      where: {
        userId: req.userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Group meals by date and calculate totals
    const dailyTotals = meals.reduce((acc, meal) => {
      const date = format(meal.date, 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = {
          date,
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          fiber: 0
        };
      }
      acc[date].calories += meal.calories;
      acc[date].protein += meal.protein;
      acc[date].carbs += meal.carbs;
      acc[date].fats += meal.fats;
      acc[date].fiber += meal.fiber;
      return acc;
    }, {});

    // Fill in missing dates with zeros
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });
    const result = allDays.map(day => {
      const date = format(day, 'yyyy-MM-dd');
      return dailyTotals[date] || {
        date,
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        fiber: 0
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    res.status(500).json({ error: 'Failed to fetch weekly summary' });
  }
});

// Delete a meal
router.delete('/meals/:id', authenticateToken, async (req, res) => {
  try {
    console.log('Delete meal request received for ID:', req.params.id);
    const mealId = parseInt(req.params.id);
    
    if (isNaN(mealId)) {
      console.log('Invalid meal ID:', req.params.id);
      return res.status(400).json({ error: 'Invalid meal ID' });
    }

    // First check if the meal exists and belongs to the user
    const meal = await prisma.meal.findFirst({
      where: {
        id: mealId,
        userId: req.userId
      }
    });

    console.log('Found meal:', meal);

    if (!meal) {
      console.log('Meal not found or unauthorized');
      return res.status(404).json({ error: 'Meal not found or unauthorized' });
    }

    // Delete the meal
    await prisma.meal.delete({
      where: {
        id: mealId
      }
    });

    console.log('Meal deleted successfully');
    res.status(200).json({ message: 'Meal deleted successfully' });
  } catch (error) {
    console.error('Error deleting meal:', error);
    res.status(500).json({ error: 'Failed to delete meal' });
  }
});

export default router; 