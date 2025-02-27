import pandas as pd
from pathlib import Path

class RehabPredictor:
    def __init__(self):
        self.data_path = Path(__file__).parent.parent / 'data' / 'updated_injury_rehab_dataset.xlsx'
        self.df = None
        self.load_data()

    def load_data(self):
        try:
            excel_file = pd.ExcelFile(self.data_path)
            self.df = pd.read_excel(self.data_path, sheet_name=excel_file.sheet_names[0])
            self.df["Age"] = pd.to_numeric(self.df["Age"], errors="coerce")
        except Exception as e:
            print(f"Error loading data: {e}")
            raise

    def get_rehabilitation_plan(self, injury_type, age, gender, height, weight):
        try:
            bmi = weight / ((height / 100) ** 2)
            gender_code = 1 if gender.lower() == 'female' else 0

            phase_mapping = {
                "Phase 1 - Early Rehab": "Phase 1",
                "Phase 2 - Strength": "Phase 2",
                "Phase 3 - Agility & Power": "Phase 3",
                "Phase 4 - Return to Sport": "Phase 4",
            }

            filtered_df = self.df[
                (self.df["Injury Name"].str.lower() == injury_type.lower()) & 
                (self.df["Gender (0=Male, 1=Female)"] == gender_code)
            ].copy()

            filtered_df["Rehab Phase"] = filtered_df["Rehab Phase"].replace(phase_mapping)

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

            return {
                "patient_details": {
                    "injury_type": injury_type,
                    "age": age,
                    "gender": gender,
                    "height": height,
                    "weight": weight,
                    "bmi": round(bmi, 2)
                },
                "rehabilitation_plan": phase_exercises
            }

        except Exception as e:
            print(f"Error generating rehabilitation plan: {e}")
            raise 