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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrapeConversation") {
    const messages = scrapeChatGPTConversation();
    sendResponse({ messages });
  }
  return true;
});