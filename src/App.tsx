import { lazy, Suspense } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { ChunkLoadErrorBoundary } from "./components/ChunkLoadErrorBoundary";
import { useProductSessionTracking } from "./hooks/useProductSessionTracking";

const ApiDocs = lazy(() => import("./pages/ApiDocs"));
const Auth = lazy(() => import("./pages/Auth"));
const Callback = lazy(() => import("./pages/auth/Callback"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings = lazy(() => import("./pages/dashboard/Settings"));
const Discover = lazy(() => import("./pages/Discover"));
const DiscoverPromptPage = lazy(() => import("./pages/discover/DiscoverPromptPage"));
const Index = lazy(() => import("./pages/Index"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Profile = lazy(() => import("./pages/Profile"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const SharedPromptPage = lazy(() => import("./pages/share/SharedPrompt"));
const TemplatePage = lazy(() => import("./pages/template/TemplatePage"));
const Templates = lazy(() => import("./pages/Templates"));
const Terms = lazy(() => import("./pages/Terms"));

function App() {
  useProductSessionTracking();

  return (
    <Router>
      {/* Increase bottom offset by 20px to avoid footer overlap */}
      <Toaster position="bottom-right" richColors offset={{ bottom: 60, right: 20 }} />
      <ChunkLoadErrorBoundary>
        <Suspense fallback={<div className="min-h-screen bg-black" aria-label="Loading page" />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<Callback />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/api-docs" element={<ApiDocs />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/template/:id" element={<TemplatePage />} />
            <Route path="/share/:token" element={<SharedPromptPage />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/discover/prompt/:id" element={<DiscoverPromptPage />} />
          </Routes>
        </Suspense>
      </ChunkLoadErrorBoundary>
    </Router>
  );
}

export default App;
