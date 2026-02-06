import React, { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/Components/ui/sidebar";
import { AppSidebar } from "@/Components/app-sidebar";
import { Separator } from "@/Components/ui/separator";
import { Button } from "@/Components/ui/button";
import { Moon, Sun } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";

/**
 * DashboardLayout - Shared layout component with sidebar and header
 * Use this for all dashboard pages to maintain consistent navigation
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content to render in main area
 * @param {React.ReactNode} props.headerContent - Optional content for header (filters, etc.)
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Page subtitle/description
 */
export function DashboardLayout({ children, headerContent, title, subtitle }) {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem("darkMode");
        return saved ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("darkMode", JSON.stringify(darkMode));
    }, [darkMode]);

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex-1">
                {/* Header */}
                <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-700/50 px-6 bg-slate-900">
                    <SidebarTrigger className="text-white hover:bg-white/10" />
                    <Separator orientation="vertical" className="h-5 bg-slate-600" />

                    {/* Header Content (filters, etc) */}
                    {headerContent && (
                        <div className="flex-1 flex items-center">
                            {headerContent}
                        </div>
                    )}

                    {!headerContent && <div className="flex-1" />}

                    {/* Notifications */}
                    <NotificationDropdown />

                    {/* Dark Mode Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDarkMode(!darkMode)}
                        className="h-9 w-9 text-white hover:bg-white/10"
                    >
                        {darkMode ? (
                            <Sun className="h-5 w-5 text-amber-400" />
                        ) : (
                            <Moon className="h-5 w-5" />
                        )}
                    </Button>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-6 bg-slate-950 min-h-[calc(100vh-3.5rem)] overflow-auto">
                    <div className="w-full">
                        {/* Page Title */}
                        {(title || subtitle) && (
                            <div className="mb-6">
                                {title && (
                                    <h1 className="text-3xl font-bold text-white mb-2">
                                        {title}
                                    </h1>
                                )}
                                {subtitle && (
                                    <p className="text-slate-400">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Page Content */}
                        {children}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
