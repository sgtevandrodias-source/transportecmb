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
import { SteeringWheelIcon } from "@/components/ui/icons";
import { useRequireAuth } from "@/auth/with-auth-guard";
import { Radii } from "@/constants/theme";
import { Motorista } from "@/domain/types";
import { useMotoristas } from "@/hooks/use-motoristas";
import { useTheme } from "@/hooks/use-theme";

export function MotoristasScreen() {
  const { carregando: carregandoSessao } = useRequireAuth("gestor");
  const theme = useTheme();
  const { items: motoristas, create, update, remove } = useMotoristas();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [motoristaEmEdicao, setMotoristaEmEdicao] = useState<number | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");

  function limparFormulario() {
    setNome("");
    setEmail("");
    setTelefone("");
    setSenha("");
    setMotoristaEmEdicao(null);
    setMostrarFormulario(false);
  }

  function editarMotorista(motorista: Motorista) {
    setMotoristaEmEdicao(motorista.id);
    setNome(motorista.nome);
    setEmail(motorista.email);
    setTelefone(motorista.telefone);
    setSenha("");
    setMostrarFormulario(true);
  }

  async function salvarMotorista() {
    if (!nome.trim() || !email.trim() || !telefone.trim()) {
      alert("Preencha todos os campos.");
      return;
    }

    if (motoristaEmEdicao === null && !senha.trim()) {
      alert("Defina uma senha para o motorista acessar o app.");
      return;
    }

    const emailNormalizado = email.trim().toLowerCase();

    const jaCadastrado = motoristas.some(
      (motorista) =>
        motorista.id !== motoristaEmEdicao && motorista.email.toLowerCase() === emailNormalizado,
    );

    if (jaCadastrado) {
      alert("Já existe um motorista com este e-mail.");
      return;
    }

    try {
      const dados = {
        nome: nome.trim(),
        email: emailNormalizado,
        telefone: telefone.trim(),
        perfil: "motorista" as const,
        ...(senha.trim() ? { senha: senha.trim() } : {}),
      };

      if (motoristaEmEdicao !== null) {
        await update(motoristaEmEdicao, dados);
      } else {
        await create(dados);
      }

      alert(
        motoristaEmEdicao !== null
          ? "Motorista atualizado com sucesso."
          : "Motorista cadastrado com sucesso.",
      );

      limparFormulario();
    } catch (erro) {
      console.log("Erro ao salvar motorista:", erro);
      alert(erro instanceof Error ? erro.message : "Não foi possível salvar o motorista.");
    }
  }

  if (carregandoSessao) {
    return null;
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        variant="form"
        title="Motoristas"
        subtitle="Rota CMB - Tavares Transportes"
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: theme.primary }]}>{motoristas.length}</Text>
          <Text style={[styles.summaryText, { color: theme.textSecondary }]}>
            Motoristas cadastrados
          </Text>
        </Card>

        <View style={styles.addButtonWrapper}>
          <Button
            label={mostrarFormulario ? "Cancelar cadastro" : "+ Cadastrar motorista"}
            variant={mostrarFormulario ? "secondary" : "primary"}
            onPress={() => (mostrarFormulario ? limparFormulario() : setMostrarFormulario(true))}
          />
        </View>

        {mostrarFormulario && (
          <Card style={styles.formCard}>
            <Text style={[styles.formTitle, { color: theme.text }]}>
              {motoristaEmEdicao !== null ? "Editar motorista" : "Novo motorista"}
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

            <FormField
              label={motoristaEmEdicao !== null ? "Nova senha (opcional)" : "Senha"}
              placeholder={
                motoristaEmEdicao !== null ? "Deixe em branco para manter a atual" : "Defina uma senha"
              }
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />

            <Button
              label={motoristaEmEdicao !== null ? "Salvar alterações" : "Salvar motorista"}
              onPress={salvarMotorista}
            />
          </Card>
        )}

        <View style={styles.titleRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Lista de motoristas</Text>
          <Text style={[styles.counterText, { color: theme.textMuted }]}>
            {motoristas.length} cadastrados
          </Text>
        </View>

        {motoristas.length === 0 ? (
          <EmptyState
            tone="warning"
            icon={SteeringWheelIcon}
            title="Nenhum motorista cadastrado"
            message="Cadastre o primeiro motorista para ele acessar o modo viagem."
          />
        ) : (
          motoristas.map((motorista) => (
            <Card key={motorista.id} style={styles.driverCard}>
              <View style={styles.driverHeader}>
                <View style={[styles.driverIcon, { backgroundColor: theme.infoBg }]}>
                  <SteeringWheelIcon size={22} color={theme.primary} weight="bold" />
                </View>

                <View style={styles.driverTextArea}>
                  <Text style={[styles.driverName, { color: theme.text }]}>{motorista.nome}</Text>
                  <Text style={[styles.driverInfo, { color: theme.textSecondary }]}>
                    {motorista.email}
                  </Text>
                  <Text style={[styles.driverInfo, { color: theme.textSecondary }]}>
                    {motorista.telefone}
                  </Text>
                </View>
              </View>

              <View style={styles.actions}>
                <View style={styles.actionButton}>
                  <Button label="Editar" variant="secondary" onPress={() => editarMotorista(motorista)} />
                </View>

                <View style={styles.actionButton}>
                  <Button label="Remover" variant="danger" onPress={() => remove(motorista.id)} />
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
  driverCard: {
    marginBottom: 14,
  },
  driverHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverIcon: {
    width: 44,
    height: 44,
    borderRadius: Radii.small,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  driverTextArea: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  driverInfo: {
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
