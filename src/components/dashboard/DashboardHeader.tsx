import { Logo } from "@/components/landing/Logo";
import { ExternalLink } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { DashboardUserNav } from "./DashboardUserNav";

export function DashboardHeader() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 w-full bg-black/95 backdrop-blur-sm border-b border-white/10 z-40">
      <div className="h-14 sm:h-16 px-3 sm:px-6 lg:px-8 flex items-center justify-between w-full">
        <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity flex-shrink-0">
          <Logo />
        </Link>
        <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
          <nav className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
            <a
              href="https://www.producthunt.com/posts/promplify"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex text-sm bg-[#EA532A]/10 hover:bg-[#EA532A]/20 text-[#EA532A] transition-all group items-center gap-1.5 px-3 py-1 rounded-full border border-[#EA532A]/20"
            >
              <span>🎉</span>
              <span>Vote on Product Hunt</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
            </a>
            <Link to="/" className={`transition-colors text-xs sm:text-sm relative group whitespace-nowrap ${isActive("/") ? "text-white" : "text-gray-400 hover:text-white"}`}>
              Home
              <span
                className={`absolute -bottom-1 left-0 w-full h-0.5 bg-white transform origin-left transition-transform duration-200 ${
                  isActive("/") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
            <Link to="/discover" className={`hidden sm:inline-block transition-colors text-xs sm:text-sm relative group whitespace-nowrap ${isActive("/discover") ? "text-white" : "text-gray-400 hover:text-white"}`}>
              Discover
              <span
                className={`absolute -bottom-1 left-0 w-full h-0.5 bg-white transform origin-left transition-transform duration-200 ${
                  isActive("/discover") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
            <Link to="/templates" className={`hidden md:inline-block transition-colors text-xs sm:text-sm relative group whitespace-nowrap ${isActive("/templates") ? "text-white" : "text-gray-400 hover:text-white"}`}>
              Templates
              <span
                className={`absolute -bottom-1 left-0 w-full h-0.5 bg-white transform origin-left transition-transform duration-200 ${
                  isActive("/templates") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
            <Link to="/api-docs" className={`hidden lg:inline-block transition-colors text-xs sm:text-sm relative group whitespace-nowrap ${isActive("/api-docs") ? "text-white" : "text-gray-400 hover:text-white"}`}>
              API
              <span
                className={`absolute -bottom-1 left-0 w-full h-0.5 bg-white transform origin-left transition-transform duration-200 ${
                  isActive("/api-docs") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
            <a
              href="https://github.com/Promplify/promplify-web/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:inline-flex text-gray-400 hover:text-white transition-colors text-xs sm:text-sm relative group items-center gap-1 whitespace-nowrap"
              title="Issue Tracker & Contributions Repository"
            >
              GitHub
              <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-white transform origin-left transition-transform duration-200 scale-x-0 group-hover:scale-x-100" />
            </a>
            <Link to="/dashboard" className={`transition-colors text-xs sm:text-sm relative group whitespace-nowrap ${isActive("/dashboard") ? "text-white" : "text-gray-400 hover:text-white"}`}>
              Dashboard
              <span
                className={`absolute -bottom-1 left-0 w-full h-0.5 bg-white transform origin-left transition-transform duration-200 ${
                  isActive("/dashboard") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
          </nav>
          <DashboardUserNav />
        </div>
      </div>
    </header>
  );
}
