// Configuration
const CONFIG = {
    DELAY: {
        BASE_MS: 350,
        VARIANCE_MS: 50
    },
    MAX_RETRIES: 50000
};

// State management
const processedVideos = new Set();

// Check enabled state before processing
async function isEnabled() {
    const result = await chrome.storage.sync.get({ enabled: true });
    return result.enabled;
}

// Utility functions
function generateDelay() {
    // Box-Muller transform for Gaussian distribution
    let u, v;
    while (!(u = Math.random())); // Ensure non-zero
    while (!(v = Math.random())); // Ensure non-zero

    const gaussian = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return gaussian * CONFIG.DELAY.VARIANCE_MS + CONFIG.DELAY.BASE_MS;
}

// DOM interaction helpers
const DOM = {
    findButtonByText: (text) =>
        Array.from(document.querySelectorAll('button'))
            .find(button => button.textContent.trim().includes(text)),

    click: (element, description) => {
        if (!element) {
            console.log(`${description} not found`);
            return false;
        }
        console.log(`Clicking: ${description}`);
        element.click();
        return true;
    },

    retryableAction: function (finder, description, onSuccess = null, attempt = 0) {
        setTimeout(() => {
            const element = finder();

            if (this.click(element, description)) {
                onSuccess?.();
            } else if (attempt < CONFIG.MAX_RETRIES) {
                console.log(`Retry ${attempt + 1} for ${description}`);
                this.retryableAction(finder, description, onSuccess, attempt + 1);
            } else {
                console.log(`Max attempts reached for ${description}`);
            }
        }, generateDelay());
    }
};

// Report workflow
const ReportActions = {
    initiate: (onSuccess) => {
        DOM.retryableAction(
            () => DOM.findButtonByText("Report"),
            "Report button",
            onSuccess
        );
    },

    selectReason: (onSuccess) => {
        DOM.retryableAction(
            () => DOM.findButtonByText("Nudity or sexual activity"),
            "Nudity violation option",
            onSuccess
        );
    },

    submit: () => {
        DOM.retryableAction(
            () => DOM.findButtonByText("Nudity or sexual activity"),
            "Submit report button"
        );
    },

    execute: () => {
        ReportActions.initiate(() => {
            setTimeout(() => {
                ReportActions.selectReason(() => {
                    setTimeout(ReportActions.submit, generateDelay());
                });
            }, generateDelay());
        });
    }
};

// Video processing
const VideoProcessor = {
    handleLongVideo: async (video) => {
        if (!(await isEnabled())) return;

        const moreOptionsButton = document.querySelector('svg[aria-label="More options"]')
            ?.closest('div[role="button"]');

        if (!moreOptionsButton) {
            console.log('More options button not found');
            return;
        }

        setTimeout(() => {
            DOM.click(moreOptionsButton, 'More options');
            setTimeout(ReportActions.execute, generateDelay());
        }, generateDelay());
    },

    process: async (video) => {
        if (processedVideos.has(video)) return;
        if (!(await isEnabled())) return;

        const handleMetadata = () => {
            console.log(`Found video: ${video.duration} seconds`);
            processedVideos.add(video);

            if (video.duration > 60) {
                VideoProcessor.handleLongVideo(video);
            }
        };

        video.addEventListener('loadedmetadata', handleMetadata);
        if (video.src) handleMetadata();
    },

    scan: async () => {
        if (!(await isEnabled())) return;
        document.querySelectorAll('video').forEach(VideoProcessor.process);
    }
};

// Initialize
const observer = new MutationObserver(mutations => {
    if (mutations.some(mutation => mutation.addedNodes.length)) {
        VideoProcessor.scan();
    }
});

observer.observe(document.body, { childList: true, subtree: true });
window.addEventListener('load', VideoProcessor.scan);