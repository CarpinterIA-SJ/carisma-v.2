import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search, Download, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { grupos } from "@/lib/mock-data";

export const Route = createFileRoute("/grupos/")({
  head: () => ({
    meta: [
      { title: "Grupos de Oração — RCC Barreiras" },
      { name: "description", content: "Lista de todos os grupos de oração da diocese." },
    ],
  }),
  component: GruposListPage,
});

function GruposListPage() {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  const filtrados = grupos.filter((g) => {
    const matchNome = g.nome.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "todos" || g.status === filtroStatus;
    return matchNome && matchStatus;
  });

  return (
    <AppShell>
      <PageHeader
        title="Grupos de Oração"
        description="Cadastre e gerencie os grupos da Renovação Carismática Católica."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Novo Grupo
            </Button>
          </>
        }
      />

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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtrados.map((g) => (
          <Link
            key={g.id}
            to="/grupos/$id"
            params={{ id: g.id }}
            className="group rounded-lg border border-border bg-card p-5 transition-all hover:border-primary hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <h3 className="font-semibold leading-tight group-hover:text-primary">
                {g.nome}
              </h3>
              <StatusBadge status={g.status} />
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
          <p className="text-sm text-muted-foreground">Nenhum grupo encontrado.</p>
        </div>
      )}
    </AppShell>
  );
}
