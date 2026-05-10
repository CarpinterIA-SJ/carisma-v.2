import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { ShieldAlert, ShieldCheck, FileText, Wallet } from "lucide-react";
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
import { createUsuario, updateUsuario, getGrupos } from "@/lib/services";
import type { User, Grupo } from "@/lib/types";
import { cn } from "@/lib/utils";

const ROLES = ["admin", "coordenador", "secretario", "tesoureiro"] as const;
const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  coordenador: "Coordenador",
  secretario: "Secretário",
  tesoureiro: "Tesoureiro",
};

const ROLE_META: Record<(typeof ROLES)[number], { icon: typeof ShieldCheck; cor: string; bg: string; descricao: string }> = {
  admin: {
    icon: ShieldAlert,
    cor: "text-primary",
    bg: "bg-primary/10 border-primary/30",
    descricao: "Acesso global ao sistema. Gerencia grupos, usuários e configurações.",
  },
  coordenador: {
    icon: ShieldCheck,
    cor: "text-blue-600",
    bg: "bg-blue-500/10 border-blue-500/30",
    descricao: "Gerencia tudo de um grupo: servos, eventos e financeiro.",
  },
  secretario: {
    icon: FileText,
    cor: "text-emerald-700",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    descricao: "Gestão do grupo (servos, eventos). Sem acesso financeiro.",
  },
  tesoureiro: {
    icon: Wallet,
    cor: "text-amber-700",
    bg: "bg-amber-500/10 border-amber-500/30",
    descricao: "Acesso exclusivo ao financeiro: pagamentos, comprovantes e farol.",
  },
};

const createSchema = z
  .object({
    nome: z.string().min(2, "Nome obrigatório"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string(),
    role: z.enum(ROLES),
    grupoId: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

const editSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  role: z.enum(ROLES),
  grupoId: z.string().optional(),
});

type CreateValues = z.infer<typeof createSchema>;
type EditValues = z.infer<typeof editSchema>;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  usuario?: User;
}

export function UsuarioFormDialog({ open, onOpenChange, usuario }: Props) {
  const router = useRouter();
  const isEdit = !!usuario;
  const [grupos, setGrupos] = useState<Grupo[]>([]);

  useEffect(() => {
    if (open) getGrupos().then(setGrupos).catch(() => {});
  }, [open]);

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { nome: "", email: "", password: "", confirmPassword: "", role: "coordenador", grupoId: "" },
  });

  const editForm = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { nome: usuario?.nome ?? "", role: usuario?.role ?? "coordenador", grupoId: usuario?.grupoId ?? "" },
  });

  useEffect(() => {
    if (open && isEdit && usuario) {
      editForm.reset({ nome: usuario.nome, role: usuario.role, grupoId: usuario.grupoId ?? "" });
    }
    if (open && !isEdit) {
      createForm.reset();
    }
  }, [open, usuario]);

  async function onSubmitCreate(values: CreateValues) {
    try {
      await createUsuario({
        nome: values.nome,
        email: values.email,
        password: values.password,
        role: values.role,
        grupoId: values.grupoId || undefined,
      });
      toast.success("Usuário cadastrado com acesso liberado.");
      onOpenChange(false);
      await router.invalidate();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao cadastrar usuário.";
      toast.error(msg);
    }
  }

  async function onSubmitEdit(values: EditValues) {
    try {
      await updateUsuario(usuario!.id, {
        nome: values.nome,
        role: values.role,
        grupoId: values.grupoId || null,
      });
      toast.success("Usuário atualizado com sucesso.");
      onOpenChange(false);
      await router.invalidate();
    } catch {
      toast.error("Erro ao atualizar usuário.");
    }
  }

  const roleField = (control: any, name: string) => (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Função</FormLabel>
          <FormControl>
            <div className="grid gap-2 sm:grid-cols-2">
              {ROLES.map((r) => {
                const meta = ROLE_META[r];
                const Icon = meta.icon;
                const ativo = field.value === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => field.onChange(r)}
                    className={cn(
                      "flex items-start gap-2 rounded-lg border p-3 text-left transition-all",
                      ativo
                        ? `${meta.bg} ring-2 ring-primary/40`
                        : "border-border bg-card hover:border-primary/40",
                    )}
                  >
                    <div className={cn("rounded-md p-1.5", meta.bg)}>
                      <Icon className={cn("h-3.5 w-3.5", meta.cor)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{ROLE_LABELS[r]}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                        {meta.descricao}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const grupoField = (control: any, name: string) => (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Grupo (opcional)</FormLabel>
          <FormControl>
            <select
              {...field}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">— Nenhum —</option>
              {grupos.map((g) => (
                <option key={g.id} value={g.id}>{g.nome}</option>
              ))}
            </select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  if (isEdit) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {roleField(editForm.control, "role")}
              {grupoField(editForm.control, "grupoId")}
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={editForm.formState.isSubmitting}>
                  {editForm.formState.isSubmitting ? "Salvando..." : "Salvar Alterações"}
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Usuário</DialogTitle>
        </DialogHeader>
        <Form {...createForm}>
          <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="space-y-4">
            <FormField
              control={createForm.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={createForm.control}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Repita a senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {roleField(createForm.control, "role")}
            {grupoField(createForm.control, "grupoId")}
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createForm.formState.isSubmitting}>
                {createForm.formState.isSubmitting ? "Criando..." : "Criar Usuário"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
