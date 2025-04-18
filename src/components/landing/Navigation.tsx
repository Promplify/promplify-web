import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { exportUserData } from "@/services/promptService";
import { Download, ExternalLink, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Logo } from "./Logo";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

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

  const handleExport = async () => {
    try {
      const data = await exportUserData(session.user.id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `promplify-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black shadow-md">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Logo />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <a
              href="https://www.producthunt.com/posts/promplify"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm bg-[#EA532A]/10 hover:bg-[#EA532A]/20 text-[#EA532A] transition-all group inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#EA532A]/20"
            >
              <span>🎉</span>
              <span>Vote on Product Hunt</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
            </a>
            <Link to="/" className={`transition-colors text-sm relative group ${isActive("/") ? "text-white" : "text-gray-400 hover:text-white"}`}>
              Home
              <span
                className={`absolute -bottom-1 left-0 w-full h-0.5 bg-white transform origin-left transition-transform duration-200 ${
                  isActive("/") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
            <Link to="/templates" className={`transition-colors text-sm relative group ${isActive("/templates") ? "text-white" : "text-gray-400 hover:text-white"}`}>
              Templates
              <span
                className={`absolute -bottom-1 left-0 w-full h-0.5 bg-white transform origin-left transition-transform duration-200 ${
                  isActive("/templates") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
            <Link to="/api-docs" className={`transition-colors text-sm relative group ${isActive("/api-docs") ? "text-white" : "text-gray-400 hover:text-white"}`}>
              API
              <span
                className={`absolute -bottom-1 left-0 w-full h-0.5 bg-white transform origin-left transition-transform duration-200 ${
                  isActive("/api-docs") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
            <a
              href="https://github.com/Promplify/promplify-issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors text-sm relative group inline-flex items-center gap-1"
              title="Issue Tracker & Contributions Repository"
            >
              GitHub
              <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-white transform origin-left transition-transform duration-200 scale-x-0 group-hover:scale-x-100" />
            </a>
            {session && (
              <Link to="/dashboard" className={`transition-colors text-sm relative group ${isActive("/dashboard") ? "text-white" : "text-gray-400 hover:text-white"}`}>
                Dashboard
                <span
                  className={`absolute -bottom-1 left-0 w-full h-0.5 bg-white transform origin-left transition-transform duration-200 ${
                    isActive("/dashboard") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            )}
            {session ? (
              <div className="flex items-center gap-4 ml-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="focus:outline-none cursor-pointer">
                      <Avatar className="w-10 h-10 border-2 border-white/20 hover:border-white/40 transition-colors">
                        <AvatarImage
                          src={session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling?.classList.remove("hidden");
                          }}
                        />
                        <AvatarFallback className="bg-primary/20 text-white text-lg">
                          {(session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email)?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 mt-2" align="end">
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">{session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/profile" className="flex items-center w-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2 h-4 w-4"
                        >
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/settings" className="flex items-center w-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2 h-4 w-4"
                        >
                          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleExport} className="cursor-pointer">
                      <Download className="mr-2 h-4 w-4" />
                      <span>Export Data</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={handleLogout} className="text-red-600 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link to="/auth">
                <Button className="bg-primary text-white hover:bg-primary/90">Sign In</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle Menu">
            <div className="relative w-6 h-6">
              <span className={`absolute left-0 block w-full h-0.5 bg-current transform transition-all duration-300 ease-in-out ${isMenuOpen ? "rotate-45 top-3" : "top-1"}`} />
              <span className={`absolute left-0 block w-full h-0.5 bg-current transform transition-all duration-300 ease-in-out top-3 ${isMenuOpen ? "opacity-0" : "opacity-100"}`} />
              <span className={`absolute left-0 block w-full h-0.5 bg-current transform transition-all duration-300 ease-in-out ${isMenuOpen ? "-rotate-45 top-3" : "top-5"}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="border-t border-white/10 py-4">
            <div className="flex flex-col space-y-4 px-4">
              <a
                href="https://www.producthunt.com/posts/promplify"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm bg-[#EA532A]/10 hover:bg-[#EA532A]/20 text-[#EA532A] transition-all group inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#EA532A]/20"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>🎉</span>
                <span>Vote on Product Hunt</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
              </a>
              <Link to="/" className="text-white/80 hover:text-white transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link to="/templates" className="text-white/80 hover:text-white transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                Templates
              </Link>
              <Link to="/api-docs" className="text-white/80 hover:text-white transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                API
              </Link>
              <a
                href="https://github.com/Promplify/promplify-issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors py-2 inline-flex items-center gap-1"
                onClick={() => setIsMenuOpen(false)}
              >
                GitHub
                <ExternalLink className="w-3.5 h-3.5 opacity-50" />
              </a>
              {session && (
                <Link to="/dashboard" className="text-white/80 hover:text-white transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
              )}
              {session ? (
                <>
                  <button
                    onClick={() => {
                      handleExport();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors py-2 text-left"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Data</span>
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors py-2 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-primary text-white hover:bg-primary/90">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
