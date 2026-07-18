import type { Env } from "../../_lib/env";
import { json } from "../../_lib/http";
import { extrairToken, revogarSessao } from "../../_lib/session";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const token = extrairToken(context.request);

  if (token) {
    await revogarSessao(context.env.DB, token);
  }

  return json({ ok: true });
};
