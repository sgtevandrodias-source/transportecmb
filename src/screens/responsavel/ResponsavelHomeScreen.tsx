import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { TripStatusCard } from "@/components/responsavel/TripStatusCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/Text";
import { BackpackIcon, CheckIcon, XIcon } from "@/components/ui/icons";
import { useAuth } from "@/auth/session-context";
import { useRequireAuth } from "@/auth/with-auth-guard";
import { Radii } from "@/constants/theme";
import { alunosRepository } from "@/data/repositories/alunos.repository";
import { confirmacoesRepository } from "@/data/repositories/confirmacoes.repository";
import { viagensRepository } from "@/data/repositories/viagens.repository";
import { Aluno, ConfirmacaoResponsavel, SentidoViagem, Viagem } from "@/domain/types";
import { useTheme } from "@/hooks/use-theme";
import { acompanhamentoService, Acompanhamento, ToneAcompanhamento } from "@/services/acompanhamento-service";

const textoConfirmacaoIda: Record<ConfirmacaoResponsavel, string> = {
  vai: "Ida confirmada",
  "nao-vai": "Não utilizará o transporte",
  "nao-sei": "Decisão pendente",
  aguardando: "Aguardando confirmação",
};

const descricaoConfirmacaoIda: Record<ConfirmacaoResponsavel, string> = {
  vai: "O motorista já pode considerar o aluno na lista de embarque.",
  "nao-vai": "O aluno não será esperado nesta viagem.",
  "nao-sei": "Você poderá confirmar ou cancelar mais tarde.",
  aguardando: "Confirme se o aluno utilizará o transporte nesta viagem.",
};

const textoConfirmacaoVolta: Record<ConfirmacaoResponsavel, string> = {
  vai: "Volta confirmada",
  "nao-vai": "Não retornará no transporte",
  "nao-sei": "Decisão pendente",
  aguardando: "Aguardando confirmação",
};

const descricaoConfirmacaoVolta: Record<ConfirmacaoResponsavel, string> = {
  vai: "O aluno será incluído na lista de embarque da volta.",
  "nao-vai": "O motorista não aguardará o aluno na saída.",
  "nao-sei": "A confirmação poderá ser alterada mais tarde.",
  aguardando: "Informe se o aluno voltará utilizando o transporte.",
};

export function ResponsavelHomeScreen() {
  const { usuario, carregando: carregandoSessao } = useRequireAuth("responsavel");
  const { logout } = useAuth();
  const theme = useTheme();

  const [alunosVinculados, setAlunosVinculados] = useState<Aluno[]>([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);
  const [viagemIda, setViagemIda] = useState<Viagem | null>(null);
  const [viagemVolta, setViagemVolta] = useState<Viagem | null>(null);
  const [confirmacaoIda, setConfirmacaoIda] = useState<ConfirmacaoResponsavel>("aguardando");
  const [confirmacaoVolta, setConfirmacaoVolta] = useState<ConfirmacaoResponsavel>("aguardando");
  const [acompanhamentoIda, setAcompanhamentoIda] = useState<Acompanhamento | null>(null);
  const [acompanhamentoVolta, setAcompanhamentoVolta] = useState<Acompanhamento | null>(null);

  useEffect(() => {
    if (!usuario) {
      return;
    }

    async function carregarDados() {
      const todosOsAlunos = await alunosRepository.list();
      const filhos = todosOsAlunos.filter((aluno) => aluno.responsavelId === usuario!.id);

      setAlunosVinculados(filhos);

      const primeiroFilho = filhos[0] ?? null;
      setAlunoSelecionado(primeiroFilho);

      const [ida, volta] = await Promise.all([
        viagensRepository.buscarAtualPorSentido("ida"),
        viagensRepository.buscarAtualPorSentido("volta"),
      ]);

      setViagemIda(ida);
      setViagemVolta(volta);

      await carregarConfirmacoesEAcompanhamento(primeiroFilho, ida, volta);
    }

    carregarDados();
  }, [usuario]);

  async function carregarConfirmacoesEAcompanhamento(
    aluno: Aluno | null,
    ida: Viagem | null,
    volta: Viagem | null,
  ) {
    const [statusIda, statusVolta] = await Promise.all([
      acompanhamentoService.obterAcompanhamento(ida, aluno),
      acompanhamentoService.obterAcompanhamento(volta, aluno),
    ]);

    setAcompanhamentoIda(statusIda);
    setAcompanhamentoVolta(statusVolta);

    setConfirmacaoIda(
      ida && aluno ? await confirmacoesRepository.obter("ida", ida.id, aluno.id) : "aguardando",
    );

    setConfirmacaoVolta(
      volta && aluno ? await confirmacoesRepository.obter("volta", volta.id, aluno.id) : "aguardando",
    );
  }

  async function selecionarAluno(aluno: Aluno) {
    setAlunoSelecionado(aluno);
    await carregarConfirmacoesEAcompanhamento(aluno, viagemIda, viagemVolta);
  }

  async function confirmar(sentido: SentidoViagem, valor: ConfirmacaoResponsavel) {
    const viagem = sentido === "ida" ? viagemIda : viagemVolta;

    if (!viagem || !alunoSelecionado) {
      alert(`Nenhuma viagem de ${sentido} disponível.`);
      return;
    }

    if (sentido === "ida") {
      setConfirmacaoIda(valor);
    } else {
      setConfirmacaoVolta(valor);
    }

    await confirmacoesRepository.salvar(sentido, viagem.id, alunoSelecionado.id, valor);
  }

  function corDoTone(tone: ToneAcompanhamento) {
    const mapa: Record<ToneAcompanhamento, string> = {
      neutral: theme.textMuted,
      success: theme.success,
      info: theme.info,
      warning: theme.warning,
      danger: theme.danger,
    };

    return mapa[tone];
  }

  function corDeFundo(confirmacao: ConfirmacaoResponsavel) {
    if (confirmacao === "vai") return theme.successBg;
    if (confirmacao === "nao-vai") return theme.dangerBg;
    if (confirmacao === "nao-sei") return theme.warningBg;
    return theme.warningBg;
  }

  if (carregandoSessao) {
    return null;
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        variant="dashboard"
        title={`Olá, ${usuario?.nome ?? "responsável"}`}
        subtitle="Rota CMB - Tavares Transportes"
        rightActionLabel="Sair"
        onRightAction={async () => {
          await logout();
          router.replace("/");
        }}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.childCard}>
          <View style={styles.childInfoArea}>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
              {alunosVinculados.length > 1 ? "Filhos vinculados" : "Aluno vinculado"}
            </Text>

            {alunoSelecionado ? (
              <>
                <Text style={[styles.childName, { color: theme.text }]}>
                  {alunoSelecionado.nome}
                </Text>
                <Text style={[styles.childInfo, { color: theme.textSecondary }]}>
                  {alunoSelecionado.serie} • Turno da {alunoSelecionado.turno.toLowerCase()}
                </Text>
                <Text style={[styles.childInfo, { color: theme.textSecondary }]}>
                  {alunoSelecionado.ponto}
                </Text>
              </>
            ) : (
              <Text style={[styles.childName, { color: theme.text }]}>Nenhum aluno vinculado</Text>
            )}
          </View>

          <View style={[styles.childIcon, { backgroundColor: theme.infoBg }]}>
            <BackpackIcon size={26} color={theme.primary} weight="bold" />
          </View>
        </Card>

        {acompanhamentoIda && (
          <TripStatusCard
            titulo={`Ida: ${acompanhamentoIda.titulo}`}
            mensagem={acompanhamentoIda.mensagem}
            horario={acompanhamentoIda.horario}
            icone={acompanhamentoIda.icone}
            cor={corDoTone(acompanhamentoIda.tone)}
          />
        )}

        {acompanhamentoVolta && (
          <TripStatusCard
            titulo={`Volta: ${acompanhamentoVolta.titulo}`}
            mensagem={acompanhamentoVolta.mensagem}
            horario={acompanhamentoVolta.horario}
            icone={acompanhamentoVolta.icone}
            cor={corDoTone(acompanhamentoVolta.tone)}
          />
        )}

        {alunosVinculados.length > 1 && (
          <View style={styles.childrenSelector}>
            {alunosVinculados.map((aluno) => (
              <TouchableOpacity key={aluno.id} onPress={() => selecionarAluno(aluno)}>
                <View
                  style={[
                    styles.childOption,
                    {
                      borderColor: alunoSelecionado?.id === aluno.id ? theme.primary : theme.border,
                      borderWidth: alunoSelecionado?.id === aluno.id ? 2 : 1,
                      backgroundColor:
                        alunoSelecionado?.id === aluno.id ? theme.infoBg : theme.surface,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.childOptionText,
                      { color: alunoSelecionado?.id === aluno.id ? theme.primary : theme.textSecondary },
                    ]}
                  >
                    {aluno.nome}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Card style={styles.tripCard}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>Próxima viagem de ida</Text>

          {viagemIda ? (
            <>
              <Text style={[styles.tripTitle, { color: theme.text }]}>Ida para o CMB</Text>
              {(["data", "horario", "turno", "motorista"] as const).map((campo) => (
                <View key={campo} style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.textMuted }]}>
                    {campo === "data"
                      ? "Data"
                      : campo === "horario"
                        ? "Horário previsto"
                        : campo === "turno"
                          ? "Turno"
                          : "Motorista"}
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{viagemIda[campo]}</Text>
                </View>
              ))}
            </>
          ) : (
            <Text style={[styles.noTripText, { color: theme.textSecondary }]}>
              Nenhuma viagem de ida programada.
            </Text>
          )}
        </Card>

        <Card style={styles.tripCard}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>Próxima viagem de volta</Text>

          {viagemVolta ? (
            <>
              <Text style={[styles.tripTitle, { color: theme.text }]}>Volta do CMB</Text>
              {(["data", "horario", "turno", "motorista"] as const).map((campo) => (
                <View key={campo} style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.textMuted }]}>
                    {campo === "data"
                      ? "Data"
                      : campo === "horario"
                        ? "Horário previsto"
                        : campo === "turno"
                          ? "Turno"
                          : "Motorista"}
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{viagemVolta[campo]}</Text>
                </View>
              ))}
            </>
          ) : (
            <Text style={[styles.noTripText, { color: theme.textSecondary }]}>
              Nenhuma viagem de volta programada.
            </Text>
          )}
        </Card>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Confirmação de ida</Text>

        <View style={styles.optionsRow}>
          <View style={styles.optionButtonWrapper}>
            <Button
              label="Vai na ida"
              variant="success"
              icon={CheckIcon}
              onPress={() => confirmar("ida", "vai")}
            />
          </View>
          <View style={styles.optionButtonWrapper}>
            <Button
              label="Não vai"
              variant="danger"
              icon={XIcon}
              onPress={() => confirmar("ida", "nao-vai")}
            />
          </View>
        </View>

        <View style={styles.maybeButtonWrapper}>
          <Button label="Ainda não sei" variant="secondary" onPress={() => confirmar("ida", "nao-sei")} />
        </View>

        <View style={[styles.statusCard, { backgroundColor: corDeFundo(confirmacaoIda) }]}>
          <Text style={[styles.statusTitle, { color: theme.text }]}>Situação atual</Text>
          <Text style={[styles.statusBadge, { color: theme.text }]}>
            {textoConfirmacaoIda[confirmacaoIda]}
          </Text>
          <Text style={[styles.statusDescription, { color: theme.textSecondary }]}>
            {descricaoConfirmacaoIda[confirmacaoIda]}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, styles.returnTitle, { color: theme.text }]}>
          Confirmação de volta
        </Text>

        <View style={styles.optionsRow}>
          <View style={styles.optionButtonWrapper}>
            <Button
              label="Volta no ônibus"
              variant="success"
              icon={CheckIcon}
              onPress={() => confirmar("volta", "vai")}
            />
          </View>
          <View style={styles.optionButtonWrapper}>
            <Button
              label="Não volta"
              variant="danger"
              icon={XIcon}
              onPress={() => confirmar("volta", "nao-vai")}
            />
          </View>
        </View>

        <View style={styles.maybeButtonWrapper}>
          <Button label="Ainda não sei" variant="secondary" onPress={() => confirmar("volta", "nao-sei")} />
        </View>

        <View style={[styles.statusCard, { backgroundColor: corDeFundo(confirmacaoVolta) }]}>
          <Text style={[styles.statusTitle, { color: theme.text }]}>Situação da volta</Text>
          <Text style={[styles.statusBadge, { color: theme.text }]}>
            {textoConfirmacaoVolta[confirmacaoVolta]}
          </Text>
          <Text style={[styles.statusDescription, { color: theme.textSecondary }]}>
            {descricaoConfirmacaoVolta[confirmacaoVolta]}
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  childCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  childInfoArea: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 13,
  },
  childName: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 3,
  },
  childInfo: {
    fontSize: 14,
    marginTop: 4,
  },
  childIcon: {
    width: 56,
    height: 56,
    borderRadius: Radii.medium,
    alignItems: "center",
    justifyContent: "center",
  },
  childrenSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  childOption: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  childOptionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  tripCard: {
    marginBottom: 22,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  tripTitle: {
    fontSize: 19,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  noTripText: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  returnTitle: {
    marginTop: 24,
  },
  optionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  optionButtonWrapper: {
    flex: 1,
  },
  maybeButtonWrapper: {
    marginTop: 12,
  },
  statusCard: {
    borderRadius: 16,
    padding: 18,
    marginTop: 22,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statusBadge: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 8,
  },
  statusDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
  },
});
