import type { Env } from "../../../../_lib/env";
import { erro, json } from "../../../../_lib/http";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { sentido, viagemId, alunoId } = context.params as Record<string, string>;

  const registro = await context.env.DB.prepare(
    "SELECT confirmacao FROM confirmacoes WHERE sentido = ? AND viagem_id = ? AND aluno_id = ?",
  )
    .bind(sentido, Number(viagemId), Number(alunoId))
    .first<{ confirmacao: string }>();

  return json(registro ?? null);
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const { sentido, viagemId, alunoId } = context.params as Record<string, string>;
  const corpo = await context.request.json<{ confirmacao?: string }>().catch(() => null);

  if (!corpo?.confirmacao) {
    return erro("Informe a confirmação.");
  }

  await context.env.DB.prepare(
    `INSERT INTO confirmacoes (sentido, viagem_id, aluno_id, confirmacao)
     VALUES (?, ?, ?, ?)
     ON CONFLICT (sentido, viagem_id, aluno_id)
     DO UPDATE SET confirmacao = excluded.confirmacao`,
  )
    .bind(sentido, Number(viagemId), Number(alunoId), corpo.confirmacao)
    .run();

  return json({ ok: true });
};
