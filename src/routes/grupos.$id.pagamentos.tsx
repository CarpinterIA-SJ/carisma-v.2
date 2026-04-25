import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { FileText, CheckCircle2, Activity, Eye } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  getGrupoById,
  getMensalidadesByGrupo,
  nomesMeses,
} from "@/lib/mock-data";

export const Route = createFileRoute("/grupos/$id/pagamentos")({
  loader: ({ params }) => {
    const grupo = getGrupoById(params.id);
    if (!grupo) throw notFound();
    return { grupo, mensalidades: getMensalidadesByGrupo(grupo.id) };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `Pagamentos — ${loaderData?.grupo.nome ?? "Grupo"}` }],
  }),
  component: PagamentosPage,
});

function PagamentosPage() {
  const { grupo, mensalidades } = Route.useLoaderData();
  const [ano, setAno] = useState(2025);

  const filtradas = mensalidades.filter((m) => m.ano === ano);

  return (
    <AppShell>
      <PageHeader
        title="Gerenciamento de Pagamentos"
        description={`Mensalidades — ${grupo.nome}`}
        backTo={`/grupos/${grupo.id}`}
        actions={
          <>
            <Link to="/grupos/$id/farol" params={{ id: grupo.id }}>
              <Button variant="outline" size="sm">
                <Activity className="mr-2 h-4 w-4" />
                Ver Farol
              </Button>
            </Link>
            <Button size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Gerar Boleto
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={ano}
          onChange={(e) => setAno(Number(e.target.value))}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value={2025}>2025</option>
          <option value={2024}>2024</option>
        </select>
        <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option>Visão do Grupo</option>
          <option>Visão Diocesana (consolidada)</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full">
          <thead className="bg-muted/40">
            <tr className="text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3">Referência</th>
              <th className="px-5 py-3">Vencimento</th>
              <th className="px-5 py-3">Valor</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Pagamento</th>
              <th className="px-5 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtradas.map((m) => (
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
                    {m.status === "validacao" && (
                      <Button size="sm" variant="outline" className="h-8">
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                        Validar
                      </Button>
                    )}
                    {(m.status === "pendente" || m.status === "atrasado") && (
                      <Button size="sm" className="h-8">
                        <FileText className="mr-1 h-3.5 w-3.5" />
                        Gerar Boleto
                      </Button>
                    )}
                    {m.status === "pago" && (
                      <Button size="sm" variant="ghost" className="h-8">
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        Recibo
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
