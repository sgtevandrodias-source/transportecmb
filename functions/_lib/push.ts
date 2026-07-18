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
