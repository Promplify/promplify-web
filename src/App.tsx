import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { GoogleAnalytics } from "./components/GoogleAnalytics";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import Privacy from "./pages/Privacy";
import Profile from "./pages/Profile";
import Terms from "./pages/Terms";
import Callback from "./pages/auth/Callback";

function App() {
  return (
    <Router>
      <GoogleAnalytics />
      <Toaster position="bottom-right" richColors />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<Callback />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </Router>
  );
}

export default App;
