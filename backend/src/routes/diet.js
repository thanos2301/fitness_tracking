import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { startOfDay, endOfDay, subDays, format, eachDayOfInterval } from 'date-fns';

const router = express.Router();
const prisma = new PrismaClient();

// Test route to verify the router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Diet route is working' });
});

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
    const mealId = parseInt(req.params.id);
    
    // First check if meal exists and belongs to user
    const meal = await prisma.meal.findFirst({
      where: {
        id: mealId,
        userId: req.userId
      }
    });

    if (!meal) {
      return res.status(404).json({ error: 'Meal not found or unauthorized' });
    }

    // Delete the meal
    await prisma.meal.delete({
      where: {
        id: mealId
      }
    });

    res.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    console.error('Error deleting meal:', error);
    res.status(500).json({ error: 'Failed to delete meal' });
  }
});

// Update the calorie multipliers and add weekly meal variations
const CALORIE_MULTIPLIERS = {
  weightloss: 0.8,    // 20% deficit
  weightgain: 1.2,    // 20% surplus
  balance: 1.0        // maintenance
};

const MEAL_DATABASE = {
  breakfast: {
    weightloss: [
      { food: 'Egg White Omelette', baseCalories: 200, protein: 20, carbs: 5, fats: 10 },
      { food: 'Greek Yogurt with Berries', baseCalories: 150, protein: 15, carbs: 20, fats: 3 },
      { food: 'Protein Smoothie', baseCalories: 250, protein: 25, carbs: 25, fats: 5 },
      { food: 'Overnight Oats', baseCalories: 300, protein: 15, carbs: 45, fats: 8 },
      { food: 'Cottage Cheese with Fruit', baseCalories: 200, protein: 20, carbs: 15, fats: 5 }
    ],
    weightgain: [
      { food: 'Protein Pancakes', baseCalories: 400, protein: 30, carbs: 50, fats: 12 },
      { food: 'Peanut Butter Oatmeal', baseCalories: 450, protein: 20, carbs: 60, fats: 18 },
      { food: 'Mass Gainer Smoothie', baseCalories: 500, protein: 40, carbs: 70, fats: 10 },
      { food: 'Breakfast Burrito', baseCalories: 550, protein: 35, carbs: 65, fats: 20 },
      { food: 'French Toast', baseCalories: 450, protein: 25, carbs: 55, fats: 15 }
    ],
    balance: [
      { food: 'Oatmeal with Nuts', baseCalories: 350, protein: 15, carbs: 45, fats: 12 },
      { food: 'Whole Grain Toast with Eggs', baseCalories: 300, protein: 20, carbs: 30, fats: 10 },
      { food: 'Fruit and Nut Yogurt Bowl', baseCalories: 320, protein: 18, carbs: 40, fats: 8 },
      { food: 'Quinoa Breakfast Bowl', baseCalories: 330, protein: 16, carbs: 42, fats: 9 },
      { food: 'Smoothie Bowl', baseCalories: 340, protein: 17, carbs: 43, fats: 10 }
    ]
  },
  lunch: {
    weightloss: [
      { food: 'Grilled Chicken Salad', baseCalories: 300, protein: 35, carbs: 10, fats: 12 },
      { food: 'Tuna Lettuce Wraps', baseCalories: 250, protein: 30, carbs: 8, fats: 10 },
      { food: 'Turkey and Avocado Bowl', baseCalories: 350, protein: 32, carbs: 15, fats: 18 },
      { food: 'Salmon with Vegetables', baseCalories: 320, protein: 34, carbs: 12, fats: 15 },
      { food: 'Quinoa Chicken Bowl', baseCalories: 330, protein: 33, carbs: 25, fats: 12 }
    ],
    weightgain: [
      { food: 'Chicken Rice Bowl', baseCalories: 600, protein: 40, carbs: 80, fats: 15 },
      { food: 'Steak and Sweet Potato', baseCalories: 650, protein: 45, carbs: 70, fats: 20 },
      { food: 'Salmon Pasta', baseCalories: 700, protein: 38, carbs: 85, fats: 22 },
      { food: 'Turkey Burger with Fries', baseCalories: 750, protein: 42, carbs: 90, fats: 25 },
      { food: 'Beef and Quinoa Bowl', baseCalories: 680, protein: 43, carbs: 75, fats: 23 }
    ],
    balance: [
      { food: 'Mediterranean Bowl', baseCalories: 450, protein: 25, carbs: 55, fats: 15 },
      { food: 'Chicken Wrap', baseCalories: 420, protein: 28, carbs: 48, fats: 14 },
      { food: 'Buddha Bowl', baseCalories: 440, protein: 22, carbs: 58, fats: 16 },
      { food: 'Poke Bowl', baseCalories: 430, protein: 26, carbs: 50, fats: 15 },
      { food: 'Turkey and Hummus Plate', baseCalories: 410, protein: 27, carbs: 45, fats: 13 }
    ]
  },
  dinner: {
    weightloss: [
      { food: 'Baked Fish with Vegetables', baseCalories: 280, protein: 32, carbs: 12, fats: 10 },
      { food: 'Turkey Meatballs with Zucchini Noodles', baseCalories: 300, protein: 35, carbs: 10, fats: 12 },
      { food: 'Shrimp Stir-Fry', baseCalories: 270, protein: 30, carbs: 15, fats: 8 },
      { food: 'Chicken and Broccoli', baseCalories: 290, protein: 34, carbs: 12, fats: 9 },
      { food: 'Tofu and Vegetable Curry', baseCalories: 260, protein: 28, carbs: 18, fats: 8 }
    ],
    weightgain: [
      { food: 'Steak and Loaded Potato', baseCalories: 800, protein: 50, carbs: 80, fats: 35 },
      { food: 'Chicken Alfredo Pasta', baseCalories: 750, protein: 45, carbs: 85, fats: 30 },
      { food: 'Salmon with Rice Pilaf', baseCalories: 700, protein: 42, carbs: 75, fats: 28 },
      { food: 'Beef Burrito Bowl', baseCalories: 780, protein: 48, carbs: 82, fats: 32 },
      { food: 'Pork Chop with Mac and Cheese', baseCalories: 820, protein: 52, carbs: 78, fats: 36 }
    ],
    balance: [
      { food: 'Grilled Fish with Quinoa', baseCalories: 450, protein: 35, carbs: 45, fats: 15 },
      { food: 'Chicken Stir-Fry with Brown Rice', baseCalories: 480, protein: 32, carbs: 50, fats: 18 },
      { food: 'Turkey Chili', baseCalories: 420, protein: 30, carbs: 48, fats: 14 },
      { food: 'Lentil and Vegetable Curry', baseCalories: 440, protein: 28, carbs: 52, fats: 16 },
      { food: 'Tofu Buddha Bowl', baseCalories: 430, protein: 26, carbs: 54, fats: 15 }
    ]
  }
};

// Update the plan generation route
router.post('/plan', authenticateToken, async (req, res) => {
  try {
    const { goal = 'balance' } = req.body;
    console.log('Diet plan route hit with goal:', goal);

    // Get user profile data
    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId },
      select: {
        height: true,
        weight: true,
        dob: true,
        gender: true
      }
    });

    if (!profile) {
      return res.status(400).json({ error: 'Please complete your profile first' });
    }

    // Calculate BMI
    const heightInMeters = profile.height / 100;
    const bmi = profile.weight / (heightInMeters * heightInMeters);

    // Calculate age
    const age = profile.dob ? 
      Math.floor((new Date() - new Date(profile.dob)) / (365.25 * 24 * 60 * 60 * 1000)) : 
      30;

    // Calculate BMR using Harris-Benedict equation
    const bmr = profile.gender?.toLowerCase() === 'female'
      ? 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * age)
      : 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * age);

    // Adjust calories based on activity level and goal
    const activityMultiplier = 1.375; // Lightly active
    let goalMultiplier;
    switch (goal) {
      case 'weightloss':
        goalMultiplier = 0.8; // 20% deficit
        break;
      case 'weightgain':
        goalMultiplier = 1.2; // 20% surplus
        break;
      default: // balance
        goalMultiplier = 1.0; // maintenance
    }

    const dailyCalories = Math.round(bmr * activityMultiplier * goalMultiplier);

    // Generate a week's worth of meals
    const weeklyPlan = Array.from({ length: 7 }, () => {
      const dayMeals = {};
      ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
        const mealOptions = MEAL_DATABASE[mealType][goal];
        const meal = mealOptions[Math.floor(Math.random() * mealOptions.length)];
        const calorieAdjustment = dailyCalories / 3 / meal.baseCalories;
        
        dayMeals[mealType] = {
          ...meal,
          calories: Math.round(meal.baseCalories * calorieAdjustment),
          protein: Math.round(meal.protein * calorieAdjustment),
          carbs: Math.round(meal.carbs * calorieAdjustment),
          fats: Math.round(meal.fats * calorieAdjustment)
        };
      });
      return dayMeals;
    });

    // Calculate weekly totals
    const weeklyTotals = weeklyPlan.reduce((totals, day) => {
      Object.values(day).forEach(meal => {
        totals.calories += meal.calories;
        totals.protein += meal.protein;
        totals.carbs += meal.carbs;
        totals.fats += meal.fats;
      });
      return totals;
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

    res.json({
      metrics: {
        age,
        height: profile.height,
        weight: profile.weight,
        bmi: Math.round(bmi * 10) / 10,
        goal,
        dailyCalories,
        weeklyCalories: weeklyTotals.calories,
        weeklyProtein: weeklyTotals.protein,
        weeklyCarbs: weeklyTotals.carbs,
        weeklyFats: weeklyTotals.fats,
        activityLevel: 'Lightly Active',
        goalDescription: {
          weightloss: '20% caloric deficit for steady weight loss',
          weightgain: '20% caloric surplus for muscle gain',
          balance: 'Maintenance calories for body recomposition'
        }[goal]
      },
      weeklyPlan
    });
  } catch (error) {
    console.error('Diet plan error:', error);
    res.status(500).json({ error: 'Failed to generate diet plan', details: error.message });
  }
});

export default router; 