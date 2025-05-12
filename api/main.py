from fastapi import FastAPI, Query, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, field_validator, ConfigDict
from typing import Dict, List, Optional
import pickle
import json
import os
import pandas as pd
from db.database import SessionLocal
from db.crud import save_prediction, get_recent_predictions
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from db.database import SessionLocal
from db.models import Mushroom
import traceback



# Load model and input values
try:
    # Adjust paths to look in the data directory
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
    model_path = os.path.join(data_dir, 'best_mushroom_model.pkl')
    form_inputs_path = os.path.join(data_dir, 'form_inputs.json')
    
    with open(model_path, 'rb') as file:
        model = pickle.load(file)
        
    with open(form_inputs_path, 'r') as file:
        form_inputs = json.load(file)
except FileNotFoundError as e:
    print(f"Error loading files: {e}")
    # We'll handle this error in the API endpoints

app = FastAPI(
    title="Mushroom Classification API",
    description="API to predict if a mushroom is edible or poisonous",
    version="1.0.0"
)

# Add CORS middleware to allow cross-origin requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class MushroomFeatures(BaseModel):
    bruises: str
    odor: str
    gill_spacing: str
    gill_size: str
    gill_color: str
    stalk_root: str
    stalk_surface_above_ring: str
    stalk_surface_below_ring: str
    stalk_color_above_ring: str
    stalk_color_below_ring: str
    ring_type: str
    spore_print_color: str
    population: str
    habitat: str

    # ✅ Nueva configuración Pydantic v2
    model_config = ConfigDict(populate_by_name=True)
    
    # Validators to check if values are allowed (updated for Pydantic v2)
    @field_validator("*")
    @classmethod
    def check_values(cls, v, info):
        # Make sure form_inputs is loaded
        if 'form_inputs' not in globals():
            raise ValueError("Form inputs not loaded")
        
        # Convert field name from snake_case to kebab-case for validation
        field_name = info.field_name.replace('_', '-')
        
        # Check if the value is in the allowed values
        if field_name in form_inputs and v not in form_inputs[field_name]:
            allowed_values = ", ".join(form_inputs[field_name])
            raise ValueError(f"Value '{v}' is not valid for {field_name}. Allowed values: {allowed_values}")
        return v

class PredictionResponse(BaseModel):
    prediction: str
    probability: float
    features: Dict

# Define the templates directory path
templates_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'static')

# Mount static files (CSS, JS)
app.mount("/static", StaticFiles(directory=templates_dir), name="static")

# Change your root endpoint to serve the HTML
@app.get("/", response_class=FileResponse)
def serve_frontend():
    return FileResponse(os.path.join(templates_dir, "index.html"))

# Change your API welcome message to a different route
@app.get("/api")
def api_root():
    return {"message": "Welcome to the Mushroom Classification API"}

@app.get("/form-inputs")
def get_form_inputs():
    try:
        return form_inputs
    except NameError:
        raise HTTPException(status_code=500, detail="Form inputs file not loaded properly")
    
# Converts the dictionary keys from kebab-case to snake_case.
def convert_to_snake_case(data: dict) -> dict:
    
    return {key.replace("-", "_"): value for key, value in data.items()}

@app.post("/predict", response_model=PredictionResponse)
def predict_mushroom(features: MushroomFeatures):
    db = None

    try:
        # Verify that the model is loaded
        if "model" not in globals():
            print("❌ Error: El modelo no está cargado.")
            raise HTTPException(status_code=500, detail="El modelo no está cargado.")

        # Log the received data
        print(f"📦 Datos recibidos para predicción: {features.dict()}")

        # Convert the data to a DataFrame
        try:
            features_dict = {
                'bruises': features.bruises,
                'odor': features.odor,
                'gill-spacing': features.gill_spacing,
                'gill-size': features.gill_size,
                'gill-color': features.gill_color,
                'stalk-root': features.stalk_root,
                'stalk-surface-above-ring': features.stalk_surface_above_ring,
                'stalk-surface-below-ring': features.stalk_surface_below_ring,
                'stalk-color-above-ring': features.stalk_color_above_ring,
                'stalk-color-below-ring': features.stalk_color_below_ring,
                'ring-type': features.ring_type,
                'spore-print-color': features.spore_print_color,
                'population': features.population,
                'habitat': features.habitat
            }
            
            # Create DataFrame for prediction
            df = pd.DataFrame([features_dict])
            print(f"✅ DataFrame creado correctamente:\n{df}")

        except Exception as e:
            print(f"❌ Error al crear el DataFrame: {e}")
            traceback.print_exc()
            raise HTTPException(status_code=422, detail=f"Error al crear el DataFrame: {str(e)}")

        # Make the prediction
        try:
            prediction_numeric = model.predict(df)[0]
            prediction_proba = model.predict_proba(df)[0]
            print(f"✅ Predicción realizada: {prediction_numeric}, Probabilidad: {prediction_proba}")

        except Exception as e:
            print(f"❌ Error durante la predicción: {e}")
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Error durante la predicción: {str(e)}")

        # Convert to readable results
        prediction = "edible" if prediction_numeric == 0 else "poisonous"
        probability = float(prediction_proba[prediction_numeric])

        # Save to database
        try:
            db = SessionLocal()

            # Convert keys to snake_case before creating the Mushroom object
            snake_case_dict = convert_to_snake_case(features_dict)
            print(f"🐍 Datos convertidos a snake_case: {snake_case_dict}")

            # Create Mushroom record
            new_mushroom = Mushroom(**snake_case_dict)
            db.add(new_mushroom)
            db.commit()
            db.refresh(new_mushroom)

            # Save prediction
            save_prediction(db, prediction, new_mushroom.id, probability)
            print(f"✅ Predicción guardada en la base de datos con ID: {new_mushroom.id}")

        except Exception as e:
            print(f"❌ Error al guardar en la base de datos: {e}")
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Error al guardar en la base de datos: {str(e)}")

        return {
            "prediction": prediction,
            "probability": probability,
            "features": snake_case_dict
        }

    except Exception as e:
        print(f"❌ Error general en /predict: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if db:
            db.close()
    
@app.get("/predictions")
def get_predictions(limit: int = 5):
    try:
        db = SessionLocal()
        predictions = get_recent_predictions(db, limit)
        db.close()

        return [
            {"id": str(pred.id), "result": pred.prediction_result, "probability": pred.probability, "created_at": pred.created_at}
            for pred in predictions
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching predictions: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)