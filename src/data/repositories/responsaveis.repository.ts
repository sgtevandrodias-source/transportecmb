import { Responsavel } from "@/domain/types";
import { StorageKeys } from "@/data/storage-keys";
import { createListRepository } from "@/data/repositories/create-list-repository";

const base = createListRepository<Responsavel>(StorageKeys.responsaveis);

async function buscarPorEmail(email: string): Promise<Responsavel | null> {
  const emailNormalizado = email.trim().toLowerCase();
  const lista = await base.list();

  return (
    lista.find(
      (responsavel) => responsavel.email.toLowerCase() === emailNormalizado,
    ) ?? null
  );
}

export const responsaveisRepository = { ...base, buscarPorEmail };
