import { createFileRoute } from "@tanstack/react-router";
import { Search, Eye, Download } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { recibos, grupos } from "@/lib/mock-data";

export const Route = createFileRoute("/recibos")({
  head: () => ({
    meta: [
      { title: "Recibos — RCC Barreiras" },
      { name: "description", content: "Emissão e consulta de recibos de pagamento." },
    ],
  }),
  component: RecibosPage,
});

function RecibosPage() {
  const [busca, setBusca] = useState("");
  const [grupoId, setGrupoId] = useState("todos");

  const filtrados = recibos.filter((r) => {
    const matchBusca =
      r.codigo.toLowerCase().includes(busca.toLowerCase()) ||
      r.descricao.toLowerCase().includes(busca.toLowerCase());
    const matchGrupo = grupoId === "todos" || r.grupoId === grupoId;
    return matchBusca && matchGrupo;
  });

  const grupoNome = (id: string) => grupos.find((g) => g.id === id)?.nome ?? "—";

  return (
    <AppShell>
      <PageHeader
        title="Emissão de Recibos"
        description="Recibos de pagamentos realizados pelos grupos."
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por código ou descrição..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={grupoId}
          onChange={(e) => setGrupoId(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="todos">Todos os grupos</option>
          {grupos.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nome}
            </option>
          ))}
        </select>
        <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option>Todos os períodos</option>
          <option>Últimos 30 dias</option>
          <option>2025</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full">
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
            {filtrados.map((r) => (
              <tr key={r.id} className="text-sm">
                <td className="px-5 py-3 font-mono text-xs font-medium">{r.codigo}</td>
                <td className="px-5 py-3">{grupoNome(r.grupoId)}</td>
                <td className="px-5 py-3 text-muted-foreground">{r.descricao}</td>
                <td className="px-5 py-3 font-medium">
                  R$ {r.valor.toFixed(2).replace(".", ",")}
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {new Date(r.emitidoEm).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-8">
                      <Eye className="mr-1 h-3.5 w-3.5" />
                      Ver
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8">
                      <Download className="mr-1 h-3.5 w-3.5" />
                      PDF
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtrados.length === 0 && (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Nenhum recibo encontrado.
          </div>
        )}
      </div>
    </AppShell>
  );
}
