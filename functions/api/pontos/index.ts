import type { Env } from "../../_lib/env";
import { erro, json } from "../../_lib/http";

type Ponto = {
  id: number;
  nome: string;
  referencia: string;
  horario: string;
  ordem: number;
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { results } = await context.env.DB.prepare(
    "SELECT id, nome, referencia, horario, ordem FROM pontos ORDER BY ordem ASC",
  ).all<Ponto>();

  return json(results);
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const corpo = await context.request.json<Partial<Ponto>>().catch(() => null);

  if (!corpo?.nome?.trim() || !corpo.horario?.trim() || typeof corpo.ordem !== "number") {
    return erro("Preencha todos os campos do ponto.");
  }

  const resultado = await context.env.DB.prepare(
    "INSERT INTO pontos (nome, referencia, horario, ordem) VALUES (?, ?, ?, ?)",
  )
    .bind(corpo.nome.trim(), corpo.referencia?.trim() ?? "", corpo.horario.trim(), corpo.ordem)
    .run();

  const ponto: Ponto = {
    id: resultado.meta.last_row_id as number,
    nome: corpo.nome.trim(),
    referencia: corpo.referencia?.trim() ?? "",
    horario: corpo.horario.trim(),
    ordem: corpo.ordem,
  };

  return json(ponto, 201);
};
