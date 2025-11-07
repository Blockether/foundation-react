# Build stage
FROM python:3.13-slim as builder

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Install uv via pip (more reliable than shell script)
RUN pip install --no-cache-dir uv

# Set working directory
WORKDIR /app

# Copy project files
COPY pyproject.toml uv.lock* ./
COPY server.py .

# Install dependencies with uv
RUN uv sync --frozen --no-dev

# Runtime stage
FROM public.ecr.aws/lambda/python:3.13
ENV PORT=8000 AWS_LWA_READINESS_CHECK_PROTOCOL=tcp 

COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.1 /lambda-adapter /opt/extensions/lambda-adapter

# Copy installed packages from builder to the Lambda layer directory
COPY --from=builder /app/.venv/lib/python3.13/site-packages/ ${LAMBDA_TASK_ROOT}/

# Copy application code
COPY --from=builder /app/server.py ${LAMBDA_TASK_ROOT}/

CMD exec uvicorn --port=$PORT server:app
