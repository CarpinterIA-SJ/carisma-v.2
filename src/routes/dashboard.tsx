import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { AccessDenied } from "@/components/AccessDenied";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { getDashboardPagamentos, type DashboardData, type DashboardGrupo } from "@/lib/services";
import type { Mensalidade } from "@/lib/types";

const MESES_ABREV = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

type DashboardSearch = { ano?: number };

export const Route = createFileRoute("/dashboard")({
  validateSearch: (s: Record<string, unknown>): DashboardSearch => ({
    ano: typeof s.ano === "number" ? s.ano : undefined,
  }),
  loaderDeps: ({ search: { ano } }) => ({ ano: ano ?? new Date().getFullYear() }),
  loader: async ({ deps }) => getDashboardPagamentos(deps.ano),
  head: () => ({
    meta: [{ title: "Farol Tesouraria — RCC Barreiras" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const data = Route.useLoaderData() as DashboardData;
  const { user } = useAuth();
  const navigate = Route.useNavigate();
  const [copied, setCopied] = useState(false);

  if (user?.role !== "admin") {
    return (
      <AppShell>
        <AccessDenied
          title="Acesso restrito"
          message="Apenas administradores podem visualizar o farol consolidado."
          backTo="/admin"
        />
      </AppShell>
    );
  }

  const { ano, grupos } = data;
  const anoAtual = new Date().getFullYear();
  const anosDisponiveis = [anoAtual - 2, anoAtual - 1, anoAtual, anoAtual + 1];

  function handleAnoChange(novoAno: number) {
    navigate({ search: { ano: novoAno } });
  }

  function buildWhatsAppText(): string {
    const linhas: string[] = [];
    linhas.push(`*FAROL TESOURARIA — ${ano}*`);
    linhas.push("");
    linhas.push("```");
    const head = "GRUPO".padEnd(24) + " " + MESES_ABREV.map((m) => m[0]).join(" ");
    linhas.push(head);
    grupos.forEach((g) => {
      const nome = g.grupo.nome.length > 23 ? g.grupo.nome.slice(0, 23) : g.grupo.nome;
      const cells = g.meses.map((s) => (s === "pago" ? "✓" : s === null ? "·" : "✗")).join(" ");
      linhas.push(nome.padEnd(24) + " " + cells);
    });
    linhas.push("```");
    linhas.push("");
    linhas.push(`✓ Pago  ✗ Em aberto  · Sem lançamento`);
    return linhas.join("\n");
  }

  async function handleCopyWhatsApp() {
    try {
      await navigator.clipboard.writeText(buildWhatsAppText());
      setCopied(true);
      toast.success("Texto copiado. Cole no WhatsApp.");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Falha ao copiar texto.");
    }
  }

  return (
    <AppShell>
      <div className="print:hidden">
        <PageHeader
          title="Farol Tesouraria"
          description={`Visão consolidada das mensalidades — ${ano}`}
          actions={
            <>
              <select
                value={ano}
                onChange={(e) => handleAnoChange(Number(e.target.value))}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {anosDisponiveis.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <Button size="sm" variant="outline" onClick={handleCopyWhatsApp} className="gap-1.5">
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                <span className="hidden sm:inline">{copied ? "Copiado" : "Copiar WhatsApp"}</span>
              </Button>
            </>
          }
        />
      </div>

      <FarolMatrix ano={ano} grupos={grupos} />
    </AppShell>
  );
}

// ── Matriz Farol ──────────────────────────────────────────────────────────────

function FarolMatrix({ ano, grupos }: { ano: number; grupos: DashboardGrupo[] }) {
  return (
    <div className="mx-auto max-w-3xl rounded-lg border border-border bg-white p-3 shadow-sm">
      {/* Título estilo planilha */}
      <h2 className="mb-2 text-center text-lg sm:text-xl font-extrabold tracking-tight underline underline-offset-4 decoration-2">
        FAROL TESOURARIA — {ano}
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[11px] leading-tight">
          <thead>
            <tr className="bg-success/15">
              <th className="border border-border px-1 py-1 text-center w-6 text-[10px] font-bold">#</th>
              <th className="border border-border px-2 py-1 text-left text-[11px] font-bold uppercase tracking-wide">
                Grupo
              </th>
              {MESES_ABREV.map((m) => (
                <th key={m} className="border border-border px-0.5 py-1 text-center text-[10px] font-bold w-7">
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grupos.map((g, idx) => (
              <tr key={g.grupo.id} className="hover:bg-muted/30">
                <td className="border border-border px-1 py-0.5 text-center text-[10px] text-muted-foreground tabular-nums">
                  {idx + 1}
                </td>
                <td className="border border-border px-2 py-0.5 font-medium uppercase whitespace-nowrap text-[11px]">
                  {g.grupo.nome}
                </td>
                {g.meses.map((status, i) => (
                  <td key={i} className="border border-border p-0 text-center align-middle">
                    <div className="flex items-center justify-center h-5">
                      <FarolCell status={status} />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
            {grupos.length === 0 && (
              <tr>
                <td colSpan={14} className="border border-border px-3 py-8 text-center text-xs text-muted-foreground">
                  Nenhum grupo aprovado encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Legenda */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-[11px]">
        <Legend kind="pago" label="Pago" />
        <Legend kind="aberto" label="Em aberto" />
        <Legend kind="vazio" label="Sem lançamento" />
      </div>
    </div>
  );
}

function FarolCell({ status }: { status: Mensalidade["status"] | null }) {
  if (status === "pago") {
    return (
      <span
        className="inline-flex items-center justify-center w-4 h-4 rounded-[2px] border border-success text-success bg-success/10"
        aria-label="Pago"
        title="Pago"
      >
        <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="5 12 10 17 19 7" />
        </svg>
      </span>
    );
  }
  if (status === null) {
    return <span className="inline-block text-[10px] text-muted-foreground/50">—</span>;
  }
  return (
    <span
      className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-destructive text-white"
      aria-label="Em aberto"
      title={status === "validacao" ? "Em validação" : status === "atrasado" ? "Atrasado" : "Pendente"}
    >
      <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
        <line x1="6" y1="12" x2="18" y2="12" />
      </svg>
    </span>
  );
}

function Legend({ kind, label }: { kind: "pago" | "aberto" | "vazio"; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {kind === "pago" && <FarolCell status="pago" />}
      {kind === "aberto" && <FarolCell status="pendente" />}
      {kind === "vazio" && <FarolCell status={null} />}
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
