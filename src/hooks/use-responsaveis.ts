import { responsaveisRepository } from "@/data/repositories/responsaveis.repository";
import { createListHook } from "@/hooks/create-list-hook";

export const useResponsaveis = createListHook(responsaveisRepository);
