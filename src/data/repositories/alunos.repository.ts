import { Aluno } from "@/domain/types";
import { createApiListRepository } from "@/data/repositories/create-api-list-repository";

export const alunosRepository = createApiListRepository<Aluno>("/api/alunos");
