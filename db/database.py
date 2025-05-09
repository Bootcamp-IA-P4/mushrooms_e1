from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
import sys


load_dotenv()

# URL de conexión a PostgreSQL
DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("ERROR: ⛔ La variable de entorno DATABASE_URL no está configurada.")
    sys.exit(1)

# Creamos el motor de conexión
try:
    engine = create_engine(DATABASE_URL)
    print("✅ Conexión a la base de datos establecida.")
except Exception as e:
    print(f"Error al conectar con la base de datos: {e}")
    sys.exit(1)

# Creamos la sesión local
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
