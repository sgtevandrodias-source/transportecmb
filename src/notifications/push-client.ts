import { Platform } from "react-native";

import { apiClient } from "@/data/api-client";

// Chave pública VAPID — informação pública por design (o navegador a usa
// para verificar que os pushes vêm do nosso servidor). A privada nunca sai
// do backend.
const VAPID_PUBLIC_KEY = "BGQiBl1ctBw3RtngVs-yTTpTpe9-pjQ4VufbCre9dTOiOq25AxK1FoWmaUpn4-K0GmTivNx7KXKEuHLurfcamIM";

function suportado(): boolean {
  return (
    Platform.OS === "web" &&
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

function paraUint8Array(base64url: string): Uint8Array {
  const padding = "=".repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const bruto = atob(base64);
  return Uint8Array.from([...bruto].map((char) => char.charCodeAt(0)));
}

async function obterInscricaoAtual(): Promise<PushSubscription | null> {
  if (!suportado()) {
    return null;
  }

  const registro = await navigator.serviceWorker.getRegistration();
  return (await registro?.pushManager.getSubscription()) ?? null;
}

async function estaInscrito(): Promise<boolean> {
  return Boolean(await obterInscricaoAtual());
}

async function registrarEInscrever(): Promise<void> {
  if (!suportado()) {
    throw new Error("Este navegador não suporta notificações push.");
  }

  const permissao = await Notification.requestPermission();

  if (permissao !== "granted") {
    throw new Error("Permissão de notificações não concedida.");
  }

  const registro = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  const inscricaoExistente = await registro.pushManager.getSubscription();

  const inscricao =
    inscricaoExistente ??
    (await registro.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: paraUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    }));

  const dados = inscricao.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };

  if (!dados.endpoint || !dados.keys?.p256dh || !dados.keys?.auth) {
    throw new Error("Não foi possível gerar a inscrição de notificações.");
  }

  await apiClient.post("/api/push/subscribe", dados);
}

async function cancelarInscricao(): Promise<void> {
  const inscricao = await obterInscricaoAtual();

  if (!inscricao) {
    return;
  }

  await apiClient.post("/api/push/unsubscribe", { endpoint: inscricao.endpoint });
  await inscricao.unsubscribe();
}

export const pushClient = { suportado, estaInscrito, registrarEInscrever, cancelarInscricao };
