import { apiClient } from "@/data/api-client";
import { ConfirmacaoResponsavel, SentidoViagem } from "@/domain/types";

async function obter(
  sentido: SentidoViagem,
  viagemId: number,
  alunoId: number,
): Promise<ConfirmacaoResponsavel> {
  const registro = await apiClient.get<{ confirmacao: ConfirmacaoResponsavel } | null>(
    `/api/confirmacoes/${sentido}/${viagemId}/${alunoId}`,
  );

  return registro?.confirmacao ?? "aguardando";
}

async function salvar(
  sentido: SentidoViagem,
  viagemId: number,
  alunoId: number,
  confirmacao: ConfirmacaoResponsavel,
): Promise<void> {
  await apiClient.put(`/api/confirmacoes/${sentido}/${viagemId}/${alunoId}`, { confirmacao });
}

export const confirmacoesRepository = { obter, salvar };
