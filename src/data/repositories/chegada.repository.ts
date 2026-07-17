import AsyncStorage from "@react-native-async-storage/async-storage";

import { RegistroChegada } from "@/domain/types";
import { StorageKeys } from "@/data/storage-keys";

async function obter(viagemId: number): Promise<RegistroChegada | null> {
  const salva = await AsyncStorage.getItem(
    StorageKeys.chegadaDaViagem(viagemId),
  );

  return salva ? (JSON.parse(salva) as RegistroChegada) : null;
}

async function registrar(registro: RegistroChegada): Promise<void> {
  await AsyncStorage.setItem(
    StorageKeys.chegadaDaViagem(registro.viagemId),
    JSON.stringify(registro),
  );
}

export const chegadaRepository = { obter, registrar };
