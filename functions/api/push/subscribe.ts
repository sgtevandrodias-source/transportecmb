import type { Env } from "../../_lib/env";
import type { Data } from "../_middleware";
import { erro, json } from "../../_lib/http";

type CorpoInscricao = {
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
};

export const onRequestPost: PagesFunction<Env, string, Data> = async (context) => {
  const corpo = await context.request.json<CorpoInscricao>().catch(() => null);

  if (!corpo?.endpoint || !corpo.keys?.p256dh || !corpo.keys?.auth) {
    return erro("Inscrição de notificações inválida.");
  }

  await context.env.DB.prepare(
    `INSERT INTO push_subscriptions (usuario_id, endpoint, p256dh, auth)
     VALUES (?, ?, ?, ?)
     ON CONFLICT (endpoint)
     DO UPDATE SET usuario_id = excluded.usuario_id, p256dh = excluded.p256dh, auth = excluded.auth`,
  )
    .bind(context.data.usuario.id, corpo.endpoint, corpo.keys.p256dh, corpo.keys.auth)
    .run();

  return json({ ok: true }, 201);
};
