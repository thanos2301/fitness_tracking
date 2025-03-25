import pandas as pd
import random
from flask import Flask, request, jsonify

def calculate_calories(height, weight, age, goal):
    # Basal Metabolic Rate (BMR) Calculation using Mifflin-St Jeor Equation
    bmr = 10 * weight + 6.25 * height - 5 * age + 5  # Male
    activity_multiplier = 1.375  # Lightly Active (default)
    maintenance_calories = bmr * activity_multiplier
    
    if goal == "weight_loss":
        target_calories = maintenance_calories - 500  # Deficit for weight loss
    elif goal == "weight_gain":
        target_calories = maintenance_calories + 500  # Surplus for muscle gain
    else:
        target_calories = maintenance_calories  # Maintenance
    
    return round(target_calories / 3, 2)  # Per meal (assuming 3 main meals)

def load_meals_from_csv(file_path):
    df = pd.read_csv(file_path)
    return df.to_dict(orient='records')

def generate_meal(calories, meals):
    meal = random.choice(meals)
    return {
        "meal": meal["meal_name"],
        "calories": calories,
        "protein": meal["protein"],
        "carbs": meal["carbs"],
        "fats": meal["fats"]
    }

def generate_diet_plan(height, weight, age, goal, file_path="C:\Users\thiya\Downloads\improved_diet_meal_portions_dataset.csv"):
    calorie_per_meal = calculate_calories(height, weight, age, goal)
    meals = load_meals_from_csv(file_path)
    
    plan = {}
    days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    
    for day in days:
        plan[day] = {
            "breakfast": generate_meal(calorie_per_meal, meals),
            "lunch": generate_meal(calorie_per_meal, meals),
            "dinner": generate_meal(calorie_per_meal, meals)
        }
    
    return plan

# Flask API to interact with the frontend
app = Flask(__name__)

@app.route('/generate_diet', methods=['POST'])
def get_diet_plan():
    data = request.json
    height = data.get("height")
    weight = data.get("weight")
    age = data.get("age")
    goal = data.get("goal")
    
    if not all([height, weight, age, goal]):
        return jsonify({"error": "Missing required parameters"}), 400
    
    diet_plan = generate_diet_plan(height, weight, age, goal)
    return jsonify(diet_plan)

if __name__ == '__main__':
    app.run(debug=True)
