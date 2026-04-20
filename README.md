# AI Coding Trainer 3D

AI Coding Trainer 3D is a portfolio-ready polyglot product that shows how coding challenges can be evaluated, scored, and visualized through a real-time 3D frontend.

It is designed to map directly to AI Training roles that ask for:

- Three.js / WebGL
- TypeScript
- JavaScript
- Python
- Java
- Ruby

## Product Story

The user picks a challenge, writes a solution in Python, JavaScript, TypeScript, Java, or Ruby, and sends it to an evaluation pipeline. The platform scores the submission, creates feedback, and visualizes the pipeline in 3D:

`submission -> tests -> score -> feedback`

## Why This Repo Works As A Portfolio Piece

- `frontend-3d` demonstrates React, TypeScript, and Three.js with a custom WebGL scene.
- `frontend-js-widget` demonstrates plain JavaScript through an embeddable challenge widget.
- `services/python-evaluator` works as the orchestration API and evaluation engine.
- `services/java-runner` shows a Java scoring microservice.
- `services/ruby-reporter` shows a Ruby reporting microservice.
- `shared/challenges` centralizes challenge content and starter code for every language.

## Repository Structure

```txt
frontend-3d/              React + TypeScript + Three.js dashboard
frontend-js-widget/       Vanilla JavaScript embeddable widget
services/python-evaluator FastAPI evaluation orchestrator
services/java-runner/     Java microservice for Java submission scoring
services/ruby-reporter/   Ruby microservice for report generation
shared/challenges/        Challenge metadata and starter code
docker-compose.yml        Local multi-service orchestration
```

## Demo Flow

1. Open the React dashboard.
2. Choose a challenge and language.
3. Submit code to the Python evaluator.
4. Let the evaluator enrich the result with the Java and Ruby services.
5. Watch the 3D pipeline update and inspect the final report.

## Local Run

### Option 1: Docker Compose

```bash
docker compose up --build
```

Services:

- `frontend-3d`: http://localhost:5173
- `frontend-js-widget`: http://localhost:4173
- `python-evaluator`: http://localhost:8000
- `java-runner`: http://localhost:8080
- `ruby-reporter`: http://localhost:4567

### Option 2: Run Parts Separately

Frontend:

```bash
cd frontend-3d
npm install
npm run dev
```

Python evaluator:

```bash
cd services/python-evaluator
py -m uvicorn app.main:app --reload
```

Java runner:

```bash
javac -d out src/main/java/com/aicodingtrainer/JavaRunnerServer.java
java -cp out com.aicodingtrainer.JavaRunnerServer
```

Ruby reporter:

```bash
ruby app.rb
```

## Endpoints

### Python Evaluator

- `GET /health`
- `GET /challenges`
- `POST /evaluate`

### Java Runner

- `GET /health`
- `POST /score`

### Ruby Reporter

- `GET /health`
- `POST /report`

## Suggested Next Steps

- Add secure execution sandboxes for each language.
- Persist submissions and attempt history in a database.
- Stream pipeline updates over WebSockets.
- Attach an LLM-based qualitative reviewer for richer feedback.
- Add screenshots or a short video demo to the repo.

