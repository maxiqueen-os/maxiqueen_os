from fastapi import APIRouter

from app.api.v1.endpoints.decision import router as decision_router

api_router = APIRouter()
api_router.include_router(decision_router, tags=["decision"])
