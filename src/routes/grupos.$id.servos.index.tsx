import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getGrupoById, getServosByGrupo } from "@/lib/mock-data";

export const Route = createFileRoute("/grupos/$id/servos/")({
  loader: ({ params }) => {
    const grupo = getGrupoById(params.id);
    if (!grupo) throw notFound();
    return { grupo, servos: getServosByGrupo(grupo.id) };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Servos — ${loaderData?.grupo.nome ?? "Grupo"}` },
      { name: "description", content: "Cadastro de servos do grupo de oração." },
    ],
  }),
  component: ServosListPage,
});

function ServosListPage() {
  const { grupo, servos } = Route.useLoaderData();
  const [busca, setBusca] = useState("");
  const [ministerio, setMinisterio] = useState("todos");
  const [etapa, setEtapa] = useState("todas");

  const filtrados = servos.filter((s) => {
    const matchNome =
      s.nome.toLowerCase().includes(busca.toLowerCase()) ||
      s.funcao.toLowerCase().includes(busca.toLowerCase());
    const matchMin = ministerio === "todos" || s.ministerios.includes(ministerio as any);
    const matchEtapa = etapa === "todas" || s.etapaFormativa === etapa;
    return matchNome && matchMin && matchEtapa;
  });

  return (
    <AppShell>
      <PageHeader
        title="Servos do Grupo"
        description={grupo.nome}
        backTo={`/grupos/${grupo.id}`}
        actions={
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Novo Servo
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou função..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={ministerio}
          onChange={(e) => setMinisterio(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="todos">Todos ministérios</option>
          <option>Música</option>
          <option>Intercessão</option>
          <option>Pregação</option>
          <option>Acolhida</option>
          <option>Jovens</option>
          <option>Comunicação</option>
        </select>
        <select
          value={etapa}
          onChange={(e) => setEtapa(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="todas">Todas etapas</option>
          <option>Iniciante</option>
          <option>Seminário Vida no Espírito Santo</option>
          <option>Crescimento</option>
          <option>Maturidade</option>
          <option>Discipulado</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full">
          <thead className="bg-muted/40">
            <tr className="text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3">Servo</th>
              <th className="px-5 py-3">Função</th>
              <th className="px-5 py-3">Etapa Formativa</th>
              <th className="px-5 py-3">Ministérios</th>
              <th className="px-5 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtrados.map((s) => (
              <tr key={s.id} className="text-sm hover:bg-muted/30">
                <td className="px-5 py-3">
                  <Link
                    to="/grupos/$id/servos/$servoId"
                    params={{ id: grupo.id, servoId: s.id }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {s.nome
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <p className="font-medium hover:text-primary">{s.nome}</p>
                      <p className="text-xs text-muted-foreground">{s.email}</p>
                    </div>
                  </Link>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{s.funcao}</td>
                <td className="px-5 py-3">
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">
                    {s.etapaFormativa}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1">
                    {s.ministerios.map((m) => (
                      <span
                        key={m}
                        className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtrados.length === 0 && (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Nenhum servo encontrado.
          </div>
        )}
      </div>
    </AppShell>
  );
}
