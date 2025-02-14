document.addEventListener('DOMContentLoaded', () => {
    const checkbox = document.getElementById('enabledCheckbox');

    // Load initial state from storage
    chrome.storage.sync.get({ enabled: false }, (result) => {
        checkbox.checked = result.enabled;
    });

    // Save state when checkbox changes
    checkbox.addEventListener('change', (event) => {
        chrome.storage.sync.set({ enabled: event.target.checked });
    });
});
