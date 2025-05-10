import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
import numpy as np
import json
import os
from api.main import app, MushoomFeatures

# Inicializa el cliente de pruebas
client = TestClient(app)

# Fixture para datos de mushroom válidos
@pytest.fixture
def valid_mushroom_data():
    return {
        "bruises": "bruises",
        "odor": "foul",
        "gill_spacing": "crowded",
        "gill_size": "narrow",
        "gill_color": "black",
        "stalk_root": "club",
        "stalk_surface_above_ring": "smooth",
        "stalk_surface_below_ring": "smooth",
        "stalk_color_above_ring": "white",
        "stalk_color_below_ring": "white",
        "ring_type": "pendant",
        "spore_print_color": "black",
        "population": "scattered",
        "habitat": "urban"
    }

# Tests con mocks para evitar dependencias externas

@patch('api.main.model')
def test_predict_endpoint_with_mock_model(mock_model, valid_mushroom_data):
    """Test del endpoint /predict usando un modelo mock"""
    # Configurar el mock para que devuelva valores previsibles
    mock_model.predict.return_value = np.array([1])  # 1 = poisonous
    mock_model.predict_proba.return_value = np.array([[0.05, 0.95]])  # 95% de probabilidad de ser venenosa
    
    # Llamar al endpoint
    response = client.post("/predict", json=valid_mushroom_data)
    
    # Verificar la respuesta
    assert response.status_code == 200
    result = response.json()
    assert result["prediction"] == "poisonous"
    assert result["probability"] == 0.95
    
    # Verificar que el modelo fue llamado correctamente
    mock_model.predict.assert_called_once()
    mock_model.predict_proba.assert_called_once()

@patch('api.main.form_inputs')
def test_form_inputs_endpoint_with_mock(mock_form_inputs):
    """Test del endpoint /form-inputs usando un mock"""
    # Crear datos de mock
    mock_data = {
        "bruises": ["bruises", "no"],
        "odor": ["almond", "anise", "foul", "none"],
        "gill-spacing": ["close", "crowded"],
        # ... otros campos
    }
    mock_form_inputs.__getitem__.side_effect = mock_data.__getitem__
    mock_form_inputs.keys.return_value = mock_data.keys()
    mock_form_inputs.items.return_value = mock_data.items()
    
    # Llamar al endpoint
    response = client.get("/form-inputs")
    
    # Verificar la respuesta
    assert response.status_code == 200
    # La verificación exacta dependerá de cómo se implementa tu código,
    # pero básicamente debería devolver los datos de mock

@patch('builtins.open', side_effect=FileNotFoundError("File not found"))
@patch('pickle.load')
@patch('json.load')
def test_app_startup_with_file_error(mock_json_load, mock_pickle_load, mock_open):
    """Verifica que se maneje correctamente la ausencia de archivos al iniciar"""
    from importlib import reload
    import api.main

    # Reimportamos para que se ejecute el bloque try-except con el mock activo
    reload(api.main)

    # Verificamos que se intentó abrir los archivos y que no hay excepción
    assert mock_open.called


# Test de errores HTTP

def test_invalid_json_format():
    """Test de envío de JSON mal formateado"""
    # Enviar una cadena que no es JSON válido
    response = client.post(
        "/predict", 
        headers={"Content-Type": "application/json"},
        content="this is not json"
    )
    assert response.status_code == 422  # Unprocessable Entity

def test_missing_required_fields():
    """Test de envío de datos con campos faltantes"""
    # Enviar un JSON con campos faltantes
    incomplete_data = {
        "bruises": "bruises",
        # Faltan todos los demás campos
    }
    response = client.post("/predict", json=incomplete_data)
    assert response.status_code == 422  # Unprocessable Entity