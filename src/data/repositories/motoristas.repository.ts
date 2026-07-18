import { Motorista } from "@/domain/types";
import { createApiListRepository } from "@/data/repositories/create-api-list-repository";

export const motoristasRepository = createApiListRepository<Motorista>("/api/usuarios", {
  perfil: "motorista",
});
