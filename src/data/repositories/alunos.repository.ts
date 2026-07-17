import { Aluno } from "@/domain/types";
import { StorageKeys } from "@/data/storage-keys";
import { createListRepository } from "@/data/repositories/create-list-repository";

const alunosRepository = createListRepository<Aluno>(StorageKeys.alunos);

export { alunosRepository };
