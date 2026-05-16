import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthChangeEvent, Session, User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { User, UserRole, UserStatus } from "./types";

interface SignUpInput {
  nome: string;
  email: string;
  password: string;
  role: Exclude<UserRole, "admin">;
  grupoId: string;
  lgpdConsent: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (input: SignUpInput) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let currentUserId: string | null = null;

    async function loadProfile(supabaseUser: SupabaseUser, allowUnapproved: boolean) {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", supabaseUser.id)
          .single();
        if (cancelled) return;
        if (data) {
          const status: UserStatus = (data.status as UserStatus) ?? "pendente";
          if (status !== "aprovado" && !allowUnapproved) {
            // Sessão criada mas perfil não aprovado: derruba sessão imediatamente.
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
            return;
          }
          setUser({
            id: data.id,
            nome: data.nome,
            email: supabaseUser.email!,
            role: data.role,
            grupoId: data.grupo_id ?? undefined,
            avatar: data.avatar ?? undefined,
            status,
          });
        } else {
          setUser(null);
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    function handleSession(session: Session | null, event: AuthChangeEvent | null) {
      setSession(session);
      const nextUserId = session?.user.id ?? null;
      // Skip refetch if the user hasn't changed (e.g. TOKEN_REFRESHED, USER_UPDATED).
      if (nextUserId === currentUserId) {
        if (!session) setLoading(false);
        return;
      }
      currentUserId = nextUserId;
      if (session) {
        setLoading(true);
        // During password recovery the user must keep the session alive even if
        // their profile is not approved, so they can complete updateUser().
        loadProfile(session.user, event === "PASSWORD_RECOVERY");
      } else {
        setUser(null);
        setLoading(false);
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      handleSession(session, null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      handleSession(session, event);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    // Bloqueia acesso se o profile não estiver aprovado.
    const userId = data.user?.id;
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", userId)
        .single();
      const status: UserStatus = (profile?.status as UserStatus) ?? "pendente";
      if (status !== "aprovado") {
        await supabase.auth.signOut();
        return {
          error:
            status === "rejeitado"
              ? "Cadastro rejeitado pelo administrador."
              : "Cadastro aguardando aprovação do administrador.",
        };
      }
    }
    return { error: null };
  }

  async function signUp(input: SignUpInput) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/signup-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
        },
        body: JSON.stringify({
          nome: input.nome,
          email: input.email,
          password: input.password,
          role: input.role,
          grupoId: input.grupoId,
          lgpdConsent: input.lgpdConsent,
        }),
      });
      const payload = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (!res.ok) {
        return { error: payload?.error ?? `Falha no cadastro (HTTP ${res.status}).` };
      }
      if (payload?.error) return { error: payload.error };
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro de rede.";
      return { error: message };
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function resetPassword(email: string) {
    const normalized = email.trim().toLowerCase();
    const { error } = await supabase.auth.resetPasswordForEmail(normalized, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (!error) return { error: null };
    const status = (error as { status?: number }).status;
    if (status === 429) {
      return {
        error:
          "Muitas tentativas. Aguarde alguns minutos antes de solicitar um novo link de redefinição.",
      };
    }
    return { error: error.message };
  }

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
