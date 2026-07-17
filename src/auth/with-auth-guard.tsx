import { router } from "expo-router";
import { useEffect } from "react";

import { Perfil } from "@/domain/types";
import { useAuth } from "@/auth/session-context";

export function useRequireAuth(perfilEsperado: Perfil) {
  const { usuario, carregando } = useAuth();

  useEffect(() => {
    if (!carregando && (!usuario || usuario.perfil !== perfilEsperado)) {
      router.replace("/");
    }
  }, [carregando, usuario, perfilEsperado]);

  return { usuario, carregando };
}
