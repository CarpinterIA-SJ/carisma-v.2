import { useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { createServo, updateServo } from "@/lib/services";
import { ETAPAS_FORMATIVAS, type Servo, type EtapaFormativa } from "@/lib/types";

const ETAPAS_ALL = Object.values(ETAPAS_FORMATIVAS).flat() as readonly EtapaFormativa[];

const FUNCOES = [
  "Coordenador(a)",
  "Secretário(a)",
  "Tesoureiro(a)",
  "Servo(a)",
];

const MINISTERIOS = [
  "Música e Artes",
  "Intercessão",
  "Pregação",
  "Promoção Humana",
  "Jovens",
  "Crianças e Adolescentes",
  "Família",
  "Cura e Libertação",
  "Comunicação",
  "Formação",
] as const;

const DATE_BR_REGEX = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

function isoToBr(iso: string): string {
  if (!iso) return "";
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

function brToIso(br: string): string {
  const m = br.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return br;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

function maskDateBr(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

const schema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(8, "Telefone obrigatório"),
  dataNascimento: z
    .string()
    .min(1, "Data de nascimento obrigatória")
    .regex(DATE_BR_REGEX, "Use o formato dd/mm/aaaa"),
  funcao: z.string().min(1, "Função obrigatória"),
  etapasFormativas: z
    .array(z.enum(ETAPAS_ALL as unknown as [EtapaFormativa, ...EtapaFormativa[]]))
    .min(1, "Selecione ao menos uma etapa formativa"),
  ministerios: z.array(z.string()).min(1, "Selecione ao menos um ministério"),
  ingressoEm: z.string().min(1, "Data de ingresso obrigatória"),
  rua: z.string().min(2, "Rua obrigatória"),
  numero: z.string().min(1, "Número obrigatório"),
  bairro: z.string().min(2, "Bairro obrigatório"),
  cidade: z.string().min(2, "Cidade obrigatória"),
  estado: z.string().length(2, "UF com 2 letras"),
  cep: z.string().min(8, "CEP obrigatório"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  grupoId: string;
  servo?: Servo;
}

export function ServoFormDialog({ open, onOpenChange, grupoId, servo }: Props) {
  const router = useRouter();
  const isEdit = !!servo;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      dataNascimento: "",
      funcao: "",
      etapasFormativas: [],
      ministerios: [],
      ingressoEm: new Date().toISOString().slice(0, 10),
      rua: "",
      numero: "",
      bairro: "",
      cidade: "Barreiras",
      estado: "BA",
      cep: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        nome: servo?.nome ?? "",
        email: servo?.email ?? "",
        telefone: servo?.telefone ?? "",
        dataNascimento: isoToBr(servo?.dataNascimento ?? ""),
        funcao: servo?.funcao ?? "",
        etapasFormativas: servo?.etapasFormativas ?? [],
        ministerios: servo?.ministerios ?? [],
        ingressoEm: servo?.ingressoEm ?? new Date().toISOString().slice(0, 10),
        rua: servo?.endereco?.rua ?? "",
        numero: servo?.endereco?.numero ?? "",
        bairro: servo?.endereco?.bairro ?? "",
        cidade: servo?.endereco?.cidade ?? "Barreiras",
        estado: servo?.endereco?.estado ?? "BA",
        cep: servo?.endereco?.cep ?? "",
      });
    }
  }, [open, servo]);

  async function onSubmit(values: FormValues) {
    const input = {
      grupoId,
      nome: values.nome,
      email: values.email,
      telefone: values.telefone,
      dataNascimento: brToIso(values.dataNascimento),
      funcao: values.funcao,
      etapasFormativas: values.etapasFormativas as Servo["etapasFormativas"],
      ministerios: values.ministerios as Servo["ministerios"],
      ingressoEm: values.ingressoEm,
      endereco: {
        rua: values.rua,
        numero: values.numero,
        bairro: values.bairro,
        cidade: values.cidade,
        estado: values.estado,
        cep: values.cep,
      },
    };

    try {
      if (isEdit) {
        await updateServo(servo.id, input);
        toast.success("Servo atualizado com sucesso.");
      } else {
        await createServo(input);
        toast.success("Servo cadastrado com sucesso.");
      }
      onOpenChange(false);
      await router.invalidate();
    } catch {
      toast.error("Erro ao salvar servo. Verifique os dados e tente novamente.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Servo" : "Novo Servo"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do servo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(77) 99999-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dataNascimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="dd/mm/aaaa"
                        maxLength={10}
                        {...field}
                        onChange={(e) => field.onChange(maskDateBr(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ingressoEm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingresso no Grupo</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="funcao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Selecione...</option>
                      {FUNCOES.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="etapasFormativas"
              render={() => (
                <FormItem>
                  <FormLabel>Etapa Formativa</FormLabel>
                  <div className="space-y-3">
                    {(Object.entries(ETAPAS_FORMATIVAS) as [string, readonly EtapaFormativa[]][]).map(
                      ([etapa, opcoes]) => (
                        <div key={etapa} className="rounded-md border border-border p-3">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {etapa}
                          </p>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {opcoes.map((opt) => (
                              <FormField
                                key={opt}
                                control={form.control}
                                name="etapasFormativas"
                                render={({ field }) => (
                                  <FormItem className="flex items-center gap-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(opt)}
                                        onCheckedChange={(checked) => {
                                          const current = field.value ?? [];
                                          field.onChange(
                                            checked
                                              ? [...current, opt]
                                              : current.filter((v) => v !== opt),
                                          );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="cursor-pointer text-xs font-normal">
                                      {opt}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ministerios"
              render={() => (
                <FormItem>
                  <FormLabel>Ministérios</FormLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {MINISTERIOS.map((m) => (
                      <FormField
                        key={m}
                        control={form.control}
                        name="ministerios"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(m)}
                                onCheckedChange={(checked) => {
                                  const current = field.value ?? [];
                                  field.onChange(
                                    checked ? [...current, m] : current.filter((v) => v !== m),
                                  );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="cursor-pointer text-xs font-normal">{m}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">
              Endereço
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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

              <FormField
                control={form.control}
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
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Salvando..." : isEdit ? "Salvar Alterações" : "Cadastrar Servo"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
