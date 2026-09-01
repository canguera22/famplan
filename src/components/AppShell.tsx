import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, ChefHat, Home, ListTodo, Settings, ShoppingBasket } from "lucide-react";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { QuickAdd } from "@/components/QuickAdd";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const PRIMARY_NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/meals", label: "Meals", icon: ChefHat },
  { to: "/lists", label: "Lists", icon: ListTodo },
] as const;

const MOBILE_NAV = [
  ...PRIMARY_NAV,
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const MEAL_NAV = [
  { to: "/shopping", label: "Shopping list", icon: ShoppingBasket },
  { to: "/preferences", label: "Meal preferences", icon: Settings },
] as const;

function isActive(pathname: string, to: string) {
  return to === "/" ? pathname === "/" : pathname.startsWith(to);
}

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string | undefined;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { profile } = useAuth();
  const displayName = profile?.display_name || "Family member";
  const initial = displayName.slice(0, 1).toUpperCase();

  return (
    <div className="min-h-dvh bg-background">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card px-4 py-6 lg:flex">
        <Link to="/" className="flex items-center gap-3 rounded-xl px-2">
          <BrandLogo className="h-11 w-11" priority />
          <span>
            <span className="block font-display text-lg font-bold tracking-tight">Mesa</span>
            <span className="block text-xs text-muted-foreground">Family life, together.</span>
          </span>
        </Link>

        <nav className="mt-8 flex flex-col gap-1" aria-label="Primary navigation">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn("nav-item", isActive(pathname, item.to) && "nav-item-active")}
            >
              <item.icon className="h-5 w-5" strokeWidth={2} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-7 border-t border-border pt-5">
          <p className="px-3 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Meals & groceries
          </p>
          <nav className="mt-2 flex flex-col gap-1" aria-label="Meal tools">
            {MEAL_NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn("nav-item", isActive(pathname, item.to) && "nav-item-active")}
              >
                <item.icon className="h-5 w-5" strokeWidth={2} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto space-y-4">
          <QuickAdd />
          <Link
            to="/settings"
            className="flex min-h-12 items-center gap-3 rounded-2xl border border-border p-2.5 hover:bg-muted"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-person-blue text-xs font-bold text-primary">
              {initial}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{displayName}</span>
              <span className="block text-xs text-muted-foreground">Settings</span>
            </span>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="border-b border-border/70 bg-background/95 px-4 pb-4 pt-5 backdrop-blur sm:px-6 lg:px-10 lg:pb-5 lg:pt-8">
          <div className="mx-auto flex max-w-6xl items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-3 flex items-center gap-2 lg:hidden">
                <BrandLogo className="h-9 w-9" priority />
                <span className="font-display text-sm font-bold">Mesa</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
              {subtitle ? (
                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto max-w-6xl px-4 pb-32 pt-5 sm:px-6 lg:px-10 lg:pb-12 lg:pt-8"
        >
          {children}
        </main>
      </div>

      <div className="fixed bottom-24 right-4 z-40 lg:hidden">
        <QuickAdd compact />
      </div>

      <nav className="mobile-nav lg:hidden" aria-label="Primary navigation">
        {MOBILE_NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "mobile-nav-item",
              isActive(pathname, item.to) && "mobile-nav-item-active",
            )}
          >
            <item.icon className="h-5 w-5" strokeWidth={2.2} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
