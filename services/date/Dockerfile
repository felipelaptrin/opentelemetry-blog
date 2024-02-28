FROM python:3.11.8-slim
WORKDIR /app
RUN pip install pipenv
COPY Pipfile .
COPY Pipfile.lock .
RUN pipenv install --deploy
COPY . .
CMD ["pipenv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3000", "--no-access-log"]
