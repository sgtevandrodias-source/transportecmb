import { SituacaoEmbarque, StatusViagem } from "@/domain/types";

const transicoesViagem: Record<StatusViagem, StatusViagem[]> = {
  programada: ["em-andamento", "cancelada"],
  "em-andamento": ["programada", "finalizada", "cancelada"],
  finalizada: [],
  cancelada: [],
};

export function podeTransicionarViagem(
  de: StatusViagem,
  para: StatusViagem,
): boolean {
  return transicoesViagem[de].includes(para);
}

const transicoesEmbarque: Record<SituacaoEmbarque, SituacaoEmbarque[]> = {
  aguardando: ["embarcou", "ausente", "nao-localizado", "revisitar", "cancelado"],
  revisitar: ["embarcou", "nao-localizado", "cancelado"],
  embarcou: ["desembarcou", "cancelado"],
  desembarcou: [],
  ausente: ["cancelado"],
  "nao-localizado": ["cancelado"],
  cancelado: [],
};

export function podeTransicionarEmbarque(
  de: SituacaoEmbarque,
  para: SituacaoEmbarque,
): boolean {
  return transicoesEmbarque[de].includes(para);
}
