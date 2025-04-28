console.log("Website Highlight Saver content script loaded");

// Variable to store the current selection
let currentSelection = {
    text: "",
    range: null,
};

// Create a floating button element
const saveButton = document.createElement("div");

saveButton.textContent = "Save Highlight";

// Style the floating button
saveButton.style.cssText = `
  position: absolute;
  background-color: #4285f4;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  z-index: 10000;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
  display: none;
  user-select: none;
  transition: background-color 0.2s, transform 0.1s;
  border: none;
`;

document.body.appendChild(saveButton);

// Listen for text selection
document.addEventListener("mouseup", function (event) {
    // Don't process if the click was on the save button itself
    if (event.target === saveButton) {
        return;
    }

    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText) {
        currentSelection.text = selectedText;

        if (selection.rangeCount > 0) {
            currentSelection.range = selection.getRangeAt(0);

            const rect = currentSelection.range.getBoundingClientRect();

            saveButton.style.left = `${rect.left + window.scrollX}px`;
            saveButton.style.top = `${rect.bottom + window.scrollY + 5}px`;
            saveButton.style.display = "block";
        }
    } else {
        // Hide button if no text is selected and click wasn't on button
        if (event.target !== saveButton) {
            saveButton.style.display = "none";
            currentSelection = { text: "", range: null };
        }
    }
});

// Save the highlighted text
saveButton.addEventListener("click", function (event) {
    event.stopPropagation();
    event.preventDefault();
    if (currentSelection.text) {
        const pageUrl = window.location.href;
        const pageTitle = document.title;
        const timestamp = new Date().toISOString();

        const highlight = {
            id: crypto.randomUUID(),
            text: currentSelection.text,
            url: pageUrl,
            title: pageTitle,
            timestamp: timestamp,
        };

        console.log("Highlight object created:", highlight);

        try {
            chrome.storage.local.get("highlights", function (data) {
                if (chrome.runtime.lastError) {
                    console.error("Error getting from storage:", chrome.runtime.lastError);
                    saveButton.textContent = "Error loading!";
                    setTimeout(() => {
                        saveButton.textContent = "Save Highlight";
                    }, 3000);
                    return;
                }

                const highlights = Array.isArray(data.highlights) ? data.highlights : [];

                highlights.push(highlight);

                chrome.storage.local.set({ highlights: highlights }, function () {
                    if (chrome.runtime.lastError) {
                        console.error("Error saving to storage:", chrome.runtime.lastError);
                        saveButton.textContent = "Error: " + chrome.runtime.lastError.message;
                        setTimeout(() => {
                            saveButton.textContent = "Save Highlight";
                        }, 3000);
                        return;
                    }

                    saveButton.textContent = "Saved!";
                    setTimeout(() => {
                        saveButton.textContent = "Save Highlight";
                        saveButton.style.display = "none";
                        currentSelection = { text: "", range: null };
                    }, 1500);
                });
            });
        } catch (error) {
            console.error("Exception when saving:", error);
            saveButton.textContent = "Error: " + error.message;
            setTimeout(() => {
                saveButton.textContent = "Save Highlight";
            }, 1500);
        }
    } else {
        saveButton.textContent = "No text selected!";
        setTimeout(() => {
            saveButton.textContent = "Save Highlight";
            saveButton.style.display = "none";
        }, 1500);
    }
});

// Prevent clicks on the save button from clearing the selection
saveButton.addEventListener("mousedown", function (event) {
    event.stopPropagation(); // Stop event bubbling
    event.preventDefault();
});
