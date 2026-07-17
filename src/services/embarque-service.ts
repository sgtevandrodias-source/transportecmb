import { podeTransicionarEmbarque } from "@/domain/state-machines";
import { AlunoMotorista, SentidoViagem, SituacaoEmbarque, Viagem } from "@/domain/types";
import { embarquesRepository } from "@/data/repositories/embarques.repository";
import { registrarEventoRota, TipoEventoRota } from "@/services/rota-events";
import { obterHorarioAtual } from "@/utils/datas";

const eventoPorSituacao: Partial<Record<SituacaoEmbarque, TipoEventoRota>> = {
  embarcou: "aluno_embarcou",
  desembarcou: "aluno_desembarcou",
  revisitar: "aluno_revisitar",
  ausente: "aluno_ausente",
  "nao-localizado": "aluno_nao_localizado",
};

async function registrarSituacaoAluno(
  viagem: Viagem,
  aluno: AlunoMotorista,
  novaSituacao: SituacaoEmbarque,
) {
  if (viagem.status !== "em-andamento") {
    throw new Error("Inicie a viagem antes de registrar os embarques.");
  }

  if (!podeTransicionarEmbarque(aluno.situacao, novaSituacao)) {
    throw new Error(
      `Não é possível mudar "${aluno.nome}" de "${aluno.situacao}" para "${novaSituacao}".`,
    );
  }

  const horario = obterHorarioAtual();

  const listaAtualizada = await embarquesRepository.registrarSituacao(
    viagem.id,
    aluno.id,
    novaSituacao,
    horario,
  );

  // "cancelado" não tem um tipo de evento próprio no log de eventos da rota
  // (o mais próximo seria "viagem_cancelada", que descreveria a viagem
  // inteira, não um aluno) — por isso fica sem evento até existir um tipo
  // específico.
  const tipoEvento = eventoPorSituacao[novaSituacao];

  if (tipoEvento) {
    await registrarEventoRota({
      tipo: tipoEvento,
      viagemId: viagem.id,
      alunoId: aluno.id,
      perfilAutor: "motorista",
      ponto: aluno.ponto,
      detalhes: {
        nome: aluno.nome,
        serie: aluno.serie,
        situacao: novaSituacao,
      },
    });
  }

  return { listaAtualizada, horario };
}

/**
 * Valida se a viagem pode ser finalizada: todo aluno confirmado precisa ter
 * uma situação definitiva e, na volta, ninguém pode continuar embarcado.
 * Retorna uma mensagem de erro ou null se estiver tudo certo.
 */
function validarFinalizacaoEmbarque(
  alunosConfirmados: AlunoMotorista[],
  sentido: SentidoViagem,
): string | null {
  const pendentes = alunosConfirmados.filter(
    (aluno) =>
      aluno.situacao === "aguardando" || aluno.situacao === "revisitar",
  );

  if (pendentes.length > 0) {
    const aguardandoPrimeiraVerificacao = pendentes.filter(
      (aluno) => aluno.situacao === "aguardando",
    ).length;

    const aguardandoRetorno = pendentes.filter(
      (aluno) => aluno.situacao === "revisitar",
    ).length;

    return (
      `Ainda existem passageiros pendentes:\n\n` +
      `${aguardandoPrimeiraVerificacao} aguardando verificação\n` +
      `${aguardandoRetorno} aguardando retorno ao ponto`
    );
  }

  if (sentido === "volta") {
    const aindaABordo = alunosConfirmados.filter(
      (aluno) => aluno.situacao === "embarcou",
    );

    if (aindaABordo.length > 0) {
      return `Ainda existem ${aindaABordo.length} aluno(s) dentro do veículo.`;
    }
  }

  return null;
}

export const embarqueService = {
  registrarSituacaoAluno,
  validarFinalizacaoEmbarque,
};
