export type UserRole = "admin" | "coordenador" | "tesoureiro" | "secretario";

export type UserStatus = "pendente" | "aprovado" | "rejeitado";

export interface User {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  grupoId?: string;
  avatar?: string;
  status: UserStatus;
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

export const ETAPAS_FORMATIVAS = {
  "Etapa 1": [
    "Seminário de Vida no Espírito Santo",
    "Experiência de Oração",
    "Aprofundamento de Dons",
  ],
  "Etapa 2": [
    "Vida Cristã 1",
    "Identidade",
    "Jesus, Senhor e Mestre",
    "Vida no Espírito Santo",
    "Grupo de Oração",
    "Vida de Oração",
    "Carismas e Dons do Espírito",
    "Igreja",
    "Vida Cristã 2",
  ],
  "Etapa 3": [
    "Pregação",
    "Música",
    "Intercessão",
    "Jovens",
    "Família",
    "Comunicação",
    "Crianças e Adolescentes",
    "Promoção Humana",
  ],
} as const;

export type EtapaFormativa =
  | (typeof ETAPAS_FORMATIVAS)["Etapa 1"][number]
  | (typeof ETAPAS_FORMATIVAS)["Etapa 2"][number]
  | (typeof ETAPAS_FORMATIVAS)["Etapa 3"][number];

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
  etapasFormativas: EtapaFormativa[];
  ministerios: Ministerio[];
  avatar?: string;
  ingressoEm: string;
}

export type StatusPagamento = "pago" | "pendente" | "atrasado" | "validacao";

export const TIPOS_COBRANCA = [
  { value: "mensalidade", label: "Mensalidade" },
  { value: "taxa_evento", label: "Taxa de Evento" },
  { value: "contribuicao_especial", label: "Contribuição Especial" },
  { value: "taxa_formacao", label: "Taxa de Formação" },
  { value: "outro", label: "Outro" },
] as const;

export type TipoCobranca = typeof TIPOS_COBRANCA[number]["value"];

export interface Mensalidade {
  id: string;
  grupoId: string;
  mes: number;
  ano: number;
  valor: number;
  vencimento: string;
  status: StatusPagamento;
  tipo?: TipoCobranca;
  descricao?: string;
  dataPagamento?: string;
  comprovanteUrl?: string;
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
