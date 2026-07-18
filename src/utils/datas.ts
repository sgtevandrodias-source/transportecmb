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

/** Data de hoje no mesmo formato "DD/MM/AAAA" usado em `viagem.data`. */
export function obterDataAtual() {
  const agora = new Date();
  const dia = String(agora.getDate()).padStart(2, "0");
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${agora.getFullYear()}`;
}
