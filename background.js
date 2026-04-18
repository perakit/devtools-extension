chrome.runtime.onInstalled.addListener(async () => {
    console.log('Web Dev Toolbox extension installed');

    if (chrome.sidePanel?.setOptions) {
        await chrome.sidePanel.setOptions({
            path: 'sidepanel.html',
            enabled: true
        });
    }
});

const FULL_SHOT_WAIT_MS = 180;
const MAX_CANVAS_EDGE = 32760;
const CAPTURE_MIN_INTERVAL_MS = 1100;
const CAPTURE_RETRY_LIMIT = 4;
let lastCaptureTimestamp = 0;

function executeInTab(tabId, func, args = []) {
    return new Promise((resolve, reject) => {
        chrome.scripting.executeScript(
            {
                target: { tabId },
                func,
                args
            },
            (result) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }

                resolve(result?.[0]?.result);
            }
        );
    });
}

function captureVisible(windowId) {
    return new Promise((resolve, reject) => {
        chrome.tabs.captureVisibleTab(windowId, { format: 'png' }, (dataUrl) => {
            if (chrome.runtime.lastError || !dataUrl) {
                reject(new Error(chrome.runtime.lastError?.message || 'Unable to capture the current tab.'));
                return;
            }

            resolve(dataUrl);
        });
    });
}

function isCaptureQuotaError(error) {
    return /MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND/i.test(error?.message || '');
}

async function captureVisibleWithThrottle(windowId) {
    for (let attempt = 0; attempt < CAPTURE_RETRY_LIMIT; attempt += 1) {
        const elapsed = Date.now() - lastCaptureTimestamp;
        if (elapsed < CAPTURE_MIN_INTERVAL_MS) {
            await wait(CAPTURE_MIN_INTERVAL_MS - elapsed);
        }

        try {
            const dataUrl = await captureVisible(windowId);
            lastCaptureTimestamp = Date.now();
            return dataUrl;
        } catch (error) {
            if (!isCaptureQuotaError(error) || attempt === CAPTURE_RETRY_LIMIT - 1) {
                throw error;
            }

            const backoffMs = CAPTURE_MIN_INTERVAL_MS * (attempt + 1);
            await wait(backoffMs);
        }
    }

    throw new Error('Unable to capture screenshot due to Chrome capture quota.');
}

function startDownload(url, filename, saveAs = false) {
    return new Promise((resolve, reject) => {
        chrome.downloads.download(
            {
                url,
                filename,
                saveAs
            },
            (downloadId) => {
                if (chrome.runtime.lastError || typeof downloadId !== 'number') {
                    reject(new Error(chrome.runtime.lastError?.message || 'Unable to start download.'));
                    return;
                }

                resolve(downloadId);
            }
        );
    });
}

function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function fetchWithFallback(url, options = {}) {
    try {
        return await fetch(url, options);
    } catch (error) {
        if (options.method === 'HEAD') {
            return fetch(url, { ...options, method: 'GET' });
        }

        throw error;
    }
}

async function traceRedirectPath(url, maxHops = 10) {
    const hops = [];
    let currentUrl = url;

    for (let hopIndex = 0; hopIndex < maxHops; hopIndex += 1) {
        let response;
        try {
            response = await fetchWithFallback(currentUrl, {
                method: 'HEAD',
                redirect: 'manual'
            });
        } catch (error) {
            hops.push({
                url: currentUrl,
                statusCode: 0,
                statusText: error.message,
                location: ''
            });
            break;
        }

        const locationHeader = response.headers.get('location') || '';
        hops.push({
            url: currentUrl,
            statusCode: response.status,
            statusText: response.statusText,
            location: locationHeader
        });

        const isRedirect = response.status >= 300 && response.status < 400;
        if (!isRedirect || !locationHeader) {
            break;
        }

        currentUrl = new URL(locationHeader, currentUrl).href;
    }

    return {
        hops,
        finalUrl: hops.length ? hops[hops.length - 1].location || hops[hops.length - 1].url : url
    };
}

async function checkBrokenLinks(urls) {
    const inputUrls = Array.isArray(urls) ? urls.slice(0, 120) : [];
    const results = [];

    for (const url of inputUrls) {
        try {
            const response = await fetchWithFallback(url, {
                method: 'HEAD',
                redirect: 'follow'
            });

            const broken = response.status >= 400;
            results.push({
                url,
                statusCode: response.status,
                statusLabel: `${response.status} ${response.statusText}`,
                broken,
                note: response.url !== url ? `Final URL: ${response.url}` : ''
            });
        } catch (error) {
            results.push({
                url,
                statusCode: 0,
                statusLabel: 'Request error',
                broken: true,
                note: error.message
            });
        }
    }

    return results;
}

async function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to convert screenshot blob.'));
        reader.readAsDataURL(blob);
    });
}

async function getPageMetrics(tabId) {
    return executeInTab(tabId, () => {
        const doc = document.documentElement;
        const body = document.body;
        return {
            scrollX: window.scrollX,
            scrollY: window.scrollY,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            fullWidth: Math.max(
                doc.scrollWidth,
                doc.clientWidth,
                body ? body.scrollWidth : 0,
                body ? body.clientWidth : 0
            ),
            fullHeight: Math.max(
                doc.scrollHeight,
                doc.clientHeight,
                body ? body.scrollHeight : 0,
                body ? body.clientHeight : 0
            )
        };
    });
}

async function scrollToY(tabId, y) {
    return executeInTab(tabId, (scrollY) => {
        window.scrollTo(0, scrollY);
        return window.scrollY;
    }, [y]);
}

async function restoreScroll(tabId, x, y) {
    await executeInTab(tabId, (scrollX, scrollY) => {
        window.scrollTo(scrollX, scrollY);
    }, [x, y]);
}

async function captureViewportScreenshot(windowId) {
    const visibleDataUrl = await captureVisibleWithThrottle(windowId);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `toolbox-screenshot-${timestamp}.png`;
    const downloadId = await startDownload(visibleDataUrl, filename, false);
    return { downloadId, filename, mode: 'visible' };
}

async function captureFullPageScreenshot(tabId, windowId) {
    if (typeof OffscreenCanvas === 'undefined' || typeof createImageBitmap === 'undefined') {
        throw new Error('Full-page screenshot is not supported in this browser runtime.');
    }

    const metrics = await getPageMetrics(tabId);
    if (!metrics || !metrics.viewportHeight || !metrics.fullHeight) {
        throw new Error('Could not read page dimensions.');
    }

    const originalX = metrics.scrollX || 0;
    const originalY = metrics.scrollY || 0;
    const viewportHeight = Math.max(1, Math.floor(metrics.viewportHeight));
    const fullHeight = Math.max(1, Math.floor(metrics.fullHeight));

    const requestedOffsets = [];
    for (let y = 0; y < fullHeight; y += viewportHeight) {
        requestedOffsets.push(y);
    }

    const captures = [];

    try {
        for (const requestedY of requestedOffsets) {
            const actualY = await scrollToY(tabId, requestedY);
            await wait(FULL_SHOT_WAIT_MS);
            const dataUrl = await captureVisibleWithThrottle(windowId);

            const last = captures[captures.length - 1];
            if (!last || last.scrollY !== actualY) {
                captures.push({ scrollY: actualY, dataUrl });
            }
        }
    } finally {
        await restoreScroll(tabId, originalX, originalY);
    }

    if (!captures.length) {
        throw new Error('No screenshot segments were captured.');
    }

    const firstBlob = await fetch(captures[0].dataUrl).then((response) => response.blob());
    const firstBitmap = await createImageBitmap(firstBlob);
    const scale = firstBitmap.height / viewportHeight;
    const targetWidth = Math.max(1, Math.round(firstBitmap.width));
    const targetHeight = Math.max(1, Math.round(fullHeight * scale));
    firstBitmap.close();

    if (targetWidth > MAX_CANVAS_EDGE || targetHeight > MAX_CANVAS_EDGE) {
        throw new Error('Page is too large for single-image export.');
    }

    const canvas = new OffscreenCanvas(targetWidth, targetHeight);
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) {
        throw new Error('Could not create screenshot canvas context.');
    }

    for (const segment of captures) {
        const blob = await fetch(segment.dataUrl).then((response) => response.blob());
        const bitmap = await createImageBitmap(blob);
        const drawY = Math.round(segment.scrollY * scale);

        context.drawImage(bitmap, 0, drawY, targetWidth, bitmap.height);
        bitmap.close();
    }

    const stitchedBlob = await canvas.convertToBlob({ type: 'image/png' });
    const stitchedDataUrl = await blobToDataUrl(stitchedBlob);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `toolbox-fullpage-${timestamp}.png`;
    const downloadId = await startDownload(stitchedDataUrl, filename, false);

    return { downloadId, filename, mode: 'full-page', segments: captures.length };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received in background:', message);

    if (message.action === 'openResponsiveViewer') {
        chrome.tabs.create({ url: 'responsive-viewer.html' });
        sendResponse({ status: 'opened' });
        return true;
    }

    if (message.action === 'openTodoPanel') {
        const windowId = message.windowId ?? sender.tab?.windowId;

        if (chrome.sidePanel?.open && typeof windowId === 'number') {
            chrome.sidePanel.open({ windowId })
                .then(() => sendResponse({ status: 'opened' }))
                .catch((error) => {
                    console.error('Failed to open side panel:', error);
                    sendResponse({ status: 'error', message: error.message });
                });
            return true;
        }

        sendResponse({ status: 'unsupported' });
        return true;
    }

    if (message.action === 'downloadText') {
        const payload = encodeURIComponent(message.content || '');
        chrome.downloads.download({
            url: `data:text/plain;charset=utf-8,${payload}`,
            filename: message.filename || 'export.txt',
            saveAs: true
        }).then(() => {
            sendResponse({ status: 'download-started' });
        }).catch((error) => {
            console.error('Download failed:', error);
            sendResponse({ status: 'error', message: error.message });
        });
        return true;
    }

    if (message.action === 'takeScreenshot') {
        const tabId = message.tabId ?? sender.tab?.id;
        const windowId = message.windowId ?? sender.tab?.windowId;

        if (typeof tabId !== 'number' || typeof windowId !== 'number') {
            sendResponse({ status: 'error', message: 'No active tab found.' });
            return true;
        }

        captureFullPageScreenshot(tabId, windowId)
            .then((result) => {
                sendResponse({ status: 'download-started', ...result });
            })
            .catch(async (error) => {
                console.warn('Full-page screenshot failed, falling back to visible capture:', error);
                try {
                    const fallback = await captureViewportScreenshot(windowId);
                    sendResponse({
                        status: 'download-started',
                        ...fallback,
                        fallbackReason: error.message
                    });
                } catch (fallbackError) {
                    console.error('Screenshot failed:', fallbackError);
                    sendResponse({ status: 'error', message: fallbackError.message });
                }
            });
        return true;
    }

    if (message.action === 'saveAsPdf') {
        const tabId = message.tabId ?? sender.tab?.id;
        if (typeof tabId !== 'number') {
            sendResponse({ status: 'error', message: 'No active tab found.' });
            return true;
        }

        chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
                window.print();
            }
        }).then(() => {
            sendResponse({ status: 'print-opened' });
        }).catch((error) => {
            console.error('Print failed:', error);
            sendResponse({ status: 'error', message: error.message });
        });
        return true;
    }

    if (message.action === 'openMultipleUrls') {
        const urls = Array.isArray(message.urls) ? message.urls : [];
        const windowId = message.windowId ?? sender.tab?.windowId;
        const tasks = urls
            .map((url) => {
                try {
                    const parsed = new URL(url);
                    if (!['http:', 'https:'].includes(parsed.protocol)) {
                        return null;
                    }

                    return chrome.tabs.create({
                        url: parsed.href,
                        active: false,
                        windowId
                    });
                } catch (error) {
                    return null;
                }
            })
            .filter(Boolean);

        Promise.all(tasks)
            .then((tabs) => {
                sendResponse({ status: 'opened', opened: tabs.length });
            })
            .catch((error) => {
                console.error('Open URLs failed:', error);
                sendResponse({ status: 'error', message: error.message });
            });
        return true;
    }

    if (message.action === 'getCookiesForUrl') {
        const url = message.url;
        if (!url) {
            sendResponse({ status: 'error', message: 'Missing URL.' });
            return true;
        }

        chrome.cookies.getAll({ url })
            .then((cookies) => sendResponse({ status: 'ok', cookies }))
            .catch((error) => {
                console.error('Get cookies failed:', error);
                sendResponse({ status: 'error', message: error.message });
            });
        return true;
    }

    if (message.action === 'setCookieForUrl') {
        const { url, name, value, path, sameSite } = message;
        if (!url || !name) {
            sendResponse({ status: 'error', message: 'Missing cookie URL or name.' });
            return true;
        }

        const details = {
            url,
            name,
            value: value ?? '',
            path: path || '/'
        };

        if (sameSite) {
            details.sameSite = sameSite;
        }

        chrome.cookies.set(details)
            .then((cookie) => sendResponse({ status: 'ok', cookie }))
            .catch((error) => {
                console.error('Set cookie failed:', error);
                sendResponse({ status: 'error', message: error.message });
            });
        return true;
    }

    if (message.action === 'removeCookieForUrl') {
        const { url, name, storeId } = message;
        if (!url || !name) {
            sendResponse({ status: 'error', message: 'Missing cookie URL or name.' });
            return true;
        }

        chrome.cookies.remove({ url, name, storeId })
            .then((details) => sendResponse({ status: 'ok', details }))
            .catch((error) => {
                console.error('Remove cookie failed:', error);
                sendResponse({ status: 'error', message: error.message });
            });
        return true;
    }

    if (message.action === 'proxyFetch') {
        const { url, method = 'GET', headers = {}, body = '' } = message;
        if (!url) {
            sendResponse({ status: 'error', message: 'Missing request URL.' });
            return true;
        }

        fetch(url, {
            method,
            headers,
            body: method === 'GET' || method === 'HEAD' ? undefined : body,
            redirect: 'follow'
        }).then(async (response) => {
            const headersObject = {};
            response.headers.forEach((value, key) => {
                headersObject[key] = value;
            });

            const text = await response.text();
            sendResponse({
                status: 'ok',
                statusCode: response.status,
                statusText: response.statusText,
                finalUrl: response.url,
                headers: headersObject,
                body: text.slice(0, 500000)
            });
        }).catch((error) => {
            console.error('Proxy fetch failed:', error);
            sendResponse({ status: 'error', message: error.message });
        });
        return true;
    }

    if (message.action === 'checkBrokenLinks') {
        checkBrokenLinks(message.urls)
            .then((results) => sendResponse({ status: 'ok', results }))
            .catch((error) => {
                console.error('Broken link checker failed:', error);
                sendResponse({ status: 'error', message: error.message });
            });
        return true;
    }

    if (message.action === 'traceRedirectPath') {
        const targetUrl = message.url;
        if (!targetUrl) {
            sendResponse({ status: 'error', message: 'Missing URL to trace.' });
            return true;
        }

        traceRedirectPath(targetUrl, Number(message.maxHops) || 10)
            .then((result) => sendResponse({ status: 'ok', ...result }))
            .catch((error) => {
                console.error('Redirect trace failed:', error);
                sendResponse({ status: 'error', message: error.message });
            });
        return true;
    }

    sendResponse({ status: 'received' });
    return true;
});
