import { createFileRoute } from "@tanstack/react-router";
import { Search, Download, Printer, Eye } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getRecibos, getGrupos } from "@/lib/services";
import { useAuth } from "@/lib/auth";
import { imprimirRecibo, visualizarRecibo, referenciaKey, referenciaLabel } from "@/lib/recibo";
import type { Recibo, Grupo } from "@/lib/types";

export const Route = createFileRoute("/recibos")({
  loader: async () => {
    const [recibos, grupos] = await Promise.all([getRecibos(), getGrupos()]);
    return { recibos, grupos };
  },
  head: () => ({
    meta: [
      { title: "Recibos — RCC Barreiras" },
      { name: "description", content: "Emissão e download de recibos de contribuição mensal." },
    ],
  }),
  component: RecibosPage,
});


function RecibosPage() {
  const { recibos, grupos } = Route.useLoaderData();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const podeVerRecibos =
    isAdmin || user?.role === "coordenador" || user?.role === "tesoureiro";

  // Filtra recibos visíveis conforme role
  const recibosVisiveis = isAdmin
    ? recibos
    : recibos.filter((r) => {
        const grupo = grupos.find((g) => g.id === r.grupoId);
        return (
          r.grupoId === user?.grupoId ||
          grupo?.coordenadorId === user?.id ||
          grupo?.tesoureiroId === user?.id
        );
      });

  // Períodos únicos derivados dos recibos visíveis
  const periodosUnicos: [string, string][] = Array.from(
    new Map<string, string>(
      recibosVisiveis
        .map((r): [string, string] => [referenciaKey(r), referenciaLabel(r)])
        .sort((a, b) => b[0].localeCompare(a[0])),
    ).entries(),
  );

  const [busca, setBusca] = useState("");
  const [filtroGrupo, setFiltroGrupo] = useState("todos");
  const [filtroPeriodo, setFiltroPeriodo] = useState("todos");

  const filtrados = recibosVisiveis.filter((r) => {
    const matchBusca =
      r.codigo.toLowerCase().includes(busca.toLowerCase()) ||
      r.descricao.toLowerCase().includes(busca.toLowerCase());
    const matchGrupo = filtroGrupo === "todos" || r.grupoId === filtroGrupo;
    const matchPeriodo =
      filtroPeriodo === "todos" || referenciaKey(r) === filtroPeriodo;
    return matchBusca && matchGrupo && matchPeriodo;
  });

  const grupoNome = (id: string) => grupos.find((g) => g.id === id)?.nome ?? "—";

  if (!podeVerRecibos) {
    return (
      <AppShell>
        <PageHeader
          title="Recibos"
          description="Acesso restrito a coordenadores, tesoureiros e administradores."
        />
        <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Recibos de Contribuição"
        description="Baixe e imprima os recibos mensais do seu grupo de oração."
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

        {isAdmin && (
          <select
            value={filtroGrupo}
            onChange={(e) => setFiltroGrupo(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="todos">Todos os grupos</option>
            {grupos.map((g: Grupo) => (
              <option key={g.id} value={g.id}>
                {g.nome}
              </option>
            ))}
          </select>
        )}

        <select
          value={filtroPeriodo}
          onChange={(e) => setFiltroPeriodo(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="todos">Todos os períodos</option>
          {periodosUnicos.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-muted/40">
            <tr className="text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3">Código</th>
              {isAdmin && <th className="px-5 py-3">Grupo</th>}
              <th className="px-5 py-3">Referência</th>
              <th className="px-5 py-3">Descrição</th>
              <th className="px-5 py-3">Valor</th>
              <th className="px-5 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtrados.map((r) => (
              <tr key={r.id} className="text-sm hover:bg-muted/20">
                <td className="px-5 py-3 font-mono text-xs font-medium">{r.codigo}</td>
                {isAdmin && <td className="px-5 py-3">{grupoNome(r.grupoId)}</td>}
                <td className="px-5 py-3 font-medium">{referenciaLabel(r)}</td>
                <td className="px-5 py-3 text-muted-foreground">{r.descricao}</td>
                <td className="px-5 py-3 font-medium">
                  R$ {r.valor.toFixed(2).replace(".", ",")}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={() => visualizarRecibo(r, grupoNome(r.grupoId))}
                      title="Visualizar recibo"
                    >
                      <Eye className="mr-1 h-3.5 w-3.5" />
                      Visualizar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={() => imprimirRecibo(r, grupoNome(r.grupoId))}
                      title="Abrir diálogo de impressão"
                    >
                      <Printer className="mr-1 h-3.5 w-3.5" />
                      Imprimir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => imprimirRecibo(r, grupoNome(r.grupoId))}
                      title="Salvar como PDF (use Salvar como PDF no diálogo de impressão)"
                    >
                      <Download className="mr-1 h-3.5 w-3.5" />
                      PDF
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
            Nenhum recibo encontrado para o período selecionado.
          </div>
        )}
      </div>

      {filtrados.length > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          {filtrados.length} recibo{filtrados.length !== 1 ? "s" : ""} encontrado
          {filtrados.length !== 1 ? "s" : ""}. Para salvar em PDF, clique em{" "}
          <strong>PDF</strong> e escolha <em>"Salvar como PDF"</em> no diálogo de impressão.
        </p>
      )}
    </AppShell>
  );
}
