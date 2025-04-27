document.addEventListener("DOMContentLoaded", function () {
    // Set up search functionality
    document.getElementById("searchInput").addEventListener("input", function () {
        loadHighlights(this.value);
    });

    // Add a clear all button with better styling
    const clearButton = document.createElement("button");
    clearButton.textContent = "Clear All Highlights";
    clearButton.className = "clear-all-btn";

    clearButton.addEventListener("click", function () {
        if (confirm("Are you sure you want to delete all highlights?")) {
            chrome.storage.local.set({ highlights: [] }, function () {
                console.log("All highlights cleared");
                loadHighlights();
                updateHeaderCount();
            });
        }
    });

    // Add the clear button to the container
    const container = document.querySelector(".container");

    // Create a wrapper for the debug section and clear button
    const actionsWrapper = document.createElement("div");
    actionsWrapper.className = "actions-wrapper";
    actionsWrapper.style.marginTop = "16px";

    actionsWrapper.appendChild(clearButton);

    container.appendChild(actionsWrapper);

    // Initialize header count
    updateHeaderCount();

    // Load highlights and set initial clear button visibility
    chrome.storage.local.get("highlights", function (data) {
        const highlights = data.highlights || [];
        toggleClearButtonVisibility(highlights.length > 0);
        loadHighlights();
    });
});

// Function to update the header count
function updateHeaderCount() {
    chrome.storage.local.get("highlights", function (data) {
        const highlights = data.highlights || [];
        const headerElement = document.querySelector("h1");
        headerElement.textContent = `Saved Highlights (${highlights.length})`;
    });
}

function loadHighlights(searchQuery = "") {
    chrome.storage.local.get("highlights", function (data) {
        const highlights = data.highlights || [];
        const container = document.getElementById("highlights-container");
        const emptyState = document.getElementById("empty-state");

        container.innerHTML = "";

        console.log("Number of highlights:", highlights.length);

        // Toggle visibility of the clear all button
        toggleClearButtonVisibility(highlights.length > 0);

        if (!highlights || highlights.length === 0) {
            console.log("No highlights found, showing empty state");
            emptyState.style.display = "block";
            return;
        }

        emptyState.style.display = "none";

        // Sort highlights by timestamp (newest first)
        highlights.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Filter highlights if search query exists
        const filteredHighlights = searchQuery
            ? highlights.filter((h) => h.text.toLowerCase().includes(searchQuery.toLowerCase()))
            : highlights;

        if (filteredHighlights.length === 0) {
            container.innerHTML = '<p class="no-results">No highlights match your search.</p>';
            return;
        }

        // Create and append highlight elements
        filteredHighlights.forEach((highlight) => {
            const highlightElement = createHighlightElement(highlight);
            container.appendChild(highlightElement);
        });
    });
}

function createHighlightElement(highlight) {
    const element = document.createElement("div");
    element.className = "highlight-item";

    // Format the date with AM/PM
    const date = new Date(highlight.timestamp);

    // Format the date using toLocaleString with specific options for AM/PM
    const formattedDate = date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true, // This ensures we get AM/PM format
    });

    // Truncate URL for display
    const displayUrl = highlight.url.length > 30 ? highlight.url.substring(0, 30) + "..." : highlight.url;

    // Create the trash icon SVG
    const trashIconSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
      </svg>
    `;

    // Create the copy icon SVG
    const copyIconSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
      </svg>
    `;

    // Create the AI summarize icon SVG
    const summarizeIconSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        <circle cx="18" cy="18" r="2.5" fill="#34a853"/>
      </svg>
    `;

    element.innerHTML = `
      <div class="highlight-text">${highlight.text}</div>
      <div class="highlight-meta">
        <div class="highlight-source" title="${highlight.url}">
          <a href="${highlight.url}" target="_blank">${displayUrl}</a>
        </div>
        <div class="highlight-timestamp">${formattedDate}</div>
      </div>
      <div class="highlight-actions">
        <button class="summarize-btn" title="Summarize text">${summarizeIconSVG}</button>
        <button class="copy-btn" title="Copy text">${copyIconSVG}</button>
        <button class="delete-btn" title="Delete highlight">${trashIconSVG}</button>
      </div>
    `;

    // Add summarize functionality (placeholder for now)
    element.querySelector(".summarize-btn").addEventListener("click", function () {
        alert("Summarize feature coming soon!");
    });

    // Add copy functionality
    element.querySelector(".copy-btn").addEventListener("click", function () {
        navigator.clipboard.writeText(highlight.text).then(function () {
            const copyBtn = element.querySelector(".copy-btn");
            copyBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4caf50">
            <path d="M0 0h24v24H0z" fill="none"/>
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        `;
            setTimeout(() => {
                copyBtn.innerHTML = copyIconSVG;
            }, 1000);
        });
    });

    // Add delete functionality
    element.querySelector(".delete-btn").addEventListener("click", function () {
        deleteHighlight(highlight.id);
    });

    return element;
}

function deleteHighlight(id) {
    chrome.storage.local.get("highlights", function (data) {
        let highlights = data.highlights || [];

        // Remove the highlight
        highlights = highlights.filter((highlight) => highlight.id !== id);

        // Save the updated highlights
        chrome.storage.local.set({ highlights: highlights }, function () {
            // Update the header count
            updateHeaderCount();

            // Toggle visibility of the clear all button
            toggleClearButtonVisibility(highlights.length > 0);

            // Reload the highlights
            document.getElementById("searchInput").value = "";
            loadHighlights();
        });
    });
}

function toggleClearButtonVisibility(hasHighlights) {
    const clearButton = document.querySelector(".clear-all-btn");
    if (clearButton) {
        clearButton.style.display = hasHighlights ? "block" : "none";
    }
}
