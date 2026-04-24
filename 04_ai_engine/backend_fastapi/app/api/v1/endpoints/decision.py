from fastapi import APIRouter, Depends

from app.schemas.decision import DecisionRequest, DecisionResponse
from app.services.decision_service import DecisionService
from app.services.modules.decision_module import DecisionModule

router = APIRouter()


def get_decision_service() -> DecisionService:
    return DecisionService(module=DecisionModule())


@router.post("/decision", response_model=DecisionResponse)
def create_decision(
    payload: DecisionRequest,
    service: DecisionService = Depends(get_decision_service),
) -> DecisionResponse:
    return service.generate_strategy(payload)
