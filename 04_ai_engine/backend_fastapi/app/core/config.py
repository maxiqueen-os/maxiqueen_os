from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "MaxiQueen OS - AI Engine"
    app_version: str = "0.1.0"
    api_v1_prefix: str = ""

    ai_provider: str = "openai"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


settings = Settings()
