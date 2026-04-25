import type {
  Grupo,
  Servo,
  Mensalidade,
  Evento,
  Recibo,
  User,
  FarolStatus,
} from "./types";

// E-mails reconhecidos como Administradores Gerais do sistema.
// Quando o Lovable Cloud for ativado, estes usuários serão provisionados
// automaticamente com a role "admin" via trigger no signup.
export const ADMIN_EMAILS: readonly string[] = [
  "fabricio.christian@hotmail.com",
  "carpinteria.ia.sj@gmail.com",
] as const;

export const adminUsers: User[] = [
  {
    id: "u-admin-1",
    nome: "Fabrício Christian",
    email: "fabricio.christian@hotmail.com",
    role: "admin",
  },
  {
    id: "u-admin-2",
    nome: "Carpintaria IA SJ",
    email: "carpinteria.ia.sj@gmail.com",
    role: "admin",
  },
];

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export const currentUser: User = adminUsers[0];

export const grupos: Grupo[] = [
  {
    id: "g-001",
    nome: "Cenáculo Pentecostes",
    descricao: "Grupo de oração da Catedral, com foco em jovens e adultos.",
    diaSemana: "Quarta-feira",
    horario: "19:30",
    endereco: {
      rua: "Praça da Sé",
      numero: "50",
      bairro: "Centro",
      cidade: "Barreiras",
      estado: "BA",
      cep: "47800-000",
    },
    coordenadorId: "s-001",
    secretarioId: "s-002",
    tesoureiroId: "s-003",
    status: "aprovado",
    fundadoEm: "2015-05-12",
    totalServos: 24,
    paroquia: "Catedral São João Batista",
  },
  {
    id: "g-002",
    nome: "Águas Vivas",
    descricao: "Grupo voltado para casais e famílias.",
    diaSemana: "Sexta-feira",
    horario: "20:00",
    endereco: {
      rua: "Rua das Flores",
      numero: "120",
      bairro: "Vila Nova",
      cidade: "Barreiras",
      estado: "BA",
      cep: "47802-100",
    },
    coordenadorId: "s-004",
    secretarioId: "s-005",
    tesoureiroId: "s-006",
    status: "aprovado",
    fundadoEm: "2018-03-20",
    totalServos: 18,
    paroquia: "Paróquia Sagrado Coração",
  },
  {
    id: "g-003",
    nome: "Fogo do Espírito",
    descricao: "Grupo jovem da Paróquia São José.",
    diaSemana: "Terça-feira",
    horario: "19:00",
    endereco: {
      rua: "Av. ACM",
      numero: "1500",
      bairro: "Sandra Regina",
      cidade: "Barreiras",
      estado: "BA",
      cep: "47805-000",
    },
    coordenadorId: "s-007",
    status: "aprovado",
    fundadoEm: "2020-08-01",
    totalServos: 32,
    paroquia: "Paróquia São José",
  },
  {
    id: "g-004",
    nome: "Maranatha",
    descricao: "Novo grupo de oração do Bairro Barreirinhas.",
    diaSemana: "Quinta-feira",
    horario: "19:30",
    endereco: {
      rua: "Rua São Pedro",
      numero: "78",
      bairro: "Barreirinhas",
      cidade: "Barreiras",
      estado: "BA",
      cep: "47810-200",
    },
    coordenadorId: "s-008",
    secretarioId: "s-009",
    tesoureiroId: "s-010",
    status: "pendente",
    fundadoEm: "2025-03-01",
    totalServos: 8,
    paroquia: "Paróquia Nossa Senhora Aparecida",
  },
  {
    id: "g-005",
    nome: "Vinde Espírito Santo",
    descricao: "Grupo da Paróquia Santa Rita.",
    diaSemana: "Segunda-feira",
    horario: "19:30",
    endereco: {
      rua: "Rua Santa Rita",
      numero: "300",
      bairro: "Recanto dos Pássaros",
      cidade: "Barreiras",
      estado: "BA",
      cep: "47820-500",
    },
    coordenadorId: "s-011",
    status: "pendente",
    fundadoEm: "2025-02-15",
    totalServos: 6,
    paroquia: "Paróquia Santa Rita",
  },
];

const nomesServos = [
  "Maria das Graças Souza",
  "João Batista Lima",
  "Ana Cláudia Pereira",
  "Pedro Henrique Santos",
  "Mariana Oliveira",
  "Carlos Eduardo Rocha",
  "Luciana Ferreira",
  "Rafael Mendes",
  "Beatriz Cardoso",
  "Tiago Almeida",
  "Helena Costa",
  "Marcos Vinícius",
];

export const servos: Servo[] = nomesServos.flatMap((nome, i) => {
  const grupoId = grupos[i % 3].id;
  return [
    {
      id: `s-${String(i + 1).padStart(3, "0")}`,
      grupoId,
      nome,
      email: `${nome.split(" ")[0].toLowerCase()}@email.com`,
      telefone: `(77) 9${String(8000 + i).padStart(4, "0")}-${String(1000 + i * 13).slice(-4)}`,
      dataNascimento: `198${i % 10}-0${(i % 9) + 1}-1${i % 9}`,
      endereco: {
        rua: "Rua das Acácias",
        numero: String(100 + i),
        bairro: "Centro",
        cidade: "Barreiras",
        estado: "BA",
        cep: "47800-000",
      },
      funcao:
        i === 0
          ? "Coordenador(a)"
          : i === 1
            ? "Secretário(a)"
            : i === 2
              ? "Tesoureiro(a)"
              : "Servo(a)",
      etapaFormativa:
        i % 5 === 0
          ? "Discipulado"
          : i % 4 === 0
            ? "Maturidade"
            : i % 3 === 0
              ? "Crescimento"
              : i % 2 === 0
                ? "Seminário Vida no Espírito Santo"
                : "Iniciante",
      ministerios:
        i % 3 === 0
          ? ["Música", "Pregação"]
          : i % 3 === 1
            ? ["Intercessão", "Acolhida"]
            : ["Jovens", "Comunicação"],
      ingressoEm: `202${i % 5}-0${(i % 9) + 1}-15`,
    },
  ];
});

const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export const nomesMeses = meses;

export const mensalidades: Mensalidade[] = grupos
  .filter((g) => g.status === "aprovado")
  .flatMap((g, gi) =>
    Array.from({ length: 6 }, (_, i) => {
      const mes = i + 1;
      const status =
        i < 3 ? "pago" : i === 3 ? "validacao" : i === 4 ? "pendente" : "atrasado";
      return {
        id: `m-${g.id}-${mes}`,
        grupoId: g.id,
        mes,
        ano: 2025,
        valor: 50,
        vencimento: `2025-${String(mes).padStart(2, "0")}-10`,
        status: status as Mensalidade["status"],
        dataPagamento: status === "pago" ? `2025-${String(mes).padStart(2, "0")}-08` : undefined,
        codigoBarras: "23793.38128 60082.179171 38000.063305 1 95820000005000",
      };
    }),
  );

export const recibos: Recibo[] = mensalidades
  .filter((m) => m.status === "pago")
  .map((m, i) => ({
    id: `r-${i + 1}`,
    codigo: `REC-2025-${String(i + 1).padStart(4, "0")}`,
    grupoId: m.grupoId,
    valor: m.valor,
    descricao: `Mensalidade ${nomesMeses[m.mes - 1]}/${m.ano}`,
    emitidoEm: m.dataPagamento!,
  }));

export const eventos: Evento[] = [
  {
    id: "e-001",
    titulo: "Assembleia Diocesana 2025",
    descricao: "Assembleia anual dos coordenadores e servos da RCC Diocesana.",
    tipo: "Assembleia",
    status: "agendado",
    data: "2025-06-21",
    horaInicio: "08:00",
    horaFim: "17:00",
    local: "Centro Diocesano de Eventos",
    cidade: "Barreiras",
    vagas: 200,
    inscritos: ["s-001", "s-002", "s-003", "s-004"],
    organizador: "RCC Diocesana de Barreiras",
  },
  {
    id: "e-002",
    titulo: "Congresso de Renovação 2025",
    descricao: "Congresso regional com pregadores nacionais.",
    tipo: "Congresso",
    status: "agendado",
    data: "2025-09-12",
    horaInicio: "08:00",
    horaFim: "22:00",
    local: "Estádio Geraldão",
    cidade: "Barreiras",
    vagas: 1500,
    inscritos: Array.from({ length: 12 }, (_, i) => `s-${String(i + 1).padStart(3, "0")}`),
    organizador: "RCC Diocesana de Barreiras",
  },
  {
    id: "e-003",
    titulo: "Cenáculo de Pentecostes",
    descricao: "Cenáculo com vigília de oração na noite de Pentecostes.",
    tipo: "Cenáculo",
    status: "agendado",
    data: "2025-06-07",
    horaInicio: "19:00",
    horaFim: "23:00",
    local: "Catedral São João Batista",
    cidade: "Barreiras",
    vagas: 300,
    inscritos: Array.from({ length: 8 }, (_, i) => `s-${String(i + 1).padStart(3, "0")}`),
    organizador: "Catedral",
  },
  {
    id: "e-004",
    titulo: "Encontro de Jovens",
    descricao: "Encontro voltado para jovens dos grupos de oração.",
    tipo: "Encontro",
    status: "concluido",
    data: "2025-03-15",
    horaInicio: "14:00",
    horaFim: "21:00",
    local: "Salão Paroquial São José",
    cidade: "Barreiras",
    vagas: 120,
    inscritos: Array.from({ length: 6 }, (_, i) => `s-${String(i + 1).padStart(3, "0")}`),
    organizador: "Paróquia São José",
  },
  {
    id: "e-005",
    titulo: "Caravana ao Hosana Brasil",
    descricao: "Caravana com saída de Barreiras para o evento nacional.",
    tipo: "Caravana",
    status: "agendado",
    data: "2025-10-10",
    horaInicio: "06:00",
    horaFim: "23:59",
    local: "Aparecida do Norte/SP",
    cidade: "Aparecida",
    vagas: 45,
    inscritos: Array.from({ length: 4 }, (_, i) => `s-${String(i + 1).padStart(3, "0")}`),
    organizador: "RCC Diocesana de Barreiras",
  },
];

export function getFarolStatus(grupoId: string): FarolStatus {
  const ms = mensalidades.filter((m) => m.grupoId === grupoId);
  const atrasadas = ms.filter((m) => m.status === "atrasado").length;
  const pendentes = ms.filter((m) => m.status === "pendente").length;
  if (atrasadas >= 2) return "vermelho";
  if (atrasadas >= 1 || pendentes >= 2) return "amarelo";
  return "verde";
}

export function getGrupoById(id: string) {
  return grupos.find((g) => g.id === id);
}

export function getServoById(id: string) {
  return servos.find((s) => s.id === id);
}

export function getServosByGrupo(grupoId: string) {
  return servos.filter((s) => s.grupoId === grupoId);
}

export function getMensalidadesByGrupo(grupoId: string) {
  return mensalidades.filter((m) => m.grupoId === grupoId);
}

export const stats = {
  totalGrupos: grupos.filter((g) => g.status === "aprovado").length,
  totalServos: servos.length,
  mensalidadesEmDia: mensalidades.filter((m) => m.status === "pago").length,
  mensalidadesAtraso: mensalidades.filter((m) => m.status === "atrasado").length,
  pendentes: grupos.filter((g) => g.status === "pendente"),
};
