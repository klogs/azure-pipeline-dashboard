"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerClient = registerClient;
exports.unregisterClient = unregisterClient;
const dashboardService_1 = require("./dashboardService");
const POLL_INTERVAL_MS = Number(process.env.CACHE_TTL_SECONDS ?? 30) * 1000;
const clients = new Map();
let pollTimer = null;
function registerClient(id, res) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    clients.set(id, { id, res });
    startPollingIfNeeded();
    // Immediately send current data to the new client
    (0, dashboardService_1.getDashboard)()
        .then((data) => sendToClient(res, "dashboard", data))
        .catch(() => sendToClient(res, "error", { message: "Veri alınamadı." }));
}
function unregisterClient(id) {
    clients.delete(id);
    if (clients.size === 0)
        stopPolling();
}
function sendToClient(res, event, data) {
    try {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    }
    catch {
        // Client disconnected mid-write — ignore
    }
}
function broadcast(event, data) {
    for (const client of clients.values()) {
        sendToClient(client.res, event, data);
    }
}
function startPollingIfNeeded() {
    if (pollTimer)
        return;
    pollTimer = setInterval(async () => {
        try {
            const data = await (0, dashboardService_1.getDashboard)(true); // force refresh bypasses cache
            broadcast("dashboard", data);
        }
        catch (err) {
            broadcast("error", { message: err.message });
        }
    }, POLL_INTERVAL_MS);
    // Prevent the timer from blocking process exit (critical for test teardown)
    pollTimer.unref();
}
function stopPolling() {
    if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
    }
}
//# sourceMappingURL=sseService.js.map