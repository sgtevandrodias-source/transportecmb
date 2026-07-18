import { buildPushPayload, type PushMessage, type PushSubscription } from "@block65/webcrypto-web-push";

import type { Env } from "./env";

type RegistroInscricao = {
  id: number;
  endpoint: string;
  p256dh: string;
  auth: string;
};

/**
 * Envia uma notificação push para todos os dispositivos inscritos de um
 * usuário. Inscrições que o serviço de push reportar como expiradas/inválidas
 * (404/410) são removidas do banco, para não tentar de novo indefinidamente.
 */
export async function enviarPushParaUsuario(
  env: Env,
  usuarioId: number,
  mensagem: { titulo: string; corpo: string; url?: string },
): Promise<void> {
  const { results: inscricoes } = await env.DB.prepare(
    "SELECT id, endpoint, p256dh, auth FROM push_subscriptions WHERE usuario_id = ?",
  )
    .bind(usuarioId)
    .all<RegistroInscricao>();

  if (inscricoes.length === 0) {
    return;
  }

  const vapid = {
    subject: env.VAPID_SUBJECT,
    publicKey: env.VAPID_PUBLIC_KEY,
    privateKey: env.VAPID_PRIVATE_KEY,
  };

  const payload: PushMessage = {
    data: JSON.stringify({
      titulo: mensagem.titulo,
      corpo: mensagem.corpo,
      url: mensagem.url ?? "/",
    }),
    options: { ttl: 60 * 30 },
  };

  await Promise.all(
    inscricoes.map(async (inscricao) => {
      const subscription: PushSubscription = {
        endpoint: inscricao.endpoint,
        expirationTime: null,
        keys: { p256dh: inscricao.p256dh, auth: inscricao.auth },
      };

      try {
        const request = await buildPushPayload(payload, subscription, vapid);
        const resposta = await fetch(subscription.endpoint, request);

        if (resposta.status === 404 || resposta.status === 410) {
          await env.DB.prepare("DELETE FROM push_subscriptions WHERE id = ?")
            .bind(inscricao.id)
            .run();
        }
      } catch (erro) {
        console.log("Erro ao enviar push:", erro);
      }
    }),
  );
}

/** Envia a mesma notificação para vários usuários de uma vez. */
export async function enviarPushParaVarios(
  env: Env,
  usuarioIds: number[],
  mensagem: { titulo: string; corpo: string; url?: string },
): Promise<void> {
  await Promise.all(usuarioIds.map((usuarioId) => enviarPushParaUsuario(env, usuarioId, mensagem)));
}

export type AlunoConfirmado = {
  alunoId: number;
  responsavelId: number | null;
  situacao: string | null;
};

/**
 * Alunos "previstos" (= confirmados) de uma viagem: aqueles cujo responsável
 * confirmou presença (`confirmacoes.confirmacao = 'vai'`) para aquele
 * sentido/viagem — não tem relação com o turno do aluno. `situacao` vem de
 * `embarques` via LEFT JOIN e fica `null` quando o motorista ainda não
 * registrou nada (equivalente a "aguardando").
 */
export async function buscarAlunosConfirmados(
  env: Env,
  viagemId: number,
  sentido: string,
): Promise<AlunoConfirmado[]> {
  const { results } = await env.DB.prepare(
    `SELECT a.id as alunoId, a.responsavel_id as responsavelId, e.situacao as situacao
     FROM confirmacoes c
     JOIN alunos a ON a.id = c.aluno_id
     LEFT JOIN embarques e ON e.viagem_id = c.viagem_id AND e.aluno_id = c.aluno_id
     WHERE c.sentido = ? AND c.viagem_id = ? AND c.confirmacao = 'vai'`,
  )
    .bind(sentido, viagemId)
    .all<AlunoConfirmado>();

  return results;
}

/** Ids distintos dos responsáveis dos alunos previstos/confirmados de uma viagem. */
export async function buscarResponsaveisConfirmados(
  env: Env,
  viagemId: number,
  sentido: string,
): Promise<number[]> {
  const alunos = await buscarAlunosConfirmados(env, viagemId, sentido);

  return [...new Set(alunos.map((aluno) => aluno.responsavelId).filter((id): id is number => id !== null))];
}

/** Ids de todos os usuários com perfil de gestor. */
export async function buscarGestores(env: Env): Promise<number[]> {
  const { results } = await env.DB.prepare("SELECT id FROM usuarios WHERE perfil = 'gestor'").all<{
    id: number;
  }>();

  return results.map((registro) => registro.id);
}
