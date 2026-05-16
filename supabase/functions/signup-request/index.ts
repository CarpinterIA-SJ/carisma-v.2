import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_ROLES = ["coordenador", "tesoureiro", "secretario"] as const;
type AllowedRole = (typeof ALLOWED_ROLES)[number];

function isAllowedRole(role: unknown): role is AllowedRole {
  return typeof role === "string" && (ALLOWED_ROLES as readonly string[]).includes(role);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const body = await req.json().catch(() => null);
    if (!body) return json({ error: "Payload inválido." }, 400);

    const nome = typeof body.nome === "string" ? body.nome.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const role = body.role;
    const grupoId = typeof body.grupoId === "string" ? body.grupoId : "";

    if (nome.length < 2) return json({ error: "Informe o nome completo." }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "E-mail inválido." }, 400);
    if (password.length < 6) return json({ error: "A senha deve ter pelo menos 6 caracteres." }, 400);
    if (!isAllowedRole(role)) return json({ error: "Perfil inválido." }, 400);
    if (!grupoId) return json({ error: "Selecione o grupo de oração." }, 400);

    const { data: grupo, error: grupoError } = await admin
      .from("grupos")
      .select("id, status")
      .eq("id", grupoId)
      .maybeSingle();
    if (grupoError) throw grupoError;
    if (!grupo || grupo.status !== "aprovado") {
      return json({ error: "Grupo não disponível para cadastro." }, 400);
    }

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome, role, grupoId, status: "pendente" },
    });
    if (createError) {
      const raw = createError.message ?? "Erro ao criar cadastro.";
      const duplicate = /already|registered|exists|duplicate/i.test(raw);
      const msg = duplicate
        ? "Este e-mail já possui cadastro. Aguarde aprovação do administrador ou faça login."
        : raw;
      return json({ error: msg }, duplicate ? 409 : 400);
    }

    const userId = created.user?.id;
    if (userId) {
      await admin
        .from("profiles")
        .update({ nome, role, grupo_id: grupoId, status: "pendente" })
        .eq("id", userId);
    }

    return json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return json({ error: message }, 500);
  }
});
