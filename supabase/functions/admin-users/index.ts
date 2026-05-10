import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const body = await req.json();
    const { action } = body;

    if (action === "create") {
      const { nome, email, password, role, grupoId } = body;

      // Cria o usuário no Auth com nome nos metadados.
      // O trigger on_auth_user_created cria o profile automaticamente.
      // Passa status=aprovado para que o trigger marque o profile como já aprovado
      // (auto-cadastro via tela pública entra como pendente).
      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { nome, role, grupoId: grupoId ?? null, status: "aprovado" },
        });

      if (authError) throw authError;

      const userId = authData.user.id;

      // Atualiza o profile gerado pelo trigger com role e grupo corretos.
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({
          nome,
          role,
          grupo_id: grupoId ?? null,
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      // Vincula o userId ao campo correto do grupo (coordenador/tesoureiro/secretario)
      const roleField: Record<string, string> = {
        coordenador: "coordenador_id",
        tesoureiro: "tesoureiro_id",
        secretario: "secretario_id",
      };
      if (grupoId && roleField[role]) {
        await supabaseAdmin
          .from("grupos")
          .update({ [roleField[role]]: userId })
          .eq("id", grupoId);
      }

      return new Response(JSON.stringify({ id: userId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (action === "delete") {
      const { userId } = body;

      const { error: deleteError } =
        await supabaseAdmin.auth.admin.deleteUser(userId);
      if (deleteError) throw deleteError;

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ error: "Ação inválida" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
