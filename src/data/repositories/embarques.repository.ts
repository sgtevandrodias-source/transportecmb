import { apiClient } from "@/data/api-client";
import { RegistroEmbarque, SituacaoEmbarque } from "@/domain/types";

async function listarPorViagem(viagemId: number): Promise<RegistroEmbarque[]> {
  return apiClient.get<RegistroEmbarque[]>(`/api/embarques/${viagemId}`);
}

async function registrarSituacao(
  viagemId: number,
  alunoId: number,
  situacao: SituacaoEmbarque,
  horarioSituacao: string,
): Promise<RegistroEmbarque[]> {
  return apiClient.post<RegistroEmbarque[]>(`/api/embarques/${viagemId}`, {
    alunoId,
    situacao,
    horarioSituacao,
  });
}

export const embarquesRepository = { listarPorViagem, registrarSituacao };
