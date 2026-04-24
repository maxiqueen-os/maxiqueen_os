from abc import ABC, abstractmethod


class AIProvider(ABC):
    @abstractmethod
    def generate_decision(self, prompt: str, problem: str) -> dict[str, str]:
        """Devuelve analysis, recommendation y consequence."""
