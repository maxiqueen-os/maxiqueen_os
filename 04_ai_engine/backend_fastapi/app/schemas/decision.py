from pydantic import BaseModel, Field


class DecisionRequest(BaseModel):
    problem: str = Field(
        min_length=15,
        description="Situación o problema que el usuario quiere resolver.",
        examples=[
            "Tengo poco presupuesto de marketing y debo aumentar ventas en 30 días."
        ],
    )


class DecisionResponse(BaseModel):
    analysis: str = Field(description="Lectura estratégica de la situación.")
    recommendation: str = Field(description="Acción recomendada y próximos pasos.")
    consequence: str = Field(description="Resultado probable si se ejecuta la recomendación.")
