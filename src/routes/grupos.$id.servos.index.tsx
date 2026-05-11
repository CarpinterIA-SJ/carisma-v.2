import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Plus, Search, Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AccessDenied } from "@/components/AccessDenied";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ServoFormDialog } from "@/components/ServoFormDialog";
import { getGrupoById, getServosByGrupo, deleteServo } from "@/lib/services";
import { useAuth } from "@/lib/auth";
import { canAccessGestao } from "@/lib/permissions";
import { ETAPAS_FORMATIVAS, type Servo, type EtapaFormativa } from "@/lib/types";

export const Route = createFileRoute("/grupos/$id/servos/")({
  loader: async ({ params }) => {
    const grupo = await getGrupoById(params.id);
    if (!grupo) throw notFound();
    const servos = await getServosByGrupo(grupo.id);
    return { grupo, servos };
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
  const { user } = useAuth();
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [ministerio, setMinisterio] = useState("todos");
  const [etapa, setEtapa] = useState("todas");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingServo, setEditingServo] = useState<Servo | null>(null);

  if (!canAccessGestao(user, grupo)) {
    return (
      <AppShell>
        <AccessDenied
          title="Sem acesso ao cadastro de servos"
          message="O tesoureiro não tem acesso à gestão de servos. Apenas coordenador, secretário e administradores podem acessar esta área."
          backTo={`/grupos/${grupo.id}`}
        />
      </AppShell>
    );
  }

  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Remover "${nome}" do grupo?`)) return;
    try {
      await deleteServo(id);
      toast.success(`Servo "${nome}" removido.`);
      await router.invalidate();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao remover servo.";
      toast.error(msg);
    }
  }

  function handleEdit(servo: Servo) {
    setEditingServo(servo);
    setDialogOpen(true);
  }

  function handleDialogClose(v: boolean) {
    setDialogOpen(v);
    if (!v) setEditingServo(null);
  }

  const filtrados = servos.filter((s) => {
    const matchNome =
      s.nome.toLowerCase().includes(busca.toLowerCase()) ||
      s.funcao.toLowerCase().includes(busca.toLowerCase());
    const matchMin = ministerio === "todos" || s.ministerios.includes(ministerio as any);
    const matchEtapa = etapa === "todas" || s.etapasFormativas.includes(etapa as EtapaFormativa);
    return matchNome && matchMin && matchEtapa;
  });

  return (
    <AppShell>
      <PageHeader
        title="Servos do Grupo"
        description={grupo.nome}
        backTo={`/grupos/${grupo.id}`}
        actions={
          <Button size="sm" onClick={() => { setEditingServo(null); setDialogOpen(true); }}>
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
          <option>Música e Artes</option>
          <option>Intercessão</option>
          <option>Pregação</option>
          <option>Promoção Humana</option>
          <option>Jovens</option>
          <option>Crianças e Adolescentes</option>
          <option>Família</option>
          <option>Cura e Libertação</option>
          <option>Comunicação</option>
          <option>Formação</option>
        </select>
        <select
          value={etapa}
          onChange={(e) => setEtapa(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="todas">Todas etapas</option>
          {(Object.entries(ETAPAS_FORMATIVAS) as [string, readonly EtapaFormativa[]][]).map(
            ([grupo, opcoes]) => (
              <optgroup key={grupo} label={grupo}>
                {opcoes.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </optgroup>
            ),
          )}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[580px]">
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
                  <div className="flex flex-wrap gap-1">
                    {s.etapasFormativas.map((e) => (
                      <span
                        key={e}
                        className="rounded-full bg-secondary px-2.5 py-0.5 text-xs"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
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
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => handleEdit(s)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive"
                      onClick={() => handleDelete(s.id, s.nome)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {filtrados.length === 0 && (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Nenhum servo encontrado.
          </div>
        )}
      </div>

      <ServoFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        grupoId={grupo.id}
        servo={editingServo ?? undefined}
      />
    </AppShell>
  );
}
