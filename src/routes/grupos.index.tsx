import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Plus, Search, Download, MapPin, Clock, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GrupoFormDialog } from "@/components/GrupoFormDialog";
import { getGrupos, deleteGrupo } from "@/lib/services";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/grupos/")({
  loader: () => getGrupos(),
  head: () => ({
    meta: [
      { title: "Grupos de Oração — RCC Barreiras" },
      { name: "description", content: "Lista de todos os grupos de oração da diocese." },
    ],
  }),
  component: GruposListPage,
});

function GruposListPage() {
  const grupos = Route.useLoaderData();
  const { user } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === "admin";
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleDelete(e: React.MouseEvent, id: string, nome: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Excluir o grupo "${nome}"? Esta ação não pode ser desfeita.`)) return;
    setLoadingId(id);
    try {
      await deleteGrupo(id);
      toast.success(`Grupo "${nome}" excluído.`);
      await router.invalidate();
    } catch {
      toast.error("Erro ao excluir grupo.");
    } finally {
      setLoadingId(null);
    }
  }

  const gruposVisiveis = isAdmin
    ? grupos
    : grupos.filter(
        (g) =>
          g.id === user?.grupoId ||
          g.coordenadorId === user?.id ||
          g.secretarioId === user?.id ||
          g.tesoureiroId === user?.id,
      );

  const filtrados = gruposVisiveis.filter((g) => {
    const matchNome = g.nome.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "todos" || g.status === filtroStatus;
    return matchNome && matchStatus;
  });

  return (
    <AppShell>
      <PageHeader
        title="Grupos de Oração"
        description={
          isAdmin
            ? "Cadastre e gerencie os grupos da Renovação Carismática Católica."
            : "Informações do seu grupo de oração."
        }
        actions={
          isAdmin ? (
            <>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Button size="sm" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Grupo
              </Button>
            </>
          ) : undefined
        }
      />

      {isAdmin && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome do grupo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="todos">Todos os status</option>
            <option value="aprovado">Aprovados</option>
            <option value="pendente">Pendentes</option>
            <option value="rejeitado">Rejeitados</option>
          </select>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtrados.map((g) => (
          <Link
            key={g.id}
            to="/grupos/$id"
            params={{ id: g.id }}
            className="group rounded-lg border border-border bg-card p-5 transition-all hover:border-primary hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <h3 className="font-semibold leading-tight group-hover:text-primary">{g.nome}</h3>
              <div className="flex items-center gap-2">
                <StatusBadge status={g.status} />
                {isAdmin && (
                  <button
                    onClick={(e) => handleDelete(e, g.id, g.nome)}
                    disabled={loadingId === g.id}
                    className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 disabled:cursor-not-allowed"
                    title="Excluir grupo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{g.paroquia}</p>

            <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{g.descricao}</p>

            <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {g.diaSemana} • {g.horario}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                <span>
                  {g.endereco.bairro}, {g.endereco.cidade}/{g.endereco.estado}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
              <span className="text-muted-foreground">{g.totalServos} servos</span>
              <span className="font-medium text-primary">Ver perfil →</span>
            </div>
          </Link>
        ))}
      </div>

      {filtrados.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Nenhum grupo encontrado."
              : "Você ainda não está vinculado a nenhum grupo de oração."}
          </p>
        </div>
      )}

      <GrupoFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </AppShell>
  );
}
