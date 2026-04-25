import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  Edit,
  UserPlus,
  Wallet,
  Activity,
  Calendar,
  MapPin,
  Clock,
  Phone,
  Mail,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { getGrupoById, getServoById, getServosByGrupo } from "@/lib/mock-data";

export const Route = createFileRoute("/grupos/$id")({
  loader: ({ params }) => {
    const grupo = getGrupoById(params.id);
    if (!grupo) throw notFound();
    return { grupo };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.grupo.nome ?? "Grupo"} — RCC Barreiras` },
      {
        name: "description",
        content: loaderData?.grupo.descricao ?? "Detalhes do grupo de oração.",
      },
    ],
  }),
  notFoundComponent: () => (
    <AppShell>
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <p className="font-medium">Grupo não encontrado</p>
        <Link to="/grupos" className="mt-2 inline-block text-sm text-primary hover:underline">
          Voltar para a lista
        </Link>
      </div>
    </AppShell>
  ),
  component: GrupoPerfilPage,
});

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="text-sm">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function GrupoPerfilPage() {
  const { grupo } = Route.useLoaderData();
  const coordenador = getServoById(grupo.coordenadorId);
  const totalServos = getServosByGrupo(grupo.id).length;

  return (
    <AppShell>
      <PageHeader
        title={grupo.nome}
        description={grupo.paroquia}
        backTo="/grupos"
        actions={
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Editar Grupo
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold">Informações do Grupo</h2>
              <StatusBadge status={grupo.status} />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{grupo.descricao}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <InfoRow icon={Clock} label="Reuniões" value={`${grupo.diaSemana} • ${grupo.horario}`} />
              <InfoRow icon={Users} label="Total de servos" value={`${totalServos} membros`} />
              <InfoRow
                icon={Calendar}
                label="Fundado em"
                value={new Date(grupo.fundadoEm).toLocaleDateString("pt-BR")}
              />
              <InfoRow icon={MapPin} label="Paróquia" value={grupo.paroquia} />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Endereço do Grupo</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoRow
                icon={MapPin}
                label="Logradouro"
                value={`${grupo.endereco.rua}, ${grupo.endereco.numero}`}
              />
              <InfoRow icon={MapPin} label="Bairro" value={grupo.endereco.bairro} />
              <InfoRow
                icon={MapPin}
                label="Cidade / Estado"
                value={`${grupo.endereco.cidade} / ${grupo.endereco.estado}`}
              />
              <InfoRow icon={MapPin} label="CEP" value={grupo.endereco.cep} />
            </div>
          </div>

          {coordenador && (
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Dados do Coordenador</h2>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground">
                  {coordenador.nome
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <p className="font-medium">{coordenador.nome}</p>
                  <p className="text-xs text-muted-foreground">{coordenador.funcao}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoRow icon={Mail} label="E-mail" value={coordenador.email} />
                <InfoRow icon={Phone} label="Telefone" value={coordenador.telefone} />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Link to="/grupos/$id/servos" params={{ id: grupo.id }}>
            <Button className="w-full justify-start" variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Cadastrar Servos
            </Button>
          </Link>
          <Link to="/grupos/$id/pagamentos" params={{ id: grupo.id }}>
            <Button className="w-full justify-start" variant="outline">
              <Wallet className="mr-2 h-4 w-4" />
              Gerenciar Pagamentos
            </Button>
          </Link>
          <Link to="/grupos/$id/farol" params={{ id: grupo.id }}>
            <Button className="w-full justify-start" variant="outline">
              <Activity className="mr-2 h-4 w-4" />
              Ver Farol
            </Button>
          </Link>
          <Link to="/eventos">
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Gerenciar Eventos
            </Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
