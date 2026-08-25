function scrapeClaudeConversation() {
  const messages = [];

  const allEls = document.querySelectorAll(
    "p.font-claude-response-body, p.whitespace-pre-wrap.break-words"
  );

  allEls.forEach((el) => {
    const text = el.innerText.trim();
    if (!text) return;

    const isAssistant = el.classList.contains("font-claude-response-body");
    messages.push({
      role: isAssistant ? "assistant" : "user",
      content: text,
    });
  });

  return messages;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrapeConversation") {
    const messages = scrapeClaudeConversation();
    sendResponse({ messages });
  }
  return true;
});