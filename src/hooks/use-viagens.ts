import { viagensRepository } from "@/data/repositories/viagens.repository";
import { createListHook } from "@/hooks/create-list-hook";

export const useViagens = createListHook({
  ...viagensRepository,
  list: async () => viagensRepository.ordenarPorDataHora(await viagensRepository.list()),
});
