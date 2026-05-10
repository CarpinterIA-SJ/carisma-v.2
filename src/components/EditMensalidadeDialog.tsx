import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
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
import { updateMensalidade } from "@/lib/services";
import { TIPOS_COBRANCA, type Mensalidade, type TipoCobranca } from "@/lib/types";

const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

interface Props {
  mensalidade: Mensalidade | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
}

function parseValor(raw: string) {
  return parseFloat(raw.replace(",", ".")) || 0;
}

function formatValor(n: number) {
  return n.toFixed(2).replace(".", ",");
}

export function EditMensalidadeDialog({ mensalidade, open, onOpenChange, onSuccess }: Props) {
  const [tipo, setTipo] = useState<TipoCobranca>("mensalidade");
  const [descricao, setDescricao] = useState("");
  const [mes, setMes] = useState(1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [valor, setValor] = useState("0,00");
  const [vencimento, setVencimento] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!mensalidade) return;
    setTipo(mensalidade.tipo ?? "mensalidade");
    setDescricao(mensalidade.descricao ?? "");
    setMes(mensalidade.mes);
    setAno(mensalidade.ano);
    setValor(formatValor(mensalidade.valor));
    setVencimento(mensalidade.vencimento);
  }, [mensalidade]);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!mensalidade) return;
    const valorNum = parseValor(valor);
    if (valorNum <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }
    if (tipo !== "mensalidade" && !descricao.trim()) {
      toast.error("Informe a descrição.");
      return;
    }
    if (!vencimento) {
      toast.error("Informe o vencimento.");
      return;
    }

    setSubmitting(true);
    try {
      await updateMensalidade(mensalidade.id, {
        tipo,
        descricao: tipo !== "mensalidade" ? descricao.trim() : null,
        mes,
        ano,
        valor: valorNum,
        vencimento,
      });
      toast.success("Lançamento atualizado.");
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar lançamento.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Editar Lançamento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          {tipo !== "mensalidade" && (
            <div className="space-y-1.5">
              <Label htmlFor="edit-descricao">Descrição</Label>
              <Input
                id="edit-descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-mes">Mês</Label>
              <select
                id="edit-mes"
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {MESES.map((nome, i) => (
                  <option key={i + 1} value={i + 1}>{nome}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-ano">Ano</Label>
              <Input
                id="edit-ano"
                type="number"
                value={ano}
                onChange={(e) => setAno(Number(e.target.value))}
                min={2020}
                max={2099}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-valor">Valor (R$)</Label>
              <Input
                id="edit-valor"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-vencimento">Vencimento</Label>
              <Input
                id="edit-vencimento"
                type="date"
                value={vencimento}
                onChange={(e) => setVencimento(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
