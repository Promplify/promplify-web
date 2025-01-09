import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Logo } from "./Logo";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";

  // Check auth state on component mount
  useState(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  });

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black shadow-md">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between" style={{ height: "68px" }}>
          <Logo />
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/#features" className="text-white/80 hover:text-white transition-colors">
              Features
            </a>
            <a href="/#how-it-works" className="text-white/80 hover:text-white transition-colors">
              How It Works
            </a>
            <a href="https://github.com/promplify" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">
              GitHub
            </a>
            {session ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard">
                  <Button variant="ghost" className={`text-white/80 ${isDashboard ? "bg-white text-black" : ""}`}>
                    Dashboard
                  </Button>
                </Link>
                <Button onClick={handleLogout} variant="ghost" className="text-white/80 flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button className="bg-primary text-white hover:bg-primary/90">Sign In</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black border-t border-white/10 py-4">
            <div className="flex flex-col space-y-4 px-4">
              <a href="#features" className="text-white/80 hover:text-white transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                Features
              </a>
              <a href="#how-it-works" className="text-white/80 hover:text-white transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                How It Works
              </a>
              <a href="https://github.com/promplify" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                GitHub
              </a>
              {session ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full text-white hover:text-white/90">
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    variant="ghost"
                    className="w-full text-white hover:text-white/90 flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-primary text-white hover:bg-primary/90">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
