import type { Env } from "../../_lib/env";
import { erro, json } from "../../_lib/http";

const CAMPOS = ["nome", "referencia", "horario", "ordem"];

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const id = Number(context.params.id);
  const corpo = await context.request.json<Record<string, unknown>>().catch(() => null);

  if (!corpo) {
    return erro("Corpo inválido.");
  }

  const sets: string[] = [];
  const valores: unknown[] = [];

  for (const campo of CAMPOS) {
    if (campo in corpo) {
      sets.push(`${campo} = ?`);
      valores.push(corpo[campo]);
    }
  }

  if (sets.length === 0) {
    return erro("Nada para atualizar.");
  }

  valores.push(id);

  await context.env.DB.prepare(`UPDATE pontos SET ${sets.join(", ")} WHERE id = ?`)
    .bind(...valores)
    .run();

  return json({ ok: true });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const id = Number(context.params.id);
  await context.env.DB.prepare("DELETE FROM pontos WHERE id = ?").bind(id).run();
  return json({ ok: true });
};
