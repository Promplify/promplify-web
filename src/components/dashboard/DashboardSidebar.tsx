import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Home, List, Plus, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const mainMenuItems = [
  {
    title: "Dashboard",
    icon: Home,
    url: "/dashboard",
  },
  {
    title: "Create Prompt",
    icon: Plus,
    url: "/dashboard/create",
  },
  {
    title: "My Prompts",
    icon: List,
    url: "/dashboard/prompts",
  },
  {
    title: "Settings",
    icon: Settings,
    url: "/dashboard/settings",
  },
];

export function DashboardSidebar() {
  const location = useLocation();
  const { state } = useSidebar();

  return (
    <>
      <div className="sticky top-[68px] z-40 flex md:hidden">
        <SidebarTrigger className="absolute right-4 top-4" />
      </div>
      <Sidebar className="hidden md:block sticky w-64 border-r bg-white overflow-y-auto">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-gray-500 px-4 py-2">Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.url}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-md transition-all hover:bg-gray-100 ${
                          location.pathname === item.url ? "bg-gray-100 text-primary font-medium" : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        <item.icon className={`h-4 w-4 ${location.pathname === item.url ? "text-primary" : "text-gray-400"}`} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  );
}
