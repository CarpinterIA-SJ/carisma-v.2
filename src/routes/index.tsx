import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Flame, Mail, Lock, ShieldCheck, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { ADMIN_EMAILS } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Entrar — Conexão Carisma" },
      {
        name: "description",
        content:
          "Acesso ao Conexão Carisma — sistema de gerenciamento dos grupos de oração da Renovação Carismática Católica de Barreiras/BA.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { session, user, loading, signIn, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (loading || !session || !user) return;
    if (user.role === "admin") {
      navigate({ to: "/admin" });
    } else if (user.grupoId) {
      navigate({ to: "/grupos/$id", params: { id: user.grupoId } });
    } else {
      navigate({ to: "/grupos" });
    }
  }, [session, user, loading, navigate]);

  const adminMatch = ADMIN_EMAILS.includes(email.trim().toLowerCase() as never);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error } = await signIn(email, password);
    if (error) {
      setError("E-mail ou senha inválidos.");
      setSubmitting(false);
    }
    // navigation is handled by the useEffect above once auth loading completes
  }

  async function handleForgotPassword(e: { preventDefault(): void }) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error } = await resetPassword(email);
    setSubmitting(false);
    if (error) {
      setError("Não foi possível enviar o e-mail. Verifique o endereço e tente novamente.");
    } else {
      setResetSent(true);
    }
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div
        className="relative hidden lg:flex flex-col justify-between p-12 text-white bg-primary bg-cover bg-center"
        style={{ backgroundImage: "url('/hero.png')" }}
      >
        {/* Overlay para legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/60 to-black/70" aria-hidden="true" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">Conexão Carisma</p>
            <p className="text-sm opacity-80">RCC Diocese de Barreiras/BA</p>
          </div>
        </div>

        <div className="relative space-y-4 max-w-md">
          <h2 className="text-4xl font-bold leading-tight drop-shadow">
            Vinde, Espírito Santo
          </h2>
          <p className="text-base opacity-95">
            Plataforma da Renovação Carismática Católica da Diocese de Barreiras.
            Grupos de oração, servos, mensalidades e eventos em um só lugar.
          </p>
        </div>

        <p className="relative text-xs opacity-80">
          © {new Date().getFullYear()} Conexão Carisma — RCC Diocese de Barreiras
        </p>
      </div>

      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Flame className="h-5 w-5" />
            </div>
            <span className="font-semibold">Conexão Carisma</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            {forgotMode ? "Recuperar senha" : "Entrar na sua conta"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {forgotMode
              ? "Informe seu e-mail para receber o link de redefinição."
              : "Informe suas credenciais para acessar o sistema."}
          </p>

          {forgotMode ? (
            resetSent ? (
              <div className="mt-8 space-y-4">
                <div className="rounded-md bg-primary/10 px-4 py-3 text-sm text-primary">
                  E-mail enviado! Verifique sua caixa de entrada e clique no link para redefinir sua senha.
                </div>
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => { setForgotMode(false); setResetSent(false); setError(null); }}
                >
                  ← Voltar ao login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="mt-8 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Enviando..." : "Enviar link de redefinição"}
                </Button>
                <button
                  type="button"
                  className="w-full text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => { setForgotMode(false); setError(null); }}
                >
                  ← Voltar ao login
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
                {adminMatch && (
                  <p className="flex items-center gap-1.5 text-xs text-primary">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Administrador Geral reconhecido.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="senha">Senha</Label>
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => { setForgotMode(true); setError(null); }}
                  >
                    Esqueci minha senha
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Entrando..." : "Entrar"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Não tem acesso?{" "}
                <Link to="/cadastro" className="text-primary hover:underline">
                  Criar acesso
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
