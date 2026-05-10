import type { Grupo, User, UserRole } from "./types";

export type GrupoRole = "admin" | "coordenador" | "secretario" | "tesoureiro";

type GrupoLike = Pick<Grupo, "id" | "coordenadorId" | "secretarioId" | "tesoureiroId">;

export function getGrupoRole(user: User | null | undefined, grupo: GrupoLike | null | undefined): GrupoRole | null {
  if (!user || !grupo) return null;
  if (user.role === "admin") return "admin";
  if (grupo.coordenadorId === user.id) return "coordenador";
  if (grupo.secretarioId === user.id) return "secretario";
  if (grupo.tesoureiroId === user.id) return "tesoureiro";
  return null;
}

export function canAccessGrupo(user: User | null | undefined, grupo: GrupoLike | null | undefined): boolean {
  return getGrupoRole(user, grupo) !== null;
}

export function canAccessFinanceiro(user: User | null | undefined, grupo: GrupoLike | null | undefined): boolean {
  const r = getGrupoRole(user, grupo);
  return r === "admin" || r === "coordenador" || r === "tesoureiro";
}

export function canAccessGestao(user: User | null | undefined, grupo: GrupoLike | null | undefined): boolean {
  const r = getGrupoRole(user, grupo);
  return r === "admin" || r === "coordenador" || r === "secretario";
}

export function canManageGrupo(user: User | null | undefined, grupo: GrupoLike | null | undefined): boolean {
  const r = getGrupoRole(user, grupo);
  return r === "admin" || r === "coordenador";
}

export function canAssignResponsaveis(user: User | null | undefined): boolean {
  return user?.role === "admin";
}

// Role-only checks (sem precisar do grupo carregado, p/ uso em sidebar/menus)
export function roleCanFinanceiro(role: UserRole | undefined): boolean {
  return role === "admin" || role === "coordenador" || role === "tesoureiro";
}

export function roleCanGestao(role: UserRole | undefined): boolean {
  return role === "admin" || role === "coordenador" || role === "secretario";
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  coordenador: "Coordenador",
  secretario: "Secretário",
  tesoureiro: "Tesoureiro",
};

export const ROLE_DESCRICOES: Record<Exclude<UserRole, "admin">, string> = {
  coordenador: "Acesso total ao grupo, incluindo gestão e financeiro.",
  secretario: "Gestão do grupo (servos, eventos). Sem acesso financeiro.",
  tesoureiro: "Acesso exclusivo ao financeiro (pagamentos, comprovantes, farol).",
};
