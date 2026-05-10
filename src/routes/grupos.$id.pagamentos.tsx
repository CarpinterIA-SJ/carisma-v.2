import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  CheckCircle2,
  Activity,
  Eye,
  QrCode,
  Copy,
  Check,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { AppShell } from "@/components/AppShell";
import { AccessDenied } from "@/components/AccessDenied";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { canAccessFinanceiro } from "@/lib/permissions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getGrupoById,
  getMensalidadesByGrupo,
  updateMensalidadeStatus,
  createRecibo,
  deleteMensalidade,
} from "@/lib/services";
import type { Mensalidade } from "@/lib/types";
import { EditMensalidadeDialog } from "@/components/EditMensalidadeDialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// PIX key da diocese — ajuste conforme necessário
const PIX_KEY = "15617255000175";
const PIX_MERCHANT_NAME = "RCC Barreiras";
const PIX_MERCHANT_CITY = "Barreiras";

const nomesMeses = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

// ── PIX EMV payload (padrão BC do Brasil) ────────────────────────────────────

function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return ((crc & 0xffff).toString(16).toUpperCase().padStart(4, "0"));
}

function emvField(id: string, value: string): string {
  return `${id}${value.length.toString().padStart(2, "0")}${value}`;
}

function buildPixPayload(valor: number, txid: string): string {
  const key = emvField("01", PIX_KEY);
  const gui = emvField("00", "BR.GOV.BCB.PIX");
  const merchantAccount = emvField("26", gui + key);

  const additionalData = emvField("62", emvField("05", txid.slice(0, 25)));

  const payload =
    emvField("00", "01") +
    merchantAccount +
    emvField("52", "0000") +
    emvField("53", "986") +
    emvField("54", valor.toFixed(2)) +
    emvField("58", "BR") +
    emvField("59", PIX_MERCHANT_NAME.slice(0, 25)) +
    emvField("60", PIX_MERCHANT_CITY.slice(0, 15)) +
    additionalData +
    "6304";

  return payload + crc16(payload);
}

// ── Route ─────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/grupos/$id/pagamentos")({
  loader: async ({ params }) => {
    const grupo = await getGrupoById(params.id);
    if (!grupo) throw notFound();
    const mensalidades = await getMensalidadesByGrupo(grupo.id);
    return { grupo, mensalidades };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `Pagamentos — ${loaderData?.grupo.nome ?? "Grupo"}` }],
  }),
  component: PagamentosPage,
});

// ── Modals ────────────────────────────────────────────────────────────────────

function PixModal({
  mensalidade,
  grupoNome,
  open,
  onOpenChange,
}: {
  mensalidade: Mensalidade;
  grupoNome: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [copied, setCopied] = useState(false);
  const txid = `MSG${mensalidade.id.replace(/\D/g, "").slice(0, 20)}`;
  const pixString = buildPixPayload(mensalidade.valor, txid);
  const refLabel = `${nomesMeses[mensalidade.mes - 1]}/${mensalidade.ano}`;

  function handleCopy() {
    navigator.clipboard.writeText(pixString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Pagar via PIX
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted/40 p-3 text-center text-sm">
            <p className="text-muted-foreground">Referência</p>
            <p className="font-semibold">{grupoNome} — {refLabel}</p>
            <p className="mt-1 text-lg font-bold text-primary">
              R$ {mensalidade.valor.toFixed(2).replace(".", ",")}
            </p>
          </div>

          <div className="flex justify-center">
            <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <QRCodeSVG value={pixString} size={200} level="M" />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              PIX Copia e Cola
            </p>
            <div className="flex gap-2">
              <div className="min-w-0 flex-1 rounded-md border border-input bg-muted/40 px-3 py-2 text-xs font-mono break-all">
                {pixString.slice(0, 60)}…
              </div>
              <Button size="sm" variant="outline" className="shrink-0" onClick={handleCopy}>
                {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Abra seu app de pagamentos e escaneie o QR code, ou cole o código acima.
            </p>
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

// ── Page ──────────────────────────────────────────────────────────────────────

type ModalState =
  | { type: "pix"; mensalidade: Mensalidade }
  | null;

function PagamentosPage() {
  const { grupo, mensalidades } = Route.useLoaderData();
  const { user } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === "admin";
  const [ano, setAno] = useState(new Date().getFullYear());
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [editMens, setEditMens] = useState<Mensalidade | null>(null);
  const [deleteMens, setDeleteMens] = useState<Mensalidade | null>(null);

  if (!canAccessFinanceiro(user, grupo)) {
    return (
      <AppShell>
        <AccessDenied
          title="Sem acesso ao financeiro"
          message="Apenas o coordenador, tesoureiro e administradores podem visualizar os pagamentos deste grupo."
          backTo={`/grupos/${grupo.id}`}
        />
      </AppShell>
    );
  }

  const anos = [...new Set(mensalidades.map((m) => m.ano))].sort((a, b) => b - a);
  if (!anos.includes(ano) && anos.length > 0) {
    // default to first available year
  }

  const filtradas = mensalidades.filter((m) => m.ano === ano);

  // Resumo financeiro
  const totalMes = filtradas.length;
  const pagas = filtradas.filter((m) => m.status === "pago").length;
  const pendentes = filtradas.filter((m) => m.status === "pendente" || m.status === "atrasado").length;
  const totalValor = filtradas.reduce((acc, m) => acc + m.valor, 0);
  const pago = filtradas
    .filter((m) => m.status === "pago")
    .reduce((acc, m) => acc + m.valor, 0);

  async function handleValidar(m: Mensalidade) {
    setLoadingId(m.id);
    try {
      await updateMensalidadeStatus(m.id, "pago", {
        dataPagamento: new Date().toISOString().slice(0, 10),
      });
      await createRecibo({
        grupoId: grupo.id,
        valor: m.valor,
        descricao: `Contribuição Mensal dos Grupos de Oração — ${nomesMeses[m.mes - 1]}/${m.ano}`,
      });
      toast.success(`Pagamento de ${nomesMeses[m.mes - 1]}/${m.ano} confirmado. Recibo gerado.`);
      await router.invalidate();
    } catch {
      toast.error("Erro ao confirmar pagamento.");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteMens) return;
    const m = deleteMens;
    setLoadingId(m.id);
    try {
      await deleteMensalidade(m.id);
      toast.success(`Lançamento de ${nomesMeses[m.mes - 1]}/${m.ano} excluído.`);
      setDeleteMens(null);
      await router.invalidate();
    } catch {
      toast.error("Erro ao excluir lançamento.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Gerenciamento de Pagamentos"
        description={`Mensalidades — ${grupo.nome}`}
        backTo={`/grupos/${grupo.id}`}
        actions={
          <Link to="/grupos/$id/farol" params={{ id: grupo.id }}>
            <Button variant="outline" size="sm">
              <Activity className="mr-2 h-4 w-4" />
              Ver Farol
            </Button>
          </Link>
        }
      />

      {/* Cards de resumo */}
      <div className="mb-6 grid gap-4 grid-cols-2 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total / Ano</p>
          <p className="mt-1 text-2xl font-bold">R$ {totalValor.toFixed(2).replace(".", ",")}</p>
          <p className="text-xs text-muted-foreground">{totalMes} mensalidades</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Pagas</p>
          <p className="mt-1 text-2xl font-bold text-success">R$ {pago.toFixed(2).replace(".", ",")}</p>
          <p className="text-xs text-muted-foreground">{pagas} meses</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Em Aberto</p>
          <p className="mt-1 text-2xl font-bold text-destructive">
            R$ {(totalValor - pago).toFixed(2).replace(".", ",")}
          </p>
          <p className="text-xs text-muted-foreground">{pendentes} meses</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Mensalidade</p>
          <p className="mt-1 text-2xl font-bold">R$ 30,00</p>
          <p className="text-xs text-muted-foreground">valor fixo mensal</p>
        </div>
      </div>

      {/* Filtro de ano */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={ano}
          onChange={(e) => setAno(Number(e.target.value))}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {anos.length > 0 ? (
            anos.map((a) => <option key={a} value={a}>{a}</option>)
          ) : (
            <option value={ano}>{ano}</option>
          )}
        </select>
        <p className="text-sm text-muted-foreground">
          Exibindo mensalidades de {ano}
        </p>
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
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
            {filtradas.map((m) => {
              const isPendente = m.status === "pendente" || m.status === "atrasado";
              return (
                <tr key={m.id} className="text-sm">
                  <td className="px-5 py-3 font-medium">
                    {nomesMeses[m.mes - 1]}/{m.ano}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {new Date(m.vencimento).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-5 py-3 font-medium">
                    R$ {m.valor.toFixed(2).replace(".", ",")}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {m.dataPagamento
                      ? new Date(m.dataPagamento).toLocaleDateString("pt-BR")
                      : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      {/* Pendente / Atrasado: opções de pagamento + upload comprovante */}
                      {isPendente && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5"
                            onClick={() => setModal({ type: "pix", mensalidade: m })}
                          >
                            <QrCode className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">PIX</span>
                          </Button>
                          {isAdmin && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1.5 border-success text-success hover:bg-success/10"
                              disabled={loadingId === m.id}
                              title="Confirmar pagamento manualmente"
                              onClick={() => handleValidar(m)}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">
                                {loadingId === m.id ? "Confirmando…" : "Confirmar"}
                              </span>
                            </Button>
                          )}
                        </>
                      )}

                      {/* Em validação: ver comprovante + confirmar (admin only) */}
                      {m.status === "validacao" && (
                        <>
                          {m.comprovanteUrl && (
                            <a href={m.comprovanteUrl} target="_blank" rel="noreferrer">
                              <Button size="sm" variant="ghost" className="h-8">
                                <Eye className="mr-1 h-3.5 w-3.5" />
                                Ver
                              </Button>
                            </a>
                          )}
                          {isAdmin && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 border-success text-success hover:bg-success/10"
                              disabled={loadingId === m.id}
                              onClick={() => handleValidar(m)}
                            >
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                              {loadingId === m.id ? "Confirmando…" : "Confirmar"}
                            </Button>
                          )}
                        </>
                      )}

                      {/* Pago: ver comprovante */}
                      {m.status === "pago" && m.comprovanteUrl && (
                        <a href={m.comprovanteUrl} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="ghost" className="h-8">
                            <Eye className="mr-1 h-3.5 w-3.5" />
                            Comprovante
                          </Button>
                        </a>
                      )}

                      {/* Editar / Excluir */}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2"
                        title="Editar lançamento"
                        onClick={() => setEditMens(m)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        title="Excluir lançamento"
                        disabled={loadingId === m.id}
                        onClick={() => setDeleteMens(m)}
                      >
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
        {filtradas.length === 0 && (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Nenhuma mensalidade encontrada para {ano}.
          </div>
        )}
      </div>

      {/* Modais */}
      {modal?.type === "pix" && (
        <PixModal
          mensalidade={modal.mensalidade}
          grupoNome={grupo.nome}
          open={true}
          onOpenChange={(v) => { if (!v) setModal(null); }}
        />
      )}
      <EditMensalidadeDialog
        mensalidade={editMens}
        open={editMens !== null}
        onOpenChange={(v) => { if (!v) setEditMens(null); }}
        onSuccess={() => router.invalidate()}
      />
      <AlertDialog open={deleteMens !== null} onOpenChange={(v) => { if (!v) setDeleteMens(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lançamento?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteMens && (
                <>
                  Esta ação removerá permanentemente o lançamento de{" "}
                  <strong>{nomesMeses[deleteMens.mes - 1]}/{deleteMens.ano}</strong>{" "}
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
    </AppShell>
  );
}

