const BACKEND_URL = "http://localhost:3000";

const loginView = document.getElementById("loginView");
const mainView = document.getElementById("mainView");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");
const captureBtn = document.getElementById("captureBtn");
const summarizeBtn = document.getElementById("summarizeBtn");
const summaryBox = document.getElementById("summaryBox");
const loggedInEmail = document.getElementById("loggedInEmail");
const statusEl = document.getElementById("status");

let lastConversationId = null;

chrome.storage.local.get(["token", "email"], (data) => {
  if (data.token) showMainView(data.email);
});

function showMainView(email) {
  loginView.classList.add("hidden");
  mainView.classList.remove("hidden");
  loggedInEmail.textContent = email || "";
}

function showLoginView() {
  loginView.classList.remove("hidden");
  mainView.classList.add("hidden");
}

async function authRequest(endpoint) {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    statusEl.textContent = "Enter email and password.";
    return;
  }

  statusEl.textContent = "Please wait...";

  try {
    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      statusEl.textContent = data.error || "Something went wrong.";
      return;
    }

    chrome.storage.local.set({ token: data.token, email: data.user.email }, () => {
      statusEl.textContent = "";
      showMainView(data.user.email);
    });
  } catch (err) {
    statusEl.textContent = "Could not reach the server. Is it running?";
    console.error(err);
  }
}

loginBtn.addEventListener("click", () => authRequest("/auth/login"));
registerBtn.addEventListener("click", () => authRequest("/auth/register"));

logoutBtn.addEventListener("click", () => {
  chrome.storage.local.remove(["token", "email"], () => {
    showLoginView();
    statusEl.textContent = "";
    summarizeBtn.classList.add("hidden");
    summaryBox.classList.add("hidden");
  });
});

captureBtn.addEventListener("click", async () => {
  statusEl.textContent = "Reading conversation...";
  captureBtn.disabled = true;
  summarizeBtn.classList.add("hidden");
  summaryBox.classList.add("hidden");

  try {
    const { token } = await chrome.storage.local.get(["token"]);
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "scrapeConversation",
    });

    if (!response || !response.messages || response.messages.length === 0) {
      statusEl.textContent = "No messages found on this page.";
      captureBtn.disabled = false;
      return;
    }

    const source = tab.url.includes("claude.ai") ? "claude" : "chatgpt";

    const saveRes = await fetch(`${BACKEND_URL}/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        source,
        title: document.title,
        messages: response.messages,
      }),
    });

    const saved = await saveRes.json();

    if (!saveRes.ok) {
      statusEl.textContent = saved.error || "Failed to save.";
    } else {
      statusEl.textContent = `Saved! ${saved.message_count} messages captured.`;
      lastConversationId = saved.id;
      summarizeBtn.classList.remove("hidden");
    }
  } catch (err) {
    statusEl.textContent = "Error: make sure you are on claude.ai";
    console.error(err);
  }

  captureBtn.disabled = false;
});

summarizeBtn.addEventListener("click", async () => {
  if (!lastConversationId) return;

  statusEl.textContent = "Summarizing with AI...";
  summarizeBtn.disabled = true;

  try {
    const { token } = await chrome.storage.local.get(["token"]);

    const res = await fetch(`${BACKEND_URL}/summarize/${lastConversationId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!res.ok) {
      statusEl.textContent = data.error || "Summarization failed.";
    } else {
      statusEl.textContent = "Summary ready:";
      summaryBox.textContent = data.summary_text;
      summaryBox.classList.remove("hidden");
    }
  } catch (err) {
    statusEl.textContent = "Could not reach the server.";
    console.error(err);
  }

  summarizeBtn.disabled = false;
});