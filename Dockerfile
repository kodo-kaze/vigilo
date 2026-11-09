# =============================================================================
# STAGE 1: Build the Next.js Frontend
# =============================================================================
FROM node:20-slim AS frontend-builder
WORKDIR /app

# Install npm dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy full repository source and build standalone distribution
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# =============================================================================
# STAGE 2: Production Unified Runner (Python 3.12 + Node.js)
# =============================================================================
FROM python:3.12-slim AS runner
WORKDIR /app

# 1. Install system utilities and multimedia libraries for OpenCV, video decoding, and Node.js
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    ffmpeg \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 2. Install Python AI dependencies (universal CPU PyTorch wheels + vision models)
COPY backend/requirements.txt /app/backend/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r /app/backend/requirements.txt

# 3. Copy Backend Code & AI Model Weights
COPY backend /app/backend

# 4. Copy Next.js Standalone Build and Static Assets
COPY --from=frontend-builder /app/.next/standalone /app/
COPY --from=frontend-builder /app/.next/static /app/.next/static
COPY --from=frontend-builder /app/public /app/public

# 5. Configure Entrypoint Process Supervisor
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Environment variables
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1
ENV CROWD_STREAM_SOURCE="0"
ENV INTERNAL_BACKEND_URL="http://127.0.0.1:8000"

EXPOSE 3000 8000

ENTRYPOINT ["/app/entrypoint.sh"]
