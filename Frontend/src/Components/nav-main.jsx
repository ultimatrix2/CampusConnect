import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageSquare, Users } from "lucide-react";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/Components/ui/sidebar";

const navItems = [
    {
        title: "Dashboard",
        url: "/home",
        icon: LayoutDashboard,
        activeClass: "bg-gradient-to-r from-violet-600 to-purple-600",
    },
    {
        title: "Chat",
        url: "/chat",
        icon: MessageSquare,
        activeClass: "bg-gradient-to-r from-cyan-600 to-blue-600",
    },
    {
        title: "Community",
        url: "/community",
        icon: Users,
        activeClass: "bg-gradient-to-r from-emerald-600 to-teal-600",
    },
];

export function NavMain() {
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";

    return (
        <SidebarMenu className={`space-y-1 ${isCollapsed ? "items-center" : ""}`}>
            {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                    <SidebarMenuItem key={item.title} className={isCollapsed ? "flex justify-center w-full" : ""}>
                        <SidebarMenuButton
                            tooltip={item.title}
                            isActive={isActive}
                            onClick={() => navigate(item.url)}
                            className={`h-10 rounded-lg transition-all ${isCollapsed ? "justify-center px-0 w-10" : "px-3"
                                } ${isActive
                                    ? `${item.activeClass} text-white font-semibold shadow-lg`
                                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                                }`}
                        >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            {!isCollapsed && <span>{item.title}</span>}
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                );
            })}
        </SidebarMenu>
    );
}
