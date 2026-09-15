# 24/7 Intelligent AI Code Reviewer — ReviewOS

A local AI-powered code review application using Node.js, Express and Google Gemini.

## Features
- AI code review for Java, JavaScript, Python, SQL and C++
- Security, correctness, performance, maintainability and readability analysis
- Health score, findings, strengths and next steps
- Local review history stored as JSON
- Simple local email session authentication
- No API key committed to the repository

## Run locally

Requirements: Node.js 18+

```powershell
npm install
Copy-Item .env.example .env
```

Add your Gemini API key to `.env`:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
PORT=3000
```

Then run:

```powershell
npm start
```

Open `http://localhost:3000`.

## Project structure

```text
247-intelligent-code-reviewer/
├── public/
│   ├── index.html
│   └── login.html
├── data/
│   └── .gitkeep
├── .env.example
├── .gitignore
├── package.json
├── server.js
└── README.md
```

## Important
The local login is intentionally lightweight for development. It is not production-grade authentication. For production, use a real identity provider, secure session storage, HTTPS and a database.
