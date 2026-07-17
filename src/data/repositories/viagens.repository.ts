import { SentidoViagem, Viagem } from "@/domain/types";
import { StorageKeys } from "@/data/storage-keys";
import { createListRepository } from "@/data/repositories/create-list-repository";
import { obterDataHoraViagem } from "@/utils/datas";

const base = createListRepository<Viagem>(StorageKeys.viagens);

function ordenarPorDataHora(lista: Viagem[]): Viagem[] {
  return [...lista].sort(
    (a, b) => obterDataHoraViagem(a) - obterDataHoraViagem(b),
  );
}

/**
 * Viagem em andamento do sentido informado, ou a próxima programada em
 * ordem cronológica — mesma regra usada hoje na tela do motorista e na do
 * responsável para decidir qual viagem mostrar.
 */
function encontrarAtualPorSentido(
  lista: Viagem[],
  sentido: SentidoViagem,
): Viagem | null {
  const doSentido = ordenarPorDataHora(
    lista.filter(
      (viagem) =>
        viagem.sentido === sentido &&
        (viagem.status === "programada" || viagem.status === "em-andamento"),
    ),
  );

  const emAndamento = doSentido.find(
    (viagem) => viagem.status === "em-andamento",
  );

  return (
    emAndamento ??
    doSentido.find((viagem) => viagem.status === "programada") ??
    null
  );
}

async function buscarAtualPorSentido(
  sentido: SentidoViagem,
): Promise<Viagem | null> {
  return encontrarAtualPorSentido(await base.list(), sentido);
}

/**
 * Viagem em andamento (qualquer sentido) ou, na falta dela, a próxima
 * programada — é a única viagem que o motorista precisa enxergar por vez.
 */
function encontrarAtual(lista: Viagem[]): Viagem | null {
  const emAndamento = lista.find((viagem) => viagem.status === "em-andamento");

  const programadas = ordenarPorDataHora(
    lista.filter((viagem) => viagem.status === "programada"),
  );

  return emAndamento ?? programadas[0] ?? null;
}

export const viagensRepository = {
  ...base,
  ordenarPorDataHora,
  encontrarAtualPorSentido,
  buscarAtualPorSentido,
  encontrarAtual,
};
