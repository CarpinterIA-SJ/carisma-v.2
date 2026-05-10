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
  ShieldCheck,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { GrupoFormDialog } from "@/components/GrupoFormDialog";
import { GrupoResponsaveisDialog } from "@/components/GrupoResponsaveisDialog";
import { getGrupoById, getServoById, getServosByGrupo, getUsuarios } from "@/lib/services";
import { useAuth } from "@/lib/auth";
import {
  canAccessFinanceiro,
  canAccessGestao,
  canAssignResponsaveis,
  getGrupoRole,
} from "@/lib/permissions";
import type { User } from "@/lib/types";

export const Route = createFileRoute("/grupos/$id/")({
  loader: async ({ params }) => {
    const grupo = await getGrupoById(params.id);
    if (!grupo) throw notFound();
    const [coordenadorServo, servos, usuarios] = await Promise.all([
      grupo.coordenadorId ? getServoById(grupo.coordenadorId) : Promise.resolve(null),
      getServosByGrupo(grupo.id),
      getUsuarios().catch(() => [] as User[]),
    ]);
    const usuariosMap = Object.fromEntries(usuarios.map((u) => [u.id, u]));
    return {
      grupo,
      coordenadorServo,
      totalServos: servos.length,
      responsaveis: {
        coordenador: grupo.coordenadorId ? usuariosMap[grupo.coordenadorId] ?? null : null,
        secretario: grupo.secretarioId ? usuariosMap[grupo.secretarioId] ?? null : null,
        tesoureiro: grupo.tesoureiroId ? usuariosMap[grupo.tesoureiroId] ?? null : null,
      },
    };
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

function initials(nome: string): string {
  return nome
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const RESP_SLOTS = [
  {
    key: "coordenador" as const,
    titulo: "Coordenador",
    icon: ShieldCheck,
    cor: "text-blue-600",
    bg: "bg-blue-500/10",
    ring: "ring-blue-500/20",
  },
  {
    key: "secretario" as const,
    titulo: "Secretário",
    icon: FileText,
    cor: "text-emerald-700",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/20",
  },
  {
    key: "tesoureiro" as const,
    titulo: "Tesoureiro",
    icon: Wallet,
    cor: "text-amber-700",
    bg: "bg-amber-500/10",
    ring: "ring-amber-500/20",
  },
];

function GrupoPerfilPage() {
  const { grupo, coordenadorServo, totalServos, responsaveis } = Route.useLoaderData();
  const { user } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [respOpen, setRespOpen] = useState(false);

  const showFinanceiro = canAccessFinanceiro(user, grupo);
  const showGestao = canAccessGestao(user, grupo);
  const canEdit = canAccessGestao(user, grupo); // admin, coordenador e secretário
  const canAssign = canAssignResponsaveis(user);
  const myRole = getGrupoRole(user, grupo);
  const isLimitedEdit = myRole === "secretario";

  return (
    <AppShell>
      <PageHeader
        title={grupo.nome}
        description={grupo.paroquia}
        backTo="/grupos"
        actions={
          canEdit ? (
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar Grupo
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold">Informações do Grupo</h2>
              <StatusBadge status={grupo.status} />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{grupo.descricao}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <InfoRow
                icon={Clock}
                label="Reuniões"
                value={`${grupo.diaSemana} • ${grupo.horario}`}
              />
              <InfoRow icon={Users} label="Total de servos" value={`${totalServos} membros`} />
              <InfoRow
                icon={Calendar}
                label="Fundado em"
                value={new Date(grupo.fundadoEm).toLocaleDateString("pt-BR")}
              />
              <InfoRow icon={MapPin} label="Paróquia" value={grupo.paroquia} />
            </div>
          </div>

          {/* Equipe Responsável */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Equipe Responsável
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Usuários autorizados a gerenciar este grupo.
                </p>
              </div>
              {canAssign && (
                <Button variant="outline" size="sm" onClick={() => setRespOpen(true)}>
                  <Edit className="mr-2 h-3.5 w-3.5" />
                  Atribuir
                </Button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {RESP_SLOTS.map((slot) => {
                const u = responsaveis[slot.key];
                const Icon = slot.icon;
                return (
                  <div
                    key={slot.key}
                    className={`rounded-lg border border-border bg-card p-4 ring-1 ${slot.ring}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`rounded-md p-1.5 ${slot.bg}`}>
                        <Icon className={`h-3.5 w-3.5 ${slot.cor}`} />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {slot.titulo}
                      </p>
                    </div>
                    {u ? (
                      <div className="mt-3 flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                          {initials(u.nome)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{u.nome}</p>
                          <p className="truncate text-[11px] text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3 text-xs italic text-muted-foreground">Não atribuído</p>
                    )}
                  </div>
                );
              })}
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

          {coordenadorServo && (
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Dados do Coordenador</h2>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground">
                  {initials(coordenadorServo.nome)}
                </div>
                <div>
                  <p className="font-medium">{coordenadorServo.nome}</p>
                  <p className="text-xs text-muted-foreground">{coordenadorServo.funcao}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoRow icon={Mail} label="E-mail" value={coordenadorServo.email} />
                <InfoRow icon={Phone} label="Telefone" value={coordenadorServo.telefone} />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {myRole && myRole !== "admin" && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-xs">
              <p className="font-semibold text-primary">Seu acesso a este grupo</p>
              <p className="mt-1 capitalize text-muted-foreground">{myRole}</p>
            </div>
          )}

          {showGestao && (
            <Link to="/grupos/$id/servos" params={{ id: grupo.id }}>
              <Button className="w-full justify-start" variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                Cadastrar Servos
              </Button>
            </Link>
          )}
          {showFinanceiro && (
            <Link to="/grupos/$id/pagamentos" params={{ id: grupo.id }}>
              <Button className="w-full justify-start" variant="outline">
                <Wallet className="mr-2 h-4 w-4" />
                Gerenciar Pagamentos
              </Button>
            </Link>
          )}
          {showFinanceiro && (
            <Link to="/grupos/$id/farol" params={{ id: grupo.id }}>
              <Button className="w-full justify-start" variant="outline">
                <Activity className="mr-2 h-4 w-4" />
                Ver Farol
              </Button>
            </Link>
          )}
          {showGestao && (
            <Link to="/eventos">
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Gerenciar Eventos
              </Button>
            </Link>
          )}
        </div>
      </div>

      {canEdit && (
        <GrupoFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          grupo={grupo}
          isAdmin={user?.role === "admin"}
          limitedEdit={isLimitedEdit}
        />
      )}
      {canAssign && (
        <GrupoResponsaveisDialog open={respOpen} onOpenChange={setRespOpen} grupo={grupo} />
      )}
    </AppShell>
  );
}
