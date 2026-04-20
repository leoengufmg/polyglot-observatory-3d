# Polyglot Observatory 3D

Polyglot Observatory 3D is a portfolio-ready system for comparing small algorithm and utility implementations across languages and visualizing technical telemetry through a real-time 3D frontend.

This project is intentionally neutral in domain. It demonstrates frontend, visualization, orchestration, and polyglot service design without depending on a hiring-specific product space.

## What It Demonstrates

- `Three.js / WebGL`: custom 3D pipeline visualization
- `TypeScript`: main React frontend, typed API client, typed state models
- `JavaScript`: embeddable widget built without a framework
- `Python`: orchestration API and implementation analyzer with FastAPI
- `Java`: language-specific benchmarking microservice
- `Ruby`: report generation microservice

## Product Story

The user opens a workload, selects a language implementation, and inspects a technical pipeline that analyzes structure, applies language-specific heuristics, and produces a report.

`ingest -> checks -> benchmark -> report`

## Why This Repo Works As A Portfolio Piece

- `frontend-3d` demonstrates React, TypeScript, and Three.js in a product-shaped UI.
- `frontend-js-widget` demonstrates plain JavaScript with an embeddable implementation preview widget.
- `services/python-analyzer` acts as the orchestration API and core analyzer.
- `services/java-benchmark` adds Java-specific heuristics and implementation signals.
- `services/ruby-reporter` produces portable markdown reports.
- `shared/workloads` centralizes workload metadata and reference implementations.

## Repository Structure

```txt
frontend-3d/              React + TypeScript + Three.js dashboard
frontend-js-widget/       Vanilla JavaScript embeddable widget
services/python-analyzer/ FastAPI orchestration and analysis service
services/java-benchmark/  Java microservice for implementation metrics
services/ruby-reporter/   Ruby microservice for report generation
shared/workloads/         Workload metadata and reference implementations
docker-compose.yml        Local multi-service orchestration
```

## Demo Flow

1. Open the React dashboard.
2. Choose a workload and language.
3. Inspect or edit the sample implementation.
4. Send it to the Python analyzer.
5. Let the analyzer enrich the result with the Java and Ruby services.
6. Watch the 3D pipeline update and inspect the final report.

## Local Run

### Option 1: Docker Compose

```bash
docker compose up --build
```

Services:

- `frontend-3d`: http://localhost:5173
- `frontend-js-widget`: http://localhost:4173
- `python-analyzer`: http://localhost:8000
- `java-benchmark`: http://localhost:8080
- `ruby-reporter`: http://localhost:4567

### Option 2: Run Parts Separately

Frontend:

```bash
cd frontend-3d
npm install
npm run dev
```

Python analyzer:

```bash
cd services/python-analyzer
py -m uvicorn app.main:app --reload
```

Java benchmark service:

```bash
javac -d out src/main/java/com/polyglotobservatory/JavaBenchmarkServer.java
java -cp out com.polyglotobservatory.JavaBenchmarkServer
```

Ruby reporter:

```bash
ruby app.rb
```

## Endpoints

### Python Analyzer

- `GET /health`
- `GET /workloads`
- `POST /analyze`

### Java Benchmark

- `GET /health`
- `POST /benchmark`

### Ruby Reporter

- `GET /health`
- `POST /report`

## Suggested Next Steps

- Replace heuristic scoring with real benchmark execution sandboxes.
- Add persistence for workload runs and comparison history.
- Stream stage transitions over WebSockets.
- Support downloadable reports and charts.
- Add screenshots or a short video demo to the repo.
