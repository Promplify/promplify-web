import { Logo } from "@/components/landing/Logo";
import { Bell, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { UserNav } from "../landing/UserNav";

export function DashboardHeader() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="w-full bg-black">
      <div className="h-16 px-4 flex items-center justify-between w-full">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2">
            <Logo />
          </Link>
          <nav className="flex items-center space-x-6">
            <Link to="/" className={`transition-colors text-sm ${isActive("/") ? "text-white" : "text-gray-400 hover:text-white"}`}>
              Home
            </Link>
            <Link to="/dashboard" className={`transition-colors text-sm ${isActive("/dashboard") ? "text-white" : "text-gray-400 hover:text-white"}`}>
              Dashboard
            </Link>
            <Link to="/api" className={`transition-colors text-sm ${isActive("/api") ? "text-white" : "text-gray-400 hover:text-white"}`}>
              API
            </Link>
            <Link to="/docs" className={`transition-colors text-sm ${isActive("/docs") ? "text-white" : "text-gray-400 hover:text-white"}`}>
              Documentation
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors">
            <Bell size={20} />
          </button>
          <button className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors">
            <Settings size={20} />
          </button>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
