"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  CheckSquare,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
  BarChart3,
  Users,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "@/actions/auth";
import { useState } from "react";

interface SidebarProps {
  workspaceName: string;
}

export default function Sidebar({ workspaceName }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/projects", icon: Layers },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Members", href: "/members", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-neutral-900 border border-white/10 rounded-lg text-white shadow-xl"
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Sidebar Container - Hidden on mobile unless open */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-neutral-950 border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo & Workspace Selector */}
        <div className="p-6">
          <div className="flex items-center gap-3 px-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold tracking-tighter text-xl italic text-white">
              SpaceSync
            </span>
          </div>

          <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-3 flex items-center justify-between group cursor-pointer hover:border-white/10 transition-all">
            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest leading-none mb-1">
                Workspace
              </span>
              <span className="text-sm font-semibold text-white truncate">
                {workspaceName}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20"
                    : "text-neutral-500 hover:text-white hover:bg-neutral-900/50"
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-indigo-400" : "group-hover:text-white"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Sign Out */}
        <div className="p-4 border-t border-white/5">
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-neutral-500 hover:text-red-400 hover:bg-red-400/5 transition-all group"
            >
              <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
