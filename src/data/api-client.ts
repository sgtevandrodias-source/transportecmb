import AsyncStorage from "@react-native-async-storage/async-storage";

const CHAVE_TOKEN = "@rota_cmb_sessao_token";

let tokenAtual: string | null = null;

// A restauração do token do AsyncStorage é assíncrona (roda no efeito de
// montagem do AuthProvider). Sem essa trava, uma tela que recarrega a
// página (refresh, link direto) pode disparar sua primeira busca antes da
// restauração terminar, e a chamada sai sem token — daí um 401 espúrio
// logo na entrada. Toda requisição espera essa promessa resolver primeiro.
let resolverPronto: () => void;
const pronto = new Promise<void>((resolve) => {
  resolverPronto = resolve;
});

async function definirToken(token: string | null): Promise<void> {
  tokenAtual = token;

  if (token) {
    await AsyncStorage.setItem(CHAVE_TOKEN, token);
  } else {
    await AsyncStorage.removeItem(CHAVE_TOKEN);
  }
}

async function restaurarToken(): Promise<string | null> {
  try {
    tokenAtual = await AsyncStorage.getItem(CHAVE_TOKEN);
    return tokenAtual;
  } finally {
    resolverPronto();
  }
}

function montarQuery(query?: Record<string, string>): string {
  if (!query) {
    return "";
  }

  return `?${new URLSearchParams(query).toString()}`;
}

async function requisitar<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  await pronto;

  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(opcoes.headers as Record<string, string> | undefined),
  };

  if (tokenAtual) {
    headers.authorization = `Bearer ${tokenAtual}`;
  }

  const resposta = await fetch(caminho, { ...opcoes, headers });
  const texto = await resposta.text();
  const corpo = texto ? JSON.parse(texto) : null;

  if (!resposta.ok) {
    const mensagem =
      corpo && typeof corpo === "object" && "erro" in corpo
        ? String((corpo as { erro: unknown }).erro)
        : "Não foi possível completar a operação. Verifique sua conexão.";

    throw new Error(mensagem);
  }

  return corpo as T;
}

function get<T>(caminho: string, query?: Record<string, string>): Promise<T> {
  return requisitar<T>(`${caminho}${montarQuery(query)}`);
}

function post<T>(caminho: string, corpo?: unknown): Promise<T> {
  return requisitar<T>(caminho, {
    method: "POST",
    body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
  });
}

function patch<T>(caminho: string, corpo?: unknown): Promise<T> {
  return requisitar<T>(caminho, {
    method: "PATCH",
    body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
  });
}

function put<T>(caminho: string, corpo?: unknown): Promise<T> {
  return requisitar<T>(caminho, {
    method: "PUT",
    body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
  });
}

function del<T>(caminho: string): Promise<T> {
  return requisitar<T>(caminho, { method: "DELETE" });
}

export const apiClient = {
  get,
  post,
  patch,
  put,
  delete: del,
  definirToken,
  restaurarToken,
};
