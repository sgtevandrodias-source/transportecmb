import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { PointGroup } from "@/components/motorista/PointGroup";
import { StudentCard } from "@/components/motorista/StudentCard";
import { TripHeader } from "@/components/motorista/TripHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/Text";
import {
  BellIcon,
  BusIcon,
  CalendarBlankIcon,
  CheckCircleIcon,
  UsersThreeIcon,
} from "@/components/ui/icons";
import { useAuth } from "@/auth/session-context";
import { useRequireAuth } from "@/auth/with-auth-guard";
import { AlunoMotorista, SituacaoEmbarque, Viagem } from "@/domain/types";
import { alunosRepository } from "@/data/repositories/alunos.repository";
import { pontosRepository } from "@/data/repositories/pontos.repository";
import { viagensRepository } from "@/data/repositories/viagens.repository";
import { useTheme } from "@/hooks/use-theme";
import { embarqueService } from "@/services/embarque-service";
import { rosterService } from "@/services/roster-service";
import { viagemService } from "@/services/viagem-service";
import { obterHorarioAtual } from "@/utils/datas";
import { DeliveryMode } from "@/screens/motorista/DeliveryMode";
import { OperationalMode } from "@/screens/motorista/OperationalMode";

export function MotoristaHomeScreen() {
  const { carregando: carregandoSessao } = useRequireAuth("motorista");
  const { logout } = useAuth();
  const theme = useTheme();

  const [viagemAtual, setViagemAtual] = useState<Viagem | null>(null);
  const [alunos, setAlunos] = useState<AlunoMotorista[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modoViagem, setModoViagem] = useState(false);

  const carregarDados = useCallback(async () => {
    try {
      setCarregando(true);

      const [todasViagens, todosAlunos, pontos] = await Promise.all([
        viagensRepository.list(),
        alunosRepository.list(),
        pontosRepository.listOrdenados(),
      ]);

      const viagemDisponivel = viagensRepository.encontrarAtual(todasViagens);
      setViagemAtual(viagemDisponivel);

      if (!viagemDisponivel) {
        setAlunos([]);
        return;
      }

      setAlunos(await rosterService.montarRoster(viagemDisponivel, todosAlunos, pontos));
    } catch (erro) {
      console.log("Erro ao carregar dados do motorista:", erro);
      alert("Não foi possível carregar a lista de passageiros.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [carregarDados]),
  );

  async function alterarSituacao(alunoId: number, novaSituacao: SituacaoEmbarque) {
    if (!viagemAtual) {
      alert("Nenhuma viagem disponível.");
      return;
    }

    const aluno = alunos.find((item) => item.id === alunoId);

    if (!aluno) {
      return;
    }

    try {
      const { horario } = await embarqueService.registrarSituacaoAluno(
        viagemAtual,
        aluno,
        novaSituacao,
      );

      setAlunos((atual) =>
        atual.map((item) =>
          item.id === alunoId
            ? { ...item, situacao: novaSituacao, horarioSituacao: horario }
            : item,
        ),
      );
    } catch (erro) {
      alert(erro instanceof Error ? erro.message : "Não foi possível salvar a situação do aluno.");
    }
  }

  async function alterarStatusViagem(novoStatus: Viagem["status"]) {
    if (!viagemAtual) {
      alert("Nenhuma viagem disponível.");
      return;
    }

    try {
      const viagemAtualizada =
        novoStatus === "em-andamento"
          ? await viagemService.iniciarViagem(viagemAtual)
          : novoStatus === "cancelada"
            ? await viagemService.cancelarViagem(viagemAtual)
            : await viagemService.pausarViagem(viagemAtual);

      setViagemAtual(viagemAtualizada);

      if (novoStatus !== "em-andamento") {
        setModoViagem(false);
      }
    } catch (erro) {
      alert(erro instanceof Error ? erro.message : "Não foi possível alterar o status da viagem.");
    }
  }

  async function finalizarEmbarque() {
    if (!viagemAtual) {
      alert("Nenhuma viagem disponível.");
      return;
    }

    if (viagemAtual.status !== "em-andamento") {
      alert("A viagem ainda não foi iniciada.");
      return;
    }

    const erroValidacao = embarqueService.validarFinalizacaoEmbarque(
      alunosConfirmados,
      viagemAtual.sentido,
    );

    if (erroValidacao) {
      alert(erroValidacao);
      return;
    }

    try {
      const viagemFinalizada = await viagemService.finalizarViagem(viagemAtual);
      setViagemAtual(viagemFinalizada);
      setModoViagem(false);

      alert(
        viagemAtual.sentido === "ida"
          ? `Chegada ao CMB registrada às ${obterHorarioAtual()}.`
          : `Chegada da viagem registrada às ${obterHorarioAtual()}.`,
      );
    } catch (erro) {
      alert(erro instanceof Error ? erro.message : "Não foi possível finalizar a viagem.");
    }
  }

  const alunosConfirmados = alunos.filter((aluno) => aluno.confirmacaoResponsavel === "vai");

  const alunosSemResposta = alunos.filter(
    (aluno) =>
      aluno.confirmacaoResponsavel === "aguardando" || aluno.confirmacaoResponsavel === "nao-sei",
  );

  const alunosQueNaoUtilizarao = alunos.filter(
    (aluno) => aluno.confirmacaoResponsavel === "nao-vai",
  );

  const totalEmbarcados = alunosConfirmados.filter((aluno) => aluno.situacao === "embarcou").length;

  const totalOcorrencias = alunosConfirmados.filter(
    (aluno) =>
      aluno.situacao === "ausente" ||
      aluno.situacao === "nao-localizado" ||
      aluno.situacao === "cancelado",
  ).length;

  const totalRevisitar = alunosConfirmados.filter((aluno) => aluno.situacao === "revisitar").length;

  const totalResolvidos = alunosConfirmados.filter(
    (aluno) => aluno.situacao !== "aguardando" && aluno.situacao !== "revisitar",
  ).length;

  const alunoAguardando =
    alunosConfirmados.find((aluno) => aluno.situacao === "aguardando") ?? null;

  const alunoParaRevisitar =
    alunosConfirmados.find((aluno) => aluno.situacao === "revisitar") ?? null;

  const alunoAtualModo = alunoAguardando ?? alunoParaRevisitar;

  const alunosEmbarcadosNaVolta = alunosConfirmados.filter(
    (aluno) => aluno.situacao === "embarcou" || aluno.situacao === "desembarcou",
  );

  const aindaHaPendenciasDeEmbarque = alunosConfirmados.some(
    (aluno) => aluno.situacao === "aguardando" || aluno.situacao === "revisitar",
  );

  const deveAbrirModoEntrega =
    viagemAtual?.sentido === "volta" && !aindaHaPendenciasDeEmbarque && alunosEmbarcadosNaVolta.length > 0;

  const progresso =
    alunosConfirmados.length > 0
      ? Math.round((totalResolvidos / alunosConfirmados.length) * 100)
      : 0;

  const alunosConfirmadosPorPonto = alunosConfirmados.reduce<Record<string, AlunoMotorista[]>>(
    (grupos, aluno) => {
      if (!grupos[aluno.ponto]) {
        grupos[aluno.ponto] = [];
      }
      grupos[aluno.ponto].push(aluno);
      return grupos;
    },
    {},
  );

  const viagemIniciada = viagemAtual?.status === "em-andamento";

  if (carregandoSessao) {
    return null;
  }

  if (modoViagem && viagemAtual) {
    if (deveAbrirModoEntrega) {
      return (
        <DeliveryMode
          viagemAtual={viagemAtual}
          alunosDaVolta={alunosEmbarcadosNaVolta}
          onVoltar={() => setModoViagem(false)}
          onAlterarSituacao={alterarSituacao}
          onFinalizarViagem={finalizarEmbarque}
        />
      );
    }

    return (
      <OperationalMode
        viagemAtual={viagemAtual}
        alunosConfirmados={alunosConfirmados}
        alunoAtual={alunoAtualModo}
        totalResolvidos={totalResolvidos}
        totalEmbarcados={totalEmbarcados}
        totalRevisitar={totalRevisitar}
        totalOcorrencias={totalOcorrencias}
        progresso={progresso}
        onVoltar={() => setModoViagem(false)}
        onAlterarSituacao={alterarSituacao}
        onFinalizarEmbarque={finalizarEmbarque}
      />
    );
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        variant="dashboard"
        title="Olá, motorista"
        subtitle="Rota CMB - Tavares Transportes"
        rightActionLabel="Sair"
        onRightAction={async () => {
          await logout();
          router.replace("/");
        }}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TripHeader
          viagemAtual={viagemAtual}
          viagemIniciada={viagemIniciada}
          totalConfirmados={alunosConfirmados.length}
          totalEmbarcados={totalEmbarcados}
          totalSemResposta={alunosSemResposta.length}
          totalOcorrencias={totalOcorrencias}
        />

        <View style={styles.primaryButtonWrapper}>
          <Button
            label={viagemIniciada ? "Pausar viagem" : "Iniciar viagem"}
            variant={viagemIniciada ? "danger" : "accent"}
            onPress={async () => {
              if (!viagemAtual) {
                alert("Nenhuma viagem disponível.");
                return;
              }

              if (viagemAtual.status === "finalizada") {
                alert("Esta viagem já foi finalizada.");
                return;
              }

              await alterarStatusViagem(viagemIniciada ? "programada" : "em-andamento");
            }}
          />
        </View>

        {viagemIniciada && (
          <View style={styles.operationalButtonWrapper}>
            <Button
              label="Abrir Modo Viagem"
              variant="secondary"
              icon={BusIcon}
              onPress={() => setModoViagem(true)}
            />
          </View>
        )}

        {carregando ? (
          <LoadingState label="Carregando passageiros..." />
        ) : !viagemAtual ? (
          <EmptyState
            tone="warning"
            icon={CalendarBlankIcon}
            title="Nenhuma viagem disponível"
            message="O gestor precisa cadastrar uma viagem programada."
          />
        ) : (
          <>
            <View style={styles.groupHeader}>
              <View style={styles.groupTitleArea}>
                <Text style={[styles.groupTitle, { color: theme.text }]}>
                  Confirmados por ponto
                </Text>
                <Text style={[styles.groupDescription, { color: theme.textMuted }]}>
                  Passageiros organizados conforme a ordem do trajeto.
                </Text>
              </View>

              <Badge label={String(alunosConfirmados.length)} tone="info" />
            </View>

            {Object.keys(alunosConfirmadosPorPonto).length === 0 ? (
              <EmptyState
                icon={UsersThreeIcon}
                title="Nenhum aluno confirmado"
                message="Ainda não há confirmações para esta viagem."
              />
            ) : (
              Object.entries(alunosConfirmadosPorPonto).map(([ponto, alunosDoPonto]) => (
                <PointGroup
                  key={ponto}
                  ponto={ponto}
                  alunos={alunosDoPonto}
                  sentidoViagem={viagemAtual.sentido}
                  onAlterarSituacao={alterarSituacao}
                />
              ))
            )}

            <View style={styles.groupHeader}>
              <View style={styles.groupTitleArea}>
                <Text style={[styles.groupTitle, { color: theme.text }]}>Aguardando resposta</Text>
                <Text style={[styles.groupDescription, { color: theme.textMuted }]}>
                  Alunos sem confirmação definitiva do responsável.
                </Text>
              </View>

              <Badge label={String(alunosSemResposta.length)} tone="warning" />
            </View>

            {alunosSemResposta.length === 0 ? (
              <EmptyState icon={CheckCircleIcon} title="Tudo certo" message="Nenhum aluno nesta situação." />
            ) : (
              alunosSemResposta.map((aluno) => (
                <StudentCard
                  key={aluno.id}
                  aluno={aluno}
                  permitirAcoes
                  sentidoViagem={viagemAtual.sentido}
                  onAlterarSituacao={alterarSituacao}
                />
              ))
            )}

            {alunosQueNaoUtilizarao.length > 0 && (
              <>
                <View style={styles.groupHeader}>
                  <View style={styles.groupTitleArea}>
                    <Text style={[styles.groupTitle, { color: theme.text }]}>Não utilizarão</Text>
                    <Text style={[styles.groupDescription, { color: theme.textMuted }]}>
                      Alunos que não devem ser aguardados nesta viagem.
                    </Text>
                  </View>

                  <Badge label={String(alunosQueNaoUtilizarao.length)} tone="neutral" />
                </View>

                {alunosQueNaoUtilizarao.map((aluno) => (
                  <StudentCard
                    key={aluno.id}
                    aluno={aluno}
                    permitirAcoes={false}
                    sentidoViagem={viagemAtual.sentido}
                    onAlterarSituacao={alterarSituacao}
                  />
                ))}
              </>
            )}

            <View style={styles.footerActions}>
              <Button
                label="Avisar atraso"
                variant="secondary"
                icon={BellIcon}
                onPress={() =>
                  alert("O aviso de atraso será implementado no módulo de avisos.")
                }
              />

              <Button label="Finalizar embarque" onPress={finalizarEmbarque} />
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 36,
    gap: 16,
  },
  primaryButtonWrapper: {
    marginTop: 4,
  },
  operationalButtonWrapper: {
    marginBottom: 8,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  groupTitleArea: {
    flex: 1,
  },
  groupTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  groupDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  footerActions: {
    gap: 10,
    marginTop: 6,
  },
});
