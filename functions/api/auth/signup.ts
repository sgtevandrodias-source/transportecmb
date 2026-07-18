import type { Env } from "../../_lib/env";
import { erro, json } from "../../_lib/http";
import { gerarSalt, hashSenha } from "../../_lib/password";
import { criarSessao } from "../../_lib/session";

type Corpo = {
  nome?: string;
  email?: string;
  senha?: string;
  telefone?: string;
};

// Só cria conta de gestor, e só a primeira — motorista e responsável são
// cadastrados pelo gestor depois de logado (telas Motoristas/Responsáveis).
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const corpo = await context.request.json<Corpo>().catch(() => null);

  if (!corpo?.nome?.trim() || !corpo.email?.trim() || !corpo.senha?.trim()) {
    return erro("Preencha nome, e-mail e senha.");
  }

  if (corpo.senha.trim().length < 6) {
    return erro("A senha precisa ter pelo menos 6 caracteres.");
  }

  const jaExisteGestor = await context.env.DB.prepare(
    "SELECT id FROM usuarios WHERE perfil = 'gestor' LIMIT 1",
  ).first();

  if (jaExisteGestor) {
    return erro("Já existe uma conta de gestor cadastrada.", 409);
  }

  const emailNormalizado = corpo.email.trim().toLowerCase();
  const nome = corpo.nome.trim();
  const telefone = corpo.telefone?.trim() ?? "";
  const salt = gerarSalt();
  const hash = await hashSenha(corpo.senha, salt);

  let usuarioId: number;

  try {
    const resultado = await context.env.DB.prepare(
      "INSERT INTO usuarios (nome, email, telefone, perfil, senha_hash, senha_salt) VALUES (?, ?, ?, 'gestor', ?, ?)",
    )
      .bind(nome, emailNormalizado, telefone, hash, salt)
      .run();

    usuarioId = resultado.meta.last_row_id as number;
  } catch {
    return erro("Já existe uma conta com este e-mail.", 409);
  }

  const token = await criarSessao(context.env.DB, usuarioId);

  return json(
    {
      token,
      usuario: { id: usuarioId, nome, email: emailNormalizado, telefone, perfil: "gestor" },
    },
    201,
  );
};
