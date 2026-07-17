import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { Perfil, Usuario } from "@/domain/types";
import { StorageKeys } from "@/data/storage-keys";
import { responsaveisRepository } from "@/data/repositories/responsaveis.repository";

type Credenciais = {
  email: string;
  senha: string;
};

type AuthContextValue = {
  usuario: Usuario | null;
  carregando: boolean;
  login: (perfil: Perfil, credenciais: Credenciais) => Promise<Usuario>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const nomePorPerfil: Record<Exclude<Perfil, "responsavel">, string> = {
  gestor: "Gestor",
  motorista: "Motorista",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function restaurarSessao() {
      try {
        const salva = await AsyncStorage.getItem(StorageKeys.sessao);

        if (salva) {
          setUsuario(JSON.parse(salva) as Usuario);
        }
      } finally {
        setCarregando(false);
      }
    }

    restaurarSessao();
  }, []);

  const login = useCallback(
    async (perfil: Perfil, credenciais: Credenciais) => {
      if (!credenciais.email.trim() || !credenciais.senha.trim()) {
        throw new Error("Preencha o e-mail e a senha.");
      }

      const emailNormalizado = credenciais.email.trim().toLowerCase();

      let usuarioAutenticado: Usuario;

      if (perfil === "responsavel") {
        const responsavel = await responsaveisRepository.buscarPorEmail(
          emailNormalizado,
        );

        if (!responsavel) {
          throw new Error(
            "E-mail não encontrado no cadastro de responsáveis.",
          );
        }

        usuarioAutenticado = responsavel;
      } else {
        usuarioAutenticado = {
          id: 0,
          nome: nomePorPerfil[perfil],
          email: emailNormalizado,
          telefone: "",
          perfil,
        };
      }

      await AsyncStorage.setItem(
        StorageKeys.sessao,
        JSON.stringify(usuarioAutenticado),
      );

      setUsuario(usuarioAutenticado);

      return usuarioAutenticado;
    },
    [],
  );

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(StorageKeys.sessao);
    setUsuario(null);
  }, []);

  const value = useMemo(
    () => ({ usuario, carregando, login, logout }),
    [usuario, carregando, login, logout],
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
