export type Perfil = "gestor" | "motorista" | "responsavel";

export type Usuario = {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  perfil: Perfil;
  /** Só usado ao criar/atualizar a conta — a API nunca devolve senha. */
  senha?: string;
};

export type Responsavel = Usuario & {
  perfil: "responsavel";
};

export type Motorista = Usuario & {
  perfil: "motorista";
};

export type Aluno = {
  id: number;
  nome: string;
  serie: string;
  turno: string;
  ponto: string;
  responsavelId: number | null;
};

export type Ponto = {
  id: number;
  nome: string;
  referencia: string;
  horario: string;
  ordem: number;
};

export type SentidoViagem = "ida" | "volta";

export type StatusViagem =
  | "programada"
  | "em-andamento"
  | "finalizada"
  | "cancelada";

export type Viagem = {
  id: number;
  data: string;
  sentido: SentidoViagem;
  turno: string;
  horario: string;
  motorista: string;
  status: StatusViagem;
};

export type SituacaoEmbarque =
  | "aguardando"
  | "embarcou"
  | "desembarcou"
  | "ausente"
  | "revisitar"
  | "nao-localizado"
  | "cancelado";

export type ConfirmacaoResponsavel =
  | "aguardando"
  | "vai"
  | "nao-vai"
  | "nao-sei";

export type RegistroEmbarque = {
  id: number;
  situacao: SituacaoEmbarque;
  horarioSituacao?: string;
};

export type AlunoMotorista = Aluno & {
  situacao: SituacaoEmbarque;
  confirmacaoResponsavel: ConfirmacaoResponsavel;
  ordemPonto: number;
  horarioSituacao?: string;
};

export type RegistroChegada = {
  viagemId: number;
  horario: string;
  dataHora: string;
  sentido: SentidoViagem;
  destino: string;
};

export type TipoAviso = "atraso" | "mudanca-ponto" | "geral";

export type Aviso = {
  id: string;
  viagemId?: number;
  tipo: TipoAviso;
  mensagem: string;
  criadoEm: string;
  autorId: number | string;
};

export type {
  EventoRota,
  PerfilAutorEvento,
  TipoEventoRota,
} from "@/services/rota-events";
