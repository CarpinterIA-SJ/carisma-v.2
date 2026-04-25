import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Calendar as CalIcon, MapPin, Users } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { eventos } from "@/lib/mock-data";

export const Route = createFileRoute("/eventos/")({
  head: () => ({
    meta: [
      { title: "Eventos — RCC Barreiras" },
      { name: "description", content: "Assembleias, encontros, congressos e caravanas." },
    ],
  }),
  component: EventosPage,
});

function EventosPage() {
  const [tipo, setTipo] = useState("todos");
  const [status, setStatus] = useState("todos");

  const filtrados = eventos.filter((e) => {
    const matchTipo = tipo === "todos" || e.tipo === tipo;
    const matchStatus = status === "todos" || e.status === status;
    return matchTipo && matchStatus;
  });

  return (
    <AppShell>
      <PageHeader
        title="Gerenciamento de Eventos"
        description="Cadastro de assembleias, encontros, congressos, caravanas e demais eventos."
        actions={
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Novo Evento
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="todos">Todos os tipos</option>
          <option>Assembleia</option>
          <option>Encontro</option>
          <option>Congresso</option>
          <option>Caravana</option>
          <option>Retiro</option>
          <option>Cenáculo</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="todos">Todos os status</option>
          <option value="agendado">Agendados</option>
          <option value="em_andamento">Em andamento</option>
          <option value="concluido">Concluídos</option>
          <option value="cancelado">Cancelados</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtrados.map((ev) => (
          <Link
            key={ev.id}
            to="/eventos/$id"
            params={{ id: ev.id }}
            className="group rounded-lg border border-border bg-card p-5 transition-all hover:border-primary hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {ev.tipo}
                </span>
                <h3 className="mt-2 font-semibold leading-tight group-hover:text-primary">
                  {ev.titulo}
                </h3>
              </div>
              <StatusBadge status={ev.status} />
            </div>

            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{ev.descricao}</p>

            <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalIcon className="h-3.5 w-3.5" />
                <span>
                  {new Date(ev.data).toLocaleDateString("pt-BR")} • {ev.horaInicio} às{" "}
                  {ev.horaFim}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                <span>
                  {ev.local} • {ev.cidade}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5" />
                <span>
                  {ev.inscritos.length} / {ev.vagas} inscritos
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
