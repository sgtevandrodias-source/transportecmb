import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/Text";
import { useAuth } from "@/auth/session-context";
import { useRequireAuth } from "@/auth/with-auth-guard";
import { apiClient } from "@/data/api-client";
import { useTheme } from "@/hooks/use-theme";

export function MinhaContaScreen() {
  const { usuario, carregando: carregandoSessao } = useRequireAuth("gestor");
  const { atualizarUsuario } = useAuth();
  const theme = useTheme();

  const [email, setEmail] = useState(usuario?.email ?? "");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (!usuario) {
      return;
    }

    const emailNormalizado = email.trim().toLowerCase();

    if (!emailNormalizado) {
      alert("Informe o e-mail.");
      return;
    }

    if (novaSenha.trim() && !senhaAtual.trim()) {
      alert("Informe a senha atual para definir uma nova senha.");
      return;
    }

    setSalvando(true);

    try {
      await apiClient.patch(`/api/usuarios/${usuario.id}`, {
        email: emailNormalizado,
        ...(novaSenha.trim() ? { senha: novaSenha.trim(), senhaAtual: senhaAtual.trim() } : {}),
      });

      atualizarUsuario({ email: emailNormalizado });
      setSenhaAtual("");
      setNovaSenha("");

      alert("Dados atualizados com sucesso.");
    } catch (erro) {
      alert(erro instanceof Error ? erro.message : "Não foi possível atualizar sua conta.");
    } finally {
      setSalvando(false);
    }
  }

  if (carregandoSessao) {
    return null;
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        variant="form"
        title="Minha conta"
        subtitle="Rota CMB - Tavares Transportes"
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.formCard}>
          <Text style={[styles.formTitle, { color: theme.text }]}>Dados de acesso</Text>

          <FormField
            label="E-mail"
            placeholder="Digite seu e-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
            Preencha os campos abaixo só se quiser trocar a senha.
          </Text>

          <FormField
            label="Senha atual"
            placeholder="Necessária para confirmar a alteração"
            value={senhaAtual}
            onChangeText={setSenhaAtual}
            secureTextEntry
          />

          <FormField
            label="Nova senha"
            placeholder="Deixe em branco para manter a atual"
            value={novaSenha}
            onChangeText={setNovaSenha}
            secureTextEntry
          />

          <Button label="Salvar alterações" onPress={salvar} loading={salvando} />
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  formCard: {
    marginBottom: 22,
  },
  formTitle: {
    fontSize: 21,
    fontWeight: "bold",
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 13,
    marginBottom: 14,
    marginTop: -4,
  },
});
