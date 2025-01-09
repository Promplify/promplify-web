import { Home, Plus, List, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

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

  return (
    <Sidebar className="border-r border-border/10">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-base font-semibold px-6">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.url} 
                      className={`flex items-center gap-4 px-6 py-4 text-base rounded-lg transition-all hover:bg-primary/5 ${
                        location.pathname === item.url 
                          ? "bg-primary text-primary-foreground" 
                          : "text-gray-500 hover:text-primary"
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${
                        location.pathname === item.url 
                          ? "text-primary-foreground" 
                          : "text-gray-400"
                      }`} />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}