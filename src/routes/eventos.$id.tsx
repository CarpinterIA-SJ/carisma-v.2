import { createFileRoute, notFound } from "@tanstack/react-router";
import { Edit, FileDown, UserPlus, Bus, Calendar, MapPin, Clock, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { eventos, getServoById } from "@/lib/mock-data";

export const Route = createFileRoute("/eventos/$id")({
  loader: ({ params }) => {
    const evento = eventos.find((e) => e.id === params.id);
    if (!evento) throw notFound();
    return { evento };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.evento.titulo ?? "Evento"} — RCC Barreiras` },
      { name: "description", content: loaderData?.evento.descricao ?? "" },
    ],
  }),
  component: EventoDetalhesPage,
});

function EventoDetalhesPage() {
  const { evento } = Route.useLoaderData();
  const ocupacao = Math.round((evento.inscritos.length / evento.vagas) * 100);

  return (
    <AppShell>
      <PageHeader
        title={evento.titulo}
        description={evento.descricao}
        backTo="/eventos"
        actions={
          <>
            <Button variant="outline" size="sm">
              <FileDown className="mr-2 h-4 w-4" />
              Lista de Presença
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {evento.tipo}
              </span>
              <StatusBadge status={evento.status} />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field
                icon={Calendar}
                label="Data"
                value={new Date(evento.data).toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              />
              <Field
                icon={Clock}
                label="Horário"
                value={`${evento.horaInicio} às ${evento.horaFim}`}
              />
              <Field icon={MapPin} label="Local" value={evento.local} />
              <Field icon={MapPin} label="Cidade" value={evento.cidade} />
              <Field icon={Users} label="Organização" value={evento.organizador} />
              <Field
                icon={Users}
                label="Vagas"
                value={`${evento.inscritos.length} de ${evento.vagas}`}
              />
            </div>

            <div className="mt-5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Ocupação</span>
                <span>{ocupacao}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${ocupacao}%` }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold">Lista de Inscritos</h2>
              <span className="text-xs text-muted-foreground">
                {evento.inscritos.length} inscrição(ões)
              </span>
            </div>
            <div className="divide-y divide-border">
              {evento.inscritos.map((sid) => {
                const s = getServoById(sid);
                if (!s) return null;
                return (
                  <div key={sid} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {s.nome
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">{s.nome}</p>
                      <p className="text-xs text-muted-foreground">{s.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{s.funcao}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button className="w-full justify-start">
            <UserPlus className="mr-2 h-4 w-4" />
            Inscrever Servo
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Bus className="mr-2 h-4 w-4" />
            Gerenciar Caravanas
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <FileDown className="mr-2 h-4 w-4" />
            Exportar Inscrições
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="text-sm">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium capitalize">{value}</p>
      </div>
    </div>
  );
}
