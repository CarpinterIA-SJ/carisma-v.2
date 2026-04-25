import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  pago: "bg-success/10 text-success border-success/20",
  pendente: "bg-warning/10 text-warning-foreground border-warning/30",
  atrasado: "bg-destructive/10 text-destructive border-destructive/20",
  validacao: "bg-primary/10 text-primary border-primary/20",
  aprovado: "bg-success/10 text-success border-success/20",
  rejeitado: "bg-destructive/10 text-destructive border-destructive/20",
  agendado: "bg-primary/10 text-primary border-primary/20",
  em_andamento: "bg-warning/10 text-warning-foreground border-warning/30",
  concluido: "bg-muted text-muted-foreground border-border",
  cancelado: "bg-destructive/10 text-destructive border-destructive/20",
};

const labels: Record<string, string> = {
  pago: "Pago",
  pendente: "Pendente",
  atrasado: "Em Atraso",
  validacao: "Em Validação",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  agendado: "Agendado",
  em_andamento: "Em Andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[status] ?? "bg-muted text-muted-foreground border-border",
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}
