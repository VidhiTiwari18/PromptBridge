# PromptBridge

**AI Conversation Continuity Platform** — a Chrome extension and full-stack app that captures a conversation on Claude or ChatGPT, summarizes it with AI, and carries the context into a fresh conversation on the other platform.

> Switching between AI tools usually means starting from zero — retyping context, re-explaining what you were working on. PromptBridge captures the conversation you already have, compresses it into a dense context package, and drops it straight into the new chat's input box.

<!-- 🎬 DEMO GIF GOES HERE — capture → summarize → transfer, end to end -->

---

## What it does

1. **Capture** — click the extension while on an open Claude or ChatGPT conversation. A content script reads the messages directly off the page.
2. **Summarize** — the backend sends the transcript to Google's Gemini API, which returns a structured summary: goal, key facts established, current state, next step.
3. **Transfer** — click "Transfer," and the extension opens a new tab on the other platform and types the summary straight into the input box, ready to send.

A companion **dashboard** (React) lets you log in and browse every conversation you've captured, view its summary, and see quick stats across your account.

<!-- 📸 SCREENSHOT: dashboard view -->
<!-- 📸 SCREENSHOT: extension popup mid-flow -->

---

## Architecture
```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│  Chrome          │  ───▶ │  Express Backend  │  ───▶ │  Gemini API      │
│  Extension       │       │  (Node.js)        │       │  (summarization) │
│  (content        │       │                   │       └─────────────────┘
│  scripts + popup)│  ◀─── │  JWT auth         │
└─────────────────┘       │  Postgres (Neon)  │
                           └──────────────────┘
                                    ▲
                                    │
                           ┌──────────────────┐
                           │  React Dashboard  │
                           │  (Vite)           │
                           └──────────────────┘
```

- The **extension** is the capture/transfer surface — it lives inside Claude.ai and ChatGPT's pages via Manifest V3 content scripts, and uses a background service worker to keep the transfer flow alive even after the popup closes.
- The **backend** owns auth, storage, and the actual call to Gemini. Nothing talks to Gemini except the server — the extension and dashboard only ever talk to the backend.
- The **dashboard** is a separate read/manage surface for anything already captured — it doesn't do any capturing itself.

---

## Tech stack

| Layer | Tech |
|---|---|
| Extension | Manifest V3, vanilla JS content scripts, background service worker |
| Backend | Node.js, Express, PostgreSQL (Neon), JWT auth, bcrypt |
| AI | Google Gemini API |
| Dashboard | React, Vite, Framer Motion, Lucide icons |
| Landing page | Static HTML/CSS/JS, Canvas-based particle background |

---

## Why these choices

- **JWT over sessions** — the extension, dashboard, and any future client all need to authenticate against the same stateless API; JWTs avoid tying auth to server-side session storage.
- **Postgres over a NoSQL store** — conversations, summaries, and transfers are relationally linked (`conversation_id`, `summary_id` foreign keys with cascading deletes), which maps cleanly onto a relational schema.
- **A background service worker for transfers** — Chrome closes a popup's JavaScript context the moment it loses focus, which happens the instant a new tab opens. Any "wait for the new tab to load, then inject text" logic has to live somewhere that survives that — the background script is the only part of the extension that does.
- **Gemini over a paid API** — free tier, no billing setup required, easy for anyone cloning this repo to get running quickly.

---

## Project structure
```
PromptBridge/
├── backend/          Express API — auth, conversations, summarization
├── dashboard/         React (Vite) dashboard
├── extension/         Chrome extension (Manifest V3)
│   ├── background.js         service worker — handles cross-tab transfer
│   ├── content-scripts/      claude.js, chatgpt.js — scrape + inject
│   └── popup/                 login, capture, summarize, transfer UI
└── web/landing/        Static marketing landing page
```

---

## Running it locally

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, GEMINI_API_KEY
npm run migrate
npm run dev
```

### 2. Dashboard

```bash
cd dashboard
npm install
npm run dev
```

### 3. Extension

1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**, select the `extension/` folder
4. Open Claude.ai or ChatGPT, click the PromptBridge icon

---

## What I'd build next

- Gemini as a third supported platform
- Automated tests for the backend routes
- Deployed, hosted versions of the backend and dashboard so this doesn't require local setup to try

---

## Challenges worth mentioning

- **Chrome's popup lifecycle** — the transfer feature originally lived entirely in the popup's script, which meant it broke silently the moment the popup lost focus (which happens the instant a new tab opens). Moving that logic into a background service worker, communicating through `chrome.storage` instead of shared in-memory state, fixed it properly.
- **Rich-text input boxes aren't plain `<textarea>`s** — both Claude and ChatGPT use ProseMirror-based contentEditable editors, so injecting text meant simulating real input rather than just setting a `.value`.
- **Scraping order matters** — an early version of the content script grabbed all user messages, then all assistant messages, in two separate passes — which meant capturing a conversation out of order. Reading both in a single `querySelectorAll` call (which returns nodes in document order) fixed it.

---

Built by [Vidhi Tiwari](https://github.com/VidhiTiwari18)