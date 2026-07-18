import type { Env } from "../../_lib/env";
import type { Data } from "../_middleware";
import { erro, json } from "../../_lib/http";
import { gerarSalt, hashSenha, verificarSenha } from "../../_lib/password";

export const onRequestPatch: PagesFunction<Env, string, Data> = async (context) => {
  const id = Number(context.params.id);
  const autor = context.data.usuario;
  const ehProprioUsuario = autor.id === id;

  // Só o dono do registro pode editar a própria conta; um gestor também
  // pode editar qualquer outra (é assim que ele cadastra/atualiza
  // motoristas e responsáveis). Fora isso, trocar o :id na URL não deve
  // dar acesso à conta de outra pessoa.
  if (!ehProprioUsuario && autor.perfil !== "gestor") {
    return erro("Você não tem permissão para editar este usuário.", 403);
  }

  const corpo = await context.request
    .json<{ nome?: string; email?: string; telefone?: string; senha?: string; senhaAtual?: string }>()
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
    // Ao trocar a própria senha (não a de outra pessoa), a senha atual
    // precisa bater — evita que uma sessão esquecida aberta em outro
    // aparelho seja suficiente para sequestrar a conta.
    if (ehProprioUsuario) {
      const atual = await context.env.DB.prepare(
        "SELECT senha_hash, senha_salt FROM usuarios WHERE id = ?",
      )
        .bind(id)
        .first<{ senha_hash: string; senha_salt: string }>();

      const senhaAtualValida =
        atual && (await verificarSenha(corpo.senhaAtual ?? "", atual.senha_salt, atual.senha_hash));

      if (!senhaAtualValida) {
        return erro("Senha atual incorreta.", 401);
      }
    }

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

export const onRequestDelete: PagesFunction<Env, string, Data> = async (context) => {
  if (context.data.usuario.perfil !== "gestor") {
    return erro("Você não tem permissão para remover este usuário.", 403);
  }

  const id = Number(context.params.id);
  await context.env.DB.prepare("DELETE FROM usuarios WHERE id = ?").bind(id).run();
  return json({ ok: true });
};
