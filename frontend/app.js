// DOM Elements
const form = document.getElementById('analyze-form');
const urlInput = document.getElementById('url-input');
const submitBtn = document.getElementById('submit-btn');
const btnText = submitBtn.querySelector('span');
const loader = submitBtn.querySelector('.loader');

const errorMessage = document.getElementById('error-message');
const resultsSection = document.getElementById('results-section');

// Result Elements
const resTitle = document.getElementById('res-title');
const resUrl = document.getElementById('res-url');
const resMeta = document.getElementById('res-meta');
const metricStatus = document.getElementById('metric-status');
const metricTime = document.getElementById('metric-time');
const metricWords = document.getElementById('metric-words');
const metricH1 = document.getElementById('metric-h1');
const metricAlt = document.getElementById('metric-alt');

// Configuration
const API_URL = 'https://page-pulse-iyjt.onrender.com/api/analyze';

// Form Submit Handler
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (!url) return;

    setLoadingState(true);
    hideError();
    hideResults();

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
        });

        const data = await response.json();

        // Use standardized API envelope
        if (data.success && data.data) {
            populateResults(data.data);
            showResults();
        } else {
            // Handle expected errors correctly (e.g. 400 Invalid URL)
            showError(data.error?.message || 'An unknown error occurred.');
        }
    } catch (error) {
        console.error('Fetch error:', error);
        // Handle hard network/offline failures
        showError('Unable to connect to the server. Is the backend running?');
    } finally {
        setLoadingState(false);
    }
});

/**
 * Updates UI to loading state
 * @param {boolean} isLoading 
 */
function setLoadingState(isLoading) {
    urlInput.disabled = isLoading;
    submitBtn.disabled = isLoading;

    if (isLoading) {
        btnText.textContent = 'Analyzing...';
        loader.classList.remove('hidden');
    } else {
        btnText.textContent = 'Analyze';
        loader.classList.add('hidden');
    }
}

/**
 * Populates the UI with data from the API
 * @param {Object} data 
 */
function populateResults(data) {
    // Header Info
    resTitle.textContent = data.title || 'No Title Found';
    resUrl.textContent = data.url;
    resUrl.href = data.url;
    resMeta.textContent = data.metaDescription || 'No meta description found on this page.';

    // Metrics
    metricStatus.textContent = data.httpStatus;

    // Dynamic color coding for HTTP status
    if (data.httpStatus >= 200 && data.httpStatus < 300) {
        metricStatus.style.color = 'var(--text-primary)';
    } else {
        metricStatus.style.color = 'var(--error-color)';
    }

    // Number formatting
    metricTime.textContent = new Intl.NumberFormat().format(data.responseTimeMs);
    metricWords.textContent = new Intl.NumberFormat().format(data.wordCount);
    metricH1.textContent = new Intl.NumberFormat().format(data.h1Count);
    metricAlt.textContent = new Intl.NumberFormat().format(data.imagesMissingAlt);

    // Visual warning for missing alt tags
    if (data.imagesMissingAlt > 0) {
        metricAlt.style.color = 'var(--error-color)';
    } else {
        metricAlt.style.color = 'var(--text-primary)';
    }
}

function showResults() {
    resultsSection.classList.remove('hidden');
}

function hideResults() {
    resultsSection.classList.add('hidden');
}

function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
    errorMessage.textContent = '';
}
