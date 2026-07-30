import { useEffect, useRef } from "react";
import type { DashboardSummary } from "@klogs/shared";

const MAX_RECONNECT_DELAY_MS = 30_000;
const POLL_INTERVAL_MS = 30_000;

interface Options {
  onUpdate: (data: DashboardSummary[]) => void;
  onError?: (err: string) => void;
}

export function useRealtimeUpdates({ onUpdate, onError }: Options): void {
  const reconnectDelay = useRef(1_000);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const es = useRef<EventSource | null>(null);

  useEffect(() => {
    let cancelled = false;

    function stopPolling() {
      if (pollTimer.current) {
        clearInterval(pollTimer.current);
        pollTimer.current = null;
      }
    }

    function startPolling() {
      stopPolling();
      pollTimer.current = setInterval(async () => {
        try {
          const res = await fetch("/api/dashboard");
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data: DashboardSummary[] = await res.json();
          if (!cancelled) onUpdate(data);
        } catch (err) {
          onError?.((err as Error).message);
        }
      }, POLL_INTERVAL_MS);
    }

    function connect() {
      if (cancelled) return;
      const source = new EventSource("/api/stream");
      es.current = source;

      source.addEventListener("dashboard", (e) => {
        reconnectDelay.current = 1_000; // başarılı mesaj — delay'i sıfırla
        stopPolling();
        try {
          if (!cancelled) onUpdate(JSON.parse(e.data) as DashboardSummary[]);
        } catch {
          // malformed JSON — yoksay
        }
      });

      source.addEventListener("error", (e) => {
        if (!cancelled) onError?.((e as MessageEvent).data ?? "SSE bağlantı hatası");
      });

      source.onerror = () => {
        source.close();
        es.current = null;
        if (cancelled) return;

        // SSE başarısız — polling fallback'e geç
        startPolling();

        // Exponential backoff ile yeniden bağlan
        const delay = reconnectDelay.current;
        reconnectDelay.current = Math.min(delay * 2, MAX_RECONNECT_DELAY_MS);
        setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      cancelled = true;
      es.current?.close();
      stopPolling();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
