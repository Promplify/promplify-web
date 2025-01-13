import { Logo } from "@/components/landing/Logo";
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
          </nav>
        </div>
        <div className="flex items-center">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
