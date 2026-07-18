import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { apiClient } from "@/data/api-client";
import { Perfil, Usuario } from "@/domain/types";

type Credenciais = {
  email: string;
  senha: string;
};

type NovaContaGestor = {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
};

type RespostaAuth = {
  token: string;
  usuario: Usuario;
};

type AuthContextValue = {
  usuario: Usuario | null;
  carregando: boolean;
  login: (perfil: Perfil, credenciais: Credenciais) => Promise<Usuario>;
  criarContaGestor: (dados: NovaContaGestor) => Promise<Usuario>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function restaurarSessao() {
      try {
        const token = await apiClient.restaurarToken();

        if (!token) {
          return;
        }

        const resposta = await apiClient.get<{ usuario: Usuario }>("/api/auth/me");
        setUsuario(resposta.usuario);
      } catch {
        await apiClient.definirToken(null);
      } finally {
        setCarregando(false);
      }
    }

    restaurarSessao();
  }, []);

  const login = useCallback(async (perfil: Perfil, credenciais: Credenciais) => {
    const resposta = await apiClient.post<RespostaAuth>("/api/auth/login", {
      perfil,
      email: credenciais.email,
      senha: credenciais.senha,
    });

    await apiClient.definirToken(resposta.token);
    setUsuario(resposta.usuario);

    return resposta.usuario;
  }, []);

  const criarContaGestor = useCallback(async (dados: NovaContaGestor) => {
    const resposta = await apiClient.post<RespostaAuth>("/api/auth/signup", dados);

    await apiClient.definirToken(resposta.token);
    setUsuario(resposta.usuario);

    return resposta.usuario;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/api/auth/logout");
    } catch {
      // segue limpando a sessão local mesmo se a chamada falhar (ex.: sem conexão)
    }

    await apiClient.definirToken(null);
    setUsuario(null);
  }, []);

  const value = useMemo(
    () => ({ usuario, carregando, login, criarContaGestor, logout }),
    [usuario, carregando, login, criarContaGestor, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de um AuthProvider.");
  }

  return context;
}
