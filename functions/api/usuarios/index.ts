import type { Env } from "../../_lib/env";
import { erro, json } from "../../_lib/http";
import { gerarSalt, hashSenha } from "../../_lib/password";

type Usuario = {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  perfil: string;
};

const PERFIS_VALIDOS = new Set(["gestor", "motorista", "responsavel"]);

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const perfil = new URL(context.request.url).searchParams.get("perfil");

  const query = perfil
    ? context.env.DB.prepare(
        "SELECT id, nome, email, telefone, perfil FROM usuarios WHERE perfil = ? ORDER BY nome ASC",
      ).bind(perfil)
    : context.env.DB.prepare("SELECT id, nome, email, telefone, perfil FROM usuarios ORDER BY nome ASC");

  const { results } = await query.all<Usuario>();

  return json(results);
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const corpo = await context.request
    .json<Partial<Usuario> & { senha?: string }>()
    .catch(() => null);

  if (
    !corpo?.nome?.trim() ||
    !corpo.email?.trim() ||
    !corpo.senha?.trim() ||
    !corpo.perfil ||
    !PERFIS_VALIDOS.has(corpo.perfil)
  ) {
    return erro("Preencha nome, e-mail, senha e um perfil válido.");
  }

  const emailNormalizado = corpo.email.trim().toLowerCase();
  const nome = corpo.nome.trim();
  const telefone = corpo.telefone?.trim() ?? "";
  const salt = gerarSalt();
  const hash = await hashSenha(corpo.senha, salt);

  let usuarioId: number;

  try {
    const resultado = await context.env.DB.prepare(
      "INSERT INTO usuarios (nome, email, telefone, perfil, senha_hash, senha_salt) VALUES (?, ?, ?, ?, ?, ?)",
    )
      .bind(nome, emailNormalizado, telefone, corpo.perfil, hash, salt)
      .run();

    usuarioId = resultado.meta.last_row_id as number;
  } catch {
    return erro("Já existe um usuário com este e-mail.", 409);
  }

  return json(
    { id: usuarioId, nome, email: emailNormalizado, telefone, perfil: corpo.perfil },
    201,
  );
};
