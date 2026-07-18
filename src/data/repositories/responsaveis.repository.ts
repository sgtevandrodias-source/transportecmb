import { Responsavel } from "@/domain/types";
import { createApiListRepository } from "@/data/repositories/create-api-list-repository";

export const responsaveisRepository = createApiListRepository<Responsavel>("/api/usuarios", {
  perfil: "responsavel",
});
