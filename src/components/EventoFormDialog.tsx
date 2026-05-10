import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createEvento, updateEvento } from "@/lib/services";
import type { Evento } from "@/lib/types";

const TIPOS = ["Assembleia", "Encontro", "Congresso", "Caravana", "Retiro", "Cenáculo"] as const;
const STATUS = ["agendado", "em_andamento", "concluido", "cancelado"] as const;
const STATUS_LABELS: Record<string, string> = {
  agendado: "Agendado",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

const schema = z.object({
  titulo: z.string().min(2, "Título obrigatório"),
  descricao: z.string().min(5, "Descrição obrigatória"),
  tipo: z.enum(TIPOS),
  status: z.enum(STATUS),
  data: z.string().min(1, "Data obrigatória"),
  horaInicio: z.string().min(1, "Hora de início obrigatória"),
  horaFim: z.string().min(1, "Hora de fim obrigatória"),
  local: z.string().min(2, "Local obrigatório"),
  cidade: z.string().min(2, "Cidade obrigatória"),
  vagas: z.coerce.number().int().min(1, "Vagas deve ser maior que zero"),
  organizador: z.string().min(2, "Organizador obrigatório"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  evento?: Evento;
}

export function EventoFormDialog({ open, onOpenChange, evento }: Props) {
  const router = useRouter();
  const isEdit = !!evento;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      titulo: evento?.titulo ?? "",
      descricao: evento?.descricao ?? "",
      tipo: evento?.tipo ?? "Encontro",
      status: evento?.status ?? "agendado",
      data: evento?.data ?? "",
      horaInicio: evento?.horaInicio ?? "",
      horaFim: evento?.horaFim ?? "",
      local: evento?.local ?? "",
      cidade: evento?.cidade ?? "Barreiras",
      vagas: evento?.vagas ?? 50,
      organizador: evento?.organizador ?? "RCC Diocesana de Barreiras",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      if (isEdit) {
        await updateEvento(evento.id, values);
        toast.success("Evento atualizado com sucesso.");
      } else {
        await createEvento(values);
        toast.success("Evento cadastrado com sucesso.");
      }
      onOpenChange(false);
      await router.invalidate();
    } catch {
      toast.error("Erro ao salvar evento. Verifique os dados e tente novamente.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Evento" : "Novo Evento"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Assembleia Diocesana 2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Descrição do evento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {TIPOS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {STATUS.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="data"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="horaInicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora Início</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="horaFim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora Fim</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="local"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Cidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vagas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vagas</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organizador"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organizador</FormLabel>
                    <FormControl>
                      <Input placeholder="Organização responsável" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Salvando..." : isEdit ? "Salvar Alterações" : "Cadastrar Evento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
