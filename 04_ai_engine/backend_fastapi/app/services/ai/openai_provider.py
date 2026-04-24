import json

from openai import OpenAI

from app.core.config import settings
from app.services.ai.base import AIProvider


class OpenAIProvider(AIProvider):
    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None

    def generate_decision(self, prompt: str, problem: str) -> dict[str, str]:
        if not self.client:
            return self._fallback(problem)

        response = self.client.responses.create(
            model=settings.openai_model,
            input=prompt,
            response_format={"type": "json_object"},
        )

        content = response.output_text
        try:
            parsed = json.loads(content)
            return {
                "analysis": parsed.get("analysis", "No se recibió análisis."),
                "recommendation": parsed.get("recommendation", "No se recibió recomendación."),
                "consequence": parsed.get("consequence", "No se recibió consecuencia."),
            }
        except json.JSONDecodeError:
            return self._fallback(problem)

    @staticmethod
    def _fallback(problem: str) -> dict[str, str]:
        return {
            "analysis": (
                "La situación requiere priorización por impacto/esfuerzo y validación rápida. "
                f"Problema detectado: {problem[:160]}"
            ),
            "recommendation": (
                "Define 1 objetivo crítico para los próximos 7 días, crea 3 acciones medibles "
                "y revisa resultados cada 24h para iterar."
            ),
            "consequence": (
                "Si ejecutas con disciplina, reducirás incertidumbre y tendrás señales claras "
                "para decidir si escalar, pivotar o detener la iniciativa."
            ),
        }
