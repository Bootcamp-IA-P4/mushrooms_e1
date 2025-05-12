import pytest
from fastapi.testclient import TestClient
import os
import json
import pickle
import pandas as pd
from api.main import app, MushroomFeatures

# Inicializa el cliente de pruebas
client = TestClient(app)

# Cargar datos para pruebas
@pytest.fixture
def form_inputs():
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
    form_inputs_path = os.path.join(data_dir, 'form_inputs.json')
    with open(form_inputs_path, 'r') as file:
        return json.load(file)

@pytest.fixture
def valid_mushroom_features(form_inputs):
    """Crea un conjunto de características válidas para tests"""
    return {
        "bruises": form_inputs["bruises"][0],
        "odor": form_inputs["odor"][0],
        "gill_spacing": form_inputs["gill-spacing"][0],
        "gill_size": form_inputs["gill-size"][0],
        "gill_color": form_inputs["gill-color"][0],
        "stalk_root": form_inputs["stalk-root"][0],
        "stalk_surface_above_ring": form_inputs["stalk-surface-above-ring"][0],
        "stalk_surface_below_ring": form_inputs["stalk-surface-below-ring"][0],
        "stalk_color_above_ring": form_inputs["stalk-color-above-ring"][0],
        "stalk_color_below_ring": form_inputs["stalk-color-below-ring"][0],
        "ring_type": form_inputs["ring-type"][0],
        "spore_print_color": form_inputs["spore-print-color"][0],
        "population": form_inputs["population"][0],
        "habitat": form_inputs["habitat"][0]
    }

# TESTS DE LA API
def test_read_root():
    """Test del endpoint raíz"""
    response = client.get("/")
    assert response.status_code == 200
    
    # Verifica que la respuesta contiene el doctype y comienza con <html>
    assert response.text.startswith("<!DOCTYPE html>")

def test_get_form_inputs(form_inputs):
    """Test del endpoint /form-inputs"""
    response = client.get("/form-inputs")
    assert response.status_code == 200
    # Verifica que devuelve el mismo contenido que form_inputs
    assert response.json() == form_inputs

def test_predict_valid_data(valid_mushroom_features):
    """Test de predicción con datos válidos"""
    response = client.post("/predict", json=valid_mushroom_features)
    assert response.status_code == 200
    
    # Verificar estructura de la respuesta
    data = response.json()
    assert "prediction" in data
    assert "probability" in data
    assert "features" in data
    
    # Verificar que la predicción es un valor válido
    assert data["prediction"] in ["edible", "poisonous"]
    
    # Verificar que la probabilidad está entre 0 y 1
    assert 0 <= data["probability"] <= 1

def test_predict_invalid_data(valid_mushroom_features):
    """Test de validación con datos inválidos"""
    # Modificar un campo para que tenga un valor inválido
    invalid_data = valid_mushroom_features.copy()
    invalid_data["odor"] = "invalid_value"
    
    response = client.post("/predict", json=invalid_data)
    assert response.status_code == 422  # Unprocessable Entity

# TESTS UNITARIOS DE VALIDACIÓN
def test_mushroom_features_validation(form_inputs):
    """Test de validación del modelo Pydantic"""
    # Test con datos válidos
    valid_data = {
        "bruises": form_inputs["bruises"][0],
        "odor": form_inputs["odor"][0],
        "gill_spacing": form_inputs["gill-spacing"][0],
        "gill_size": form_inputs["gill-size"][0],
        "gill_color": form_inputs["gill-color"][0],
        "stalk_root": form_inputs["stalk-root"][0],
        "stalk_surface_above_ring": form_inputs["stalk-surface-above-ring"][0],
        "stalk_surface_below_ring": form_inputs["stalk-surface-below-ring"][0],
        "stalk_color_above_ring": form_inputs["stalk-color-above-ring"][0],
        "stalk_color_below_ring": form_inputs["stalk-color-below-ring"][0],
        "ring_type": form_inputs["ring-type"][0],
        "spore_print_color": form_inputs["spore-print-color"][0],
        "population": form_inputs["population"][0],
        "habitat": form_inputs["habitat"][0]
    }
    
    # Esto no debería lanzar una excepción
    features = MushroomFeatures(**valid_data)
    
    # Test con datos inválidos
    with pytest.raises(ValueError):
        invalid_data = valid_data.copy()
        invalid_data["odor"] = "invalid_value"
        MushroomFeatures(**invalid_data)

# TESTS DE INTEGRACIÓN
def test_model_loaded():
    """Verifica que el modelo se cargue correctamente"""
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
    model_path = os.path.join(data_dir, 'best_mushroom_model.pkl')
    
    assert os.path.exists(model_path), "El archivo del modelo no existe"
    
    with open(model_path, 'rb') as file:
        model = pickle.load(file)
    
    # Verificar que el modelo tiene los métodos esperados
    assert hasattr(model, 'predict'), "El modelo no tiene método predict"
    assert hasattr(model, 'predict_proba'), "El modelo no tiene método predict_proba"

def test_model_prediction_format(valid_mushroom_features):
    """Verifica que el modelo produce predicciones en el formato esperado"""
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
    model_path = os.path.join(data_dir, 'best_mushroom_model.pkl')
    
    with open(model_path, 'rb') as file:
        model = pickle.load(file)
    
    # Convertir características a formato esperado por el modelo
    features_dict = {
        'bruises': valid_mushroom_features['bruises'],
        'odor': valid_mushroom_features['odor'],
        'gill-spacing': valid_mushroom_features['gill_spacing'],
        'gill-size': valid_mushroom_features['gill_size'],
        'gill-color': valid_mushroom_features['gill_color'],
        'stalk-root': valid_mushroom_features['stalk_root'],
        'stalk-surface-above-ring': valid_mushroom_features['stalk_surface_above_ring'],
        'stalk-surface-below-ring': valid_mushroom_features['stalk_surface_below_ring'],
        'stalk-color-above-ring': valid_mushroom_features['stalk_color_above_ring'],
        'stalk-color-below-ring': valid_mushroom_features['stalk_color_below_ring'],
        'ring-type': valid_mushroom_features['ring_type'],
        'spore-print-color': valid_mushroom_features['spore_print_color'],
        'population': valid_mushroom_features['population'],
        'habitat': valid_mushroom_features['habitat']
    }
    
    df = pd.DataFrame([features_dict])
    
    # Ejecutar predicción
    prediction = model.predict(df)
    prediction_proba = model.predict_proba(df)
    
    # Verificar formato de la predicción
    assert prediction.shape == (1,), "La predicción no tiene la forma esperada"
    assert prediction_proba.shape == (1, 2), "Las probabilidades no tienen la forma esperada"
    assert prediction[0] in [0, 1], "La predicción no es 0 o 1"
    assert abs(sum(prediction_proba[0]) - 1.0) < 1e-6, "Las probabilidades no suman 1"

# TEST DE CONSISTENCIA DE DATOS
def test_form_inputs_consistency():
    """Verifica que form_inputs.json tiene la estructura esperada"""
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
    form_inputs_path = os.path.join(data_dir, 'form_inputs.json')
    
    with open(form_inputs_path, 'r') as file:
        form_inputs = json.load(file)
    
    # Lista de campos esperados
    expected_fields = [
        "bruises", "odor", "gill-spacing", "gill-size", "gill-color", 
        "stalk-root", "stalk-surface-above-ring", "stalk-surface-below-ring", 
        "stalk-color-above-ring", "stalk-color-below-ring", "ring-type", 
        "spore-print-color", "population", "habitat"
    ]
    
    # Verificar que todos los campos esperados están presentes
    for field in expected_fields:
        assert field in form_inputs, f"Campo {field} no encontrado en form_inputs.json"
        assert isinstance(form_inputs[field], list), f"El campo {field} no es una lista"
        assert len(form_inputs[field]) > 0, f"El campo {field} está vacío"