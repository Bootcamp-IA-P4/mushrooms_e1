from sqlalchemy.orm import Session
from .models import Prediction
from sqlalchemy import desc

# Guardamos una nueva predicción
def save_prediction(db: Session, prediction_result: str):
    new_prediction = Prediction(
        mushroom_id=None,  
        prediction_result=prediction_result
    )
    db.add(new_prediction)
    db.commit()
    db.refresh(new_prediction)
    return new_prediction

# Obtenemos las últimas N predicciones
def get_recent_predictions(db: Session, limit: int = 5):
    return db.query(Prediction).order_by(desc(Prediction.created_at)).limit(limit).all()
