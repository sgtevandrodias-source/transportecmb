import type { Env } from "../../_lib/env";
import { erro, json } from "../../_lib/http";
import { gerarSalt, hashSenha } from "../../_lib/password";

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const id = Number(context.params.id);
  const corpo = await context.request
    .json<{ nome?: string; email?: string; telefone?: string; senha?: string }>()
    .catch(() => null);

  if (!corpo) {
    return erro("Corpo inválido.");
  }

  const sets: string[] = [];
  const valores: unknown[] = [];

  if (corpo.nome !== undefined) {
    sets.push("nome = ?");
    valores.push(corpo.nome.trim());
  }

  if (corpo.email !== undefined) {
    sets.push("email = ?");
    valores.push(corpo.email.trim().toLowerCase());
  }

  if (corpo.telefone !== undefined) {
    sets.push("telefone = ?");
    valores.push(corpo.telefone.trim());
  }

  if (corpo.senha?.trim()) {
    const salt = gerarSalt();
    const hash = await hashSenha(corpo.senha, salt);
    sets.push("senha_hash = ?", "senha_salt = ?");
    valores.push(hash, salt);
  }

  if (sets.length === 0) {
    return erro("Nada para atualizar.");
  }

  valores.push(id);

  try {
    await context.env.DB.prepare(`UPDATE usuarios SET ${sets.join(", ")} WHERE id = ?`)
      .bind(...valores)
      .run();
  } catch {
    return erro("Já existe um usuário com este e-mail.", 409);
  }

  return json({ ok: true });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const id = Number(context.params.id);
  await context.env.DB.prepare("DELETE FROM usuarios WHERE id = ?").bind(id).run();
  return json({ ok: true });
};
