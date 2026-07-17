import AsyncStorage from "@react-native-async-storage/async-storage";

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

const CHAVE_EVENTOS = "@rota_cmb_eventos";

function gerarIdEvento() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function obterHorarioAtual() {
  return new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function listarEventosRota(): Promise<
  EventoRota[]
> {
  try {
    const eventosSalvos =
      await AsyncStorage.getItem(CHAVE_EVENTOS);

    if (!eventosSalvos) {
      return [];
    }

    return JSON.parse(eventosSalvos) as EventoRota[];
  } catch (erro) {
    console.log(
      "Erro ao listar eventos da rota:",
      erro,
    );

    return [];
  }
}

export async function registrarEventoRota(
  evento: Omit<
    EventoRota,
    "id" | "criadoEm" | "horario"
  > & {
    horario?: string;
  },
): Promise<EventoRota> {
  const eventosAtuais =
    await listarEventosRota();

  const novoEvento: EventoRota = {
    ...evento,
    id: gerarIdEvento(),
    criadoEm: new Date().toISOString(),
    horario:
      evento.horario ?? obterHorarioAtual(),
  };

  const listaAtualizada = [
    ...eventosAtuais,
    novoEvento,
  ];

  await AsyncStorage.setItem(
    CHAVE_EVENTOS,
    JSON.stringify(listaAtualizada),
  );

  return novoEvento;
}

export async function listarEventosPorViagem(
  viagemId: number,
): Promise<EventoRota[]> {
  const eventos = await listarEventosRota();

  return eventos
    .filter(
      (evento) =>
        evento.viagemId === viagemId,
    )
    .sort(
      (a, b) =>
        new Date(a.criadoEm).getTime() -
        new Date(b.criadoEm).getTime(),
    );
}

export async function listarEventosPorAluno(
  alunoId: number,
): Promise<EventoRota[]> {
  const eventos = await listarEventosRota();

  return eventos
    .filter(
      (evento) =>
        evento.alunoId === alunoId,
    )
    .sort(
      (a, b) =>
        new Date(a.criadoEm).getTime() -
        new Date(b.criadoEm).getTime(),
    );
}

export async function listarEventosDoAlunoNaViagem(
  viagemId: number,
  alunoId: number,
): Promise<EventoRota[]> {
  const eventos = await listarEventosRota();

  return eventos
    .filter(
      (evento) =>
        evento.viagemId === viagemId &&
        evento.alunoId === alunoId,
    )
    .sort(
      (a, b) =>
        new Date(a.criadoEm).getTime() -
        new Date(b.criadoEm).getTime(),
    );
}

export async function obterUltimoEventoDoAlunoNaViagem(
  viagemId: number,
  alunoId: number,
): Promise<EventoRota | null> {
  const eventos =
    await listarEventosDoAlunoNaViagem(
      viagemId,
      alunoId,
    );

  if (eventos.length === 0) {
    return null;
  }

  return eventos[eventos.length - 1];
}

export async function limparEventosRota() {
  await AsyncStorage.removeItem(
    CHAVE_EVENTOS,
  );
}