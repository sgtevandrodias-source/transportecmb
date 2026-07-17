import { pontosRepository } from "@/data/repositories/pontos.repository";
import { createListHook } from "@/hooks/create-list-hook";

export const usePontos = createListHook({
  ...pontosRepository,
  list: pontosRepository.listOrdenados,
});
