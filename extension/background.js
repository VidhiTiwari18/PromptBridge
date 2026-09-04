chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startTransfer") {
    startTransfer(request.text, request.targetUrl);
  }
  return true;
});

function startTransfer(text, targetUrl) {
  chrome.tabs.create({ url: targetUrl }, (newTab) => {
    function tryInject(tabId, retriesLeft) {
      chrome.tabs.sendMessage(tabId, { action: "injectSummary", text }, (response) => {
        if (chrome.runtime.lastError || !response || !response.success) {
          if (retriesLeft > 0) {
            setTimeout(() => tryInject(tabId, retriesLeft - 1), 800);
          } else {
            chrome.storage.local.set({ transferStatus: "Could not find the input box. Paste manually with Ctrl+V." });
          }
        } else {
          chrome.storage.local.set({ transferStatus: "Transferred! Review and hit send." });
        }
      });
    }

    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
      if (tabId === newTab.id && info.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);
        setTimeout(() => tryInject(tabId, 10), 1500);
      }
    });
  });
}