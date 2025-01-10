import { supabase } from "@/lib/supabase";
import { LogOut, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Profile {
  avatar_url?: string;
  full_name?: string;
  email?: string;
}

export function UserNav() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function getProfile() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase.from("profiles").select("avatar_url, full_name, email").eq("id", session.user.id).single();

        setProfile(
          data || {
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name,
            avatar_url: session.user.user_metadata?.avatar_url,
          }
        );
      }
    }

    getProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="relative group">
      <button className="h-8 w-8 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 transition-colors overflow-hidden">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name || "User"}
            className="h-8 w-8 object-cover"
            onError={(e) => {
              e.currentTarget.src = "";
              e.currentTarget.classList.add("hidden");
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
            <div className="text-sm font-medium text-white">{profile?.full_name || "User"}</div>
            <div className="text-xs text-gray-400">{profile?.email}</div>
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
