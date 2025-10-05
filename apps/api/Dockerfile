FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

RUN apt-get update && apt-get install -y git && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY ./apps/api ./apps/api
COPY ./migrations ./migrations

WORKDIR /app/apps/api
RUN uv sync --locked --no-cache --no-dev

EXPOSE 8000
CMD ["uv", "run", "fastapi", "run", "main.py", "--host", "0.0.0.0", "--port", "8000"]