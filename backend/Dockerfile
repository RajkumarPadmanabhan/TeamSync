FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy backend dependencies
COPY manage.py .
COPY teamsync ./teamsync
COPY apps ./apps

RUN pip install --no-cache-dir django djangorestframework django-cors-headers djangorestframework-simplejwt gunicorn

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
