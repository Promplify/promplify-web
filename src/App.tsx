import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import Auth from "./pages/Auth";
import Callback from "./pages/auth/Callback";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import Privacy from "./pages/Privacy";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import SharedPromptPage from "./pages/share/SharedPrompt";
import Templates from "./pages/Templates";
import Terms from "./pages/Terms";

function App() {
  return (
    <Router>
      <Toaster position="bottom-right" richColors />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<Callback />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/share/:token" element={<SharedPromptPage />} />
      </Routes>
    </Router>
  );
}

export default App;
