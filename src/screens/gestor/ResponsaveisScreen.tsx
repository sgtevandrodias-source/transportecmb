import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormField } from "@/components/ui/FormField";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/Text";
import { UserCircleIcon } from "@/components/ui/icons";
import { useRequireAuth } from "@/auth/with-auth-guard";
import { Radii } from "@/constants/theme";
import { Responsavel } from "@/domain/types";
import { useResponsaveis } from "@/hooks/use-responsaveis";
import { useTheme } from "@/hooks/use-theme";

export function ResponsaveisScreen() {
  const { carregando: carregandoSessao } = useRequireAuth("gestor");
  const theme = useTheme();
  const { items: responsaveis, create, update, remove } = useResponsaveis();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [responsavelEmEdicao, setResponsavelEmEdicao] = useState<number | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  function limparFormulario() {
    setNome("");
    setEmail("");
    setTelefone("");
    setResponsavelEmEdicao(null);
    setMostrarFormulario(false);
  }

  function editarResponsavel(responsavel: Responsavel) {
    setResponsavelEmEdicao(responsavel.id);
    setNome(responsavel.nome);
    setEmail(responsavel.email);
    setTelefone(responsavel.telefone);
    setMostrarFormulario(true);
  }

  async function salvarResponsavel() {
    if (!nome.trim() || !email.trim() || !telefone.trim()) {
      alert("Preencha todos os campos.");
      return;
    }

    const emailNormalizado = email.trim().toLowerCase();

    const jaCadastrado = responsaveis.some(
      (responsavel) =>
        responsavel.id !== responsavelEmEdicao &&
        responsavel.email.toLowerCase() === emailNormalizado,
    );

    if (jaCadastrado) {
      alert("Já existe um responsável com este e-mail.");
      return;
    }

    try {
      const dados = {
        nome: nome.trim(),
        email: emailNormalizado,
        telefone: telefone.trim(),
        perfil: "responsavel" as const,
      };

      if (responsavelEmEdicao !== null) {
        await update(responsavelEmEdicao, dados);
      } else {
        await create(dados);
      }

      alert(
        responsavelEmEdicao !== null
          ? "Responsável atualizado com sucesso."
          : "Responsável cadastrado com sucesso.",
      );

      limparFormulario();
    } catch (erro) {
      console.log("Erro ao salvar responsável:", erro);
      alert("Não foi possível salvar o responsável.");
    }
  }

  if (carregandoSessao) {
    return null;
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        variant="form"
        title="Responsáveis"
        subtitle="Rota CMB - Tavares Transportes"
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: theme.primary }]}>
            {responsaveis.length}
          </Text>
          <Text style={[styles.summaryText, { color: theme.textSecondary }]}>
            Responsáveis cadastrados
          </Text>
        </Card>

        <View style={styles.addButtonWrapper}>
          <Button
            label={mostrarFormulario ? "Cancelar cadastro" : "+ Cadastrar responsável"}
            variant={mostrarFormulario ? "secondary" : "primary"}
            onPress={() => (mostrarFormulario ? limparFormulario() : setMostrarFormulario(true))}
          />
        </View>

        {mostrarFormulario && (
          <Card style={styles.formCard}>
            <Text style={[styles.formTitle, { color: theme.text }]}>
              {responsavelEmEdicao !== null ? "Editar responsável" : "Novo responsável"}
            </Text>

            <FormField label="Nome completo" placeholder="Digite o nome" value={nome} onChangeText={setNome} />

            <FormField
              label="E-mail"
              placeholder="Digite o e-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <FormField
              label="Telefone"
              placeholder="Exemplo: (61) 99999-9999"
              value={telefone}
              onChangeText={setTelefone}
              keyboardType="phone-pad"
            />

            <Button
              label={responsavelEmEdicao !== null ? "Salvar alterações" : "Salvar responsável"}
              onPress={salvarResponsavel}
            />
          </Card>
        )}

        <View style={styles.titleRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Lista de responsáveis</Text>
          <Text style={[styles.counterText, { color: theme.textMuted }]}>
            {responsaveis.length} cadastrados
          </Text>
        </View>

        {responsaveis.length === 0 ? (
          <EmptyState
            tone="warning"
            icon={UserCircleIcon}
            title="Nenhum responsável cadastrado"
            message="Cadastre o primeiro responsável para depois vinculá-lo a um aluno."
          />
        ) : (
          responsaveis.map((responsavel) => (
            <Card key={responsavel.id} style={styles.responsibleCard}>
              <View style={styles.responsibleHeader}>
                <View style={[styles.responsibleIcon, { backgroundColor: theme.infoBg }]}>
                  <UserCircleIcon size={22} color={theme.primary} weight="bold" />
                </View>

                <View style={styles.responsibleTextArea}>
                  <Text style={[styles.responsibleName, { color: theme.text }]}>
                    {responsavel.nome}
                  </Text>
                  <Text style={[styles.responsibleInfo, { color: theme.textSecondary }]}>
                    {responsavel.email}
                  </Text>
                  <Text style={[styles.responsibleInfo, { color: theme.textSecondary }]}>
                    {responsavel.telefone}
                  </Text>
                </View>
              </View>

              <View style={styles.actions}>
                <View style={styles.actionButton}>
                  <Button
                    label="Editar"
                    variant="secondary"
                    onPress={() => editarResponsavel(responsavel)}
                  />
                </View>

                <View style={styles.actionButton}>
                  <Button
                    label="Remover"
                    variant="danger"
                    onPress={() => remove(responsavel.id)}
                  />
                </View>
              </View>
            </Card>
          ))
        )}
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
  responsibleCard: {
    marginBottom: 14,
  },
  responsibleHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  responsibleIcon: {
    width: 44,
    height: 44,
    borderRadius: Radii.small,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  responsibleTextArea: {
    flex: 1,
  },
  responsibleName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  responsibleInfo: {
    fontSize: 13,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
  },
});
