import type { Env } from "../_lib/env";
import { extrairToken, obterUsuarioPorToken, type UsuarioSessao } from "../_lib/session";
import { erro } from "../_lib/http";

export type Data = {
  usuario: UsuarioSessao;
};

const ROTAS_PUBLICAS = new Set(["/api/auth/login", "/api/auth/signup"]);

export const onRequest: PagesFunction<Env, string, Data> = async (context) => {
  const { pathname } = new URL(context.request.url);

  if (ROTAS_PUBLICAS.has(pathname)) {
    return context.next();
  }

  const token = extrairToken(context.request);

  if (!token) {
    return erro("Sessão não encontrada. Faça login novamente.", 401);
  }

  const usuario = await obterUsuarioPorToken(context.env.DB, token);

  if (!usuario) {
    return erro("Sessão expirada. Faça login novamente.", 401);
  }

  context.data.usuario = usuario;

  return context.next();
};
