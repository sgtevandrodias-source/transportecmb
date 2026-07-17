import { Aluno, Viagem } from "@/domain/types";
import { chegadaRepository } from "@/data/repositories/chegada.repository";
import { embarquesRepository } from "@/data/repositories/embarques.repository";
import {
  ArrowsClockwiseIcon,
  BackpackIcon,
  BuildingsIcon,
  BusIcon,
  CalendarBlankIcon,
  CheckCircleIcon,
  ClockIcon,
  HouseIcon,
  WarningCircleIcon,
  XCircleIcon,
  type Icon,
} from "@/components/ui/icons";

export type ToneAcompanhamento = "neutral" | "success" | "info" | "warning" | "danger";

export type Acompanhamento = {
  titulo: string;
  mensagem: string;
  horario?: string;
  icone: Icon;
  tone: ToneAcompanhamento;
};

/**
 * Traduz o estado atual de uma viagem/aluno (chegada registrada, situação de
 * embarque, status da viagem) numa mensagem amigável para o responsável —
 * mesma lógica que antes vivia dentro da tela do responsável.
 */
async function obterAcompanhamento(
  viagem: Viagem | null,
  aluno: Aluno | null,
): Promise<Acompanhamento> {
  if (!viagem) {
    return {
      titulo: "Nenhuma viagem programada",
      mensagem: "Ainda não existe uma viagem disponível para acompanhamento.",
      icone: CalendarBlankIcon,
      tone: "neutral",
    };
  }

  if (!aluno) {
    return {
      titulo: "Nenhum aluno selecionado",
      mensagem: "Selecione um aluno para acompanhar a viagem.",
      icone: BackpackIcon,
      tone: "neutral",
    };
  }

  const chegada = await chegadaRepository.obter(viagem.id);

  if (chegada) {
    return {
      titulo:
        viagem.sentido === "ida" ? `${aluno.nome} chegou ao CMB` : `${aluno.nome} chegou ao destino`,
      mensagem:
        viagem.sentido === "ida"
          ? "A viagem foi finalizada e a chegada ao Colégio Militar foi registrada."
          : "A viagem de volta foi finalizada.",
      horario: `Chegada registrada às ${chegada.horario}`,
      icone: viagem.sentido === "ida" ? BuildingsIcon : HouseIcon,
      tone: "success",
    };
  }

  const embarques = await embarquesRepository.listarPorViagem(viagem.id);
  const registro = embarques.find((item) => item.id === aluno.id);

  if (registro) {
    switch (registro.situacao) {
      case "embarcou":
        return {
          titulo: `${aluno.nome} embarcou`,
          mensagem:
            viagem.status === "em-andamento"
              ? "O aluno está no transporte e a viagem está em andamento."
              : "O embarque do aluno foi registrado.",
          horario: registro.horarioSituacao
            ? `Embarque registrado às ${registro.horarioSituacao}`
            : undefined,
          icone: CheckCircleIcon,
          tone: "success",
        };

      case "desembarcou":
        return {
          titulo: `${aluno.nome} desembarcou`,
          mensagem: "A entrega do aluno no ponto foi registrada pelo motorista.",
          horario: registro.horarioSituacao
            ? `Desembarque registrado às ${registro.horarioSituacao}`
            : undefined,
          icone: HouseIcon,
          tone: "info",
        };

      case "revisitar":
        return {
          titulo: "O motorista retornará ao ponto",
          mensagem: `${aluno.nome} não estava disponível na primeira passagem. O motorista fará uma nova tentativa.`,
          horario: registro.horarioSituacao
            ? `Primeira passagem às ${registro.horarioSituacao}`
            : undefined,
          icone: ArrowsClockwiseIcon,
          tone: "info",
        };

      case "ausente":
        return {
          titulo: `${aluno.nome} foi marcado como ausente`,
          mensagem: "O motorista informou que o aluno não embarcou nesta viagem.",
          horario: registro.horarioSituacao
            ? `Atualizado às ${registro.horarioSituacao}`
            : undefined,
          icone: WarningCircleIcon,
          tone: "warning",
        };

      case "nao-localizado":
        return {
          titulo: `${aluno.nome} não foi localizado`,
          mensagem: "O motorista não encontrou o aluno no ponto de embarque.",
          horario: registro.horarioSituacao
            ? `Atualizado às ${registro.horarioSituacao}`
            : undefined,
          icone: WarningCircleIcon,
          tone: "danger",
        };

      case "cancelado":
        return {
          titulo: "Embarque cancelado",
          mensagem: "O embarque do aluno foi cancelado nesta viagem.",
          horario: registro.horarioSituacao
            ? `Atualizado às ${registro.horarioSituacao}`
            : undefined,
          icone: XCircleIcon,
          tone: "danger",
        };
    }
  }

  if (viagem.status === "em-andamento") {
    return {
      titulo: "Viagem iniciada",
      mensagem: `A rota foi iniciada. Aguardando o embarque de ${aluno.nome}.`,
      icone: BusIcon,
      tone: "info",
    };
  }

  if (viagem.status === "cancelada") {
    return {
      titulo: "Viagem cancelada",
      mensagem: "Esta viagem foi cancelada pelo responsável pelo transporte.",
      icone: XCircleIcon,
      tone: "danger",
    };
  }

  return {
    titulo: "Viagem ainda não iniciada",
    mensagem: `Aguardando o início da viagem prevista para ${viagem.horario}.`,
    icone: ClockIcon,
    tone: "warning",
  };
}

export const acompanhamentoService = { obterAcompanhamento };
