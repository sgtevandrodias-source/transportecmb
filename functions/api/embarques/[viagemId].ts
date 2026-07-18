import type { Env } from "../../_lib/env";
import { erro, json } from "../../_lib/http";
import { buscarAlunosConfirmados, enviarPushParaUsuario, enviarPushParaVarios } from "../../_lib/push";

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

  const registroAnterior = await context.env.DB.prepare(
    "SELECT situacao FROM embarques WHERE viagem_id = ? AND aluno_id = ?",
  )
    .bind(viagemId, corpo.alunoId)
    .first<{ situacao: string }>();

  const situacaoAnterior = registroAnterior?.situacao ?? "aguardando";

  await context.env.DB.prepare(
    `INSERT INTO embarques (viagem_id, aluno_id, situacao, horario_situacao)
     VALUES (?, ?, ?, ?)
     ON CONFLICT (viagem_id, aluno_id)
     DO UPDATE SET situacao = excluded.situacao, horario_situacao = excluded.horario_situacao`,
  )
    .bind(viagemId, corpo.alunoId, corpo.situacao, corpo.horarioSituacao ?? null)
    .run();

  if (corpo.situacao === "embarcou" || corpo.situacao === "desembarcou") {
    context.waitUntil(notificarResponsavel(context.env, viagemId, corpo.alunoId, corpo.situacao));
  }

  if (situacaoAnterior === "aguardando" || situacaoAnterior === "revisitar") {
    context.waitUntil(notificarSeEmbarqueCompleto(context.env, viagemId));
  }

  return json(await listar(context.env, viagemId));
};

async function notificarResponsavel(
  env: Env,
  viagemId: number,
  alunoId: number,
  situacao: "embarcou" | "desembarcou",
): Promise<void> {
  const [aluno, viagem] = await Promise.all([
    env.DB.prepare("SELECT nome, responsavel_id as responsavelId FROM alunos WHERE id = ?")
      .bind(alunoId)
      .first<{ nome: string; responsavelId: number | null }>(),
    env.DB.prepare("SELECT sentido FROM viagens WHERE id = ?").bind(viagemId).first<{ sentido: string }>(),
  ]);

  if (!aluno?.responsavelId) {
    return;
  }

  const acao =
    situacao === "embarcou"
      ? "embarcou no ônibus"
      : viagem?.sentido === "ida"
        ? "chegou ao CMB"
        : "chegou em casa";

  await enviarPushParaUsuario(env, aluno.responsavelId, {
    titulo: "Rota CMB",
    corpo: `${aluno.nome} ${acao}.`,
  });
}

/**
 * Dispara o aviso de "embarque completo" exatamente uma vez: só quando a
 * atualização que acabou de acontecer foi a que zerou as pendências (ver
 * checagem de `situacaoAnterior` em `onRequestPost`), evitando duplicidade a
 * cada aluno resolvido depois que a viagem já estava completa.
 */
async function notificarSeEmbarqueCompleto(env: Env, viagemId: number): Promise<void> {
  const viagem = await env.DB.prepare("SELECT sentido FROM viagens WHERE id = ?")
    .bind(viagemId)
    .first<{ sentido: string }>();

  if (!viagem) {
    return;
  }

  const alunos = await buscarAlunosConfirmados(env, viagemId, viagem.sentido);

  const aindaPendente = alunos.some(
    (aluno) => aluno.situacao === null || aluno.situacao === "aguardando" || aluno.situacao === "revisitar",
  );

  if (aindaPendente) {
    return;
  }

  const responsaveis = [
    ...new Set(alunos.map((aluno) => aluno.responsavelId).filter((id): id is number => id !== null)),
  ];

  await enviarPushParaVarios(env, responsaveis, {
    titulo: "Rota CMB",
    corpo: "Todos os alunos confirmados já foram verificados no embarque.",
  });
}
