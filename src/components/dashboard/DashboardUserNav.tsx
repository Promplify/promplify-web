import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { exportUserData, importUserData } from "@/services/promptService";
import { Download, LogOut, Settings, Upload, User } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function DashboardUserNav() {
  const [session, setSession] = useState(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

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
      if (!session?.user?.id) {
        toast.error("Please login to export data");
        return;
      }
      const data = await exportUserData(session.user.id);
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `promplify-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    }
  };

  const handleImportClick = () => {
    if (!session) {
      toast.error("Please login to import data");
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
      // Refresh to reload dashboard data
      setTimeout(() => window.location.reload(), 500);
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(`Failed to import data: ${error.message || "Unknown error"}`, { id: loadingId });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!session) return null;

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full cursor-pointer">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture}
              alt={session.user.user_metadata?.full_name || session.user.email}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
            <AvatarFallback className="bg-primary/20 text-white text-lg">
              {(session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email)?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium leading-none">{session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email}</p>
          <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
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
    <input ref={fileInputRef} onChange={handleImportChange} type="file" accept="application/json,.json" className="hidden" />
    </>
  );
}
