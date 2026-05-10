import { supabase } from "./supabase";
import type {
  Grupo,
  Servo,
  Mensalidade,
  TipoCobranca,
  Recibo,
  Evento,
  FarolStatus,
  User,
} from "./types";

// ── Mappers ──────────────────────────────────────────────────────────────────

function mapGrupo(r: Record<string, unknown>): Grupo {
  return {
    id: r.id as string,
    nome: r.nome as string,
    descricao: r.descricao as string,
    diaSemana: r.dia_semana as string,
    horario: r.horario as string,
    endereco: r.endereco as Grupo["endereco"],
    coordenadorId: r.coordenador_id as string,
    secretarioId: (r.secretario_id as string | null) ?? undefined,
    tesoureiroId: (r.tesoureiro_id as string | null) ?? undefined,
    status: r.status as Grupo["status"],
    fundadoEm: r.fundado_em as string,
    totalServos: r.total_servos as number,
    paroquia: r.paroquia as string,
  };
}

function mapServo(r: Record<string, unknown>): Servo {
  return {
    id: r.id as string,
    grupoId: r.grupo_id as string,
    nome: r.nome as string,
    email: r.email as string,
    telefone: r.telefone as string,
    dataNascimento: r.data_nascimento as string,
    endereco: r.endereco as Servo["endereco"],
    funcao: r.funcao as string,
    etapasFormativas: (r.etapas_formativas as Servo["etapasFormativas"]) ?? [],
    ministerios: r.ministerios as Servo["ministerios"],
    avatar: (r.avatar as string | null) ?? undefined,
    ingressoEm: r.ingresso_em as string,
  };
}

function mapMensalidade(r: Record<string, unknown>): Mensalidade {
  return {
    id: r.id as string,
    grupoId: r.grupo_id as string,
    tipo: (r.tipo as Mensalidade["tipo"]) ?? "mensalidade",
    descricao: (r.descricao as string | null) ?? undefined,
    mes: r.mes as number,
    ano: r.ano as number,
    valor: r.valor as number,
    vencimento: r.vencimento as string,
    status: r.status as Mensalidade["status"],
    dataPagamento: (r.data_pagamento as string | null) ?? undefined,
    comprovanteUrl: (r.comprovante_url as string | null) ?? undefined,
  };
}

function mapRecibo(r: Record<string, unknown>): Recibo {
  return {
    id: r.id as string,
    codigo: r.codigo as string,
    servoId: (r.servo_id as string | null) ?? undefined,
    grupoId: r.grupo_id as string,
    valor: r.valor as number,
    descricao: r.descricao as string,
    emitidoEm: r.emitido_em as string,
  };
}

function mapEvento(r: Record<string, unknown>): Evento {
  return {
    id: r.id as string,
    titulo: r.titulo as string,
    descricao: r.descricao as string,
    tipo: r.tipo as Evento["tipo"],
    status: r.status as Evento["status"],
    data: r.data as string,
    horaInicio: r.hora_inicio as string,
    horaFim: r.hora_fim as string,
    local: r.local as string,
    cidade: r.cidade as string,
    vagas: r.vagas as number,
    inscritos: r.inscritos as string[],
    organizador: r.organizador as string,
  };
}

function computeFarol(mensalidades: Mensalidade[]): FarolStatus {
  const atrasadas = mensalidades.filter((m) => m.status === "atrasado").length;
  const pendentes = mensalidades.filter((m) => m.status === "pendente").length;
  if (atrasadas >= 2) return "vermelho";
  if (atrasadas >= 1 || pendentes >= 2) return "amarelo";
  return "verde";
}

// ── Grupos ───────────────────────────────────────────────────────────────────

export async function getGrupos(): Promise<Grupo[]> {
  const { data, error } = await supabase.from("grupos").select("*").order("nome");
  if (error) throw error;
  return (data ?? []).map(mapGrupo);
}

export async function getGrupoById(id: string): Promise<Grupo | null> {
  const { data, error } = await supabase.from("grupos").select("*").eq("id", id).single();
  if (error) return null;
  return mapGrupo(data);
}

// ── Servos ───────────────────────────────────────────────────────────────────

export async function getServoById(id: string): Promise<Servo | null> {
  const { data, error } = await supabase.from("servos").select("*").eq("id", id).single();
  if (error) return null;
  return mapServo(data);
}

export async function getServosByGrupo(grupoId: string): Promise<Servo[]> {
  const { data, error } = await supabase
    .from("servos")
    .select("*")
    .eq("grupo_id", grupoId)
    .order("nome");
  if (error) throw error;
  return (data ?? []).map(mapServo);
}

export async function getServosByIds(ids: string[]): Promise<Servo[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from("servos").select("*").in("id", ids);
  if (error) throw error;
  return (data ?? []).map(mapServo);
}

// ── Mensalidades ─────────────────────────────────────────────────────────────

export async function getMensalidadesByGrupo(grupoId: string): Promise<Mensalidade[]> {
  const { data, error } = await supabase
    .from("mensalidades")
    .select("*")
    .eq("grupo_id", grupoId)
    .order("ano")
    .order("mes");
  if (error) throw error;
  return (data ?? []).map(mapMensalidade);
}

// ── Recibos ──────────────────────────────────────────────────────────────────

export async function getRecibos(): Promise<Recibo[]> {
  const { data, error } = await supabase
    .from("recibos")
    .select("*")
    .order("emitido_em", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRecibo);
}

// ── Eventos ──────────────────────────────────────────────────────────────────

export async function getEventos(): Promise<Evento[]> {
  const { data, error } = await supabase.from("eventos").select("*").order("data");
  if (error) throw error;
  return (data ?? []).map(mapEvento);
}

export async function getEventoById(id: string): Promise<Evento | null> {
  const { data, error } = await supabase.from("eventos").select("*").eq("id", id).single();
  if (error) return null;
  return mapEvento(data);
}

// ── Stats & Farol ─────────────────────────────────────────────────────────────

export async function getStats() {
  const [grupos, servos, mensalidades] = await Promise.all([
    supabase.from("grupos").select("id, status, nome, paroquia, coordenador_id, secretario_id, tesoureiro_id"),
    supabase.from("servos").select("id", { count: "exact" }),
    supabase.from("mensalidades").select("status"),
  ]);

  const gruposData = grupos.data ?? [];
  const mensalidadesData = mensalidades.data ?? [];

  return {
    totalGrupos: gruposData.filter((g) => g.status === "aprovado").length,
    totalServos: servos.count ?? 0,
    mensalidadesEmDia: mensalidadesData.filter((m) => m.status === "pago").length,
    mensalidadesAtraso: mensalidadesData.filter((m) => m.status === "atrasado").length,
    pendentes: gruposData.filter((g) => g.status === "pendente").map(mapGrupo as (r: unknown) => Grupo),
  };
}

export type DashboardGrupo = {
  grupo: Grupo;
  totalMeses: number;
  pagas: number;
  pendentes: number;
  atrasadas: number;
  validacao: number;
  valorTotal: number;
  valorPago: number;
  valorPendente: number;
  adimplencia: number;
  meses: Array<Mensalidade["status"] | null>;
};

export type DashboardData = {
  ano: number;
  grupos: DashboardGrupo[];
  totais: {
    grupos: number;
    totalMeses: number;
    pagas: number;
    pendentes: number;
    atrasadas: number;
    valorTotal: number;
    valorPago: number;
    valorPendente: number;
    adimplencia: number;
  };
};

export async function getDashboardPagamentos(ano: number): Promise<DashboardData> {
  const [{ data: gruposData }, { data: mensalidadesData }] = await Promise.all([
    supabase.from("grupos").select("*").eq("status", "aprovado").order("nome"),
    supabase.from("mensalidades").select("*").eq("ano", ano),
  ]);

  const grupos = (gruposData ?? []).map(mapGrupo);
  const mensalidades = (mensalidadesData ?? []).map(mapMensalidade);

  const dashGrupos: DashboardGrupo[] = grupos.map((g) => {
    const ms = mensalidades.filter((m) => m.grupoId === g.id);
    const pagas = ms.filter((m) => m.status === "pago").length;
    const pendentes = ms.filter((m) => m.status === "pendente").length;
    const atrasadas = ms.filter((m) => m.status === "atrasado").length;
    const validacao = ms.filter((m) => m.status === "validacao").length;
    const valorTotal = ms.reduce((s, m) => s + m.valor, 0);
    const valorPago = ms.filter((m) => m.status === "pago").reduce((s, m) => s + m.valor, 0);
    const valorPendente = valorTotal - valorPago;
    const adimplencia = ms.length > 0 ? (pagas / ms.length) * 100 : 0;
    const meses: Array<Mensalidade["status"] | null> = Array.from({ length: 12 }, (_, i) => {
      const m = ms.find((x) => x.mes === i + 1);
      return m ? m.status : null;
    });
    return {
      grupo: g,
      totalMeses: ms.length,
      pagas,
      pendentes,
      atrasadas,
      validacao,
      valorTotal,
      valorPago,
      valorPendente,
      adimplencia,
      meses,
    };
  });

  const totalMeses = dashGrupos.reduce((s, g) => s + g.totalMeses, 0);
  const pagasTot = dashGrupos.reduce((s, g) => s + g.pagas, 0);
  const valorTotal = dashGrupos.reduce((s, g) => s + g.valorTotal, 0);
  const valorPago = dashGrupos.reduce((s, g) => s + g.valorPago, 0);

  return {
    ano,
    grupos: dashGrupos,
    totais: {
      grupos: dashGrupos.length,
      totalMeses,
      pagas: pagasTot,
      pendentes: dashGrupos.reduce((s, g) => s + g.pendentes, 0),
      atrasadas: dashGrupos.reduce((s, g) => s + g.atrasadas, 0),
      valorTotal,
      valorPago,
      valorPendente: valorTotal - valorPago,
      adimplencia: totalMeses > 0 ? (pagasTot / totalMeses) * 100 : 0,
    },
  };
}

export async function getGruposComFarol(): Promise<Array<Grupo & { farol: FarolStatus }>> {
  const [{ data: gruposData }, { data: mensalidadesData }] = await Promise.all([
    supabase.from("grupos").select("*").eq("status", "aprovado").order("nome"),
    supabase.from("mensalidades").select("grupo_id, status"),
  ]);

  return (gruposData ?? []).map((g) => {
    const ms = (mensalidadesData ?? [])
      .filter((m) => m.grupo_id === g.id)
      .map(mapMensalidade);
    return { ...mapGrupo(g), farol: computeFarol(ms) };
  });
}

// ── Mutations: Grupos ─────────────────────────────────────────────────────────

export type GrupoInput = {
  nome: string;
  descricao: string;
  diaSemana: string;
  horario: string;
  paroquia: string;
  endereco: Grupo["endereco"];
  status?: Grupo["status"];
  coordenadorId?: string;
  secretarioId?: string;
  tesoureiroId?: string;
  fundadoEm?: string;
};

export async function createGrupo(input: GrupoInput): Promise<Grupo> {
  const id = `g-${Date.now()}`;
  const { data, error } = await supabase
    .from("grupos")
    .insert({
      id,
      nome: input.nome,
      descricao: input.descricao,
      dia_semana: input.diaSemana,
      horario: input.horario,
      paroquia: input.paroquia,
      endereco: input.endereco,
      status: input.status ?? "pendente",
      coordenador_id: input.coordenadorId ?? null,
      secretario_id: input.secretarioId ?? null,
      tesoureiro_id: input.tesoureiroId ?? null,
      fundado_em: input.fundadoEm ?? new Date().toISOString().slice(0, 10),
      total_servos: 0,
    })
    .select()
    .single();
  if (error) throw error;
  return mapGrupo(data);
}

export async function updateGrupo(id: string, input: Partial<GrupoInput>): Promise<Grupo> {
  const patch: Record<string, unknown> = {};
  if (input.nome !== undefined) patch.nome = input.nome;
  if (input.descricao !== undefined) patch.descricao = input.descricao;
  if (input.diaSemana !== undefined) patch.dia_semana = input.diaSemana;
  if (input.horario !== undefined) patch.horario = input.horario;
  if (input.paroquia !== undefined) patch.paroquia = input.paroquia;
  if (input.endereco !== undefined) patch.endereco = input.endereco;
  if (input.status !== undefined) patch.status = input.status;
  if (input.fundadoEm !== undefined) patch.fundado_em = input.fundadoEm;
  if (input.coordenadorId !== undefined) patch.coordenador_id = input.coordenadorId;
  if (input.secretarioId !== undefined) patch.secretario_id = input.secretarioId;
  if (input.tesoureiroId !== undefined) patch.tesoureiro_id = input.tesoureiroId;
  const { data, error } = await supabase.from("grupos").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return mapGrupo(data);
}

export async function deleteGrupo(id: string): Promise<void> {
  const { error } = await supabase.from("grupos").delete().eq("id", id);
  if (error) throw error;
}

// Atribui os 3 responsáveis (coordenador, secretario, tesoureiro) ao grupo,
// sincronizando profile.role e profile.grupo_id de cada um.
export async function assignResponsaveisGrupo(
  grupoId: string,
  ids: { coordenadorId?: string | null; secretarioId?: string | null; tesoureiroId?: string | null },
): Promise<void> {
  // 1. Lê estado atual para limpar antigos
  const { data: current } = await supabase
    .from("grupos")
    .select("coordenador_id, secretario_id, tesoureiro_id")
    .eq("id", grupoId)
    .single();

  const oldCoord = (current?.coordenador_id as string | null) ?? null;
  const oldSec = (current?.secretario_id as string | null) ?? null;
  const oldTes = (current?.tesoureiro_id as string | null) ?? null;

  const newCoord = ids.coordenadorId ?? null;
  const newSec = ids.secretarioId ?? null;
  const newTes = ids.tesoureiroId ?? null;

  // 2. Atualiza grupo
  const { error: grupoErr } = await supabase
    .from("grupos")
    .update({
      coordenador_id: newCoord,
      secretario_id: newSec,
      tesoureiro_id: newTes,
    })
    .eq("id", grupoId);
  if (grupoErr) throw grupoErr;

  // 3. Limpa grupo_id dos antigos que saíram (mantém role anterior)
  const removidos = [oldCoord, oldSec, oldTes].filter(
    (id): id is string => !!id && id !== newCoord && id !== newSec && id !== newTes,
  );
  if (removidos.length > 0) {
    await supabase.from("profiles").update({ grupo_id: null }).in("id", removidos);
  }

  // 4. Atualiza role + grupo_id dos novos atribuídos
  const updates: Array<{ id: string; role: User["role"] }> = [];
  if (newCoord) updates.push({ id: newCoord, role: "coordenador" });
  if (newSec) updates.push({ id: newSec, role: "secretario" });
  if (newTes) updates.push({ id: newTes, role: "tesoureiro" });

  for (const u of updates) {
    await supabase.from("profiles").update({ role: u.role, grupo_id: grupoId }).eq("id", u.id);
  }
}

export async function approveGrupo(id: string): Promise<void> {
  const { error } = await supabase.from("grupos").update({ status: "aprovado" }).eq("id", id);
  if (error) throw error;
}

export async function rejectGrupo(id: string): Promise<void> {
  const { error } = await supabase.from("grupos").update({ status: "rejeitado" }).eq("id", id);
  if (error) throw error;
}

// ── Mutations: Servos ─────────────────────────────────────────────────────────

export type ServoInput = {
  grupoId: string;
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  endereco: Servo["endereco"];
  funcao: string;
  etapasFormativas: Servo["etapasFormativas"];
  ministerios: Servo["ministerios"];
  ingressoEm: string;
};

export async function createServo(input: ServoInput): Promise<Servo> {
  const id = `s-${Date.now()}`;
  const { data, error } = await supabase
    .from("servos")
    .insert({
      id,
      grupo_id: input.grupoId,
      nome: input.nome,
      email: input.email,
      telefone: input.telefone,
      data_nascimento: input.dataNascimento,
      endereco: input.endereco,
      funcao: input.funcao,
      etapas_formativas: input.etapasFormativas,
      ministerios: input.ministerios,
      ingresso_em: input.ingressoEm,
    })
    .select()
    .single();
  if (error) throw error;
  return mapServo(data);
}

export async function updateServo(id: string, input: Partial<ServoInput>): Promise<Servo> {
  const patch: Record<string, unknown> = {};
  if (input.nome !== undefined) patch.nome = input.nome;
  if (input.email !== undefined) patch.email = input.email;
  if (input.telefone !== undefined) patch.telefone = input.telefone;
  if (input.dataNascimento !== undefined) patch.data_nascimento = input.dataNascimento;
  if (input.endereco !== undefined) patch.endereco = input.endereco;
  if (input.funcao !== undefined) patch.funcao = input.funcao;
  if (input.etapasFormativas !== undefined) patch.etapas_formativas = input.etapasFormativas;
  if (input.ministerios !== undefined) patch.ministerios = input.ministerios;
  if (input.ingressoEm !== undefined) patch.ingresso_em = input.ingressoEm;
  const { data, error } = await supabase.from("servos").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return mapServo(data);
}

export async function deleteServo(id: string): Promise<void> {
  const { error } = await supabase.from("servos").delete().eq("id", id);
  if (error) throw error;
}

// ── Mutations: Eventos ────────────────────────────────────────────────────────

export type EventoInput = {
  titulo: string;
  descricao: string;
  tipo: Evento["tipo"];
  status: Evento["status"];
  data: string;
  horaInicio: string;
  horaFim: string;
  local: string;
  cidade: string;
  vagas: number;
  organizador: string;
};

export async function createEvento(input: EventoInput): Promise<Evento> {
  const id = `e-${Date.now()}`;
  const { data, error } = await supabase
    .from("eventos")
    .insert({
      id,
      titulo: input.titulo,
      descricao: input.descricao,
      tipo: input.tipo,
      status: input.status,
      data: input.data,
      hora_inicio: input.horaInicio,
      hora_fim: input.horaFim,
      local: input.local,
      cidade: input.cidade,
      vagas: input.vagas,
      organizador: input.organizador,
      inscritos: [],
    })
    .select()
    .single();
  if (error) throw error;
  return mapEvento(data);
}

export async function updateEvento(id: string, input: Partial<EventoInput>): Promise<Evento> {
  const patch: Record<string, unknown> = {};
  if (input.titulo !== undefined) patch.titulo = input.titulo;
  if (input.descricao !== undefined) patch.descricao = input.descricao;
  if (input.tipo !== undefined) patch.tipo = input.tipo;
  if (input.status !== undefined) patch.status = input.status;
  if (input.data !== undefined) patch.data = input.data;
  if (input.horaInicio !== undefined) patch.hora_inicio = input.horaInicio;
  if (input.horaFim !== undefined) patch.hora_fim = input.horaFim;
  if (input.local !== undefined) patch.local = input.local;
  if (input.cidade !== undefined) patch.cidade = input.cidade;
  if (input.vagas !== undefined) patch.vagas = input.vagas;
  if (input.organizador !== undefined) patch.organizador = input.organizador;
  const { data, error } = await supabase.from("eventos").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return mapEvento(data);
}

export async function deleteEvento(id: string): Promise<void> {
  const { error } = await supabase.from("eventos").delete().eq("id", id);
  if (error) throw error;
}

// ── Mutations: Mensalidades / Storage ─────────────────────────────────────────

export async function updateMensalidadeStatus(
  id: string,
  status: Mensalidade["status"],
  extras: { dataPagamento?: string; comprovanteUrl?: string } = {},
): Promise<void> {
  const patch: Record<string, unknown> = { status };
  if (extras.dataPagamento) patch.data_pagamento = extras.dataPagamento;
  if (extras.comprovanteUrl) patch.comprovante_url = extras.comprovanteUrl;
  const { error } = await supabase.from("mensalidades").update(patch).eq("id", id);
  if (error) throw error;
}

export async function updateMensalidade(
  id: string,
  patch: {
    tipo?: TipoCobranca;
    descricao?: string | null;
    mes?: number;
    ano?: number;
    valor?: number;
    vencimento?: string;
  },
): Promise<void> {
  const row: Record<string, unknown> = {};
  if (patch.tipo !== undefined) row.tipo = patch.tipo;
  if (patch.descricao !== undefined) row.descricao = patch.descricao;
  if (patch.mes !== undefined) row.mes = patch.mes;
  if (patch.ano !== undefined) row.ano = patch.ano;
  if (patch.valor !== undefined) row.valor = patch.valor;
  if (patch.vencimento !== undefined) row.vencimento = patch.vencimento;
  const { error } = await supabase.from("mensalidades").update(row).eq("id", id);
  if (error) throw error;
}

export async function deleteMensalidade(id: string): Promise<void> {
  const { error } = await supabase.from("mensalidades").delete().eq("id", id);
  if (error) throw error;
}

export async function createMensalidadesLote(items: {
  grupoId: string;
  tipo: TipoCobranca;
  descricao?: string;
  mes: number;
  ano: number;
  valor: number;
  vencimento: string;
}[]): Promise<void> {
  const rows = items.map((item) => ({
    id: crypto.randomUUID(),
    grupo_id: item.grupoId,
    tipo: item.tipo,
    descricao: item.descricao ?? null,
    mes: item.mes,
    ano: item.ano,
    valor: item.valor,
    vencimento: item.vencimento,
    status: "pendente",
  }));
  const { error } = await supabase.from("mensalidades").insert(rows);
  if (error) throw error;
}

export async function createRecibo(input: {
  grupoId: string;
  valor: number;
  descricao: string;
}): Promise<Recibo> {
  const now = new Date();
  const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const suffix = crypto.randomUUID().slice(0, 5).toUpperCase();
  const codigo = `REC-${yyyymm}-${suffix}`;
  const { data, error } = await supabase
    .from("recibos")
    .insert({
      id: crypto.randomUUID(),
      codigo,
      grupo_id: input.grupoId,
      valor: input.valor,
      descricao: input.descricao,
      emitido_em: now.toISOString().slice(0, 10),
    })
    .select()
    .single();
  if (error) throw error;
  return mapRecibo(data as Record<string, unknown>);
}

export async function uploadComprovante(file: File, mensalidadeId: string): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `comprovantes/${mensalidadeId}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("comprovantes")
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from("comprovantes").getPublicUrl(path);
  return data.publicUrl;
}

// ── Mappers: Usuários ─────────────────────────────────────────────────────────

function normalizeRole(raw: unknown): User["role"] {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""); // remove combining marks (acentos)
  if (s === "secretaria" || s === "secretario") return "secretario";
  if (s === "tesoureira" || s === "tesoureiro") return "tesoureiro";
  if (s === "coordenadora" || s === "coordenador") return "coordenador";
  if (s === "admin" || s === "administrador" || s === "administradora") return "admin";
  return "coordenador";
}

function mapUser(r: Record<string, unknown>): User {
  return {
    id: r.id as string,
    nome: r.nome as string,
    email: r.email as string,
    role: normalizeRole(r.role),
    grupoId: (r.grupo_id as string | null) ?? undefined,
    avatar: (r.avatar as string | null) ?? undefined,
    status: ((r.status as User["status"] | null) ?? "aprovado") as User["status"],
  };
}

// ── Queries: Usuários ─────────────────────────────────────────────────────────

export async function getUsuarios(): Promise<User[]> {
  const { data, error } = await supabase.from("profiles").select("*").order("nome");
  if (error) throw error;
  return (data ?? []).map(mapUser);
}

// ── Mutations: Usuários ────────────────────────────────────────────────────────

const ROLE_FIELD: Partial<Record<User["role"], string>> = {
  coordenador: "coordenador_id",
  tesoureiro: "tesoureiro_id",
  secretario: "secretario_id",
};

async function syncGrupoRole(
  userId: string,
  role: User["role"],
  newGrupoId: string | null,
  oldGrupoId: string | null,
  oldRole?: User["role"],
) {
  const newField = ROLE_FIELD[role];
  const oldField = oldRole ? ROLE_FIELD[oldRole] : newField;

  // Remove do grupo antigo (apenas se este usuário ainda estava lá)
  if (oldGrupoId && oldField && oldGrupoId !== newGrupoId) {
    await supabase.from("grupos").update({ [oldField]: null }).eq("id", oldGrupoId).eq(oldField, userId);
  }

  // Atualiza o grupo novo
  if (newGrupoId && newField) {
    await supabase.from("grupos").update({ [newField]: userId }).eq("id", newGrupoId);
  }
}

export async function createUsuario(input: {
  nome: string;
  email: string;
  password: string;
  role: User["role"];
  grupoId?: string;
}): Promise<void> {
  const { data, error } = await supabase.functions.invoke("admin-users", {
    body: { action: "create", ...input },
  });
  if (error) throw error;

  // Vincula o usuário ao campo correto do grupo (coordenador/tesoureiro/secretario)
  const userId = (data as { id?: string } | null)?.id;
  if (userId && input.grupoId) {
    await syncGrupoRole(userId, input.role, input.grupoId, null);
  }
}

export async function updateUsuario(
  id: string,
  input: { nome?: string; role?: User["role"]; grupoId?: string | null },
): Promise<void> {
  // Busca estado atual para saber o grupo e role anteriores
  const { data: current } = await supabase
    .from("profiles")
    .select("grupo_id, role")
    .eq("id", id)
    .single();

  const patch: Record<string, unknown> = {};
  if (input.nome !== undefined) patch.nome = input.nome;
  if (input.role !== undefined) patch.role = input.role;
  if ("grupoId" in input) patch.grupo_id = input.grupoId ?? null;
  const { error } = await supabase.from("profiles").update(patch).eq("id", id);
  if (error) throw error;

  const oldRole = current?.role as User["role"] | undefined;
  const oldGrupoId: string | null = current?.grupo_id ?? null;
  const newRole = input.role ?? oldRole;
  const newGrupoId: string | null = "grupoId" in input ? (input.grupoId ?? null) : oldGrupoId;

  if (newRole && (newGrupoId !== oldGrupoId || input.role !== undefined)) {
    await syncGrupoRole(id, newRole, newGrupoId, oldGrupoId, oldRole);
  }
}

export async function deleteUsuario(id: string): Promise<void> {
  const { error } = await supabase.functions.invoke("admin-users", {
    body: { action: "delete", userId: id },
  });
  if (error) throw error;
}

// ── Cadastros pendentes (auto-cadastro aguardando aprovação) ─────────────────

export async function getUsuariosPendentes(): Promise<User[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("status", "pendente")
    .order("nome");
  if (error) throw error;
  return (data ?? []).map(mapUser);
}

export async function approveUsuario(id: string): Promise<void> {
  // Lê role + grupo_id do perfil antes de aprovar para sincronizar com o grupo.
  const { data: profile, error: readError } = await supabase
    .from("profiles")
    .select("role, grupo_id")
    .eq("id", id)
    .single();
  if (readError) throw readError;

  const { error } = await supabase
    .from("profiles")
    .update({ status: "aprovado" })
    .eq("id", id);
  if (error) throw error;

  const role = normalizeRole(profile?.role);
  const grupoId = (profile?.grupo_id as string | null) ?? null;
  if (grupoId && role !== "admin") {
    await syncGrupoRole(id, role, grupoId, null);
  }
}

export async function rejectUsuario(id: string): Promise<void> {
  // Marca como rejeitado e remove do auth para liberar o e-mail.
  await supabase.from("profiles").update({ status: "rejeitado" }).eq("id", id);
  const { error } = await supabase.functions.invoke("admin-users", {
    body: { action: "delete", userId: id },
  });
  if (error) throw error;
}

// Lista mínima de grupos aprovados para a tela pública de cadastro.
export async function getGruposPublicos(): Promise<{ id: string; nome: string; paroquia: string | null }[]> {
  const { data, error } = await supabase
    .from("grupos")
    .select("id, nome, paroquia")
    .eq("status", "aprovado")
    .order("nome");
  if (error) throw error;
  return (data ?? []).map((g) => ({
    id: g.id as string,
    nome: g.nome as string,
    paroquia: (g.paroquia as string | null) ?? null,
  }));
}
