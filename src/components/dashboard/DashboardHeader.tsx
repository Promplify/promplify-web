import { Logo } from "@/components/landing/Logo";
import { Bell, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { UserNav } from "../landing/UserNav";

export function DashboardHeader() {
  return (
    <header className="w-full bg-black">
      <div className="h-16 px-4 flex items-center justify-between w-full">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2">
            <Logo />
          </Link>
          <nav className="flex items-center space-x-6">
            <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">
              Home
            </Link>
            <Link to="/dashboard" className="text-white transition-colors text-sm">
              Dashboard
            </Link>
            <Link to="/api" className="text-gray-400 hover:text-white transition-colors text-sm">
              API
            </Link>
            <Link to="/docs" className="text-gray-400 hover:text-white transition-colors text-sm">
              Documentation
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-800 rounded-full">
            <Bell size={20} className="text-gray-400 hover:text-white" />
          </button>
          <button className="p-2 hover:bg-gray-800 rounded-full">
            <Settings size={20} className="text-gray-400 hover:text-white" />
          </button>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
