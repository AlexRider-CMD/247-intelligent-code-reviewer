const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');

fs.mkdirSync(DATA_DIR, { recursive: true });
function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return fallback; }
}
function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
if (!fs.existsSync(REVIEWS_FILE)) writeJson(REVIEWS_FILE, []);

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// AI runs entirely in the browser. This endpoint only saves the completed review locally.
app.post('/api/review', (req, res) => {
  const {
    code,
    language = 'Java',
    filename = 'untitled',
    score = 0,
    summary = '',
    findings = [],
    strengths = [],
    nextSteps = []
  } = req.body || {};

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Code is required.' });
  }
  if (code.length > 50000) {
    return res.status(413).json({ error: 'Code is too large. Maximum 50,000 characters.' });
  }

  const review = {
    id: crypto.randomUUID(),
    language: String(language),
    filename: String(filename || 'untitled'),
    code,
    score: Math.max(0, Math.min(100, Number(score) || 0)),
    summary: String(summary || ''),
    findings: Array.isArray(findings) ? findings : [],
    strengths: Array.isArray(strengths) ? strengths : [],
    nextSteps: Array.isArray(nextSteps) ? nextSteps : [],
    createdAt: new Date().toISOString()
  };

  const reviews = readJson(REVIEWS_FILE, []);
  reviews.unshift(review);
  writeJson(REVIEWS_FILE, reviews.slice(0, 200));
  res.json(review);
});

app.get('/api/history', (req, res) => {
  res.json(readJson(REVIEWS_FILE, []).slice(0, 30));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`ReviewOS running at http://localhost:${PORT}`));
