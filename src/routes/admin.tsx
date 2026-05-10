import * as React from "react";
import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import {
  Users, UserCheck, CheckCircle2, AlertCircle, Calendar, Check, X,
  UserPlus, Pencil, Trash2, ShieldCheck, Plus, Search, MapPin, Clock,
  Activity, Eye, Download, QrCode, Copy, Settings, KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  getStats, getGrupos, getEventos, getRecibos, getUsuarios, getGruposComFarol,
  getServosByIds, getServosByGrupo, getMensalidadesByGrupo,
  approveGrupo, rejectGrupo, deleteGrupo,
  deleteServo, deleteEvento,
  updateMensalidadeStatus,
  createRecibo,
  deleteUsuario,
  approveUsuario,
  rejectUsuario,
  deleteMensalidade,
} from "@/lib/services";
import { imprimirRecibo } from "@/lib/recibo";
import { GrupoFormDialog } from "@/components/GrupoFormDialog";
import { GrupoResponsaveisDialog } from "@/components/GrupoResponsaveisDialog";
import { ServoFormDialog } from "@/components/ServoFormDialog";
import { EventoFormDialog } from "@/components/EventoFormDialog";
import { UsuarioFormDialog } from "@/components/UsuarioFormDialog";
import { LancarCobrancasDialog } from "@/components/LancarCobrancasDialog";
import { EditMensalidadeDialog } from "@/components/EditMensalidadeDialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Grupo, Servo, Mensalidade, Evento, Recibo, User, FarolStatus } from "@/lib/types";

// ── PIX helpers ───────────────────────────────────────────────────────────────

const PIX_KEY = "15617255000175";
const PIX_MERCHANT_NAME = "RCC Barreiras";
const PIX_MERCHANT_CITY = "Barreiras";

function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

function emvField(id: string, value: string): string {
  return `${id}${value.length.toString().padStart(2, "0")}${value}`;
}

function getPixConfig() {
  return {
    key: localStorage.getItem("carisma_pix_key") ?? PIX_KEY,
    nome: localStorage.getItem("carisma_pix_nome") ?? PIX_MERCHANT_NAME,
    cidade: localStorage.getItem("carisma_pix_cidade") ?? PIX_MERCHANT_CITY,
  };
}

function buildPixPayload(valor: number, txid: string): string {
  const cfg = getPixConfig();
  const key = emvField("01", cfg.key);
  const gui = emvField("00", "BR.GOV.BCB.PIX");
  const merchantAccount = emvField("26", gui + key);
  const additionalData = emvField("62", emvField("05", txid.slice(0, 25)));
  const payload =
    emvField("00", "01") + merchantAccount + emvField("52", "0000") +
    emvField("53", "986") + emvField("54", valor.toFixed(2)) +
    emvField("58", "BR") + emvField("59", cfg.nome.slice(0, 25)) +
    emvField("60", cfg.cidade.slice(0, 15)) + additionalData + "6304";
  return payload + crc16(payload);
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador", coordenador: "Coordenador",
  tesoureiro: "Tesoureiro", secretario: "Secretário",
};
const ROLE_BADGES: Record<string, string> = {
  admin: "bg-primary/10 text-primary", coordenador: "bg-blue-500/10 text-blue-600",
  tesoureiro: "bg-amber-500/10 text-amber-700", secretario: "bg-emerald-500/10 text-emerald-700",
};
const FAROL_COLORS: Record<FarolStatus, string> = { verde: "bg-success", amarelo: "bg-warning", vermelho: "bg-destructive" };
const FAROL_BG: Record<FarolStatus, string> = {
  verde: "bg-success/5 border-success/30", amarelo: "bg-warning/10 border-warning/40",
  vermelho: "bg-destructive/5 border-destructive/30",
};
const FAROL_LABELS: Record<FarolStatus, string> = { verde: "Em dia", amarelo: "Atraso parcial", vermelho: "Inadimplente" };

type AdminTab = "visao-geral" | "grupos" | "servos" | "pagamentos" | "eventos" | "recibos" | "farol" | "usuarios" | "configuracoes";

const TABS: { id: AdminTab; label: string }[] = [
  { id: "visao-geral", label: "Visão Geral" },
  { id: "grupos", label: "Grupos" },
  { id: "servos", label: "Servos" },
  { id: "pagamentos", label: "Pagamentos" },
  { id: "eventos", label: "Eventos" },
  { id: "recibos", label: "Recibos" },
  { id: "farol", label: "Farol" },
  { id: "usuarios", label: "Usuários" },
  { id: "configuracoes", label: "Configurações" },
];

// ── Loader ────────────────────────────────────────────────────────────────────

async function loadAdminData() {
  const [stats, usuarios, grupos, eventos, recibos, gruposComFarol] = await Promise.all([
    getStats(), getUsuarios(), getGrupos(), getEventos(), getRecibos(), getGruposComFarol(),
  ]);

  const servoIds = stats.pendentes.flatMap((g) =>
    [g.coordenadorId, g.secretarioId, g.tesoureiroId].filter(Boolean) as string[],
  );
  const servos = await getServosByIds([...new Set(servoIds)]);
  const servoMap = Object.fromEntries(servos.map((s) => [s.id, s]));

  return { ...stats, servoMap, usuarios, grupos, eventos, recibos, gruposComFarol };
}

export const Route = createFileRoute("/admin")({
  loader: loadAdminData,
  head: () => ({
    meta: [
      { title: "Painel — RCC Barreiras" },
      { name: "description", content: "Visão geral do sistema diocesano da RCC Barreiras." },
    ],
  }),
  component: AdminDashboard,
});

// ── Shared sub-components ─────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, tone }: {
  label: string; value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: "default" | "success" | "warning" | "destructive";
}) {
  const tones = {
    default: "bg-primary/10 text-primary", success: "bg-success/10 text-success",
    warning: "bg-warning/20 text-warning-foreground", destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <div className={`rounded-lg p-2.5 ${tones[tone]}`}><Icon className="h-5 w-5" /></div>
      </div>
    </div>
  );
}

function PixModal({ mensalidade, grupoNome, open, onOpenChange }: {
  mensalidade: Mensalidade; grupoNome: string; open: boolean; onOpenChange: (v: boolean) => void;
}) {
  const [copied, setCopied] = React.useState(false);
  const txid = `MSG${mensalidade.id.replace(/\D/g, "").slice(0, 20)}`;
  const pixString = buildPixPayload(mensalidade.valor, txid);
  const refLabel = `${MESES[mensalidade.mes - 1]}/${mensalidade.ano}`;

  function handleCopy() {
    navigator.clipboard.writeText(pixString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><QrCode className="h-5 w-5 text-primary" />Pagar via PIX</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg bg-muted/40 p-3 text-center text-sm">
            <p className="text-muted-foreground">Referência</p>
            <p className="font-semibold">{grupoNome} — {refLabel}</p>
            <p className="mt-1 text-lg font-bold text-primary">R$ {mensalidade.valor.toFixed(2).replace(".", ",")}</p>
          </div>
          <div className="flex justify-center">
            <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <QRCodeSVG value={pixString} size={200} level="M" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">PIX Copia e Cola</p>
            <div className="flex gap-2">
              <div className="min-w-0 flex-1 rounded-md border border-input bg-muted/40 px-3 py-2 text-xs font-mono break-all">{pixString.slice(0, 60)}…</div>
              <Button size="sm" variant="outline" className="shrink-0" onClick={handleCopy}>
                {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
          <div className="rounded-md bg-primary/5 p-3 text-xs text-muted-foreground">
            <p><strong>Chave PIX:</strong> {PIX_KEY}</p>
            <p><strong>Favorecido:</strong> {PIX_MERCHANT_NAME}</p>
            <p><strong>Valor:</strong> R$ {mensalidade.valor.toFixed(2).replace(".", ",")}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Tab: Visão Geral ──────────────────────────────────────────────────────────

function VisaoGeralTab({
  totalGrupos, totalServos, mensalidadesEmDia, mensalidadesAtraso, pendentes, servoMap,
}: {
  totalGrupos: number; totalServos: number; mensalidadesEmDia: number; mensalidadesAtraso: number;
  pendentes: Grupo[]; servoMap: Record<string, Servo>;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState<string | null>(null);

  async function handleApprove(grupo: Grupo) {
    setLoading(grupo.id);
    try {
      await approveGrupo(grupo.id);
      toast.success(`Grupo "${grupo.nome}" aprovado.`);
      await router.invalidate();
    } catch { toast.error("Erro ao aprovar grupo."); }
    finally { setLoading(null); }
  }

  async function handleReject(grupo: Grupo) {
    setLoading(grupo.id);
    try {
      await rejectGrupo(grupo.id);
      toast.success(`Grupo "${grupo.nome}" rejeitado.`);
      await router.invalidate();
    } catch { toast.error("Erro ao rejeitar grupo."); }
    finally { setLoading(null); }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de Grupos" value={totalGrupos} icon={Users} tone="default" />
        <StatCard label="Total de Servos" value={totalServos} icon={UserCheck} tone="default" />
        <StatCard label="Mensalidades em Dia" value={mensalidadesEmDia} icon={CheckCircle2} tone="success" />
        <StatCard label="Mensalidades em Atraso" value={mensalidadesAtraso} icon={AlertCircle} tone="destructive" />
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">Grupos Pendentes de Aprovação</h2>
            <p className="text-sm text-muted-foreground">Novos grupos aguardando análise da diocese.</p>
          </div>
          <span className="rounded-full bg-warning/20 px-2.5 py-0.5 text-xs font-medium text-warning-foreground">
            {pendentes.length} pendentes
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
              {pendentes.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">Nenhum grupo pendente.</td></tr>
              )}
              {pendentes.map((g) => (
                <tr key={g.id} className="text-sm">
                  <td className="px-5 py-3"><p className="font-medium">{g.nome}</p><p className="text-xs text-muted-foreground">{g.paroquia}</p></td>
                  <td className="px-5 py-3 text-muted-foreground">{g.coordenadorId ? (servoMap[g.coordenadorId]?.nome ?? "—") : "—"}</td>
                  <td className="px-5 py-3 text-muted-foreground">{g.secretarioId ? (servoMap[g.secretarioId]?.nome ?? "—") : "—"}</td>
                  <td className="px-5 py-3 text-muted-foreground">{g.tesoureiroId ? (servoMap[g.tesoureiroId]?.nome ?? "—") : "—"}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" className="h-8 px-2.5" disabled={loading === g.id} onClick={() => handleReject(g)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" className="h-8 px-2.5 bg-success hover:bg-success/90" disabled={loading === g.id} onClick={() => handleApprove(g)}>
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
    </div>
  );
}

// ── Tab: Grupos ───────────────────────────────────────────────────────────────

function GruposTab({ grupos }: { grupos: Grupo[] }) {
  const router = useRouter();
  const [busca, setBusca] = React.useState("");
  const [filtroStatus, setFiltroStatus] = React.useState("todos");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editGrupo, setEditGrupo] = React.useState<Grupo | undefined>(undefined);
  const [respGrupo, setRespGrupo] = React.useState<Grupo | undefined>(undefined);
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  const filtrados = grupos.filter((g) => {
    const matchNome = g.nome.toLowerCase().includes(busca.toLowerCase()) || g.paroquia.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "todos" || g.status === filtroStatus;
    return matchNome && matchStatus;
  });

  async function handleDelete(g: Grupo) {
    if (!confirm(`Excluir o grupo "${g.nome}"? Esta ação não pode ser desfeita.`)) return;
    setLoadingId(g.id);
    try {
      await deleteGrupo(g.id);
      toast.success(`Grupo "${g.nome}" excluído.`);
      await router.invalidate();
    } catch { toast.error("Erro ao excluir grupo."); }
    finally { setLoadingId(null); }
  }

  async function handleApprove(g: Grupo) {
    setLoadingId(g.id);
    try {
      await approveGrupo(g.id);
      toast.success(`Grupo "${g.nome}" aprovado.`);
      await router.invalidate();
    } catch { toast.error("Erro ao aprovar."); }
    finally { setLoadingId(null); }
  }

  async function handleReject(g: Grupo) {
    setLoadingId(g.id);
    try {
      await rejectGrupo(g.id);
      toast.success(`Grupo "${g.nome}" rejeitado.`);
      await router.invalidate();
    } catch { toast.error("Erro ao rejeitar."); }
    finally { setLoadingId(null); }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou paróquia..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
        </div>
        <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="todos">Todos os status</option>
          <option value="aprovado">Aprovados</option>
          <option value="pendente">Pendentes</option>
          <option value="rejeitado">Rejeitados</option>
        </select>
        <Button size="sm" onClick={() => { setEditGrupo(undefined); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />Novo Grupo
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-muted/40">
            <tr className="text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3">Grupo</th>
              <th className="px-5 py-3">Paróquia</th>
              <th className="px-5 py-3">Reunião</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Servos</th>
              <th className="px-5 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtrados.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">Nenhum grupo encontrado.</td></tr>
            )}
            {filtrados.map((g) => (
              <tr key={g.id} className="text-sm hover:bg-muted/20">
                <td className="px-5 py-3">
                  <Link to="/grupos/$id" params={{ id: g.id }} className="font-medium hover:text-primary">{g.nome}</Link>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{g.paroquia}</td>
                <td className="px-5 py-3 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />{g.diaSemana} {g.horario}
                  </div>
                </td>
                <td className="px-5 py-3"><StatusBadge status={g.status} /></td>
                <td className="px-5 py-3 text-muted-foreground">{g.totalServos}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    {g.status === "pendente" && (
                      <>
                        <Button size="sm" variant="outline" className="h-7 px-2 text-destructive hover:border-destructive hover:bg-destructive/10"
                          disabled={loadingId === g.id} onClick={() => handleReject(g)}><X className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" className="h-7 px-2 bg-success hover:bg-success/90"
                          disabled={loadingId === g.id} onClick={() => handleApprove(g)}><Check className="h-3.5 w-3.5" /></Button>
                      </>
                    )}
                    <Button size="sm" variant="outline" className="h-7 px-2"
                      title="Atribuir Responsáveis"
                      onClick={() => setRespGrupo(g)}><ShieldCheck className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="outline" className="h-7 px-2"
                      onClick={() => { setEditGrupo(g); setDialogOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="outline" className="h-7 px-2 text-destructive hover:border-destructive hover:bg-destructive/10"
                      disabled={loadingId === g.id} onClick={() => handleDelete(g)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <GrupoFormDialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditGrupo(undefined); }} grupo={editGrupo} isAdmin />
      {respGrupo && (
        <GrupoResponsaveisDialog
          open={!!respGrupo}
          onOpenChange={(v) => { if (!v) setRespGrupo(undefined); }}
          grupo={respGrupo}
        />
      )}
    </div>
  );
}

// ── Tab: Servos ───────────────────────────────────────────────────────────────

function ServosTab({ grupos }: { grupos: Grupo[] }) {
  const router = useRouter();
  const aprovados = grupos.filter((g) => g.status === "aprovado");
  const [grupoId, setGrupoId] = React.useState(aprovados[0]?.id ?? "");
  const [servos, setServos] = React.useState<Servo[]>([]);
  const [loadingServos, setLoadingServos] = React.useState(false);
  const [busca, setBusca] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editServo, setEditServo] = React.useState<Servo | undefined>(undefined);

  React.useEffect(() => {
    if (!grupoId) return;
    setLoadingServos(true);
    getServosByGrupo(grupoId)
      .then(setServos)
      .catch(() => toast.error("Erro ao carregar servos."))
      .finally(() => setLoadingServos(false));
  }, [grupoId]);

  async function handleRefresh() {
    if (!grupoId) return;
    const data = await getServosByGrupo(grupoId);
    setServos(data);
  }

  async function handleDelete(s: Servo) {
    if (!confirm(`Remover "${s.nome}" do grupo?`)) return;
    try {
      await deleteServo(s.id);
      toast.success(`Servo "${s.nome}" removido.`);
      await handleRefresh();
      await router.invalidate();
    } catch { toast.error("Erro ao remover servo."); }
  }

  const filtrados = servos.filter((s) =>
    s.nome.toLowerCase().includes(busca.toLowerCase()) || s.funcao.toLowerCase().includes(busca.toLowerCase()),
  );

  const grupoSelecionado = grupos.find((g) => g.id === grupoId);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Grupo de Oração</label>
          <select value={grupoId} onChange={(e) => { setGrupoId(e.target.value); setBusca(""); }}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {aprovados.length === 0 && <option value="">Nenhum grupo aprovado</option>}
            {aprovados.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
          </select>
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground mt-3" />
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Buscar</label>
          <Input placeholder="Nome ou função..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9 mt-1" />
        </div>
        <div className="flex items-end">
          <Button size="sm" disabled={!grupoId} onClick={() => { setEditServo(undefined); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />Novo Servo
          </Button>
        </div>
      </div>

      {grupoSelecionado && (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{grupoSelecionado.nome}</span> — {grupoSelecionado.paroquia} • {grupoSelecionado.totalServos} servos
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {loadingServos ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-muted/40">
              <tr className="text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Servo</th>
                <th className="px-5 py-3">Função</th>
                <th className="px-5 py-3">Etapa</th>
                <th className="px-5 py-3">Ministérios</th>
                <th className="px-5 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtrados.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">
                  {grupoId ? "Nenhum servo encontrado." : "Selecione um grupo."}
                </td></tr>
              )}
              {filtrados.map((s) => (
                <tr key={s.id} className="text-sm hover:bg-muted/20">
                  <td className="px-5 py-3">
                    <Link to="/grupos/$id/servos/$servoId" params={{ id: grupoId, servoId: s.id }}
                      className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {s.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
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
                        <span key={e} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">{e}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {s.ministerios.map((m) => (
                        <span key={m} className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">{m}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="outline" className="h-7 px-2"
                        onClick={() => { setEditServo(s); setDialogOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="outline" className="h-7 px-2 text-destructive hover:border-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(s)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {grupoId && (
        <ServoFormDialog
          open={dialogOpen}
          onOpenChange={async (v) => {
            setDialogOpen(v);
            if (!v) { setEditServo(undefined); await handleRefresh(); }
          }}
          grupoId={grupoId}
          servo={editServo}
        />
      )}
    </div>
  );
}

// ── Tab: Pagamentos ───────────────────────────────────────────────────────────

type ModalState = { type: "pix"; mensalidade: Mensalidade } | null;

function PagamentosTab({ grupos }: { grupos: Grupo[] }) {
  const router = useRouter();
  const aprovados = grupos.filter((g) => g.status === "aprovado");
  const [grupoId, setGrupoId] = React.useState(aprovados[0]?.id ?? "");
  const [mensalidades, setMensalidades] = React.useState<Mensalidade[]>([]);
  const [loadingMens, setLoadingMens] = React.useState(false);
  const [ano, setAno] = React.useState(new Date().getFullYear());
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const [modal, setModal] = React.useState<ModalState>(null);
  const [lancarOpen, setLancarOpen] = React.useState(false);
  const [editMens, setEditMens] = React.useState<Mensalidade | null>(null);
  const [deleteMens, setDeleteMens] = React.useState<Mensalidade | null>(null);

  React.useEffect(() => {
    if (!grupoId) return;
    setLoadingMens(true);
    getMensalidadesByGrupo(grupoId)
      .then(setMensalidades)
      .catch(() => toast.error("Erro ao carregar mensalidades."))
      .finally(() => setLoadingMens(false));
  }, [grupoId]);

  async function handleRefresh() {
    if (!grupoId) return;
    const data = await getMensalidadesByGrupo(grupoId);
    setMensalidades(data);
  }

  async function handleValidar(m: Mensalidade) {
    setLoadingId(m.id);
    try {
      await updateMensalidadeStatus(m.id, "pago", { dataPagamento: new Date().toISOString().slice(0, 10) });
      await createRecibo({
        grupoId: m.grupoId,
        valor: m.valor,
        descricao: `Contribuição Mensal dos Grupos de Oração — ${MESES[m.mes - 1]}/${m.ano}`,
      });
      toast.success(`Pagamento de ${MESES[m.mes - 1]}/${m.ano} confirmado. Recibo gerado.`);
      await handleRefresh();
      await router.invalidate();
    } catch { toast.error("Erro ao confirmar pagamento."); }
    finally { setLoadingId(null); }
  }

  async function handleConfirmDelete() {
    if (!deleteMens) return;
    const m = deleteMens;
    setLoadingId(m.id);
    try {
      await deleteMensalidade(m.id);
      toast.success(`Lançamento de ${MESES[m.mes - 1]}/${m.ano} excluído.`);
      setDeleteMens(null);
      await handleRefresh();
      await router.invalidate();
    } catch {
      toast.error("Erro ao excluir lançamento.");
    } finally {
      setLoadingId(null);
    }
  }

  const anos = [...new Set(mensalidades.map((m) => m.ano))].sort((a, b) => b - a);
  const filtradas = mensalidades.filter((m) => m.ano === ano);
  const pagas = filtradas.filter((m) => m.status === "pago").length;
  const pendentes = filtradas.filter((m) => m.status === "pendente" || m.status === "atrasado").length;
  const totalValor = filtradas.reduce((acc, m) => acc + m.valor, 0);
  const pago = filtradas.filter((m) => m.status === "pago").reduce((acc, m) => acc + m.valor, 0);
  const grupoSelecionado = grupos.find((g) => g.id === grupoId);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Grupo de Oração</label>
          <select value={grupoId} onChange={(e) => setGrupoId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {aprovados.length === 0 && <option value="">Nenhum grupo aprovado</option>}
            {aprovados.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Ano</label>
          <select value={ano} onChange={(e) => setAno(Number(e.target.value))}
            className="mt-1 block rounded-md border border-input bg-background px-3 py-2 text-sm">
            {anos.length > 0 ? anos.map((a) => <option key={a} value={a}>{a}</option>) : <option value={ano}>{ano}</option>}
          </select>
        </div>
        <Button onClick={() => setLancarOpen(true)} className="gap-2 self-end">
          <Plus className="h-4 w-4" />
          Lançar Cobranças
        </Button>
      </div>

      {grupoSelecionado && (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{grupoSelecionado.nome}</span> — {grupoSelecionado.paroquia}
        </p>
      )}

      {!loadingMens && filtradas.length > 0 && (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Total / Ano</p>
            <p className="mt-1 text-2xl font-bold">R$ {totalValor.toFixed(2).replace(".", ",")}</p>
            <p className="text-xs text-muted-foreground">{filtradas.length} mensalidades</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Pagas</p>
            <p className="mt-1 text-2xl font-bold text-success">R$ {pago.toFixed(2).replace(".", ",")}</p>
            <p className="text-xs text-muted-foreground">{pagas} meses</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Em Aberto</p>
            <p className="mt-1 text-2xl font-bold text-destructive">R$ {(totalValor - pago).toFixed(2).replace(".", ",")}</p>
            <p className="text-xs text-muted-foreground">{pendentes} meses</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Mensalidade</p>
            <p className="mt-1 text-2xl font-bold">R$ 30,00</p>
            <p className="text-xs text-muted-foreground">valor fixo mensal</p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {loadingMens ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-muted/40">
              <tr className="text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Mês</th>
                <th className="px-5 py-3">Vencimento</th>
                <th className="px-5 py-3">Valor</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Pagamento</th>
                <th className="px-5 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtradas.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">
                  {grupoId ? `Nenhuma mensalidade em ${ano}.` : "Selecione um grupo."}
                </td></tr>
              )}
              {filtradas.map((m) => {
                const isPendente = m.status === "pendente" || m.status === "atrasado";
                return (
                  <tr key={m.id} className="text-sm">
                    <td className="px-5 py-3 font-medium">{MESES[m.mes - 1]}/{m.ano}</td>
                    <td className="px-5 py-3 text-muted-foreground">{new Date(m.vencimento).toLocaleDateString("pt-BR")}</td>
                    <td className="px-5 py-3 font-medium">R$ {m.valor.toFixed(2).replace(".", ",")}</td>
                    <td className="px-5 py-3"><StatusBadge status={m.status} /></td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {m.dataPagamento ? new Date(m.dataPagamento).toLocaleDateString("pt-BR") : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        {isPendente && (
                          <>
                            <Button size="sm" variant="outline" className="h-8 gap-1.5"
                              onClick={() => setModal({ type: "pix", mensalidade: m })}>
                              <QrCode className="h-3.5 w-3.5" /><span className="hidden sm:inline">PIX</span>
                            </Button>
                            <Button size="sm" variant="outline"
                              className="h-8 gap-1.5 border-success text-success hover:bg-success/10"
                              disabled={loadingId === m.id} title="Confirmar pagamento manualmente"
                              onClick={() => handleValidar(m)}>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">{loadingId === m.id ? "Confirmando…" : "Confirmar"}</span>
                            </Button>
                          </>
                        )}
                        {m.status === "validacao" && (
                          <>
                            {m.comprovanteUrl && (
                              <a href={m.comprovanteUrl} target="_blank" rel="noreferrer">
                                <Button size="sm" variant="ghost" className="h-8"><Eye className="mr-1 h-3.5 w-3.5" />Ver</Button>
                              </a>
                            )}
                            <Button size="sm" variant="outline" className="h-8 border-success text-success hover:bg-success/10" disabled={loadingId === m.id} onClick={() => handleValidar(m)}>
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />{loadingId === m.id ? "Confirmando…" : "Confirmar"}
                            </Button>
                          </>
                        )}
                        {m.status === "pago" && m.comprovanteUrl && (
                          <a href={m.comprovanteUrl} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="ghost" className="h-8"><Eye className="mr-1 h-3.5 w-3.5" />Comprovante</Button>
                          </a>
                        )}
                        <Button size="sm" variant="ghost" className="h-8 px-2" title="Editar lançamento"
                          onClick={() => setEditMens(m)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          title="Excluir lançamento" disabled={loadingId === m.id}
                          onClick={() => setDeleteMens(m)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {modal?.type === "pix" && (
        <PixModal mensalidade={modal.mensalidade} grupoNome={grupoSelecionado?.nome ?? ""} open={true}
          onOpenChange={(v) => { if (!v) setModal(null); }} />
      )}
      <LancarCobrancasDialog
        grupos={grupos}
        open={lancarOpen}
        onOpenChange={setLancarOpen}
        onSuccess={handleRefresh}
      />
      <EditMensalidadeDialog
        mensalidade={editMens}
        open={editMens !== null}
        onOpenChange={(v) => { if (!v) setEditMens(null); }}
        onSuccess={async () => { await handleRefresh(); await router.invalidate(); }}
      />
      <AlertDialog open={deleteMens !== null} onOpenChange={(v) => { if (!v) setDeleteMens(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lançamento?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteMens && (
                <>
                  Esta ação removerá permanentemente o lançamento de{" "}
                  <strong>{MESES[deleteMens.mes - 1]}/{deleteMens.ano}</strong>{" "}
                  (R$ {deleteMens.valor.toFixed(2).replace(".", ",")}).
                  {deleteMens.status === "pago" && " O recibo já gerado permanecerá registrado."}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Tab: Eventos ──────────────────────────────────────────────────────────────

function EventosTab({ eventos: initialEventos }: { eventos: Evento[] }) {
  const router = useRouter();
  const [tipo, setTipo] = React.useState("todos");
  const [status, setStatus] = React.useState("todos");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editEvento, setEditEvento] = React.useState<Evento | undefined>(undefined);
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  const filtrados = initialEventos.filter((e) => {
    const matchTipo = tipo === "todos" || e.tipo === tipo;
    const matchStatus = status === "todos" || e.status === status;
    return matchTipo && matchStatus;
  });

  async function handleDelete(e: Evento) {
    if (!confirm(`Excluir o evento "${e.titulo}"?`)) return;
    setLoadingId(e.id);
    try {
      await deleteEvento(e.id);
      toast.success(`Evento "${e.titulo}" excluído.`);
      await router.invalidate();
    } catch { toast.error("Erro ao excluir evento."); }
    finally { setLoadingId(null); }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="todos">Todos os tipos</option>
          {["Assembleia","Encontro","Congresso","Caravana","Retiro","Cenáculo"].map((t) => <option key={t}>{t}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="todos">Todos os status</option>
          <option value="agendado">Agendados</option>
          <option value="em_andamento">Em andamento</option>
          <option value="concluido">Concluídos</option>
          <option value="cancelado">Cancelados</option>
        </select>
        <Button size="sm" className="ml-auto" onClick={() => { setEditEvento(undefined); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />Novo Evento
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-muted/40">
            <tr className="text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3">Evento</th>
              <th className="px-5 py-3">Tipo</th>
              <th className="px-5 py-3">Data</th>
              <th className="px-5 py-3">Local</th>
              <th className="px-5 py-3">Vagas</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtrados.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-muted-foreground">Nenhum evento encontrado.</td></tr>
            )}
            {filtrados.map((e) => (
              <tr key={e.id} className="text-sm hover:bg-muted/20">
                <td className="px-5 py-3">
                  <Link to="/eventos/$id" params={{ id: e.id }} className="font-medium hover:text-primary">{e.titulo}</Link>
                  <p className="text-xs text-muted-foreground">{e.organizador}</p>
                </td>
                <td className="px-5 py-3">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{e.tipo}</span>
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(e.data).toLocaleDateString("pt-BR")}</div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{e.local}, {e.cidade}</div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{e.inscritos.length}/{e.vagas}</td>
                <td className="px-5 py-3"><StatusBadge status={e.status} /></td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="outline" className="h-7 px-2"
                      onClick={() => { setEditEvento(e); setDialogOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="outline" className="h-7 px-2 text-destructive hover:border-destructive hover:bg-destructive/10"
                      disabled={loadingId === e.id} onClick={() => handleDelete(e)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <EventoFormDialog
        open={dialogOpen}
        onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditEvento(undefined); }}
        evento={editEvento}
      />
    </div>
  );
}

// ── Tab: Recibos ──────────────────────────────────────────────────────────────

function RecibosTab({ recibos, grupos }: { recibos: Recibo[]; grupos: Grupo[] }) {
  const [busca, setBusca] = React.useState("");
  const [grupoFiltro, setGrupoFiltro] = React.useState("todos");

  const filtrados = recibos.filter((r) => {
    const matchBusca = r.codigo.toLowerCase().includes(busca.toLowerCase()) || r.descricao.toLowerCase().includes(busca.toLowerCase());
    const matchGrupo = grupoFiltro === "todos" || r.grupoId === grupoFiltro;
    return matchBusca && matchGrupo;
  });

  const grupoNome = (id: string) => grupos.find((g) => g.id === id)?.nome ?? "—";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por código ou descrição..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
        </div>
        <select value={grupoFiltro} onChange={(e) => setGrupoFiltro(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="todos">Todos os grupos</option>
          {grupos.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-muted/40">
            <tr className="text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3">Código</th>
              <th className="px-5 py-3">Grupo</th>
              <th className="px-5 py-3">Descrição</th>
              <th className="px-5 py-3">Valor</th>
              <th className="px-5 py-3">Emitido em</th>
              <th className="px-5 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtrados.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">Nenhum recibo encontrado.</td></tr>
            )}
            {filtrados.map((r) => (
              <tr key={r.id} className="text-sm">
                <td className="px-5 py-3 font-mono text-xs font-medium">{r.codigo}</td>
                <td className="px-5 py-3">{grupoNome(r.grupoId)}</td>
                <td className="px-5 py-3 text-muted-foreground">{r.descricao}</td>
                <td className="px-5 py-3 font-medium">R$ {r.valor.toFixed(2).replace(".", ",")}</td>
                <td className="px-5 py-3 text-muted-foreground">{new Date(r.emitidoEm).toLocaleDateString("pt-BR")}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-8" onClick={() => imprimirRecibo(r, grupoNome(r.grupoId))}>
                      <Eye className="mr-1 h-3.5 w-3.5" />Ver
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8" onClick={() => imprimirRecibo(r, grupoNome(r.grupoId))}>
                      <Download className="mr-1 h-3.5 w-3.5" />PDF
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Farol ────────────────────────────────────────────────────────────────

function FarolTab({ gruposComFarol }: { gruposComFarol: Array<Grupo & { farol: FarolStatus }> }) {
  const grouped: Record<FarolStatus, typeof gruposComFarol> = { verde: [], amarelo: [], vermelho: [] };
  gruposComFarol.forEach((g) => grouped[g.farol].push(g));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {(["verde", "amarelo", "vermelho"] as const).map((s) => (
          <div key={s} className={`rounded-lg border p-5 ${FAROL_BG[s]}`}>
            <div className="flex items-center gap-3">
              <span className={`h-4 w-4 rounded-full ${FAROL_COLORS[s]}`} />
              <p className="text-sm font-semibold">{FAROL_LABELS[s]}</p>
            </div>
            <p className="mt-3 text-3xl font-bold">{grouped[s].length}</p>
            <p className="text-xs text-muted-foreground">grupos</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {(["verde", "amarelo", "vermelho"] as const).map((s) => (
          <div key={s} className="rounded-lg border border-border bg-card">
            <div className="flex items-center gap-3 border-b border-border px-5 py-3">
              <span className={`h-3 w-3 rounded-full ${FAROL_COLORS[s]}`} />
              <h2 className="text-sm font-semibold">{FAROL_LABELS[s]}</h2>
              <span className="ml-auto text-xs text-muted-foreground">{grouped[s].length} grupos</span>
            </div>
            <div className="divide-y divide-border">
              {grouped[s].map((g) => (
                <Link key={g.id} to="/grupos/$id" params={{ id: g.id }}
                  className="flex items-center justify-between px-5 py-3 text-sm hover:bg-muted/40">
                  <div>
                    <p className="font-medium">{g.nome}</p>
                    <p className="text-xs text-muted-foreground">{g.paroquia}</p>
                  </div>
                  <span className="text-xs text-primary">Ver →</span>
                </Link>
              ))}
              {grouped[s].length === 0 && (
                <p className="px-5 py-6 text-center text-sm text-muted-foreground">Nenhum grupo nesta categoria.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab: Usuários ─────────────────────────────────────────────────────────────

function UsuariosTab({ usuarios, grupos }: { usuarios: User[]; grupos: Grupo[] }) {
  const router = useRouter();
  const [userDialog, setUserDialog] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | undefined>(undefined);
  const [deletingUser, setDeletingUser] = React.useState<string | null>(null);
  const [pendingAction, setPendingAction] = React.useState<string | null>(null);

  const grupoNome = React.useMemo(
    () => Object.fromEntries(grupos.map((g) => [g.id, g.nome])),
    [grupos],
  );
  const pendentes = usuarios.filter((u) => u.status === "pendente");
  const aprovados = usuarios.filter((u) => u.status !== "pendente");

  async function handleDelete(u: User) {
    if (!confirm(`Excluir o usuário "${u.nome}"? Esta ação não pode ser desfeita.`)) return;
    setDeletingUser(u.id);
    try {
      await deleteUsuario(u.id);
      toast.success(`Usuário "${u.nome}" excluído.`);
      await router.invalidate();
    } catch { toast.error("Erro ao excluir usuário."); }
    finally { setDeletingUser(null); }
  }

  async function handleApprove(u: User) {
    setPendingAction(u.id);
    try {
      await approveUsuario(u.id);
      toast.success(`"${u.nome}" aprovado. Acesso liberado.`);
      await router.invalidate();
    } catch { toast.error("Erro ao aprovar cadastro."); }
    finally { setPendingAction(null); }
  }

  async function handleReject(u: User) {
    if (!confirm(`Rejeitar e remover o cadastro de "${u.nome}"?`)) return;
    setPendingAction(u.id);
    try {
      await rejectUsuario(u.id);
      toast.success(`Cadastro de "${u.nome}" rejeitado.`);
      await router.invalidate();
    } catch { toast.error("Erro ao rejeitar cadastro."); }
    finally { setPendingAction(null); }
  }

  return (
    <div className="space-y-6">
      {/* Acessos pendentes */}
      <section className="rounded-lg border border-warning/40 bg-warning/5 p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold">Acessos pendentes</h2>
            <p className="text-sm text-muted-foreground">
              Cadastros enviados pela tela pública aguardando aprovação.
            </p>
          </div>
          <span className="rounded-full bg-warning/15 px-3 py-1 text-xs font-medium text-warning">
            {pendentes.length} pendentes
          </span>
        </div>
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead className="bg-muted/40">
                <tr className="text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3">Nome</th>
                  <th className="px-5 py-3">E-mail</th>
                  <th className="px-5 py-3">Perfil solicitado</th>
                  <th className="px-5 py-3">Grupo</th>
                  <th className="px-5 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pendentes.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">Nenhum cadastro pendente.</td></tr>
                )}
                {pendentes.map((u) => (
                  <tr key={u.id} className="text-sm">
                    <td className="px-5 py-3 font-medium">{u.nome}</td>
                    <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGES[u.role] ?? "bg-muted text-muted-foreground"}`}>
                        {ROLE_LABELS[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {u.grupoId ? (grupoNome[u.grupoId] ?? u.grupoId) : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2.5 text-success hover:border-success hover:bg-success/10"
                          disabled={pendingAction === u.id}
                          onClick={() => handleApprove(u)}
                        >
                          <Check className="mr-1 h-3.5 w-3.5" />Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2.5 text-destructive hover:border-destructive hover:bg-destructive/10"
                          disabled={pendingAction === u.id}
                          onClick={() => handleReject(u)}
                        >
                          <X className="mr-1 h-3.5 w-3.5" />Rejeitar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setSelectedUser(undefined); setUserDialog(true); }}>
          <UserPlus className="mr-2 h-4 w-4" />Novo Usuário
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead className="bg-muted/40">
            <tr className="text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3">Nome</th>
              <th className="px-5 py-3">E-mail</th>
              <th className="px-5 py-3">Perfil</th>
              <th className="px-5 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {aprovados.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-muted-foreground">Nenhum usuário cadastrado.</td></tr>
            )}
            {aprovados.map((u) => (
              <tr key={u.id} className="text-sm">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {u.nome.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium">{u.nome}</span>
                    {u.status === "rejeitado" && (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-destructive">
                        rejeitado
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGES[u.role] ?? "bg-muted text-muted-foreground"}`}>
                    <ShieldCheck className="h-3 w-3" />
                    {ROLE_LABELS[u.role] || (u.role ? String(u.role) : "Sem perfil")}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" className="h-8 px-2.5" onClick={() => { setSelectedUser(u); setUserDialog(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 px-2.5 text-destructive hover:border-destructive hover:bg-destructive/10"
                      disabled={deletingUser === u.id} onClick={() => handleDelete(u)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <UsuarioFormDialog
        open={userDialog}
        onOpenChange={(v) => { setUserDialog(v); if (!v) setSelectedUser(undefined); }}
        usuario={selectedUser}
      />
    </div>
  );
}

// ── Tab: Configurações ────────────────────────────────────────────────────────

function ConfiguracoesTab() {
  const { user, resetPassword } = useAuth();
  const [pixKey, setPixKey] = React.useState(() => localStorage.getItem("carisma_pix_key") ?? PIX_KEY);
  const [pixNome, setPixNome] = React.useState(() => localStorage.getItem("carisma_pix_nome") ?? PIX_MERCHANT_NAME);
  const [pixCidade, setPixCidade] = React.useState(() => localStorage.getItem("carisma_pix_cidade") ?? PIX_MERCHANT_CITY);
  const [resetSent, setResetSent] = React.useState(false);

  function salvarPix() {
    localStorage.setItem("carisma_pix_key", pixKey.trim());
    localStorage.setItem("carisma_pix_nome", pixNome.trim());
    localStorage.setItem("carisma_pix_cidade", pixCidade.trim());
    toast.success("Configurações PIX salvas. Novos QR Codes usarão esses dados.");
  }

  async function handleResetSenha() {
    if (!user?.email) return;
    const { error } = await resetPassword(user.email);
    if (error) toast.error("Erro ao enviar e-mail de redefinição.");
    else { setResetSent(true); toast.success("Link enviado para " + user.email); }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Minha Conta */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-base">Minha Conta</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">E-mail</p>
            <p className="font-medium">{user?.email ?? "—"}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">Função</p>
            <p className="font-medium">{ROLE_LABELS[user?.role ?? ""] ?? user?.role}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleResetSenha} disabled={resetSent}>
          {resetSent ? "E-mail enviado!" : "Alterar senha"}
        </Button>
      </section>

      {/* PIX */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <QrCode className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-base">Configurações PIX</h2>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="pix-key">Chave PIX</Label>
            <Input
              id="pix-key"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="CPF, CNPJ, e-mail ou chave aleatória"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pix-nome">Nome do beneficiário</Label>
              <Input
                id="pix-nome"
                value={pixNome}
                onChange={(e) => setPixNome(e.target.value)}
                maxLength={25}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pix-cidade">Cidade</Label>
              <Input
                id="pix-cidade"
                value={pixCidade}
                onChange={(e) => setPixCidade(e.target.value)}
                maxLength={15}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={salvarPix}>Salvar configurações PIX</Button>
          <p className="text-xs text-muted-foreground">Aplica nos próximos QR Codes gerados.</p>
        </div>
      </section>

      {/* Sobre */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-base">Sobre</h2>
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Sistema de Gerenciamento — RCC Diocese de Barreiras/BA</p>
          <p>Versão 2.0</p>
        </div>
      </section>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

function AdminDashboard() {
  const { totalGrupos, totalServos, mensalidadesEmDia, mensalidadesAtraso, pendentes, servoMap,
    usuarios, grupos, eventos, recibos, gruposComFarol } = Route.useLoaderData();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = React.useState<AdminTab>("visao-geral");

  React.useEffect(() => {
    if (authLoading || !user || user.role === "admin") return;
    if (user.grupoId) navigate({ to: "/grupos/$id", params: { id: user.grupoId } });
    else navigate({ to: "/grupos" });
  }, [user, authLoading, navigate]);

  if (authLoading) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
  if (!user || user.role !== "admin") return null;

  return (
    <AppShell>
      <PageHeader
        title="Painel do Administrador"
        description="Gerencie todos os recursos da diocese em um só lugar."
      />

      {/* Tab navigation */}
      <div className="mb-6 flex overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "visao-geral" && (
        <VisaoGeralTab totalGrupos={totalGrupos} totalServos={totalServos}
          mensalidadesEmDia={mensalidadesEmDia} mensalidadesAtraso={mensalidadesAtraso}
          pendentes={pendentes} servoMap={servoMap} />
      )}
      {tab === "grupos" && <GruposTab grupos={grupos} />}
      {tab === "servos" && <ServosTab grupos={grupos} />}
      {tab === "pagamentos" && <PagamentosTab grupos={grupos} />}
      {tab === "eventos" && <EventosTab eventos={eventos} />}
      {tab === "recibos" && <RecibosTab recibos={recibos} grupos={grupos} />}
      {tab === "farol" && <FarolTab gruposComFarol={gruposComFarol} />}
      {tab === "usuarios" && <UsuariosTab usuarios={usuarios} grupos={grupos} />}
      {tab === "configuracoes" && <ConfiguracoesTab />}
    </AppShell>
  );
}
