import { Response } from "express";
import { getDashboard } from "./dashboardService";

const POLL_INTERVAL_MS = Number(process.env.CACHE_TTL_SECONDS ?? 30) * 1000;

interface SseClient {
  id: string;
  res: Response;
}

const clients = new Map<string, SseClient>();
let pollTimer: NodeJS.Timeout | null = null;

export function registerClient(id: string, res: Response): void {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  clients.set(id, { id, res });
  startPollingIfNeeded();

  // Immediately send current data to the new client
  getDashboard()
    .then((data) => sendToClient(res, "dashboard", data))
    .catch(() => sendToClient(res, "error", { message: "Veri alınamadı." }));
}

export function unregisterClient(id: string): void {
  clients.delete(id);
  if (clients.size === 0) stopPolling();
}

function sendToClient(res: Response, event: string, data: unknown): void {
  try {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  } catch {
    // Client disconnected mid-write — ignore
  }
}

function broadcast(event: string, data: unknown): void {
  for (const client of clients.values()) {
    sendToClient(client.res, event, data);
  }
}

function startPollingIfNeeded(): void {
  if (pollTimer) return;
  pollTimer = setInterval(async () => {
    try {
      const data = await getDashboard(true); // force refresh bypasses cache
      broadcast("dashboard", data);
    } catch (err) {
      broadcast("error", { message: (err as Error).message });
    }
  }, POLL_INTERVAL_MS);
  // Prevent the timer from blocking process exit (critical for test teardown)
  pollTimer.unref();
}

function stopPolling(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}
