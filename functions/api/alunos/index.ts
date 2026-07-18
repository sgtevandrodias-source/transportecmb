import type { Env } from "../../_lib/env";
import { erro, json } from "../../_lib/http";

type Aluno = {
  id: number;
  nome: string;
  serie: string;
  turno: string;
  ponto: string;
  responsavelId: number | null;
};

type LinhaAluno = {
  id: number;
  nome: string;
  serie: string;
  turno: string;
  ponto: string;
  responsavel_id: number | null;
};

function paraAluno(linha: LinhaAluno): Aluno {
  return {
    id: linha.id,
    nome: linha.nome,
    serie: linha.serie,
    turno: linha.turno,
    ponto: linha.ponto,
    responsavelId: linha.responsavel_id,
  };
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { results } = await context.env.DB.prepare(
    "SELECT id, nome, serie, turno, ponto, responsavel_id FROM alunos ORDER BY nome ASC",
  ).all<LinhaAluno>();

  return json(results.map(paraAluno));
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const corpo = await context.request.json<Partial<Aluno>>().catch(() => null);

  if (!corpo?.nome?.trim() || !corpo.serie?.trim() || !corpo.turno?.trim() || !corpo.ponto?.trim()) {
    return erro("Preencha todos os campos do aluno.");
  }

  const resultado = await context.env.DB.prepare(
    "INSERT INTO alunos (nome, serie, turno, ponto, responsavel_id) VALUES (?, ?, ?, ?, ?)",
  )
    .bind(corpo.nome.trim(), corpo.serie.trim(), corpo.turno.trim(), corpo.ponto.trim(), corpo.responsavelId ?? null)
    .run();

  const aluno: Aluno = {
    id: resultado.meta.last_row_id as number,
    nome: corpo.nome.trim(),
    serie: corpo.serie.trim(),
    turno: corpo.turno.trim(),
    ponto: corpo.ponto.trim(),
    responsavelId: corpo.responsavelId ?? null,
  };

  return json(aluno, 201);
};
