const DURACAO_SESSAO_DIAS = 30;

export type Perfil = "gestor" | "motorista" | "responsavel";

export type UsuarioSessao = {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  perfil: Perfil;
};

export async function criarSessao(db: D1Database, usuarioId: number): Promise<string> {
  const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  const expiraEm = new Date(Date.now() + DURACAO_SESSAO_DIAS * 24 * 60 * 60 * 1000).toISOString();

  await db
    .prepare("INSERT INTO sessoes (token, usuario_id, expira_em) VALUES (?, ?, ?)")
    .bind(token, usuarioId, expiraEm)
    .run();

  return token;
}

export async function obterUsuarioPorToken(
  db: D1Database,
  token: string,
): Promise<UsuarioSessao | null> {
  const registro = await db
    .prepare(
      `SELECT u.id, u.nome, u.email, u.telefone, u.perfil
       FROM sessoes s
       JOIN usuarios u ON u.id = s.usuario_id
       WHERE s.token = ? AND s.expira_em > datetime('now')`,
    )
    .bind(token)
    .first<UsuarioSessao>();

  return registro ?? null;
}

export async function revogarSessao(db: D1Database, token: string): Promise<void> {
  await db.prepare("DELETE FROM sessoes WHERE token = ?").bind(token).run();
}

export function extrairToken(request: Request): string {
  const cabecalho = request.headers.get("authorization") ?? "";
  return cabecalho.startsWith("Bearer ") ? cabecalho.slice(7) : "";
}
