"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Server,
  Activity,
  Lightbulb,
  AlertCircle,
  Settings,
  Menu,
  X,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

const NAV_ITEMS = [
  { label: "Overview", href: "/app", icon: LayoutDashboard },
  { label: "Systems", href: "/app/systems", icon: Server },
  { label: "Activity", href: "/app/activity", icon: Activity },
  { label: "Insights", href: "/app/insights", icon: Lightbulb },
  { label: "Needs Attention", href: "/app/attention", icon: AlertCircle },
];

const SETTINGS_ITEM = { label: "Settings", href: "/app/settings", icon: Settings };

export default function AppSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [demoActive, setDemoActive] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const isActive = (href: string) => {
    if (href === "/app") return pathname === "/app";
    return pathname.startsWith(href);
  };

  const handleDemoToggle = async () => {
    setDemoLoading(true);
    try {
      if (!demoActive) {
        await api.demo.start();
        setDemoActive(true);
      } else {
        await api.demo.reset();
        setDemoActive(false);
      }
    } catch {
      // silently fail
    } finally {
      setDemoLoading(false);
    }
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-6 h-16 flex items-center border-b border-border-subtle">
        <Link href="/" className="font-heading text-base font-bold tracking-tight text-text-primary">
          VANTAGE
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                active
                  ? "bg-accent-soft text-accent"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              )}
            >
              <Icon size={16} className={active ? "text-accent" : "text-text-muted"} />
              {item.label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-2">
        {/* Settings */}
        <Link
          href={SETTINGS_ITEM.href}
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            isActive(SETTINGS_ITEM.href)
              ? "bg-accent-soft text-accent"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
          )}
        >
          <Settings size={16} className="text-text-muted" />
          Settings
        </Link>

        {/* Demo Mode */}
        <button
          onClick={handleDemoToggle}
          disabled={demoLoading}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer",
            demoActive
              ? "bg-accent-soft text-accent border border-accent-border"
              : "text-text-muted hover:text-text-secondary hover:bg-surface-hover border border-transparent"
          )}
        >
          <Play size={12} />
          {demoLoading ? "Loading..." : demoActive ? "Demo Active" : "Demo Mode"}
          {demoActive && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-canvas-soft border-r border-border-subtle h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-canvas-soft/95 backdrop-blur-md border-b border-border-subtle flex items-center justify-between px-4">
        <Link href="/" className="font-heading text-sm font-bold tracking-tight text-text-primary">
          VANTAGE
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-text-secondary hover:text-text-primary"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-canvas-soft flex flex-col">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
