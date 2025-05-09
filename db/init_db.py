from db.database import engine
from db.models import Base

def init_db():
    try:
        print("⚙️  Creando tablas en la base de datos...")
        Base.metadata.create_all(bind=engine)
        print("✅ Tablas creadas correctamente.")
    except Exception as e:
        print(f"😢 Error al crear tablas: {e}")

# Ejecutamos la creación de tablas solo si se ejecuta directamente
if __name__ == "__main__":
    init_db()
