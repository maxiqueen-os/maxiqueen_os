from fastapi import FastAPI

from app.api.v1.router import api_router
from app.core.config import settings


def create_app() -> FastAPI:
    application = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "Motor inicial de toma de decisiones para MaxiQueen OS. "
            "Recibe situaciones y responde con estrategia accionable."
        ),
    )

    application.include_router(api_router, prefix=settings.api_v1_prefix)

    @application.get("/health", tags=["system"])
    def health_check() -> dict[str, str]:
        return {"status": "ok"}

    return application


app = create_app()
