import type { Env } from "../../_lib/env";
import { erro, json } from "../../_lib/http";

const CAMPOS: Record<string, string> = {
  nome: "nome",
  serie: "serie",
  turno: "turno",
  ponto: "ponto",
  responsavelId: "responsavel_id",
};

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const id = Number(context.params.id);
  const corpo = await context.request.json<Record<string, unknown>>().catch(() => null);

  if (!corpo) {
    return erro("Corpo inválido.");
  }

  const sets: string[] = [];
  const valores: unknown[] = [];

  for (const [campoCliente, colunaBanco] of Object.entries(CAMPOS)) {
    if (campoCliente in corpo) {
      sets.push(`${colunaBanco} = ?`);
      valores.push(corpo[campoCliente]);
    }
  }

  if (sets.length === 0) {
    return erro("Nada para atualizar.");
  }

  valores.push(id);

  await context.env.DB.prepare(`UPDATE alunos SET ${sets.join(", ")} WHERE id = ?`)
    .bind(...valores)
    .run();

  return json({ ok: true });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const id = Number(context.params.id);
  await context.env.DB.prepare("DELETE FROM alunos WHERE id = ?").bind(id).run();
  return json({ ok: true });
};
