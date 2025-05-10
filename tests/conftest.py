# Este archivo permite configurar fixtures globales para todos los tests
import pytest
import os
import sys

# Agregar el directorio raíz del proyecto al path para poder importar los módulos
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Define aquí cualquier fixture global que pueda ser necesario para varios tests
@pytest.fixture(scope="session", autouse=True)
def setup_environment():
    """
    Preparar el entorno de pruebas - se ejecutará automáticamente antes de todos los tests
    """
    # Asegurarse de que estamos usando el entorno de pruebas
    os.environ["TESTING"] = "1"
    
    # Puedes agregar más configuraciones según sea necesario
    yield
    
    # Limpieza después de los tests (si es necesario)
    os.environ.pop("TESTING", None)