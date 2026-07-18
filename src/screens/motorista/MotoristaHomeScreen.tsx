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
  CalendarBlankIcon,
  CheckCircleIcon,
  HouseIcon,
  UsersThreeIcon,
} from "@/components/ui/icons";
import { useAuth } from "@/auth/session-context";
import { useRequireAuth } from "@/auth/with-auth-guard";
import { AlunoMotorista, SituacaoEmbarque, Viagem } from "@/domain/types";
import { alunosRepository } from "@/data/repositories/alunos.repository";
import { pontosRepository } from "@/data/repositories/pontos.repository";
import { viagensRepository } from "@/data/repositories/viagens.repository";
import { usePolling } from "@/hooks/use-polling";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useTheme } from "@/hooks/use-theme";
import { embarqueService } from "@/services/embarque-service";
import { rosterService } from "@/services/roster-service";
import { viagemService } from "@/services/viagem-service";
import { obterHorarioAtual } from "@/utils/datas";

export function MotoristaHomeScreen() {
  const { carregando: carregandoSessao } = useRequireAuth("motorista");
  const { logout } = useAuth();
  const theme = useTheme();

  const [viagemAtual, setViagemAtual] = useState<Viagem | null>(null);
  const [alunos, setAlunos] = useState<AlunoMotorista[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [desembarcandoTodos, setDesembarcandoTodos] = useState(false);

  const notificacoes = usePushNotifications();

  const carregarDados = useCallback(async (mostrarCarregando = true) => {
    try {
      if (mostrarCarregando) {
        setCarregando(true);
      }

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
      if (mostrarCarregando) {
        alert("Não foi possível carregar a lista de passageiros.");
      }
    } finally {
      if (mostrarCarregando) {
        setCarregando(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [carregarDados]),
  );

  usePolling(
    useCallback(() => carregarDados(false), [carregarDados]),
    10000,
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

      alert(
        viagemAtual.sentido === "ida"
          ? `Chegada ao CMB registrada às ${obterHorarioAtual()}.`
          : `Chegada da viagem registrada às ${obterHorarioAtual()}.`,
      );
    } catch (erro) {
      alert(erro instanceof Error ? erro.message : "Não foi possível finalizar a viagem.");
    }
  }

  async function desembarcarTodos() {
    setDesembarcandoTodos(true);

    try {
      await Promise.all(
        alunosEmbarcados.map((aluno) => alterarSituacao(aluno.id, "desembarcou")),
      );
    } finally {
      setDesembarcandoTodos(false);
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

  const alunosEmbarcados = alunosConfirmados.filter((aluno) => aluno.situacao === "embarcou");

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

        {notificacoes.suportado && (
          <View style={styles.operationalButtonWrapper}>
            <Button
              label={notificacoes.ativas ? "Notificações ativadas" : "Ativar notificações"}
              variant="secondary"
              icon={BellIcon}
              loading={notificacoes.carregando}
              onPress={notificacoes.alternar}
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
        ) : alunos.length === 0 ? (
          <EmptyState
            tone="warning"
            icon={UsersThreeIcon}
            title="Nenhum aluno cadastrado"
            message="O gestor precisa cadastrar alunos para eles aparecerem nesta viagem."
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

              {viagemIniciada && alunosEmbarcados.length > 0 && (
                <Button
                  label="Desembarcar todos"
                  variant="secondary"
                  icon={HouseIcon}
                  loading={desembarcandoTodos}
                  onPress={desembarcarTodos}
                />
              )}

              <Button label="Finalizar viagem" onPress={finalizarEmbarque} />
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
