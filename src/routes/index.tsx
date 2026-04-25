import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Flame, Mail, Lock, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ADMIN_EMAILS, isAdminEmail } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Entrar — RCC Diocese de Barreiras" },
      {
        name: "description",
        content:
          "Acesso ao sistema de gerenciamento dos grupos de oração da Renovação Carismática Católica de Barreiras/BA.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string>(ADMIN_EMAILS[0]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => navigate({ to: "/admin" }), 500);
  };

  const adminMatch = isAdminEmail(email);

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-primary p-12 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/10">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">RCC Diocesana</p>
            <p className="text-sm opacity-80">Barreiras/BA</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold leading-tight">
            Sistema de Gerenciamento dos Grupos de Oração
          </h2>
          <p className="text-base opacity-90">
            Renovação Carismática Católica da Diocese de Barreiras. Gestão de grupos, servos,
            mensalidades e eventos em um só lugar.
          </p>
        </div>

        <p className="text-xs opacity-70">
          © {new Date().getFullYear()} RCC Diocesana de Barreiras
        </p>
      </div>

      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Flame className="h-5 w-5" />
            </div>
            <span className="font-semibold">RCC Barreiras</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">Entrar na sua conta</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Informe suas credenciais para acessar o sistema.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  defaultValue="admin@rccbarreiras.org"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="senha">Senha</Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  defaultValue="demo1234"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Demonstração com dados fictícios. Use qualquer credencial para entrar.
          </p>
        </div>
      </div>
    </div>
  );
}
