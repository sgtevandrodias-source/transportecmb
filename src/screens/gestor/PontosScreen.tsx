import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/Text";
import { MapPinIcon } from "@/components/ui/icons";
import { useRequireAuth } from "@/auth/with-auth-guard";
import { Radii } from "@/constants/theme";
import { Ponto } from "@/domain/types";
import { usePontos } from "@/hooks/use-pontos";
import { useTheme } from "@/hooks/use-theme";

export function PontosScreen() {
  const { carregando: carregandoSessao } = useRequireAuth("gestor");
  const theme = useTheme();
  const { items: pontos, create, update, remove } = usePontos();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [pontoEmEdicao, setPontoEmEdicao] = useState<number | null>(null);
  const [nome, setNome] = useState("");
  const [referencia, setReferencia] = useState("");
  const [horario, setHorario] = useState("");
  const [ordem, setOrdem] = useState("");

  function limparFormulario() {
    setNome("");
    setReferencia("");
    setHorario("");
    setOrdem("");
    setPontoEmEdicao(null);
    setMostrarFormulario(false);
  }

  function editarPonto(ponto: Ponto) {
    setPontoEmEdicao(ponto.id);
    setNome(ponto.nome);
    setReferencia(ponto.referencia);
    setHorario(ponto.horario);
    setOrdem(String(ponto.ordem));
    setMostrarFormulario(true);
  }

  async function salvarPonto() {
    if (!nome.trim() || !referencia.trim() || !horario.trim() || !ordem.trim()) {
      alert("Preencha todos os campos.");
      return;
    }

    const ordemNumerica = Number(ordem);

    if (Number.isNaN(ordemNumerica) || ordemNumerica <= 0) {
      alert("Informe uma ordem válida.");
      return;
    }

    try {
      const dados = {
        nome: nome.trim(),
        referencia: referencia.trim(),
        horario: horario.trim(),
        ordem: ordemNumerica,
      };

      if (pontoEmEdicao !== null) {
        await update(pontoEmEdicao, dados);
      } else {
        await create(dados);
      }

      alert(pontoEmEdicao !== null ? "Ponto atualizado com sucesso." : "Ponto cadastrado com sucesso.");
      limparFormulario();
    } catch (erro) {
      console.log("Erro ao salvar ponto:", erro);
      alert("Não foi possível salvar o ponto.");
    }
  }

  if (carregandoSessao) {
    return null;
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        variant="form"
        title="Pontos"
        subtitle="Rota CMB - Tavares Transportes"
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: theme.primary }]}>{pontos.length}</Text>
          <Text style={[styles.summaryText, { color: theme.textSecondary }]}>
            Pontos de embarque cadastrados
          </Text>
        </Card>

        <View style={styles.addButtonWrapper}>
          <Button
            label={mostrarFormulario ? "Cancelar cadastro" : "+ Cadastrar ponto"}
            variant={mostrarFormulario ? "secondary" : "primary"}
            onPress={() => (mostrarFormulario ? limparFormulario() : setMostrarFormulario(true))}
          />
        </View>

        {mostrarFormulario && (
          <Card style={styles.formCard}>
            <Text style={[styles.formTitle, { color: theme.text }]}>
              {pontoEmEdicao !== null ? "Editar ponto" : "Novo ponto"}
            </Text>

            <FormField label="Nome do ponto" placeholder="Exemplo: Ponto 04" value={nome} onChangeText={setNome} />
            <FormField
              label="Referência"
              placeholder="Exemplo: Em frente à padaria"
              value={referencia}
              onChangeText={setReferencia}
            />
            <FormField
              label="Horário previsto"
              placeholder="Exemplo: 06:35"
              value={horario}
              onChangeText={setHorario}
            />
            <FormField
              label="Ordem no trajeto"
              placeholder="Exemplo: 4"
              value={ordem}
              onChangeText={setOrdem}
              keyboardType="numeric"
            />

            <Button
              label={pontoEmEdicao !== null ? "Salvar alterações" : "Salvar ponto"}
              onPress={salvarPonto}
            />
          </Card>
        )}

        <View style={styles.titleRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Lista de pontos</Text>
          <Text style={[styles.counterText, { color: theme.textMuted }]}>
            {pontos.length} cadastrados
          </Text>
        </View>

        {pontos.map((ponto) => (
          <Card key={ponto.id} style={styles.pointCard}>
            <View style={styles.pointHeader}>
              <View style={styles.pointMainInfo}>
                <View style={[styles.pointIcon, { backgroundColor: theme.infoBg }]}>
                  <MapPinIcon size={20} color={theme.primary} weight="bold" />
                </View>

                <View style={styles.pointTextArea}>
                  <Text style={[styles.pointName, { color: theme.text }]}>{ponto.nome}</Text>
                  <Text style={[styles.pointReference, { color: theme.textSecondary }]}>
                    {ponto.referencia}
                  </Text>
                </View>
              </View>

              <Badge label={`${ponto.ordem}º`} tone="info" />
            </View>

            <View style={[styles.timeArea, { backgroundColor: theme.surfaceAlt }]}>
              <Text style={[styles.timeLabel, { color: theme.textMuted }]}>Horário previsto</Text>
              <Text style={[styles.timeValue, { color: theme.text }]}>{ponto.horario}</Text>
            </View>

            <View style={styles.pointActions}>
              <View style={styles.actionButton}>
                <Button label="Editar" variant="secondary" onPress={() => editarPonto(ponto)} />
              </View>

              <View style={styles.actionButton}>
                <Button label="Remover" variant="danger" onPress={() => remove(ponto.id)} />
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
  pointCard: {
    marginBottom: 14,
  },
  pointHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pointMainInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  pointIcon: {
    width: 40,
    height: 40,
    borderRadius: Radii.small,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  pointTextArea: {
    flex: 1,
  },
  pointName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  pointReference: {
    fontSize: 13,
    marginTop: 4,
  },
  timeArea: {
    borderRadius: 12,
    padding: 12,
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeLabel: {
    fontSize: 13,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  pointActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 15,
  },
  actionButton: {
    flex: 1,
  },
});
