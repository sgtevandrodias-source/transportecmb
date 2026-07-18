import type { Env } from "../../_lib/env";
import { erro, json } from "../../_lib/http";
import { enviarPushParaUsuario } from "../../_lib/push";

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

  if (corpo.situacao === "embarcou" || corpo.situacao === "desembarcou") {
    context.waitUntil(notificarResponsavel(context.env, corpo.alunoId, corpo.situacao));
  }

  return json(await listar(context.env, viagemId));
};

async function notificarResponsavel(
  env: Env,
  alunoId: number,
  situacao: "embarcou" | "desembarcou",
): Promise<void> {
  const aluno = await env.DB.prepare(
    "SELECT nome, responsavel_id as responsavelId FROM alunos WHERE id = ?",
  )
    .bind(alunoId)
    .first<{ nome: string; responsavelId: number | null }>();

  if (!aluno?.responsavelId) {
    return;
  }

  const acao = situacao === "embarcou" ? "embarcou no ônibus" : "desembarcou do ônibus";

  await enviarPushParaUsuario(env, aluno.responsavelId, {
    titulo: "Rota CMB",
    corpo: `${aluno.nome} ${acao}.`,
  });
}
