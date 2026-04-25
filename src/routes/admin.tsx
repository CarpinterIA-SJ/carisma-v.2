import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Calendar,
  Settings,
  Check,
  X,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { stats, getServoById } from "@/lib/mock-data";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel — RCC Barreiras" },
      { name: "description", content: "Visão geral do sistema diocesano da RCC Barreiras." },
    ],
  }),
  component: AdminDashboard,
});

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: "default" | "success" | "warning" | "destructive";
}

function StatCard({ label, value, icon: Icon, tone }: StatCardProps) {
  const tones = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/20 text-warning-foreground",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <div className={`rounded-lg p-2.5 ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  return (
    <AppShell>
      <PageHeader
        title="Painel do Administrador"
        description="Visão geral do sistema diocesano e ações rápidas."
        actions={
          <>
            <Link to="/eventos">
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Gerenciar Eventos
              </Button>
            </Link>
            <Link to="/grupos">
              <Button size="sm">
                <Users className="mr-2 h-4 w-4" />
                Gerenciar Grupos
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de Grupos" value={stats.totalGrupos} icon={Users} tone="default" />
        <StatCard
          label="Total de Servos"
          value={stats.totalServos}
          icon={UserCheck}
          tone="default"
        />
        <StatCard
          label="Mensalidades em Dia"
          value={stats.mensalidadesEmDia}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Mensalidades em Atraso"
          value={stats.mensalidadesAtraso}
          icon={AlertCircle}
          tone="destructive"
        />
      </div>

      <div className="mt-8 rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">Grupos Pendentes de Aprovação</h2>
            <p className="text-sm text-muted-foreground">
              Novos grupos aguardando análise da diocese.
            </p>
          </div>
          <span className="rounded-full bg-warning/20 px-2.5 py-0.5 text-xs font-medium text-warning-foreground">
            {stats.pendentes.length} pendentes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/40">
              <tr className="text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Grupo</th>
                <th className="px-5 py-3">Coordenador(a)</th>
                <th className="px-5 py-3">Secretário(a)</th>
                <th className="px-5 py-3">Tesoureiro(a)</th>
                <th className="px-5 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.pendentes.map((g) => (
                <tr key={g.id} className="text-sm">
                  <td className="px-5 py-3">
                    <p className="font-medium">{g.nome}</p>
                    <p className="text-xs text-muted-foreground">{g.paroquia}</p>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {getServoById(g.coordenadorId)?.nome ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {g.secretarioId ? getServoById(g.secretarioId)?.nome : "—"}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {g.tesoureiroId ? getServoById(g.tesoureiroId)?.nome : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" className="h-8 px-2.5">
                        <X className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" className="h-8 px-2.5 bg-success hover:bg-success/90">
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link
          to="/grupos"
          className="group flex items-center justify-between rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary"
        >
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Grupos</p>
              <p className="text-xs text-muted-foreground">
                Cadastro e gestão dos grupos de oração
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
        </Link>
        <Link
          to="/eventos"
          className="group flex items-center justify-between rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary"
        >
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Eventos</p>
              <p className="text-xs text-muted-foreground">
                Assembleias, congressos e caravanas
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
        </Link>
        <button className="group flex items-center justify-between rounded-lg border border-border bg-card p-5 text-left transition-colors hover:border-primary">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Configurações</p>
              <p className="text-xs text-muted-foreground">
                Parâmetros e preferências do sistema
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
        </button>
      </div>
    </AppShell>
  );
}
