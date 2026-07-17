import { alunosRepository } from "@/data/repositories/alunos.repository";
import { createListHook } from "@/hooks/create-list-hook";

export const useAlunos = createListHook(alunosRepository);
