import sys
import json
import pandas as pd
from pathlib import Path

def generate_rehabilitation_plan(injury_type, age, gender, height, weight):
    try:
        # Load data
        data_path = Path(__file__).parent.parent / 'data' / 'updated_injury_rehab_dataset.xlsx'
        excel_file = pd.ExcelFile(data_path)
        df = pd.read_excel(data_path, sheet_name=excel_file.sheet_names[0])
        df["Age"] = pd.to_numeric(df["Age"], errors="coerce")

        # Calculate BMI
        height = float(height)
        weight = float(weight)
        bmi = weight / ((height / 100) ** 2)
        gender_code = 1 if gender.lower() == 'female' else 0

        # Phase mapping
        phase_mapping = {
            "Phase 1 - Early Rehab": "Phase 1",
            "Phase 2 - Strength": "Phase 2",
            "Phase 3 - Agility & Power": "Phase 3",
            "Phase 4 - Return to Sport": "Phase 4",
        }

        # Filter data
        filtered_df = df[
            (df["Injury Name"].str.lower() == injury_type.lower()) & 
            (df["Gender (0=Male, 1=Female)"] == gender_code)
        ].copy()

        filtered_df["Rehab Phase"] = filtered_df["Rehab Phase"].replace(phase_mapping)

        # Generate plan
        phase_exercises = {}
        for phase in ["Phase 1", "Phase 2", "Phase 3", "Phase 4"]:
            phase_data = filtered_df[filtered_df["Rehab Phase"] == phase]
            exercises = phase_data["Exercise"].unique().tolist()
            sets = phase_data["Sets"].unique().tolist()
            reps = phase_data["Reps"].unique().tolist()
            goals = phase_data["Goal"].unique().tolist() if 'Goal' in phase_data.columns else ["Not Specified"]

            if goals == ["Not Specified"]:
                goals = {
                    "Phase 1": ["Reduce pain and swelling"],
                    "Phase 2": ["Increase strength and range of motion"],
                    "Phase 3": ["Improve agility and power"],
                    "Phase 4": ["Return to sport activities"]
                }[phase]

            phase_exercises[phase] = {
                "exercises": exercises,
                "sets": sets,
                "reps": reps,
                "goals": goals,
            }

        result = {
            "patient_details": {
                "injury_type": injury_type,
                "age": int(age),
                "gender": gender,
                "height": height,
                "weight": weight,
                "bmi": round(bmi, 2)
            },
            "rehabilitation_plan": phase_exercises
        }

        return result

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    # Get arguments from command line
    injury_type = sys.argv[1]
    age = sys.argv[2]
    gender = sys.argv[3]
    height = sys.argv[4]
    weight = sys.argv[5]

    # Generate plan
    plan = generate_rehabilitation_plan(injury_type, age, gender, height, weight)
    
    # Print as JSON (will be captured by Node.js)
    print(json.dumps(plan)) 