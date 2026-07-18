import { apiClient } from "@/data/api-client";

export type TipoEventoRota =
  | "viagem_criada"
  | "viagem_iniciada"
  | "confirmacao_atualizada"
  | "aluno_embarcou"
  | "aluno_revisitar"
  | "aluno_ausente"
  | "aluno_nao_localizado"
  | "aluno_desembarcou"
  | "chegada_cmb"
  | "viagem_finalizada"
  | "viagem_cancelada";

export type PerfilAutorEvento =
  | "gestor"
  | "motorista"
  | "responsavel"
  | "sistema";

export type EventoRota = {
  id: string;
  tipo: TipoEventoRota;
  viagemId: number;
  alunoId?: number;
  autorId?: number | string;
  perfilAutor: PerfilAutorEvento;
  criadoEm: string;
  horario: string;
  ponto?: string;
  observacao?: string;
  detalhes?: Record<string, unknown>;
};

function obterHorarioAtual() {
  return new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function registrarEventoRota(
  evento: Omit<EventoRota, "id" | "criadoEm" | "horario"> & {
    horario?: string;
  },
): Promise<EventoRota> {
  return apiClient.post<EventoRota>("/api/eventos", {
    ...evento,
    horario: evento.horario ?? obterHorarioAtual(),
  });
}

export async function listarEventosPorViagem(viagemId: number): Promise<EventoRota[]> {
  return apiClient.get<EventoRota[]>("/api/eventos", { viagemId: String(viagemId) });
}

export async function listarEventosPorAluno(alunoId: number): Promise<EventoRota[]> {
  return apiClient.get<EventoRota[]>("/api/eventos", { alunoId: String(alunoId) });
}

export async function listarEventosDoAlunoNaViagem(
  viagemId: number,
  alunoId: number,
): Promise<EventoRota[]> {
  return apiClient.get<EventoRota[]>("/api/eventos", {
    viagemId: String(viagemId),
    alunoId: String(alunoId),
  });
}

export async function obterUltimoEventoDoAlunoNaViagem(
  viagemId: number,
  alunoId: number,
): Promise<EventoRota | null> {
  const eventos = await listarEventosDoAlunoNaViagem(viagemId, alunoId);
  return eventos.length > 0 ? eventos[eventos.length - 1] : null;
}
