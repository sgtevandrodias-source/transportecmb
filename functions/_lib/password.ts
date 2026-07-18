// Hash de senha via Web Crypto (PBKDF2) — nativo no runtime dos Workers.
// bcrypt/argon2 exigem bindings nativos que não existem nesse runtime.

const ITERACOES = 100_000;
const ALGORITMO_HASH = "SHA-256";
const TAMANHO_CHAVE_BITS = 256;

function paraHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function deHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);

  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }

  return bytes;
}

function compararConstante(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let diferenca = 0;

  for (let i = 0; i < a.length; i++) {
    diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return diferenca === 0;
}

export function gerarSalt(): string {
  return paraHex(crypto.getRandomValues(new Uint8Array(16)).buffer);
}

export async function hashSenha(senha: string, saltHex: string): Promise<string> {
  const chaveDerivavel = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(senha),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: deHex(saltHex),
      iterations: ITERACOES,
      hash: ALGORITMO_HASH,
    },
    chaveDerivavel,
    TAMANHO_CHAVE_BITS,
  );

  return paraHex(bits);
}

export async function verificarSenha(
  senha: string,
  saltHex: string,
  hashEsperado: string,
): Promise<boolean> {
  const hashCalculado = await hashSenha(senha, saltHex);
  return compararConstante(hashCalculado, hashEsperado);
}
