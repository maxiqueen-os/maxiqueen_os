from app.services.ai.factory import get_ai_provider


class DecisionModule:
    """Módulo de dominio listo para convivir con futuros módulos del sistema."""

    def __init__(self):
        self.ai_provider = get_ai_provider()

    def run(self, problem: str) -> dict[str, str]:
        prompt = (
            "Actúa como estratega senior de negocios y operaciones. "
            "Responde SOLO en español y en formato JSON con claves: "
            "analysis, recommendation, consequence.\n\n"
            f"Problema del usuario: {problem}"
        )
        return self.ai_provider.generate_decision(prompt=prompt, problem=problem)
