import { Viagem } from "@/domain/types";

export function obterDataHoraViagem(viagem: Viagem) {
  const [dia, mes, ano] = viagem.data.split("/").map(Number);

  const [hora = 0, minuto = 0] = viagem.horario
    .replace("h", ":")
    .split(":")
    .map(Number);

  return new Date(ano, mes - 1, dia, hora, minuto).getTime();
}

export function obterHorarioAtual() {
  return new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
