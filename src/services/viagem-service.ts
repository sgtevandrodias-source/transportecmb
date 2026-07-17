import { podeTransicionarViagem } from "@/domain/state-machines";
import { StatusViagem, Viagem } from "@/domain/types";
import { chegadaRepository } from "@/data/repositories/chegada.repository";
import { viagensRepository } from "@/data/repositories/viagens.repository";
import { registrarEventoRota } from "@/services/rota-events";
import { obterHorarioAtual } from "@/utils/datas";

async function transicionarStatus(
  viagem: Viagem,
  novoStatus: StatusViagem,
): Promise<Viagem> {
  if (!podeTransicionarViagem(viagem.status, novoStatus)) {
    throw new Error(
      `Não é possível mudar a viagem de "${viagem.status}" para "${novoStatus}".`,
    );
  }

  await viagensRepository.update(viagem.id, { status: novoStatus });

  return { ...viagem, status: novoStatus };
}

async function iniciarViagem(viagem: Viagem): Promise<Viagem> {
  const viagemAtualizada = await transicionarStatus(viagem, "em-andamento");

  await registrarEventoRota({
    tipo: "viagem_iniciada",
    viagemId: viagem.id,
    perfilAutor: "motorista",
    detalhes: {
      sentido: viagem.sentido,
      turno: viagem.turno,
      motorista: viagem.motorista,
    },
  });

  return viagemAtualizada;
}

function pausarViagem(viagem: Viagem): Promise<Viagem> {
  return transicionarStatus(viagem, "programada");
}

async function cancelarViagem(viagem: Viagem): Promise<Viagem> {
  const viagemAtualizada = await transicionarStatus(viagem, "cancelada");

  await registrarEventoRota({
    tipo: "viagem_cancelada",
    viagemId: viagem.id,
    perfilAutor: "motorista",
    detalhes: { sentido: viagem.sentido, turno: viagem.turno },
  });

  return viagemAtualizada;
}

async function finalizarViagem(viagem: Viagem): Promise<Viagem> {
  const horario = obterHorarioAtual();
  const destino = viagem.sentido === "ida" ? "CMB" : "ponto final da rota";

  await chegadaRepository.registrar({
    viagemId: viagem.id,
    horario,
    dataHora: new Date().toISOString(),
    sentido: viagem.sentido,
    destino,
  });

  const viagemAtualizada = await transicionarStatus(viagem, "finalizada");

  await registrarEventoRota({
    tipo: viagem.sentido === "ida" ? "chegada_cmb" : "viagem_finalizada",
    viagemId: viagem.id,
    perfilAutor: "motorista",
    detalhes: { sentido: viagem.sentido, destino, horario },
  });

  return viagemAtualizada;
}

export const viagemService = {
  iniciarViagem,
  pausarViagem,
  cancelarViagem,
  finalizarViagem,
};
