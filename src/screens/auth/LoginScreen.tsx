import { router, useLocalSearchParams, type Href } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/Text";
import { useAuth } from "@/auth/session-context";
import { Perfil } from "@/domain/types";
import { useTheme } from "@/hooks/use-theme";

const rotaPorPerfil: Record<Perfil, Href> = {
  responsavel: "/responsavel",
  motorista: "/motorista",
  gestor: "/gestor",
};

const nomePorPerfil: Record<Perfil, string> = {
  responsavel: "Responsável",
  motorista: "Motorista",
  gestor: "Gestor",
};

export function LoginScreen() {
  const { perfil } = useLocalSearchParams<{ perfil?: Perfil }>();
  const { login } = useAuth();
  const theme = useTheme();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);

  const perfilFormatado = perfil ? nomePorPerfil[perfil] : "Usuário";

  async function entrar() {
    if (!perfil) {
      alert("Perfil de acesso não identificado.");
      return;
    }

    setEnviando(true);

    try {
      await login(perfil, { email, senha });
      router.replace(rotaPorPerfil[perfil]);
    } catch (erro) {
      alert(erro instanceof Error ? erro.message : "Não foi possível realizar o login.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ScreenContainer keyboardAvoiding>
      <ScreenHeader
        variant="form"
        title={`Acesso do ${perfilFormatado}`}
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Digite seus dados para acessar o transporte escolar.
        </Text>

        <Card>
          <FormField
            label="E-mail"
            placeholder="Digite seu e-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <FormField
            label="Senha"
            placeholder="Digite sua senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />

          <Button label="Entrar" onPress={entrar} loading={enviando} />

          <TouchableOpacity>
            <Text style={[styles.forgotPassword, { color: theme.primary }]}>
              Esqueci minha senha
            </Text>
          </TouchableOpacity>
        </Card>

        <Text style={[styles.footer, { color: theme.textMuted }]}>
          Acesso restrito aos usuários autorizados
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    paddingBottom: 36,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 20,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 18,
  },
  footer: {
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
});
