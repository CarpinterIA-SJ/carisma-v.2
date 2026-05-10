import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AccessDenied } from "@/components/AccessDenied";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { getGrupoById, getGruposComFarol } from "@/lib/services";
import { useAuth } from "@/lib/auth";
import { canAccessFinanceiro } from "@/lib/permissions";
import type { FarolStatus } from "@/lib/types";

export const Route = createFileRoute("/grupos/$id/farol")({
  loader: async ({ params }) => {
    const [grupo, gruposComFarol] = await Promise.all([
      getGrupoById(params.id),
      getGruposComFarol(),
    ]);
    if (!grupo) throw notFound();
    return { grupo, gruposComFarol };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `Farol — ${loaderData?.grupo.nome ?? "Grupo"}` }],
  }),
  component: FarolPage,
});

const farolColors: Record<FarolStatus, string> = {
  verde: "bg-success",
  amarelo: "bg-warning",
  vermelho: "bg-destructive",
};

const farolBg: Record<FarolStatus, string> = {
  verde: "bg-success/5 border-success/30",
  amarelo: "bg-warning/10 border-warning/40",
  vermelho: "bg-destructive/5 border-destructive/30",
};

const farolLabels: Record<FarolStatus, string> = {
  verde: "Em dia",
  amarelo: "Atraso parcial",
  vermelho: "Inadimplente",
};

function FarolPage() {
  const { grupo, gruposComFarol } = Route.useLoaderData();
  const { user } = useAuth();

  if (!canAccessFinanceiro(user, grupo)) {
    return (
      <AppShell>
        <AccessDenied
          title="Sem acesso ao farol"
          message="Apenas o coordenador, tesoureiro e administradores podem visualizar o farol financeiro."
          backTo={`/grupos/${grupo.id}`}
        />
      </AppShell>
    );
  }

  const visibleGrupos =
    user?.role === "admin"
      ? gruposComFarol
      : gruposComFarol.filter((g) => g.id === grupo.id);

  const grouped: Record<FarolStatus, typeof gruposComFarol> = {
    verde: [],
    amarelo: [],
    vermelho: [],
  };
  visibleGrupos.forEach((g) => grouped[g.farol].push(g));

  return (
    <AppShell>
      <PageHeader
        title="Farol de Pagamentos"
        description={
          user?.role === "admin"
            ? "Visão consolidada do status de mensalidades de todos os grupos."
            : `Status de mensalidades — ${grupo.nome}`
        }
        backTo={`/grupos/${grupo.id}`}
        actions={
          <>
            <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option>Junho/2025</option>
              <option>Maio/2025</option>
              <option>Abril/2025</option>
            </select>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {(["verde", "amarelo", "vermelho"] as const).map((status) => (
          <div key={status} className={`rounded-lg border p-5 ${farolBg[status]}`}>
            <div className="flex items-center gap-3">
              <span className={`h-4 w-4 rounded-full ${farolColors[status]}`} />
              <p className="text-sm font-semibold">{farolLabels[status]}</p>
            </div>
            <p className="mt-3 text-3xl font-bold">{grouped[status].length}</p>
            <p className="text-xs text-muted-foreground">grupos</p>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {(["verde", "amarelo", "vermelho"] as const).map((status) => (
          <div key={status} className="rounded-lg border border-border bg-card">
            <div className="flex items-center gap-3 border-b border-border px-5 py-3">
              <span className={`h-3 w-3 rounded-full ${farolColors[status]}`} />
              <h2 className="text-sm font-semibold">{farolLabels[status]}</h2>
              <span className="ml-auto text-xs text-muted-foreground">
                {grouped[status].length} grupos
              </span>
            </div>
            <div className="divide-y divide-border">
              {grouped[status].map((g) => (
                <Link
                  key={g.id}
                  to="/grupos/$id"
                  params={{ id: g.id }}
                  className="flex items-center justify-between px-5 py-3 text-sm hover:bg-muted/40"
                >
                  <div>
                    <p className="font-medium">{g.nome}</p>
                    <p className="text-xs text-muted-foreground">{g.paroquia}</p>
                  </div>
                  <span className="text-xs text-primary">Ver →</span>
                </Link>
              ))}
              {grouped[status].length === 0 && (
                <p className="px-5 py-6 text-center text-sm text-muted-foreground">
                  Nenhum grupo nesta categoria.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
