import { apiClient } from "@/data/api-client";
import { RegistroChegada } from "@/domain/types";

async function obter(viagemId: number): Promise<RegistroChegada | null> {
  return apiClient.get<RegistroChegada | null>(`/api/chegada/${viagemId}`);
}

async function registrar(registro: RegistroChegada): Promise<void> {
  await apiClient.post(`/api/chegada/${registro.viagemId}`, registro);
}

export const chegadaRepository = { obter, registrar };
