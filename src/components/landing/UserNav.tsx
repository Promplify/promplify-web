import { supabase } from "@/lib/supabase";
import { LogOut, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export function UserNav() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (!session) return null;

  const initials = session.user.user_metadata?.full_name
    ? session.user.user_metadata.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : session.user.email?.charAt(0).toUpperCase();

  return (
    <div className="relative group">
      <button className="h-8 w-8 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 transition-colors overflow-hidden">
        {session.user.user_metadata?.avatar_url ? (
          <img
            src={session.user.user_metadata.avatar_url}
            alt={session.user.user_metadata?.full_name || "User"}
            className="h-8 w-8 object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : (
          <span className="text-sm font-medium">{initials}</span>
        )}
      </button>
      <div className="absolute right-0 top-full mt-2 w-56 rounded-md bg-black border border-gray-800 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="p-2">
          <div className="px-3 py-2 border-b border-gray-800">
            <div className="text-sm font-medium text-white">{session.user.user_metadata?.full_name || session.user.email}</div>
            <div className="text-xs text-gray-400">{session.user.email}</div>
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
            <button onClick={handleSignOut} className="w-full flex items-center px-3 py-2 text-sm rounded-md text-red-400 hover:text-red-300 hover:bg-gray-800">
              <LogOut size={16} className="mr-2" />
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
