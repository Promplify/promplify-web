import { LogOut, Settings, User } from "lucide-react";
import { Link } from "react-router-dom";

export function UserNav() {
  return (
    <div className="relative group">
      <button className="h-8 w-8 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 transition-colors">
        <img
          src="https://github.com/shadcn.png"
          alt="User"
          className="h-8 w-8 rounded-full"
          onError={(e) => {
            e.currentTarget.src = "";
            e.currentTarget.classList.add("hidden");
            e.currentTarget.nextElementSibling?.classList.remove("hidden");
          }}
        />
        <span className="text-sm font-medium hidden">JD</span>
      </button>
      <div className="absolute right-0 top-full mt-2 w-56 rounded-md bg-black border border-gray-800 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="p-2">
          <div className="px-3 py-2 border-b border-gray-800">
            <div className="text-sm font-medium text-white">John Doe</div>
            <div className="text-xs text-gray-400">john@example.com</div>
          </div>
          <div className="pt-2 space-y-1">
            <Link to="/dashboard" className="flex items-center px-3 py-2 text-sm rounded-md text-gray-300 hover:text-white hover:bg-gray-800">
              <User size={16} className="mr-2" />
              Profile
            </Link>
            <Link to="/settings" className="flex items-center px-3 py-2 text-sm rounded-md text-gray-300 hover:text-white hover:bg-gray-800">
              <Settings size={16} className="mr-2" />
              Settings
            </Link>
            <button className="w-full flex items-center px-3 py-2 text-sm rounded-md text-red-400 hover:text-red-300 hover:bg-gray-800">
              <LogOut size={16} className="mr-2" />
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
