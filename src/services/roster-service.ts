import { Aluno, AlunoMotorista, Ponto, Viagem } from "@/domain/types";
import { confirmacoesRepository } from "@/data/repositories/confirmacoes.repository";
import { embarquesRepository } from "@/data/repositories/embarques.repository";
import { normalizarTexto } from "@/utils/texto";

/**
 * Junta o cadastro de alunos com a confirmação do responsável e a situação
 * de embarque registrada pelo motorista — a mesma composição usada na tela
 * do motorista e no painel do gestor, então fica centralizada aqui em vez
 * de duplicada nas duas telas.
 *
 * Não filtra por turno: o turno do aluno é só informação exibida na tela,
 * não restringe em quais viagens ele pode aparecer — quem decide se o aluno
 * vai ou não é a confirmação do responsável.
 */
async function montarRoster(
  viagem: Viagem,
  todosOsAlunos: Aluno[],
  pontos: Ponto[],
): Promise<AlunoMotorista[]> {
  const embarques = await embarquesRepository.listarPorViagem(viagem.id);

  const roster = await Promise.all(
    todosOsAlunos.map(async (aluno) => {
      const embarque = embarques.find((item) => item.id === aluno.id);

      const confirmacao = await confirmacoesRepository.obter(
        viagem.sentido,
        viagem.id,
        aluno.id,
      );

      const ponto = pontos.find(
        (item) => normalizarTexto(item.nome) === normalizarTexto(aluno.ponto),
      );

      return {
        ...aluno,
        situacao: embarque?.situacao ?? "aguardando",
        confirmacaoResponsavel: confirmacao,
        ordemPonto: ponto?.ordem ?? 999,
        horarioSituacao: embarque?.horarioSituacao,
      } satisfies AlunoMotorista;
    }),
  );

  roster.sort((a, b) =>
    a.ordemPonto !== b.ordemPonto
      ? a.ordemPonto - b.ordemPonto
      : a.nome.localeCompare(b.nome),
  );

  return roster;
}

export const rosterService = { montarRoster };
