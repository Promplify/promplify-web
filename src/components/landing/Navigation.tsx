import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/lib/supabase";
import { exportUserData, importUserData } from "@/services/promptService";
import { Download, ExternalLink, LogOut, Upload, X } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Logo } from "./Logo";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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

  const handleImportClick = () => {
    if (!session) {
      toast.error("Please sign in first");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleImportChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const loadingId = toast.loading("Importing data...");
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      const payload = JSON.parse(text);
      const result = await importUserData(session.user.id, payload);
      toast.success(`Imported ${result.prompts_created} prompts, ${result.categories_created} categories, ${result.tags_created} tags`, { id: loadingId });
      // Refresh to reload data across views
      setTimeout(() => window.location.reload(), 500);
    } catch (error: any) {
      console.error("Error importing data:", error);
      toast.error(`Failed to import: ${error.message || "Unknown error"}`, { id: loadingId });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
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
              <Link to="/discover" className={`transition-colors text-sm relative group ${isActive("/discover") ? "text-white" : "text-gray-400 hover:text-white"}`}>
                Discover
                <span
                  className={`absolute -bottom-1 left-0 w-full h-0.5 bg-white transform origin-left transition-transform duration-200 ${
                    isActive("/discover") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
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
                href="https://github.com/Promplify/promplify-web"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-all duration-300 text-sm relative group inline-flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/5"
                title="⭐ Star us on GitHub"
              >
                <div className="flex items-center justify-center w-4 h-4 rounded-full bg-gray-700 group-hover:bg-white/20 transition-all duration-300">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="font-medium">GitHub</span>
                <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100" />
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
                      <DropdownMenuItem onSelect={handleImportClick} className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        <span>Import Data</span>
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

            {/* Mobile Menu Button - Sheet */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <button className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors" aria-label="Toggle Menu">
                  <div className="relative w-6 h-6">
                    <span className={`absolute left-0 block w-full h-0.5 bg-current transform transition-all duration-300 ease-in-out ${isMenuOpen ? "rotate-45 top-3" : "top-1"}`} />
                    <span className={`absolute left-0 block w-full h-0.5 bg-current transform transition-all duration-300 ease-in-out top-3 ${isMenuOpen ? "opacity-0" : "opacity-100"}`} />
                    <span className={`absolute left-0 block w-full h-0.5 bg-current transform transition-all duration-300 ease-in-out ${isMenuOpen ? "-rotate-45 top-3" : "top-5"}`} />
                  </div>
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px] bg-black border-white/10 p-0 [&>button]:hidden">
                {/* Mobile menu header with logo and close button */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                    <Logo />
                  </Link>
                  <button onClick={() => setIsMenuOpen(false)} className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg" aria-label="Close menu">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile menu content */}
                <div className="flex flex-col p-6 space-y-6 overflow-y-auto h-[calc(100vh-89px)]">
                  {/* Product Hunt CTA */}
                  <a
                    href="https://www.producthunt.com/posts/promplify"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm bg-[#EA532A]/10 hover:bg-[#EA532A]/20 text-[#EA532A] transition-all group flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[#EA532A]/20"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>🎉</span>
                    <span className="font-medium">Vote on Product Hunt</span>
                    <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </a>

                  {/* Navigation links */}
                  <nav className="flex flex-col space-y-1">
                    <Link
                      to="/"
                      className={`text-base px-3 py-3 rounded-lg transition-colors ${isActive("/") ? "text-white bg-white/10" : "text-white/70 hover:text-white hover:bg-white/5"}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Home
                    </Link>
                    <Link
                      to="/templates"
                      className={`text-base px-3 py-3 rounded-lg transition-colors ${isActive("/templates") ? "text-white bg-white/10" : "text-white/70 hover:text-white hover:bg-white/5"}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Templates
                    </Link>
                    <Link
                      to="/api-docs"
                      className={`text-base px-3 py-3 rounded-lg transition-colors ${isActive("/api-docs") ? "text-white bg-white/10" : "text-white/70 hover:text-white hover:bg-white/5"}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      API
                    </Link>
                    <Link
                      to="/discover"
                      className={`text-base px-3 py-3 rounded-lg transition-colors ${isActive("/discover") ? "text-white bg-white/10" : "text-white/70 hover:text-white hover:bg-white/5"}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Discover
                    </Link>
                    <a
                      href="https://github.com/Promplify/promplify-web"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 hover:text-white hover:bg-white/5 transition-colors text-base px-3 py-3 rounded-lg inline-flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      GitHub
                      <ExternalLink className="w-4 h-4 opacity-50" />
                    </a>
                    {session && (
                      <Link
                        to="/dashboard"
                        className={`text-base px-3 py-3 rounded-lg transition-colors ${isActive("/dashboard") ? "text-white bg-white/10" : "text-white/70 hover:text-white hover:bg-white/5"}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}
                  </nav>

                  {/* User actions */}
                  {session ? (
                    <div className="flex flex-col space-y-1 pt-4 border-t border-white/10">
                      <button
                        onClick={() => {
                          handleExport();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center space-x-3 text-white/70 hover:text-white hover:bg-white/5 transition-colors text-base px-3 py-3 rounded-lg text-left"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export Data</span>
                      </button>
                      <button
                        onClick={() => {
                          handleImportClick();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center space-x-3 text-white/70 hover:text-white hover:bg-white/5 transition-colors text-base px-3 py-3 rounded-lg text-left"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Import Data</span>
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center space-x-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-base px-3 py-3 rounded-lg text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  ) : (
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="pt-4 border-t border-white/10">
                      <Button className="w-full bg-primary text-white hover:bg-primary/90 h-11">Sign In</Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
      <input ref={fileInputRef} onChange={handleImportChange} type="file" accept="application/json,.json" className="hidden" />
    </>
  );
};
