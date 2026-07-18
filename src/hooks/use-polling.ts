import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

/**
 * Reexecuta `callback` a cada `intervalMs` enquanto a tela está em foco —
 * dá a sensação de tempo real (responsável vê o motorista confirmando
 * embarque sem precisar recarregar) sem gastar leituras com a tela em
 * segundo plano.
 */
export function usePolling(callback: () => void, intervalMs: number) {
  useFocusEffect(
    useCallback(() => {
      const id = setInterval(callback, intervalMs);
      return () => clearInterval(id);
    }, [callback, intervalMs]),
  );
}
