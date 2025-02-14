let alreadyFoundVideos = [];
const CLICK_DELAY = 800; // ms
const GAUS_DEVIA = 100 // ms

// Function to generate a random Gaussian number
function randomGaussian(mean, stddev) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return num * stddev + mean;
}

// Custom helper function to log and click an element
function logAndClick(element, description) {
    if (element) {
        console.log(`${description} clicked.`);
        element.click();
    } else {
        console.log(`${description} not found.`);
    }
}

// Function to perform the reporting sequence
function performReportSequence() {
    const reportButton = Array.from(document.querySelectorAll('button'))
        .find(button => button.textContent.trim() === "Report");

    if (reportButton) {
        const delay1 = randomGaussian(CLICK_DELAY, GAUS_DEVIA);
        setTimeout(() => {
            logAndClick(reportButton, 'Report button');

            const delayBeforeNudityOption = randomGaussian(CLICK_DELAY, GAUS_DEVIA);
            setTimeout(() => {
                const nudityOption = Array.from(document.querySelectorAll('div'))
                    .find(option => option.textContent.trim().includes("Nudity or sexual activity"));

                if (nudityOption) {
                    const delay2 = randomGaussian(CLICK_DELAY, GAUS_DEVIA);
                    setTimeout(() => {
                        logAndClick(nudityOption, 'Nudity option');

                        const delay3 = randomGaussian(CLICK_DELAY, GAUS_DEVIA);
                        setTimeout(() => {
                            const targetButton = Array.from(document.querySelectorAll('button'))
                                .find(button => button.textContent.includes("Nudity or sexual activity"));

                            logAndClick(targetButton, 'Specified button');
                        }, delay3);

                    }, delay2);
                } else {
                    console.log('Nudity option not found.');
                }
            }, delayBeforeNudityOption);
        }, delay1);
    } else {
        console.log('Report button not found.');
    }
}

// Function to check for video elements and log their lengths
function checkVideoLength() {
    console.log("Ran");
    const videos = document.querySelectorAll('video');

    videos.forEach(video => {
        if (alreadyFoundVideos.includes(video)) return;

        const handleVideoLength = () => {
            console.log(`Video found with length: ${video.duration} seconds`);
            alreadyFoundVideos.push(video);

            if (video.duration > 60) {
                const button = document.querySelector('svg[aria-label="More options"]');
                if (button) {
                    const delay = randomGaussian(CLICK_DELAY, GAUS_DEVIA);
                    setTimeout(() => {
                        logAndClick(button.closest('div[role="button"]'), 'More options button');

                        const reportDelay = randomGaussian(CLICK_DELAY, GAUS_DEVIA);
                        setTimeout(performReportSequence, reportDelay);
                    }, delay);
                } else {
                    console.log('More options button not found.');
                }
            }
        };

        video.addEventListener('loadedmetadata', handleVideoLength);

        if (video.src) {
            handleVideoLength();
        }
    });
}

// Use MutationObserver to detect changes in the DOM
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
            checkVideoLength();
        }
    });
});

// Start observing the document body for changes
observer.observe(document.body, { childList: true, subtree: true });

// Initial check for videos
window.onload = () => {
    checkVideoLength();
};