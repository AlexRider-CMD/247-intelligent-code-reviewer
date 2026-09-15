const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');

fs.mkdirSync(DATA_DIR, { recursive: true });
function readJson(file, fallback) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } }
function writeJson(file, data) { fs.writeFileSync(file, JSON.stringify(data, null, 2)); }
if (!fs.existsSync(SESSIONS_FILE)) writeJson(SESSIONS_FILE, {});
if (!fs.existsSync(REVIEWS_FILE)) writeJson(REVIEWS_FILE, []);

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function cookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach(p => { const i = p.indexOf('='); if (i > -1) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1)); });
  return out;
}
function auth(req, res, next) {
  const sid = cookies(req).session;
  const sessions = readJson(SESSIONS_FILE, {});
  const user = sid && sessions[sid];
  if (!user) return res.status(401).json({ error: 'Authentication required.' });
  req.user = user;
  next();
}

app.get('/api/session', (req, res) => {
  const sid = cookies(req).session;
  const sessions = readJson(SESSIONS_FILE, {});
  res.json({ authenticated: !!(sid && sessions[sid]), user: sid && sessions[sid] ? sessions[sid] : null });
});

app.post('/api/login', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
  const sid = crypto.randomBytes(32).toString('hex');
  const user = { id: crypto.createHash('sha256').update(email).digest('hex').slice(0, 24), email };
  const sessions = readJson(SESSIONS_FILE, {});
  sessions[sid] = user;
  writeJson(SESSIONS_FILE, sessions);
  res.setHeader('Set-Cookie', `session=${sid}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800`);
  res.json({ user });
});

app.post('/api/logout', (req, res) => {
  const sid = cookies(req).session;
  const sessions = readJson(SESSIONS_FILE, {});
  if (sid) delete sessions[sid];
  writeJson(SESSIONS_FILE, sessions);
  res.setHeader('Set-Cookie', 'session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0');
  res.json({ ok: true });
});

app.get('/api/history', auth, (req, res) => {
  const reviews = readJson(REVIEWS_FILE, []).filter(r => r.userId === req.user.id).slice(0, 30);
  res.json(reviews);
});

// AI runs in the browser through Puter.js. This endpoint only stores the completed review.
app.post('/api/reviews/save', auth, (req, res) => {
  const { code, language = 'Java', filename = 'untitled', score, summary, findings, strengths, nextSteps } = req.body || {};
  if (!code || typeof code !== 'string') return res.status(400).json({ error: 'Code is required.' });
  if (code.length > 60000) return res.status(413).json({ error: 'Code is too large. Maximum 60,000 characters.' });

  const review = {
    id: crypto.randomUUID(),
    userId: req.user.id,
    language,
    filename,
    code,
    summary: typeof summary === 'string' ? summary : 'Review complete.',
    findings: Array.isArray(findings) ? findings : [],
    strengths: Array.isArray(strengths) ? strengths : [],
    nextSteps: Array.isArray(nextSteps) ? nextSteps : [],
    score: Math.max(0, Math.min(100, Number(score) || 0)),
    createdAt: new Date().toISOString()
  };

  const reviews = readJson(REVIEWS_FILE, []);
  reviews.unshift(review);
  writeJson(REVIEWS_FILE, reviews.slice(0, 200));
  res.json({ ok: true, review });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', req.path === '/login' ? 'login.html' : 'index.html')));
app.listen(PORT, () => console.log(`ReviewOS running at http://localhost:${PORT}`));
