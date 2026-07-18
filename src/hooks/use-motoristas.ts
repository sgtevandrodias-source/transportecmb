import { motoristasRepository } from "@/data/repositories/motoristas.repository";
import { createListHook } from "@/hooks/create-list-hook";

export const useMotoristas = createListHook(motoristasRepository);
