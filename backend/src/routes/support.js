import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Comprehensive response datasets
const fitnessResponses = {
  // Workout and Exercise Responses
  workout: {
    patterns: ['workout', 'exercise', 'training', 'gym', 'routine', 'program'],
    responses: [
      {
        title: "Personalized Workout Guide",
        content: `Here's a structured workout plan:

1. Warm-up (10-15 minutes):
   • Light cardio
   • Dynamic stretching
   • Joint mobility exercises

2. Main Workout (40-45 minutes):
   • Compound exercises first
   • 3-4 sets per exercise
   • 8-12 reps per set
   • 60-90 seconds rest between sets

3. Cool-down (10 minutes):
   • Static stretching
   • Light walking
   • Deep breathing

Remember: Start with lighter weights and focus on form!`
      }
    ]
  },

  // Nutrition and Diet Responses
  nutrition: {
    patterns: ['diet', 'nutrition', 'food', 'eat', 'meal', 'protein', 'carbs', 'calories'],
    responses: [
      {
        title: "Nutrition Guidelines",
        content: `Here's your nutrition breakdown:

1. Daily Macronutrients:
   • Protein: 1.6-2.2g per kg bodyweight
   • Carbs: 45-65% of total calories
   • Fats: 20-35% of total calories

2. Meal Timing:
   • Breakfast: High protein + complex carbs
   • Pre-workout: Light, carb-focused
   • Post-workout: Protein + quick carbs
   • Dinner: Balanced macros

3. Key Tips:
   • Stay hydrated (2-3L water daily)
   • Eat every 3-4 hours
   • Include vegetables in main meals
   • Choose whole foods over processed`
      }
    ]
  },

  // Recovery and Injury Prevention
  recovery: {
    patterns: ['recovery', 'rest', 'sore', 'pain', 'injury', 'stretch', 'mobility'],
    responses: [
      {
        title: "Recovery & Injury Prevention",
        content: `Essential recovery guidelines:

1. Rest & Sleep:
   • 7-9 hours sleep nightly
   • 48h between training same muscles
   • 1-2 rest days weekly

2. Active Recovery:
   • Light stretching
   • Foam rolling
   • Walking or swimming
   • Yoga or mobility work

3. Injury Prevention:
   • Proper warm-up
   • Correct form
   • Progressive overload
   • Listen to your body

4. Recovery Nutrition:
   • Post-workout protein
   • Adequate hydration
   • Anti-inflammatory foods`
      }
    ]
  },

  // Weight Management
  weight: {
    patterns: ['weight', 'fat', 'lose', 'gain', 'bulk', 'cut', 'mass'],
    responses: [
      {
        title: "Weight Management Guide",
        content: `Effective weight management strategies:

1. Weight Loss:
   • Caloric deficit (500 cal/day)
   • High protein intake
   • Regular cardio
   • Strength training
   • Track progress weekly

2. Muscle Gain:
   • Caloric surplus (300-500 cal/day)
   • Progressive overload
   • Adequate protein (2g/kg)
   • Compound exercises
   • Rest and recovery

3. General Tips:
   • Stay consistent
   • Track your food
   • Regular weigh-ins
   • Adjust as needed
   • Be patient with results`
      }
    ]
  },

  // Default Response
  default: {
    responses: [
      {
        title: "General Fitness Advice",
        content: `Thank you for your question! Here are some general fitness guidelines:

1. Exercise Basics:
   • 150 mins moderate cardio/week
   • 2-3 strength sessions/week
   • Daily stretching/mobility work
   • Regular rest days

2. Nutrition Fundamentals:
   • Balanced macronutrients
   • Whole food focus
   • Regular meal timing
   • Adequate hydration

3. Lifestyle Factors:
   • Quality sleep
   • Stress management
   • Consistency over intensity
   • Regular progress tracking

What specific aspect would you like to know more about?`
      }
    ]
  }
};

// Function to get appropriate response based on input
const getResponse = (message) => {
  const lowercaseMessage = message.toLowerCase();
  
  // Check each category for matching patterns
  for (const [category, data] of Object.entries(fitnessResponses)) {
    if (data.patterns && data.patterns.some(pattern => lowercaseMessage.includes(pattern))) {
      // Get random response from matching category
      const responses = data.responses;
      const response = responses[Math.floor(Math.random() * responses.length)];
      return response.content;
    }
  }
  
  // Return default response if no patterns match
  return fitnessResponses.default.responses[0].content;
};

// Support route
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!req.userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get appropriate response
    const response = getResponse(message);
    
    return res.json({ 
      message: response,
      isAIResponse: false
    });

  } catch (error) {
    console.error('Route Error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      details: error.message 
    });
  }
});

export default router; 