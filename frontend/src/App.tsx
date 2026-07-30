import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDashboard } from "./hooks/useDashboard";
import { StatusBar } from "./components/layout/StatusBar";
import { Sidebar } from "./components/layout/Sidebar";
import { OverviewView } from "./components/views/OverviewView";
import { ProjectView } from "./components/views/ProjectView";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}

function Dashboard() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const { data: summaries, isLoading, isError, error, dataUpdatedAt } = useDashboard();

  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;
  const selectedSummary = summaries?.find((s) => s.projectId === selectedProjectId) ?? null;

  // When selected project no longer exists in data, fall back to overview
  if (selectedProjectId && !selectedSummary && summaries) {
    setSelectedProjectId(null);
  }

  return (
    <div className="flex flex-col h-dvh">
      <StatusBar summaries={summaries ?? []} lastUpdated={lastUpdated} />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          summaries={summaries ?? []}
          selected={selectedProjectId}
          onSelect={setSelectedProjectId}
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-950">
          {isLoading && <LoadingScreen />}
          {isError && <ErrorScreen message={(error as Error)?.message} />}
          {!isLoading && !isError && summaries && (
            selectedSummary
              ? <ProjectView summary={selectedSummary} />
              : <OverviewView
                  summaries={summaries}
                  onSelectProject={setSelectedProjectId}
                />
          )}
        </main>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500">
      <div className="w-8 h-8 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
      <p className="text-sm">Pipeline verileri yükleniyor…</p>
    </div>
  );
}

function ErrorScreen({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500 px-8">
      <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center text-red-400 text-lg">
        !
      </div>
      <p className="text-sm font-medium text-red-400">Veri alınamadı</p>
      {message && <p className="text-xs text-gray-600 text-center max-w-sm">{message}</p>}
      <p className="text-xs text-gray-700">Backend çalışıyor mu? .env dosyasında PAT var mı?</p>
    </div>
  );
}
