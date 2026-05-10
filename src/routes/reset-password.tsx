import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: "Redefinir senha — RCC Diocese de Barreiras" }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setValidSession(true);
      }
    });

    // Also check for existing recovery session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidSession(true);
    });
  }, []);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      setError("Não foi possível redefinir a senha. O link pode ter expirado.");
    } else {
      setSuccess(true);
      setTimeout(() => navigate({ to: "/" }), 3000);
    }
  }

  if (!validSession) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-sm text-center space-y-4">
          <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
          <h1 className="text-xl font-bold">Link inválido ou expirado</h1>
          <p className="text-sm text-muted-foreground">
            Solicite um novo link de redefinição de senha.
          </p>
          <Button variant="outline" onClick={() => navigate({ to: "/" })}>
            Voltar ao login
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-sm text-center space-y-4">
          <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
          <h1 className="text-xl font-bold">Senha redefinida!</h1>
          <p className="text-sm text-muted-foreground">
            Redirecionando para o login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold tracking-tight">Nova senha</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Escolha uma nova senha para sua conta.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nova senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmar senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirm"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
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
            {submitting ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </form>
      </div>
    </div>
  );
}
