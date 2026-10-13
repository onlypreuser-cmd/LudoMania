import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

const HomePage = React.lazy(() =>
  import('./pages/HomePage').then((m) => ({ default: m.HomePage }))
);
const MatchSetupPage = React.lazy(() =>
  import('./pages/MatchSetupPage').then((m) => ({ default: m.MatchSetupPage }))
);
const GamePage = React.lazy(() =>
  import('./pages/GamePage').then((m) => ({ default: m.GamePage }))
);
const CustomizePage = React.lazy(() =>
  import('./pages/CustomizePage').then((m) => ({ default: m.CustomizePage }))
);
const LeaderboardPage = React.lazy(() =>
  import('./pages/LeaderboardPage').then((m) => ({ default: m.LeaderboardPage }))
);

const PageLoadingFallback: React.FC = () => (
  <div className="min-h-screen w-full bg-gradient-to-b from-sky-100 via-indigo-50 to-amber-50 flex items-center justify-center p-4">
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 rounded-full border-4 border-amber-400 border-t-transparent animate-spin shadow-md" />
      <span className="text-sm font-extrabold text-slate-700 tracking-wide">
        Loading Ludo Mania...
      </span>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/setup" element={<MatchSetupPage />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="/customize" element={<CustomizePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
