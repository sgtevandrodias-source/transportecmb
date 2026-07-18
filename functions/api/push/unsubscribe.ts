import type { Env } from "../../_lib/env";
import type { Data } from "../_middleware";
import { erro, json } from "../../_lib/http";

export const onRequestPost: PagesFunction<Env, string, Data> = async (context) => {
  const corpo = await context.request.json<{ endpoint?: string }>().catch(() => null);

  if (!corpo?.endpoint) {
    return erro("Informe o endpoint da inscrição.");
  }

  await context.env.DB.prepare("DELETE FROM push_subscriptions WHERE endpoint = ? AND usuario_id = ?")
    .bind(corpo.endpoint, context.data.usuario.id)
    .run();

  return json({ ok: true });
};
