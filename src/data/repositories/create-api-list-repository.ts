import { apiClient } from "@/data/api-client";

type ComId = { id: number };

/**
 * Repositório genérico para entidades servidas por um recurso REST simples
 * (`GET/POST /caminho`, `PATCH/DELETE /caminho/:id`) nas Cloudflare
 * Functions. `fixedQuery` fica embutido em toda chamada — usado para
 * recursos compartilhados como `/api/usuarios`, onde `perfil` filtra
 * responsáveis de motoristas.
 */
export function createApiListRepository<T extends ComId>(
  caminho: string,
  fixedQuery?: Record<string, string>,
) {
  async function list(): Promise<T[]> {
    return apiClient.get<T[]>(caminho, fixedQuery);
  }

  async function create(item: Omit<T, "id">): Promise<T> {
    return apiClient.post<T>(caminho, { ...item, ...fixedQuery });
  }

  async function update(id: number, alteracoes: Partial<Omit<T, "id">>): Promise<void> {
    await apiClient.patch<{ ok: true }>(`${caminho}/${id}`, alteracoes);
  }

  async function remove(id: number): Promise<void> {
    await apiClient.delete<{ ok: true }>(`${caminho}/${id}`);
  }

  return { list, create, update, remove };
}
