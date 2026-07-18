import { Ponto } from "@/domain/types";
import { createApiListRepository } from "@/data/repositories/create-api-list-repository";

const base = createApiListRepository<Ponto>("/api/pontos");

// A API já devolve a lista ordenada por `ordem`.
export const pontosRepository = { ...base, listOrdenados: base.list };
