import AsyncStorage from "@react-native-async-storage/async-storage";

import { ConfirmacaoResponsavel, SentidoViagem } from "@/domain/types";
import { StorageKeys } from "@/data/storage-keys";

async function obter(
  sentido: SentidoViagem,
  viagemId: number,
  alunoId: number,
): Promise<ConfirmacaoResponsavel> {
  const salva = await AsyncStorage.getItem(
    StorageKeys.confirmacao(sentido, viagemId, alunoId),
  );

  return (salva as ConfirmacaoResponsavel) ?? "aguardando";
}

async function salvar(
  sentido: SentidoViagem,
  viagemId: number,
  alunoId: number,
  confirmacao: ConfirmacaoResponsavel,
): Promise<void> {
  await AsyncStorage.setItem(
    StorageKeys.confirmacao(sentido, viagemId, alunoId),
    confirmacao,
  );
}

export const confirmacoesRepository = { obter, salvar };
