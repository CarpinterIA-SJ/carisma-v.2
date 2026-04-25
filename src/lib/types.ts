export type UserRole = "admin" | "coordenador" | "tesoureiro" | "secretario";

export interface User {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  grupoId?: string;
  avatar?: string;
}

export type GrupoStatus = "aprovado" | "pendente" | "rejeitado";

export interface Endereco {
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface Grupo {
  id: string;
  nome: string;
  descricao: string;
  diaSemana: string;
  horario: string;
  endereco: Endereco;
  coordenadorId: string;
  secretarioId?: string;
  tesoureiroId?: string;
  status: GrupoStatus;
  fundadoEm: string;
  totalServos: number;
  paroquia: string;
}

export type EtapaFormativa =
  | "Iniciante"
  | "Seminário Vida no Espírito Santo"
  | "Crescimento"
  | "Maturidade"
  | "Discipulado";

export type Ministerio =
  | "Música"
  | "Intercessão"
  | "Pregação"
  | "Acolhida"
  | "Jovens"
  | "Crianças"
  | "Casais"
  | "Cura e Libertação"
  | "Comunicação";

export interface Servo {
  id: string;
  grupoId: string;
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  endereco: Endereco;
  funcao: string;
  etapaFormativa: EtapaFormativa;
  ministerios: Ministerio[];
  avatar?: string;
  ingressoEm: string;
}

export type StatusPagamento = "pago" | "pendente" | "atrasado" | "validacao";

export interface Mensalidade {
  id: string;
  grupoId: string;
  mes: number;
  ano: number;
  valor: number;
  vencimento: string;
  status: StatusPagamento;
  dataPagamento?: string;
  boletoUrl?: string;
  codigoBarras?: string;
}

export interface Recibo {
  id: string;
  codigo: string;
  servoId?: string;
  grupoId: string;
  valor: number;
  descricao: string;
  emitidoEm: string;
}

export type TipoEvento =
  | "Assembleia"
  | "Encontro"
  | "Congresso"
  | "Caravana"
  | "Retiro"
  | "Cenáculo";

export type StatusEvento = "agendado" | "em_andamento" | "concluido" | "cancelado";

export interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  tipo: TipoEvento;
  status: StatusEvento;
  data: string;
  horaInicio: string;
  horaFim: string;
  local: string;
  cidade: string;
  vagas: number;
  inscritos: string[];
  organizador: string;
}

export type FarolStatus = "verde" | "amarelo" | "vermelho";
