import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/Text";
import { BuildingsIcon, BusIcon } from "@/components/ui/icons";
import { useRequireAuth } from "@/auth/with-auth-guard";
import { Radii } from "@/constants/theme";
import { podeTransicionarViagem } from "@/domain/state-machines";
import { SentidoViagem, Viagem } from "@/domain/types";
import { useViagens } from "@/hooks/use-viagens";
import { useTheme } from "@/hooks/use-theme";
import { viagemService } from "@/services/viagem-service";

function textoStatus(status: Viagem["status"]) {
  switch (status) {
    case "em-andamento":
      return "Em andamento";
    case "finalizada":
      return "Finalizada";
    case "cancelada":
      return "Cancelada";
    default:
      return "Programada";
  }
}

function toneStatus(status: Viagem["status"]) {
  switch (status) {
    case "em-andamento":
      return "success" as const;
    case "finalizada":
      return "info" as const;
    case "cancelada":
      return "danger" as const;
    default:
      return "warning" as const;
  }
}

export function ViagensScreen() {
  const { carregando: carregandoSessao } = useRequireAuth("gestor");
  const theme = useTheme();
  const { items: viagens, create, update, remove, refetch } = useViagens();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [viagemEmEdicao, setViagemEmEdicao] = useState<number | null>(null);
  const [data, setData] = useState("");
  const [sentido, setSentido] = useState<SentidoViagem>("ida");
  const [turno, setTurno] = useState("");
  const [horario, setHorario] = useState("");
  const [motorista, setMotorista] = useState("");

  function limparFormulario() {
    setData("");
    setSentido("ida");
    setTurno("");
    setHorario("");
    setMotorista("");
    setViagemEmEdicao(null);
    setMostrarFormulario(false);
  }

  function editarViagem(viagem: Viagem) {
    setViagemEmEdicao(viagem.id);
    setData(viagem.data);
    setSentido(viagem.sentido);
    setTurno(viagem.turno);
    setHorario(viagem.horario);
    setMotorista(viagem.motorista);
    setMostrarFormulario(true);
  }

  async function salvarViagem() {
    if (!data.trim() || !turno.trim() || !horario.trim() || !motorista.trim()) {
      alert("Preencha todos os campos.");
      return;
    }

    try {
      if (viagemEmEdicao !== null) {
        await update(viagemEmEdicao, {
          data: data.trim(),
          sentido,
          turno: turno.trim(),
          horario: horario.trim(),
          motorista: motorista.trim(),
        });
      } else {
        await create({
          data: data.trim(),
          sentido,
          turno: turno.trim(),
          horario: horario.trim(),
          motorista: motorista.trim(),
          status: "programada",
        });
      }

      alert(viagemEmEdicao !== null ? "Viagem atualizada com sucesso." : "Viagem cadastrada com sucesso.");
      limparFormulario();
    } catch (erro) {
      console.log("Erro ao salvar viagem:", erro);
      alert("Não foi possível salvar a viagem.");
    }
  }

  async function executarTransicao(viagem: Viagem, acao: () => Promise<Viagem>) {
    try {
      await acao();
      await refetch();
    } catch (erro) {
      alert(erro instanceof Error ? erro.message : "Não foi possível atualizar a viagem.");
    }
  }

  if (carregandoSessao) {
    return null;
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        variant="form"
        title="Viagens"
        subtitle="Rota CMB - Tavares Transportes"
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: theme.primary }]}>{viagens.length}</Text>
          <Text style={[styles.summaryText, { color: theme.textSecondary }]}>
            Viagens cadastradas
          </Text>
        </Card>

        <View style={styles.addButtonWrapper}>
          <Button
            label={mostrarFormulario ? "Cancelar cadastro" : "+ Cadastrar viagem"}
            variant={mostrarFormulario ? "secondary" : "primary"}
            onPress={() => (mostrarFormulario ? limparFormulario() : setMostrarFormulario(true))}
          />
        </View>

        {mostrarFormulario && (
          <Card style={styles.formCard}>
            <Text style={[styles.formTitle, { color: theme.text }]}>
              {viagemEmEdicao !== null ? "Editar viagem" : "Nova viagem"}
            </Text>

            <FormField label="Data" placeholder="Exemplo: 14/07/2026" value={data} onChangeText={setData} />

            <Text style={[styles.label, { color: theme.text }]}>Sentido</Text>

            <View style={styles.optionRow}>
              {(["ida", "volta"] as SentidoViagem[]).map((opcao) => (
                <TouchableOpacity key={opcao} style={styles.optionButtonWrapper} onPress={() => setSentido(opcao)}>
                  <View
                    style={[
                      styles.optionButton,
                      {
                        borderColor: sentido === opcao ? theme.primary : theme.border,
                        borderWidth: sentido === opcao ? 2 : 1,
                        backgroundColor: sentido === opcao ? theme.infoBg : theme.surfaceAlt,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        { color: sentido === opcao ? theme.primary : theme.textSecondary },
                      ]}
                    >
                      {opcao === "ida" ? "Ida" : "Volta"}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <FormField label="Turno" placeholder="Exemplo: Manhã" value={turno} onChangeText={setTurno} />
            <FormField label="Horário" placeholder="Exemplo: 06:30" value={horario} onChangeText={setHorario} />
            <FormField
              label="Motorista"
              placeholder="Digite o nome do motorista"
              value={motorista}
              onChangeText={setMotorista}
            />

            <Button
              label={viagemEmEdicao !== null ? "Salvar alterações" : "Salvar viagem"}
              onPress={salvarViagem}
            />
          </Card>
        )}

        <View style={styles.titleRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Lista de viagens</Text>
          <Text style={[styles.counterText, { color: theme.textMuted }]}>
            {viagens.length} cadastradas
          </Text>
        </View>

        {viagens.map((viagem) => (
          <Card key={viagem.id} style={styles.tripCard}>
            <View style={styles.tripHeader}>
              <View style={styles.tripMainInfo}>
                <View style={[styles.tripIcon, { backgroundColor: theme.infoBg }]}>
                  {viagem.sentido === "ida" ? (
                    <BusIcon size={20} color={theme.primary} weight="bold" />
                  ) : (
                    <BuildingsIcon size={20} color={theme.primary} weight="bold" />
                  )}
                </View>

                <View style={styles.tripTextArea}>
                  <Text style={[styles.tripTitle, { color: theme.text }]}>
                    {viagem.sentido === "ida" ? "Ida para o CMB" : "Volta do CMB"}
                  </Text>
                  <Text style={[styles.tripInfo, { color: theme.textSecondary }]}>
                    {viagem.data} • Turno da {viagem.turno.toLowerCase()}
                  </Text>
                </View>
              </View>

              <Badge label={textoStatus(viagem.status)} tone={toneStatus(viagem.status)} />
            </View>

            <View style={[styles.detailsArea, { backgroundColor: theme.surfaceAlt }]}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Horário</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>{viagem.horario}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Motorista</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>{viagem.motorista}</Text>
              </View>
            </View>

            <View style={styles.statusActions}>
              {podeTransicionarViagem(viagem.status, "em-andamento") && (
                <View style={styles.statusActionButton}>
                  <Button
                    label="Iniciar"
                    variant="success"
                    onPress={() => executarTransicao(viagem, () => viagemService.iniciarViagem(viagem))}
                  />
                </View>
              )}

              {podeTransicionarViagem(viagem.status, "finalizada") && (
                <View style={styles.statusActionButton}>
                  <Button
                    label="Finalizar"
                    variant="secondary"
                    onPress={() => executarTransicao(viagem, () => viagemService.finalizarViagem(viagem))}
                  />
                </View>
              )}

              {podeTransicionarViagem(viagem.status, "cancelada") && (
                <View style={styles.statusActionButton}>
                  <Button
                    label="Cancelar"
                    variant="danger"
                    onPress={() => executarTransicao(viagem, () => viagemService.cancelarViagem(viagem))}
                  />
                </View>
              )}
            </View>

            <View style={styles.manageActions}>
              <View style={styles.actionButton}>
                <Button label="Editar" variant="secondary" onPress={() => editarViagem(viagem)} />
              </View>

              <View style={styles.actionButton}>
                <Button label="Remover" variant="danger" onPress={() => remove(viagem.id)} />
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  summaryCard: {
    alignItems: "center",
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: "bold",
  },
  summaryText: {
    fontSize: 14,
    marginTop: 4,
  },
  addButtonWrapper: {
    marginTop: 16,
    marginBottom: 18,
  },
  formCard: {
    marginBottom: 22,
  },
  formTitle: {
    fontSize: 21,
    fontWeight: "bold",
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 7,
  },
  optionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  optionButtonWrapper: {
    flex: 1,
  },
  optionButton: {
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  optionButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  counterText: {
    fontSize: 13,
  },
  tripCard: {
    marginBottom: 14,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tripMainInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 8,
  },
  tripIcon: {
    width: 40,
    height: 40,
    borderRadius: Radii.small,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  tripTextArea: {
    flex: 1,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  tripInfo: {
    fontSize: 13,
    marginTop: 4,
  },
  detailsArea: {
    borderRadius: 12,
    padding: 12,
    marginTop: 15,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 3,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "bold",
  },
  statusActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 15,
  },
  statusActionButton: {
    flex: 1,
  },
  manageActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
  },
});
