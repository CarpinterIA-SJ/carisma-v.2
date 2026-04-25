import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Wallet,
  Settings,
  LogOut,
  Flame,
} from "lucide-react";
import type { ReactNode } from "react";
import { currentUser } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", label: "Painel", icon: LayoutDashboard },
  { to: "/grupos", label: "Grupos de Oração", icon: Users },
  { to: "/recibos", label: "Recibos", icon: FileText },
  { to: "/eventos", label: "Eventos", icon: Calendar },
];

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 flex-col border-r border-border bg-card md:flex">
        <div className="flex items-center gap-3 border-b border-border px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">RCC Barreiras</p>
            <p className="text-xs text-muted-foreground">Sistema Diocesano</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              location.pathname === item.to ||
              (item.to !== "/admin" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
            <Settings className="h-4 w-4" />
            Configurações
          </button>
          <Link
            to="/"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
          <div className="md:hidden flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            <span className="font-semibold">RCC Barreiras</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">{currentUser.nome}</p>
              <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {currentUser.nome
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
