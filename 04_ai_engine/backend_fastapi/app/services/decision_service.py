from app.schemas.decision import DecisionRequest, DecisionResponse
from app.services.modules.decision_module import DecisionModule


class DecisionService:
    """Servicio orquestador para el módulo de toma de decisiones."""

    def __init__(self, module: DecisionModule):
        self.module = module

    def generate_strategy(self, request: DecisionRequest) -> DecisionResponse:
        result = self.module.run(problem=request.problem)
        return DecisionResponse(
            analysis=result["analysis"],
            recommendation=result["recommendation"],
            consequence=result["consequence"],
        )
