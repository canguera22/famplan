import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, ShoppingCart, Repeat2, History, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "This Week", icon: CalendarDays },
  { to: "/shopping", label: "Shopping", icon: ShoppingCart },
  { to: "/staples", label: "Staples", icon: Repeat2 },
  { to: "/history", label: "History", icon: History },
  { to: "/preferences", label: "Preferences", icon: SlidersHorizontal },
] as const;

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string | undefined;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background">
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col border-r border-border bg-card px-4 py-6">
        <div className="px-2">
          <p className="font-display text-lg font-semibold tracking-tight">Mesa</p>
          <p className="text-xs text-muted-foreground mt-0.5">Weekly dinners, sorted.</p>
        </div>
        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="md:pl-60">
        <header className="px-5 pt-7 pb-4 md:px-10 md:pt-10">
          <h1 className="text-2xl md:text-3xl font-semibold">{title}</h1>
          {subtitle ? <p className="text-sm text-muted-foreground mt-1">{subtitle}</p> : null}
        </header>
        <main className="px-5 pb-32 md:px-10 md:pb-16 max-w-4xl">{children}</main>
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 border-t border-border bg-card/95 backdrop-blur px-2 py-1.5 flex">
        {NAV.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 rounded-lg py-1.5 text-[0.65rem] font-medium",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
