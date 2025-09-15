import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import ApiDocs from "./pages/ApiDocs";
import Auth from "./pages/Auth";
import Callback from "./pages/auth/Callback";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/dashboard/Settings";
import Discover from "./pages/Discover";
import DiscoverPromptPage from "./pages/discover/DiscoverPromptPage";
import Index from "./pages/Index";
import Privacy from "./pages/Privacy";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import SharedPromptPage from "./pages/share/SharedPrompt";
import TemplatePage from "./pages/template/TemplatePage";
import Templates from "./pages/Templates";
import Terms from "./pages/Terms";

function App() {
  return (
    <Router>
      {/* Increase bottom offset by 20px to avoid footer overlap */}
      <Toaster position="bottom-right" richColors offset={{ bottom: 60, right: 20 }} />
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
    </Router>
  );
}

export default App;
