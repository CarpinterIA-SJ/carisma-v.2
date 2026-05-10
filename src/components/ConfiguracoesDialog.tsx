import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const perfilSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
});

const senhaSchema = z
  .object({
    novaSenha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmarSenha: z.string(),
  })
  .refine((d) => d.novaSenha === d.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

type PerfilValues = z.infer<typeof perfilSchema>;
type SenhaValues = z.infer<typeof senhaSchema>;

type Tab = "perfil" | "seguranca";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function ConfiguracoesDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("perfil");
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);

  const perfilForm = useForm<PerfilValues>({
    resolver: zodResolver(perfilSchema),
    defaultValues: { nome: user?.nome ?? "" },
  });

  const senhaForm = useForm<SenhaValues>({
    resolver: zodResolver(senhaSchema),
    defaultValues: { novaSenha: "", confirmarSenha: "" },
  });

  async function onSubmitPerfil(values: PerfilValues) {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ nome: values.nome })
      .eq("id", user.id);
    if (error) {
      toast.error("Erro ao atualizar perfil.");
      return;
    }
    toast.success("Nome atualizado. Recarregue para ver o efeito.");
  }

  async function onSubmitSenha(values: SenhaValues) {
    const { error } = await supabase.auth.updateUser({ password: values.novaSenha });
    if (error) {
      toast.error(error.message ?? "Erro ao alterar senha.");
      return;
    }
    toast.success("Senha alterada com sucesso.");
    senhaForm.reset();
  }

  const tabClass = (t: Tab) =>
    cn(
      "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
      tab === t
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
    );

  const initials = (user?.nome ?? "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
        </DialogHeader>

        {/* Avatar + info do usuário */}
        <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{user?.nome}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1">
          <button type="button" className={tabClass("perfil")} onClick={() => setTab("perfil")}>
            <span className="flex items-center justify-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              Perfil
            </span>
          </button>
          <button type="button" className={tabClass("seguranca")} onClick={() => setTab("seguranca")}>
            <span className="flex items-center justify-center gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              Segurança
            </span>
          </button>
        </div>

        {tab === "perfil" && (
          <Form {...perfilForm}>
            <form onSubmit={perfilForm.handleSubmit(onSubmitPerfil)} className="space-y-4">
              <FormField
                control={perfilForm.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome de exibição</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <p><span className="font-medium">E-mail:</span> {user?.email}</p>
                <p className="mt-0.5 capitalize"><span className="font-medium">Função:</span> {user?.role}</p>
              </div>
              <Button type="submit" className="w-full" disabled={perfilForm.formState.isSubmitting}>
                {perfilForm.formState.isSubmitting ? "Salvando..." : "Salvar Nome"}
              </Button>
            </form>
          </Form>
        )}

        {tab === "seguranca" && (
          <Form {...senhaForm}>
            <form onSubmit={senhaForm.handleSubmit(onSubmitSenha)} className="space-y-4">
              <FormField
                control={senhaForm.control}
                name="novaSenha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showSenha ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowSenha((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={senhaForm.control}
                name="confirmarSenha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar nova senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmar ? "text" : "password"}
                          placeholder="Repita a senha"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmar((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={senhaForm.formState.isSubmitting}>
                {senhaForm.formState.isSubmitting ? "Alterando..." : "Alterar Senha"}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
