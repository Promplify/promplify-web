import { Logo } from "@/components/landing/Logo";
import { Link, useLocation } from "react-router-dom";
import { UserNav } from "../landing/UserNav";

export function DashboardHeader() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 w-full bg-black/95 backdrop-blur-sm border-b border-white/10 z-40">
      <div className="h-16 px-4 flex items-center justify-between w-full max-w-7xl mx-auto">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Logo />
          </Link>
          <nav className="flex items-center space-x-6">
            <Link to="/" className={`transition-colors text-sm relative group ${isActive("/") ? "text-white" : "text-gray-400 hover:text-white"}`}>
              Home
              <span
                className={`absolute -bottom-1 left-0 w-full h-0.5 bg-white transform origin-left transition-transform duration-200 ${
                  isActive("/") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
            <Link to="/dashboard" className={`transition-colors text-sm relative group ${isActive("/dashboard") ? "text-white" : "text-gray-400 hover:text-white"}`}>
              Dashboard
              <span
                className={`absolute -bottom-1 left-0 w-full h-0.5 bg-white transform origin-left transition-transform duration-200 ${
                  isActive("/dashboard") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
          </nav>
        </div>
        <div className="flex items-center">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
