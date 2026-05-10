import { useForm, type Resolver } from "react-hook-form";
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
import { createGrupo, updateGrupo } from "@/lib/services";
import type { Grupo } from "@/lib/types";

const adminSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  descricao: z.string().optional(),
  diaSemana: z.string().optional(),
  horario: z.string().optional(),
  fundadoEm: z.string().optional(),
  paroquia: z.string().optional(),
  rua: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
});

const regularSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  descricao: z.string().min(5, "Descrição obrigatória"),
  diaSemana: z.string().min(1, "Dia da semana obrigatório"),
  horario: z.string().min(1, "Horário obrigatório"),
  fundadoEm: z.string().min(1, "Data de fundação obrigatória"),
  paroquia: z.string().min(2, "Paróquia obrigatória"),
  rua: z.string().min(2, "Rua obrigatória"),
  numero: z.string().min(1, "Número obrigatório"),
  bairro: z.string().min(2, "Bairro obrigatório"),
  cidade: z.string().min(2, "Cidade obrigatória"),
  estado: z.string().length(2, "UF com 2 letras"),
  cep: z.string().min(8, "CEP obrigatório"),
});

const limitedSchema = z.object({
  diaSemana: z.string().min(1, "Dia da semana obrigatório"),
  fundadoEm: z.string().min(1, "Data de fundação obrigatória"),
  paroquia: z.string().min(2, "Paróquia obrigatória"),
});

type FullValues = z.infer<typeof adminSchema>;
type LimitedValues = z.infer<typeof limitedSchema>;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  grupo?: Grupo;
  isAdmin?: boolean;
  limitedEdit?: boolean;
}

const DIAS = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];

export function GrupoFormDialog({ open, onOpenChange, grupo, isAdmin = false, limitedEdit = false }: Props) {
  const router = useRouter();
  const isEdit = !!grupo;

  const fullForm = useForm<FullValues>({
    resolver: zodResolver(isAdmin ? adminSchema : regularSchema) as Resolver<FullValues>,
    defaultValues: {
      nome: grupo?.nome ?? "",
      descricao: grupo?.descricao ?? "",
      diaSemana: grupo?.diaSemana ?? "",
      horario: grupo?.horario ?? "",
      fundadoEm: grupo?.fundadoEm ?? "",
      paroquia: grupo?.paroquia ?? "",
      rua: grupo?.endereco?.rua ?? "",
      numero: grupo?.endereco?.numero ?? "",
      bairro: grupo?.endereco?.bairro ?? "",
      cidade: grupo?.endereco?.cidade ?? "Barreiras",
      estado: grupo?.endereco?.estado ?? "BA",
      cep: grupo?.endereco?.cep ?? "",
    },
  });

  const limitedForm = useForm<LimitedValues>({
    resolver: zodResolver(limitedSchema),
    defaultValues: {
      diaSemana: grupo?.diaSemana ?? "",
      fundadoEm: grupo?.fundadoEm ?? "",
      paroquia: grupo?.paroquia ?? "",
    },
  });

  async function onSubmitFull(values: FullValues) {
    const blank = (s: string | undefined) => (s && s.trim().length > 0 ? s : undefined);
    const enderecoTemDado =
      blank(values.rua) || blank(values.numero) || blank(values.bairro) ||
      blank(values.cidade) || blank(values.estado) || blank(values.cep);

    const input = {
      nome: values.nome,
      descricao: blank(values.descricao) ?? "",
      diaSemana: blank(values.diaSemana) ?? "",
      horario: blank(values.horario) ?? "",
      fundadoEm: blank(values.fundadoEm),
      paroquia: blank(values.paroquia) ?? "",
      endereco: enderecoTemDado
        ? {
            rua: values.rua ?? "",
            numero: values.numero ?? "",
            bairro: values.bairro ?? "",
            cidade: values.cidade ?? "",
            estado: values.estado ?? "",
            cep: values.cep ?? "",
          }
        : { rua: "", numero: "", bairro: "", cidade: "", estado: "", cep: "" },
    };

    try {
      if (isEdit) {
        await updateGrupo(grupo.id, input);
        toast.success("Grupo atualizado com sucesso.");
      } else {
        await createGrupo(input);
        toast.success("Grupo cadastrado com sucesso.");
      }
      onOpenChange(false);
      await router.invalidate();
    } catch {
      toast.error("Erro ao salvar grupo. Verifique os dados e tente novamente.");
    }
  }

  async function onSubmitLimited(values: LimitedValues) {
    try {
      await updateGrupo(grupo!.id, {
        diaSemana: values.diaSemana,
        fundadoEm: values.fundadoEm,
        paroquia: values.paroquia,
      });
      toast.success("Informações do grupo atualizadas.");
      onOpenChange(false);
      await router.invalidate();
    } catch {
      toast.error("Erro ao salvar. Tente novamente.");
    }
  }

  if (limitedEdit && isEdit) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Informações do Grupo</DialogTitle>
          </DialogHeader>
          <Form {...limitedForm}>
            <form onSubmit={limitedForm.handleSubmit(onSubmitLimited)} className="space-y-4">
              <FormField
                control={limitedForm.control}
                name="diaSemana"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia da Semana</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">Selecione...</option>
                        {DIAS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={limitedForm.control}
                name="fundadoEm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fundado em</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={limitedForm.control}
                name="paroquia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paróquia</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Catedral São João Batista" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={limitedForm.formState.isSubmitting}>
                  {limitedForm.formState.isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Grupo" : "Novo Grupo de Oração"}</DialogTitle>
        </DialogHeader>

        <Form {...fullForm}>
          <form onSubmit={fullForm.handleSubmit(onSubmitFull)} className="space-y-4">
            <FormField
              control={fullForm.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Grupo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Cenáculo Pentecostes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={fullForm.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Descrição{isAdmin && <span className="ml-1 text-xs text-muted-foreground">(opcional)</span>}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Breve descrição do grupo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={fullForm.control}
              name="paroquia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Paróquia{isAdmin && <span className="ml-1 text-xs text-muted-foreground">(opcional)</span>}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Catedral São João Batista" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={fullForm.control}
                name="diaSemana"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Dia da Semana{isAdmin && <span className="ml-1 text-xs text-muted-foreground">(opcional)</span>}
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">Selecione...</option>
                        {DIAS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={fullForm.control}
                name="horario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Horário{isAdmin && <span className="ml-1 text-xs text-muted-foreground">(opcional)</span>}
                    </FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={fullForm.control}
              name="fundadoEm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Fundado em{isAdmin && <span className="ml-1 text-xs text-muted-foreground">(opcional)</span>}
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">
              Endereço{isAdmin && <span className="ml-1 normal-case font-normal text-muted-foreground">(opcional)</span>}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={fullForm.control}
                name="rua"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Rua</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua / Avenida" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={fullForm.control}
                name="numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input placeholder="Nº" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={fullForm.control}
                name="bairro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input placeholder="Bairro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={fullForm.control}
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input placeholder="00000-000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={fullForm.control}
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

              <FormField
                control={fullForm.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UF</FormLabel>
                    <FormControl>
                      <Input placeholder="BA" maxLength={2} {...field} />
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
              <Button type="submit" disabled={fullForm.formState.isSubmitting}>
                {fullForm.formState.isSubmitting ? "Salvando..." : isEdit ? "Salvar Alterações" : "Cadastrar Grupo"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
