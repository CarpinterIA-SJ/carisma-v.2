import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Flame,
  Mail,
  Lock,
  User as UserIcon,
  Users as UsersIcon,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { getGruposPublicos } from "@/lib/services";
import type { UserRole } from "@/lib/types";

type PerfilOption = Exclude<UserRole, "admin">;

const PERFIS: { value: PerfilOption; label: string }[] = [
  { value: "coordenador", label: "Coordenador(a)" },
  { value: "secretario", label: "Secretário(a)" },
  { value: "tesoureiro", label: "Tesoureiro(a)" },
];

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar acesso — RCC Diocese de Barreiras" },
      {
        name: "description",
        content:
          "Solicite acesso ao sistema da RCC Diocesana. O cadastro será aprovado pelo administrador antes de liberar o acesso.",
      },
    ],
  }),
  component: CadastroPage,
});

function CadastroPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [grupos, setGrupos] = useState<{ id: string; nome: string; paroquia: string | null }[]>([]);
  const [gruposLoading, setGruposLoading] = useState(true);
  const [grupoLoadError, setGrupoLoadError] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [perfil, setPerfil] = useState<PerfilOption | "">("");
  const [grupoId, setGrupoId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setGruposLoading(true);
    getGruposPublicos()
      .then((list) => {
        if (cancelled) return;
        setGrupos(list);
        if (list.length === 0) {
          setGrupoLoadError(
            "Nenhum grupo aprovado disponível. Contate o administrador da Diocese.",
          );
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[cadastro] getGruposPublicos:", err);
        setGrupoLoadError(
          `Não foi possível carregar a lista de grupos${err?.message ? `: ${err.message}` : "."}`,
        );
      })
      .finally(() => {
        if (!cancelled) setGruposLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setError(null);

    if (!perfil) {
      setError("Selecione um perfil.");
      return;
    }
    if (!grupoId) {
      setError("Selecione o grupo de oração.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (!lgpdConsent) {
      setError("É necessário aceitar a Política de Privacidade e os Termos de Uso para continuar.");
      return;
    }

    setSubmitting(true);
    const { error: signUpError } = await signUp({
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: perfil,
      grupoId,
      lgpdConsent,
    });
    setSubmitting(false);

    if (signUpError) {
      setError(signUpError);
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-2xl font-bold">Cadastro enviado!</h1>
          <p className="text-sm text-muted-foreground">
            Sua solicitação foi registrada e está aguardando aprovação do administrador.
            Você receberá acesso assim que for aprovado.
          </p>
          <Button onClick={() => navigate({ to: "/" })} className="w-full">
            Voltar para o login
          </Button>
        </div>
      </div>
    );
  }

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
          <h2 className="text-3xl font-bold leading-tight">Solicitar acesso</h2>
          <p className="text-base opacity-90">
            Coordenadores, secretários e tesoureiros dos grupos podem solicitar acesso ao
            sistema. O administrador da Diocese aprovará seu cadastro antes da liberação.
          </p>
        </div>

        <p className="text-xs opacity-70">© {new Date().getFullYear()} RCC Diocesana de Barreiras</p>
      </div>

      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Flame className="h-5 w-5" />
            </div>
            <span className="font-semibold">RCC Barreiras</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">Criar acesso</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Preencha os dados abaixo. O cadastro precisa ser aprovado pelo administrador antes
            do primeiro login.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="pl-9"
                  required
                  minLength={2}
                />
              </div>
            </div>

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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="perfil">Perfil</Label>
                <select
                  id="perfil"
                  value={perfil}
                  onChange={(e) => setPerfil(e.target.value as PerfilOption | "")}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  required
                >
                  <option value="">Selecione...</option>
                  {PERFIS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grupo">Grupo de oração</Label>
                <div className="relative">
                  <UsersIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <select
                    id="grupo"
                    value={grupoId}
                    onChange={(e) => setGrupoId(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm"
                    required
                    disabled={gruposLoading || grupos.length === 0}
                  >
                    <option value="">
                      {gruposLoading
                        ? "Carregando grupos..."
                        : grupos.length === 0
                          ? "Nenhum grupo disponível"
                          : "Selecione..."}
                    </option>
                    {grupos.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.nome}{g.paroquia ? ` — ${g.paroquia}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9"
                  required
                  minLength={6}
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

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmar senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repita a senha"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="pl-9"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {grupoLoadError && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {grupoLoadError}
              </div>
            )}

            <label className="flex items-start gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={lgpdConsent}
                onChange={(e) => setLgpdConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-input"
                required
              />
              <span>
                Li e aceito a{" "}
                <Link to="/privacidade" target="_blank" className="text-primary hover:underline">
                  Política de Privacidade
                </Link>{" "}
                e os{" "}
                <Link to="/termos" target="_blank" className="text-primary hover:underline">
                  Termos de Uso
                </Link>
                , autorizando o tratamento dos meus dados conforme a LGPD
                (Lei nº 13.709/2018).
              </span>
            </label>

            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={submitting || !lgpdConsent}>
              {submitting ? "Enviando..." : "Solicitar acesso"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Já tem conta?{" "}
              <Link to="/" className="text-primary hover:underline">
                Entrar
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
