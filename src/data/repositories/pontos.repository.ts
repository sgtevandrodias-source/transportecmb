import { Ponto } from "@/domain/types";
import { StorageKeys } from "@/data/storage-keys";
import { createListRepository } from "@/data/repositories/create-list-repository";

const base = createListRepository<Ponto>(StorageKeys.pontos);

async function listOrdenados(): Promise<Ponto[]> {
  const lista = await base.list();
  return [...lista].sort((a, b) => a.ordem - b.ordem);
}

export const pontosRepository = { ...base, listOrdenados };
