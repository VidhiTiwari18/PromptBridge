function scrapeChatGPTConversation() {
  const messages = [];

  const messageEls = document.querySelectorAll("[data-message-author-role]");

  messageEls.forEach((el) => {
    const role = el.getAttribute("data-message-author-role");
    const text = el.innerText.trim();
    if (!text) return;

    messages.push({
      role: role === "assistant" ? "assistant" : "user",
      content: text,
    });
  });

  return messages;
}

function injectIntoChatGPTComposer(text) {
  const box = document.querySelector("div#prompt-textarea.ProseMirror");
  if (!box) return false;

  box.focus();
  document.execCommand("insertText", false, text);
  return true;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrapeConversation") {
    const messages = scrapeChatGPTConversation();
    sendResponse({ messages });
  }
  if (request.action === "injectSummary") {
    const success = injectIntoChatGPTComposer(request.text);
    sendResponse({ success });
  }
  return true;
});