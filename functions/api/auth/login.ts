import type { Env } from "../../_lib/env";
import { erro, json } from "../../_lib/http";
import { verificarSenha } from "../../_lib/password";
import { criarSessao } from "../../_lib/session";

type Corpo = {
  perfil?: string;
  email?: string;
  senha?: string;
};

type UsuarioComSenha = {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  perfil: string;
  senha_hash: string;
  senha_salt: string;
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const corpo = await context.request.json<Corpo>().catch(() => null);

  if (!corpo?.perfil || !corpo.email?.trim() || !corpo.senha?.trim()) {
    return erro("Preencha o e-mail e a senha.");
  }

  const emailNormalizado = corpo.email.trim().toLowerCase();

  const usuario = await context.env.DB.prepare(
    "SELECT id, nome, email, telefone, perfil, senha_hash, senha_salt FROM usuarios WHERE email = ? AND perfil = ?",
  )
    .bind(emailNormalizado, corpo.perfil)
    .first<UsuarioComSenha>();

  if (!usuario) {
    return erro("E-mail não encontrado para este perfil.", 401);
  }

  const senhaValida = await verificarSenha(corpo.senha, usuario.senha_salt, usuario.senha_hash);

  if (!senhaValida) {
    return erro("Senha incorreta.", 401);
  }

  const token = await criarSessao(context.env.DB, usuario.id);

  return json({
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      perfil: usuario.perfil,
    },
  });
};
