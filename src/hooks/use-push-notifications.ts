import { useEffect, useState } from "react";

import { pushClient } from "@/notifications/push-client";

/** Estado e alternância da inscrição de notificações push — reaproveitado nas telas de responsável, motorista e gestor. */
export function usePushNotifications() {
  const [ativas, setAtivas] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const suportado = pushClient.suportado();

  useEffect(() => {
    if (!suportado) {
      return;
    }

    pushClient.estaInscrito().then(setAtivas);
  }, [suportado]);

  async function alternar() {
    setCarregando(true);

    try {
      if (ativas) {
        await pushClient.cancelarInscricao();
        setAtivas(false);
      } else {
        await pushClient.registrarEInscrever();
        setAtivas(true);
      }
    } catch (erro) {
      alert(erro instanceof Error ? erro.message : "Não foi possível alterar as notificações.");
    } finally {
      setCarregando(false);
    }
  }

  return { suportado, ativas, carregando, alternar };
}
