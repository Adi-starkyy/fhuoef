# Stage 1: Build Frontend (React + Vite)
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

COPY Frontend/package*.json ./
RUN npm ci || npm install

COPY Frontend/ .
RUN npm run build

# Stage 2: Backend (FastAPI) + Static Assets
FROM python:3.10-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install backend dependencies
COPY Backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application
COPY Backend/ .

# Copy built frontend static files into Backend static directory
COPY --from=frontend-builder /frontend/dist ./static

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
