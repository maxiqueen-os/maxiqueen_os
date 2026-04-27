from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import User

app = FastAPI()

Base.metadata.create_all(bind=engine)

@app.post("/add-xp")
def add_xp(data: dict, db: Session = Depends(get_db)):

    user = db.query(User).first()

    if not user:
        user = User(name="Jugador")
        db.add(user)

    user.xp += data["xp"]

    if user.xp >= 100:
        user.level += 1
        user.xp = 0

    db.commit()

    return {
        "level": user.level,
        "xp": user.xp
    }