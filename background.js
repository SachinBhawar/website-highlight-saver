// Listen for messages from the content script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "saveHighlight") {
    // Get existing highlights from storage
    chrome.storage.local.get("highlights", function (data) {
      const highlights = data.highlights || [];
      highlights.push(request.highlight);

      // Save the updated highlights
      chrome.storage.local.set({ highlights: highlights }, function () {
        // Send a success response back to the content script
        sendResponse({ success: true });
      });
    });

    // Return true to indicate that we will send a response asynchronously
    return true;
  }
});
