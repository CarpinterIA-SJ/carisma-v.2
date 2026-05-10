import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Flame,
  UserPlus,
  Wallet,
  Activity,
  Menu,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { roleCanFinanceiro, roleCanGestao } from "@/lib/permissions";
import type { UserRole } from "@/lib/types";
import { ConfiguracoesDialog } from "@/components/ConfiguracoesDialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface GroupSubNavProps {
  groupId: string;
  pathname: string;
  subNavLinkClass: (active: boolean) => string;
  role: UserRole | undefined;
  onNav?: () => void;
}

function GroupSubNav({ groupId, pathname, subNavLinkClass, role, onNav }: GroupSubNavProps) {
  const isAt = (path: string) => pathname === path;
  const isUnder = (path: string) => pathname.startsWith(path);
  const showGestao = roleCanGestao(role);
  const showFinanceiro = roleCanFinanceiro(role);

  return (
    <div className="mt-2 border-t border-border pt-2">
      <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Grupo de Oração
      </p>
      {showGestao && (
        <Link
          to="/grupos/$id/servos"
          params={{ id: groupId }}
          className={subNavLinkClass(isUnder(`/grupos/${groupId}/servos`))}
          onClick={onNav}
        >
          <UserPlus className="h-4 w-4" />
          Cadastrar Servos
        </Link>
      )}
      {showFinanceiro && (
        <Link
          to="/grupos/$id/pagamentos"
          params={{ id: groupId }}
          className={subNavLinkClass(isAt(`/grupos/${groupId}/pagamentos`))}
          onClick={onNav}
        >
          <Wallet className="h-4 w-4" />
          Gerenciar Pagamentos
        </Link>
      )}
      {showFinanceiro && (
        <Link
          to="/grupos/$id/farol"
          params={{ id: groupId }}
          className={subNavLinkClass(isAt(`/grupos/${groupId}/farol`))}
          onClick={onNav}
        >
          <Activity className="h-4 w-4" />
          Ver Farol
        </Link>
      )}
      {showGestao && (
        <Link
          to="/eventos"
          className={subNavLinkClass(isAt("/eventos") || isAt("/eventos/"))}
          onClick={onNav}
        >
          <Calendar className="h-4 w-4" />
          Gerenciar Eventos
        </Link>
      )}
    </div>
  );
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  coordenador: "Coordenador",
  tesoureiro: "Tesoureiro",
  secretario: "Secretário",
};

function NavContent({
  isAdmin,
  user,
  location,
  navLinkClass,
  subNavLinkClass,
  activeGroupId,
  onNav,
  onConfig,
  onSignOut,
  displayName,
  displayRole,
  initials,
}: {
  isAdmin: boolean;
  user: ReturnType<typeof useAuth>["user"];
  location: { pathname: string };
  navLinkClass: (active: boolean) => string;
  subNavLinkClass: (active: boolean) => string;
  activeGroupId: string | null;
  onNav?: () => void;
  onConfig: () => void;
  onSignOut: () => void;
  displayName: string;
  displayRole: string;
  initials: string;
}) {
  const isAt = (path: string) => location.pathname === path;
  const isUnder = (path: string) => location.pathname.startsWith(path);

  return (
    <>
      <div className="flex items-center gap-3 border-b border-border px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Flame className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">Conexão Carisma</p>
          <p className="text-xs text-muted-foreground">RCC Diocese de Barreiras</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-1 p-3">
        {isAdmin && (
          <>
            <Link to="/admin" className={navLinkClass(isAt("/admin"))} onClick={onNav}>
              <LayoutDashboard className="h-4 w-4" />
              Painel
            </Link>
            <Link to="/dashboard" className={navLinkClass(isAt("/dashboard"))} onClick={onNav}>
              <TrendingUp className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to="/grupos"
              className={navLinkClass(
                isAt("/grupos") || isAt("/grupos/") || (isUnder("/grupos") && !activeGroupId),
              )}
              onClick={onNav}
            >
              <Users className="h-4 w-4" />
              Grupos de Oração
            </Link>
            <Link to="/recibos" className={navLinkClass(isUnder("/recibos"))} onClick={onNav}>
              <FileText className="h-4 w-4" />
              Recibos
            </Link>
            <Link
              to="/eventos"
              className={navLinkClass(isAt("/eventos") || isAt("/eventos/"))}
              onClick={onNav}
            >
              <Calendar className="h-4 w-4" />
              Eventos
            </Link>
          </>
        )}

        {!isAdmin && (
          <>
            {user?.grupoId ? (
              <Link
                to="/grupos/$id"
                params={{ id: user.grupoId }}
                className={navLinkClass(isUnder("/grupos"))}
                onClick={onNav}
              >
                <Users className="h-4 w-4" />
                Meu Grupo
              </Link>
            ) : (
              <Link to="/grupos" className={navLinkClass(isUnder("/grupos"))} onClick={onNav}>
                <Users className="h-4 w-4" />
                Grupos de Oração
              </Link>
            )}
            {roleCanFinanceiro(user?.role) && (
              <Link to="/recibos" className={navLinkClass(isUnder("/recibos"))} onClick={onNav}>
                <FileText className="h-4 w-4" />
                Recibos
              </Link>
            )}
            {roleCanGestao(user?.role) && (
              <Link
                to="/eventos"
                className={navLinkClass(isAt("/eventos") || isAt("/eventos/"))}
                onClick={onNav}
              >
                <Calendar className="h-4 w-4" />
                Eventos
              </Link>
            )}
          </>
        )}

        {activeGroupId && (
          <GroupSubNav
            groupId={activeGroupId}
            pathname={location.pathname}
            subNavLinkClass={subNavLinkClass}
            role={user?.role}
            onNav={onNav}
          />
        )}
      </nav>

      <div className="border-t border-border p-3">
        <div className="mb-2 flex items-center gap-3 rounded-md px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground capitalize">
              {ROLE_LABELS[displayRole] ?? displayRole}
            </p>
          </div>
        </div>
        <button
          onClick={onConfig}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Settings className="h-4 w-4" />
          Configurações
        </button>
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, session, loading, signOut } = useAuth();
  const [configOpen, setConfigOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/" });
    }
  }, [session, loading, navigate]);

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/" });
  }

  if (loading || !session) return null;

  const isAdmin = user?.role === "admin";

  const groupUrlMatch = location.pathname.match(/^\/grupos\/([^/]+)/);
  const groupIdFromUrl = groupUrlMatch ? groupUrlMatch[1] : null;
  const activeGroupId = !isAdmin && user?.grupoId ? user.grupoId : groupIdFromUrl;

  const displayName = user?.nome ?? user?.email ?? "Usuário";
  const displayRole = user?.role ?? "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  function navLinkClass(active: boolean) {
    return cn(
      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
      active
        ? "bg-primary text-primary-foreground"
        : "text-foreground hover:bg-accent hover:text-accent-foreground",
    );
  }

  function subNavLinkClass(active: boolean) {
    return cn(
      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
      active
        ? "bg-primary/15 text-primary"
        : "text-foreground hover:bg-accent hover:text-accent-foreground",
    );
  }

  const navProps = {
    isAdmin,
    user,
    location,
    navLinkClass,
    subNavLinkClass,
    activeGroupId,
    onConfig: () => { setConfigOpen(true); setMobileOpen(false); },
    onSignOut: handleSignOut,
    displayName,
    displayRole,
    initials,
  };

  return (
    <div className="flex min-h-[100dvh] bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border bg-card md:flex">
        <NavContent {...navProps} />
      </aside>

      {/* Mobile sidebar sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col">
          <NavContent {...navProps} onNav={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <ConfiguracoesDialog open={configOpen} onOpenChange={setConfigOpen} />

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-14 md:h-16 items-center gap-3 border-b border-border bg-card px-4 md:px-6">
          {/* Hamburger — mobile only */}
          <button
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="md:hidden flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">Conexão Carisma</span>
          </div>

          <div className="ml-auto flex items-center gap-2 md:gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {ROLE_LABELS[displayRole] ?? displayRole}
              </p>
            </div>
            <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-primary text-xs md:text-sm font-semibold text-primary-foreground">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
