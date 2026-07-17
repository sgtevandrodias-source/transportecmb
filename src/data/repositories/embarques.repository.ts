import AsyncStorage from "@react-native-async-storage/async-storage";

import { RegistroEmbarque, SituacaoEmbarque } from "@/domain/types";
import { StorageKeys } from "@/data/storage-keys";

async function listarPorViagem(
  viagemId: number,
): Promise<RegistroEmbarque[]> {
  const salvos = await AsyncStorage.getItem(
    StorageKeys.embarquesDaViagem(viagemId),
  );

  return salvos ? (JSON.parse(salvos) as RegistroEmbarque[]) : [];
}

async function registrarSituacao(
  viagemId: number,
  alunoId: number,
  situacao: SituacaoEmbarque,
  horarioSituacao: string,
): Promise<RegistroEmbarque[]> {
  const lista = await listarPorViagem(viagemId);

  const jaExiste = lista.some((registro) => registro.id === alunoId);

  const listaAtualizada = jaExiste
    ? lista.map((registro) =>
        registro.id === alunoId
          ? { ...registro, situacao, horarioSituacao }
          : registro,
      )
    : [...lista, { id: alunoId, situacao, horarioSituacao }];

  await AsyncStorage.setItem(
    StorageKeys.embarquesDaViagem(viagemId),
    JSON.stringify(listaAtualizada),
  );

  return listaAtualizada;
}

export const embarquesRepository = { listarPorViagem, registrarSituacao };
