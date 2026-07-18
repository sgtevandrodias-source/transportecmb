import type { Env } from "../../_lib/env";
import type { Data } from "../_middleware";
import { erro, json } from "../../_lib/http";

type EventoRota = {
  id: string;
  tipo: string;
  viagemId: number;
  alunoId?: number;
  autorId?: number | string;
  perfilAutor: string;
  criadoEm: string;
  horario: string;
  ponto?: string;
  observacao?: string;
  detalhes?: Record<string, unknown>;
};

type LinhaEvento = {
  id: string;
  tipo: string;
  viagem_id: number;
  aluno_id: number | null;
  autor_id: string | null;
  perfil_autor: string;
  criado_em: string;
  horario: string;
  ponto: string | null;
  observacao: string | null;
  detalhes: string | null;
};

function paraEvento(linha: LinhaEvento): EventoRota {
  return {
    id: linha.id,
    tipo: linha.tipo,
    viagemId: linha.viagem_id,
    alunoId: linha.aluno_id ?? undefined,
    autorId: linha.autor_id ?? undefined,
    perfilAutor: linha.perfil_autor,
    criadoEm: linha.criado_em,
    horario: linha.horario,
    ponto: linha.ponto ?? undefined,
    observacao: linha.observacao ?? undefined,
    detalhes: linha.detalhes ? JSON.parse(linha.detalhes) : undefined,
  };
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const viagemId = url.searchParams.get("viagemId");
  const alunoId = url.searchParams.get("alunoId");

  const condicoes: string[] = [];
  const valores: unknown[] = [];

  if (viagemId) {
    condicoes.push("viagem_id = ?");
    valores.push(Number(viagemId));
  }

  if (alunoId) {
    condicoes.push("aluno_id = ?");
    valores.push(Number(alunoId));
  }

  const whereClause = condicoes.length > 0 ? `WHERE ${condicoes.join(" AND ")}` : "";

  const { results } = await context.env.DB.prepare(
    `SELECT id, tipo, viagem_id, aluno_id, autor_id, perfil_autor, criado_em, horario, ponto, observacao, detalhes
     FROM eventos ${whereClause} ORDER BY criado_em ASC`,
  )
    .bind(...valores)
    .all<LinhaEvento>();

  return json(results.map(paraEvento));
};

export const onRequestPost: PagesFunction<Env, string, Data> = async (context) => {
  const corpo = await context.request.json<Partial<EventoRota>>().catch(() => null);

  if (!corpo?.tipo || !corpo.viagemId || !corpo.perfilAutor || !corpo.horario) {
    return erro("Dados do evento incompletos.");
  }

  const id = crypto.randomUUID();
  const criadoEm = new Date().toISOString();

  await context.env.DB.prepare(
    `INSERT INTO eventos (id, tipo, viagem_id, aluno_id, autor_id, perfil_autor, criado_em, horario, ponto, observacao, detalhes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      corpo.tipo,
      corpo.viagemId,
      corpo.alunoId ?? null,
      corpo.autorId !== undefined ? String(corpo.autorId) : String(context.data.usuario.id),
      corpo.perfilAutor,
      criadoEm,
      corpo.horario,
      corpo.ponto ?? null,
      corpo.observacao ?? null,
      corpo.detalhes ? JSON.stringify(corpo.detalhes) : null,
    )
    .run();

  const evento: EventoRota = {
    id,
    tipo: corpo.tipo,
    viagemId: corpo.viagemId,
    alunoId: corpo.alunoId,
    autorId: corpo.autorId ?? context.data.usuario.id,
    perfilAutor: corpo.perfilAutor,
    criadoEm,
    horario: corpo.horario,
    ponto: corpo.ponto,
    observacao: corpo.observacao,
    detalhes: corpo.detalhes,
  };

  return json(evento, 201);
};
