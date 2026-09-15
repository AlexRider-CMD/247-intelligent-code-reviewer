# 24/7 Intelligent AI Code Reviewer — ReviewOS

A cloud-AI code review application using Node.js, Express and Puter.js.

## AI architecture
- Browser calls Puter.js cloud AI directly
- No Gemini API key
- No local Ollama/model installation
- Node.js backend stores review history only
- Code-review output is structured as JSON for the ReviewOS dashboard

## Features
- AI code review for Java, JavaScript, Python, SQL and C++
- Security, correctness, performance, maintainability and readability analysis
- Health score, findings, strengths and next steps
- Review history stored as JSON
- Simple local email session authentication
- No AI API secret committed to the repository

## Run

Requirements: Node.js 18+

```powershell
npm install
npm start
```

Open `http://localhost:3000`.

You do **not** need to create a Gemini key or put an AI key in `.env`.

## Important

Puter.js is a third-party cloud AI service. Its free availability, model selection, quotas and fair-use policies can change. The project therefore does not promise unlimited AI usage forever.

The local login is intentionally lightweight for development. It is not production-grade authentication. For production, use a real identity provider, secure session storage, HTTPS and a database.
