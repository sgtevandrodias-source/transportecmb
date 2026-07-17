import { SentidoViagem } from "@/domain/types";

export const StorageKeys = {
  responsaveis: "@rota_cmb_responsaveis",
  alunos: "@rota_cmb_alunos",
  pontos: "@rota_cmb_pontos",
  viagens: "@rota_cmb_viagens",
  sessao: "@rota_cmb_sessao",

  embarquesDaViagem(viagemId: number) {
    return `@rota_cmb_embarques_${viagemId}`;
  },

  chegadaDaViagem(viagemId: number) {
    return `@rota_cmb_chegada_${viagemId}`;
  },

  confirmacao(
    sentido: SentidoViagem,
    viagemId: number,
    alunoId: number,
  ) {
    return `@rota_cmb_confirmacao_${sentido}_${viagemId}_${alunoId}`;
  },
} as const;
