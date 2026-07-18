import type { Env } from "../../_lib/env";
import { erro, json } from "../../_lib/http";

type RegistroEmbarque = {
  id: number;
  situacao: string;
  horarioSituacao?: string;
};

async function listar(env: Env, viagemId: number): Promise<RegistroEmbarque[]> {
  const { results } = await env.DB.prepare(
    "SELECT aluno_id as id, situacao, horario_situacao as horarioSituacao FROM embarques WHERE viagem_id = ?",
  )
    .bind(viagemId)
    .all<RegistroEmbarque>();

  return results;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const viagemId = Number(context.params.viagemId);
  return json(await listar(context.env, viagemId));
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const viagemId = Number(context.params.viagemId);
  const corpo = await context.request
    .json<{ alunoId?: number; situacao?: string; horarioSituacao?: string }>()
    .catch(() => null);

  if (!corpo?.alunoId || !corpo.situacao) {
    return erro("Informe o aluno e a situação.");
  }

  await context.env.DB.prepare(
    `INSERT INTO embarques (viagem_id, aluno_id, situacao, horario_situacao)
     VALUES (?, ?, ?, ?)
     ON CONFLICT (viagem_id, aluno_id)
     DO UPDATE SET situacao = excluded.situacao, horario_situacao = excluded.horario_situacao`,
  )
    .bind(viagemId, corpo.alunoId, corpo.situacao, corpo.horarioSituacao ?? null)
    .run();

  return json(await listar(context.env, viagemId));
};
