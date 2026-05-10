import { useState, useMemo } from "react";
import { Plus, Layers } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createMensalidadesLote } from "@/lib/services";
import { TIPOS_COBRANCA, type TipoCobranca, type Grupo } from "@/lib/types";

const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

function ultimoDiaMes(mes: number, ano: number) {
  return new Date(ano, mes, 0).toISOString().slice(0, 10);
}

interface Props {
  grupos: Grupo[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
}

export function LancarCobrancasDialog({ grupos, open, onOpenChange, onSuccess }: Props) {
  const aprovados = useMemo(() => grupos.filter((g) => g.status === "aprovado"), [grupos]);
  const anoAtual = new Date().getFullYear();
  const mesAtual = new Date().getMonth() + 1;

  const [tipo, setTipo] = useState<TipoCobranca>("mensalidade");
  const [descricao, setDescricao] = useState("");
  const [meses, setMeses] = useState<Set<number>>(new Set([mesAtual]));
  const [ano, setAno] = useState(anoAtual);
  const [valor, setValor] = useState("30,00");
  const [gruposSelecionados, setGruposSelecionados] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const todosMesesSelecionados = meses.size === 12;
  const todosSelecionados = gruposSelecionados.size === aprovados.length && aprovados.length > 0;
  const totalItens = gruposSelecionados.size * meses.size;

  function toggleMes(m: number) {
    setMeses((prev) => {
      const next = new Set(prev);
      next.has(m) ? next.delete(m) : next.add(m);
      return next;
    });
  }

  function toggleTodosMeses() {
    if (todosMesesSelecionados) {
      setMeses(new Set([mesAtual]));
    } else {
      setMeses(new Set(Array.from({ length: 12 }, (_, i) => i + 1)));
    }
  }

  function toggleGrupo(id: string) {
    setGruposSelecionados((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleTodos() {
    if (todosSelecionados) {
      setGruposSelecionados(new Set());
    } else {
      setGruposSelecionados(new Set(aprovados.map((g) => g.id)));
    }
  }

  function parseValor(raw: string) {
    return parseFloat(raw.replace(",", ".")) || 0;
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (meses.size === 0) {
      toast.error("Selecione pelo menos um mês.");
      return;
    }
    if (gruposSelecionados.size === 0) {
      toast.error("Selecione pelo menos um grupo.");
      return;
    }
    const valorNum = parseValor(valor);
    if (valorNum <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }
    if (tipo !== "mensalidade" && !descricao.trim()) {
      toast.error("Informe a descrição da cobrança.");
      return;
    }

    setSubmitting(true);
    try {
      const items = [...gruposSelecionados].flatMap((grupoId) =>
        [...meses].map((m) => ({
          grupoId,
          tipo,
          descricao: tipo !== "mensalidade" ? descricao.trim() : undefined,
          mes: m,
          ano,
          valor: valorNum,
          vencimento: ultimoDiaMes(m, ano),
        }))
      );
      await createMensalidadesLote(items);
      const tipoLabel = TIPOS_COBRANCA.find((t) => t.value === tipo)?.label ?? tipo;
      toast.success(
        `${tipoLabel} lançada: ${totalItens} cobrança${totalItens > 1 ? "s" : ""} (${gruposSelecionados.size} grupo${gruposSelecionados.size > 1 ? "s" : ""} × ${meses.size} mês${meses.size > 1 ? "es" : ""}).`
      );
      onSuccess();
      onOpenChange(false);
      setGruposSelecionados(new Set());
      setDescricao("");
      setMeses(new Set([mesAtual]));
    } catch (err) {
      toast.error("Erro ao lançar cobranças. Verifique o console.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Lançar Cobranças em Lote
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tipo */}
          <div className="space-y-1.5">
            <Label>Tipo de Cobrança</Label>
            <div className="flex flex-wrap gap-2">
              {TIPOS_COBRANCA.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTipo(t.value)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    tipo === t.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Descrição (não-mensalidade) */}
          {tipo !== "mensalidade" && (
            <div className="space-y-1.5">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                placeholder={
                  tipo === "taxa_evento" ? "Ex: Congresso Diocesano 2026" :
                  tipo === "contribuicao_especial" ? "Ex: Contribuição Retiro Anual" :
                  tipo === "taxa_formacao" ? "Ex: Seminário Vida no Espírito" :
                  "Descreva a cobrança"
                }
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
              />
            </div>
          )}

          {/* Meses de Referência */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Mês de Referência</Label>
              <button
                type="button"
                onClick={toggleTodosMeses}
                className="text-xs text-primary hover:underline"
              >
                {todosMesesSelecionados ? "Desmarcar todos" : "Selecionar todos"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {MESES.map((nome, i) => {
                const m = i + 1;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMes(m)}
                    className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                      meses.has(m)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {nome.slice(0, 3)}
                  </button>
                );
              })}
            </div>
            {meses.size > 0 && (
              <p className="text-xs text-muted-foreground">
                {meses.size} mês{meses.size > 1 ? "es" : ""} selecionado{meses.size > 1 ? "s" : ""} — vencimento calculado como último dia de cada mês.
              </p>
            )}
          </div>

          {/* Ano / Valor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ano">Ano</Label>
              <Input
                id="ano"
                type="number"
                value={ano}
                onChange={(e) => setAno(Number(e.target.value))}
                min={2020}
                max={2099}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="30,00"
              />
            </div>
          </div>

          {/* Seleção de grupos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Grupos de Oração</Label>
              <button
                type="button"
                onClick={toggleTodos}
                className="text-xs text-primary hover:underline"
              >
                {todosSelecionados ? "Desmarcar todos" : `Selecionar todos (${aprovados.length})`}
              </button>
            </div>

            <div className="max-h-52 overflow-y-auto rounded-md border border-input bg-muted/20 p-1">
              {aprovados.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground">Nenhum grupo aprovado.</p>
              ) : (
                aprovados.map((g) => (
                  <label
                    key={g.id}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted/50"
                  >
                    <input
                      type="checkbox"
                      checked={gruposSelecionados.has(g.id)}
                      onChange={() => toggleGrupo(g.id)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="flex-1 font-medium">{g.nome}</span>
                    <span className="text-xs text-muted-foreground">{g.paroquia}</span>
                  </label>
                ))
              )}
            </div>

            {totalItens > 0 && (
              <p className="text-xs text-muted-foreground">
                {totalItens} cobrança{totalItens > 1 ? "s" : ""} ({gruposSelecionados.size} grupo{gruposSelecionados.size > 1 ? "s" : ""} × {meses.size} mês{meses.size > 1 ? "es" : ""}) —{" "}
                Total: R$ {(parseValor(valor) * totalItens).toFixed(2).replace(".", ",")}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting || gruposSelecionados.size === 0 || meses.size === 0}>
              <Plus className="mr-1.5 h-4 w-4" />
              {submitting
                ? "Lançando..."
                : `Lançar ${totalItens} cobrança${totalItens !== 1 ? "s" : ""}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
