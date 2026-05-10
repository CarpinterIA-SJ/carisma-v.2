import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { ShieldCheck, FileText, Wallet, UserX, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { assignResponsaveisGrupo, getUsuarios } from "@/lib/services";
import type { Grupo, User, UserRole } from "@/lib/types";
import { ROLE_DESCRICOES } from "@/lib/permissions";
import { cn } from "@/lib/utils";

type ResponsavelKey = "coordenador" | "secretario" | "tesoureiro";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  grupo: Grupo;
}

const SLOTS: { key: ResponsavelKey; titulo: string; icon: typeof ShieldCheck; cor: string; bg: string }[] = [
  {
    key: "coordenador",
    titulo: "Coordenador",
    icon: ShieldCheck,
    cor: "text-blue-600",
    bg: "bg-blue-500/10 border-blue-500/30",
  },
  {
    key: "secretario",
    titulo: "Secretário",
    icon: FileText,
    cor: "text-emerald-700",
    bg: "bg-emerald-500/10 border-emerald-500/30",
  },
  {
    key: "tesoureiro",
    titulo: "Tesoureiro",
    icon: Wallet,
    cor: "text-amber-700",
    bg: "bg-amber-500/10 border-amber-500/30",
  },
];

function initials(nome: string): string {
  return nome
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function GrupoResponsaveisDialog({ open, onOpenChange, grupo }: Props) {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busca, setBusca] = useState("");
  const [activeSlot, setActiveSlot] = useState<ResponsavelKey>("coordenador");
  const [selecao, setSelecao] = useState<Record<ResponsavelKey, string | null>>({
    coordenador: null,
    secretario: null,
    tesoureiro: null,
  });

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setBusca("");
    setActiveSlot("coordenador");
    setSelecao({
      coordenador: grupo.coordenadorId || null,
      secretario: grupo.secretarioId || null,
      tesoureiro: grupo.tesoureiroId || null,
    });
    getUsuarios()
      .then(setUsuarios)
      .catch(() => toast.error("Erro ao carregar usuários."))
      .finally(() => setLoading(false));
  }, [open, grupo]);

  const usuariosMap = useMemo(() => Object.fromEntries(usuarios.map((u) => [u.id, u])), [usuarios]);

  const elegiveis = useMemo(() => {
    // exclui admins (não devem ser responsáveis), aplica busca
    const base = usuarios.filter((u) => u.role !== "admin");
    const q = busca.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (u) => u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [usuarios, busca]);

  // IDs já escolhidos em outros slots — para impedir duplicidade
  const ocupadosOutroSlot = useMemo(() => {
    const ocupados = new Set<string>();
    (Object.entries(selecao) as [ResponsavelKey, string | null][]).forEach(([slot, id]) => {
      if (id && slot !== activeSlot) ocupados.add(id);
    });
    return ocupados;
  }, [selecao, activeSlot]);

  function handleSelect(userId: string) {
    setSelecao((s) => ({ ...s, [activeSlot]: s[activeSlot] === userId ? null : userId }));
  }

  function handleClear(slot: ResponsavelKey) {
    setSelecao((s) => ({ ...s, [slot]: null }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await assignResponsaveisGrupo(grupo.id, {
        coordenadorId: selecao.coordenador,
        secretarioId: selecao.secretario,
        tesoureiroId: selecao.tesoureiro,
      });
      toast.success("Responsáveis atualizados com sucesso.");
      onOpenChange(false);
      await router.invalidate();
    } catch {
      toast.error("Erro ao salvar responsáveis.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-h-[90vh] p-0 sm:max-w-3xl overflow-hidden">
        <DialogHeader className="border-b border-border px-6 py-4 shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Responsáveis do Grupo
          </DialogTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            {grupo.nome} • atribua até 3 usuários para gerenciar este grupo.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
        <div className="grid gap-0 lg:grid-cols-[1fr_1fr]">
          {/* COLUNA 1 — Slots de role */}
          <div className="space-y-3 border-b border-border bg-muted/20 p-5 lg:border-b-0 lg:border-r">
            {SLOTS.map((slot) => {
              const userId = selecao[slot.key];
              const user = userId ? usuariosMap[userId] : null;
              const Icon = slot.icon;
              const ativo = activeSlot === slot.key;
              return (
                <button
                  key={slot.key}
                  type="button"
                  onClick={() => setActiveSlot(slot.key)}
                  className={cn(
                    "w-full rounded-lg border p-3 text-left transition-all",
                    ativo
                      ? `${slot.bg} ring-2 ring-primary/40`
                      : "border-border bg-card hover:border-primary/40",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("rounded-md p-2", slot.bg)}>
                      <Icon className={cn("h-4 w-4", slot.cor)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{slot.titulo}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {ROLE_DESCRICOES[slot.key as Exclude<UserRole, "admin">]}
                      </p>
                    </div>
                  </div>

                  {user ? (
                    <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-card/80 p-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                        {initials(user.nome)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">{user.nome}</p>
                        <p className="truncate text-[10px] text-muted-foreground">{user.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClear(slot.key);
                        }}
                        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        title="Remover"
                      >
                        <UserX className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <p className="mt-3 rounded-md border border-dashed border-border bg-background/40 px-3 py-2 text-xs italic text-muted-foreground">
                      Nenhum atribuído
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* COLUNA 2 — Lista de usuários */}
          <div className="flex flex-col lg:max-h-[60vh]">
            <div className="border-b border-border p-4">
              <Input
                placeholder="Buscar por nome ou e-mail..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              <p className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                Selecionando para:{" "}
                <span className="font-semibold text-foreground">
                  {SLOTS.find((s) => s.key === activeSlot)?.titulo}
                </span>
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : elegiveis.length === 0 ? (
                <p className="px-4 py-12 text-center text-sm text-muted-foreground">
                  Nenhum usuário encontrado.
                </p>
              ) : (
                <ul className="space-y-1">
                  {elegiveis.map((u) => {
                    const selecionado = selecao[activeSlot] === u.id;
                    const ocupado = ocupadosOutroSlot.has(u.id);
                    return (
                      <li key={u.id}>
                        <button
                          type="button"
                          disabled={ocupado}
                          onClick={() => handleSelect(u.id)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors",
                            selecionado
                              ? "border-primary bg-primary/5"
                              : "border-transparent hover:bg-muted/50",
                            ocupado && "cursor-not-allowed opacity-50",
                          )}
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                            {initials(u.nome)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{u.nome}</p>
                            <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                          </div>
                          {ocupado && (
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              em outro slot
                            </span>
                          )}
                          {selecionado && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
        </div>

        <DialogFooter className="border-t border-border px-6 py-3 shrink-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving || loading}>
            {saving ? "Salvando..." : "Salvar Responsáveis"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
