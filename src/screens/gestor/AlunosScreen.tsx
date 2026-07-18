import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormField } from "@/components/ui/FormField";
import { OptionRow } from "@/components/ui/OptionRow";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/Text";
import { BackpackIcon, MapPinIcon, UserCircleIcon } from "@/components/ui/icons";
import { useRequireAuth } from "@/auth/with-auth-guard";
import { Radii } from "@/constants/theme";
import { TURNOS } from "@/constants/opcoes";
import { Aluno } from "@/domain/types";
import { useAlunos } from "@/hooks/use-alunos";
import { usePontos } from "@/hooks/use-pontos";
import { useResponsaveis } from "@/hooks/use-responsaveis";
import { useTheme } from "@/hooks/use-theme";

export function AlunosScreen() {
  const { carregando: carregandoSessao } = useRequireAuth("gestor");
  const theme = useTheme();

  const { items: alunos, create, update, remove } = useAlunos();
  const { items: pontosDisponiveis } = usePontos();
  const { items: responsaveisDisponiveis } = useResponsaveis();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [alunoEmEdicao, setAlunoEmEdicao] = useState<number | null>(null);
  const [nome, setNome] = useState("");
  const [serie, setSerie] = useState("");
  const [turno, setTurno] = useState("");
  const [ponto, setPonto] = useState("");
  const [responsavelId, setResponsavelId] = useState<number | null>(null);

  function limparFormulario() {
    setNome("");
    setSerie("");
    setTurno("");
    setPonto("");
    setResponsavelId(null);
    setAlunoEmEdicao(null);
    setMostrarFormulario(false);
  }

  function editarAluno(aluno: Aluno) {
    setAlunoEmEdicao(aluno.id);
    setNome(aluno.nome);
    setSerie(aluno.serie);
    setTurno(aluno.turno);
    setPonto(aluno.ponto);
    setResponsavelId(aluno.responsavelId ?? null);
    setMostrarFormulario(true);
  }

  async function cadastrarAluno() {
    if (!nome.trim() || !serie.trim() || !turno.trim() || !ponto.trim()) {
      alert("Preencha todos os campos.");
      return;
    }

    if (responsavelId === null) {
      alert("Selecione o responsável pelo aluno.");
      return;
    }

    try {
      const dados = {
        nome: nome.trim(),
        serie: serie.trim(),
        turno: turno.trim(),
        ponto: ponto.trim(),
        responsavelId,
      };

      if (alunoEmEdicao !== null) {
        await update(alunoEmEdicao, dados);
      } else {
        await create(dados);
      }

      alert(alunoEmEdicao !== null ? "Aluno atualizado com sucesso." : "Aluno cadastrado com sucesso.");
      limparFormulario();
    } catch (erro) {
      console.log("Erro ao salvar aluno:", erro);
      alert("Não foi possível salvar o aluno.");
    }
  }

  if (carregandoSessao) {
    return null;
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        variant="form"
        title="Alunos"
        subtitle="Rota CMB - Tavares Transportes"
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: theme.primary }]}>{alunos.length}</Text>
          <Text style={[styles.summaryText, { color: theme.textSecondary }]}>
            Alunos cadastrados
          </Text>
        </Card>

        <View style={styles.addButtonWrapper}>
          <Button
            label={mostrarFormulario ? "Cancelar cadastro" : "+ Cadastrar aluno"}
            variant={mostrarFormulario ? "secondary" : "primary"}
            onPress={() => (mostrarFormulario ? limparFormulario() : setMostrarFormulario(true))}
          />
        </View>

        {mostrarFormulario && (
          <Card style={styles.formCard}>
            <Text style={[styles.formTitle, { color: theme.text }]}>
              {alunoEmEdicao !== null ? "Editar aluno" : "Novo aluno"}
            </Text>

            <FormField label="Nome do aluno" placeholder="Digite o nome" value={nome} onChangeText={setNome} />
            <FormField label="Série" placeholder="Exemplo: 7º ano" value={serie} onChangeText={setSerie} />

            <Text style={[styles.label, { color: theme.text }]}>Turno</Text>
            <OptionRow options={TURNOS} value={turno} onChange={setTurno} />

            <Text style={[styles.label, { color: theme.text }]}>Ponto de embarque</Text>

            {pontosDisponiveis.length === 0 ? (
              <EmptyState
                tone="warning"
                icon={MapPinIcon}
                title="Nenhum ponto cadastrado"
                message="Cadastre primeiro no módulo Pontos."
              />
            ) : (
              <View style={styles.optionsList}>
                {pontosDisponiveis.map((item) => (
                  <TouchableOpacity key={item.id} onPress={() => setPonto(item.nome)}>
                    <Card
                      style={[
                        styles.option,
                        {
                          borderColor: ponto === item.nome ? theme.primary : theme.border,
                          borderWidth: ponto === item.nome ? 2 : 1,
                          backgroundColor: ponto === item.nome ? theme.infoBg : theme.surfaceAlt,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionTitle,
                          { color: ponto === item.nome ? theme.primary : theme.text },
                        ]}
                      >
                        {item.nome}
                      </Text>
                      <Text style={[styles.optionInfo, { color: theme.textSecondary }]}>
                        {item.referencia} • {item.horario}
                      </Text>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={[styles.label, { color: theme.text }]}>Responsável pelo aluno</Text>

            {responsaveisDisponiveis.length === 0 ? (
              <EmptyState
                tone="warning"
                icon={UserCircleIcon}
                title="Nenhum responsável cadastrado"
                message="Cadastre primeiro no módulo Responsáveis."
              />
            ) : (
              <View style={styles.optionsList}>
                {responsaveisDisponiveis.map((responsavel) => (
                  <TouchableOpacity
                    key={responsavel.id}
                    onPress={() => setResponsavelId(responsavel.id)}
                  >
                    <Card
                      style={[
                        styles.option,
                        {
                          borderColor:
                            responsavelId === responsavel.id ? theme.primary : theme.border,
                          borderWidth: responsavelId === responsavel.id ? 2 : 1,
                          backgroundColor:
                            responsavelId === responsavel.id ? theme.infoBg : theme.surfaceAlt,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionTitle,
                          {
                            color:
                              responsavelId === responsavel.id ? theme.primary : theme.text,
                          },
                        ]}
                      >
                        {responsavel.nome}
                      </Text>
                      <Text style={[styles.optionInfo, { color: theme.textSecondary }]}>
                        {responsavel.email} • {responsavel.telefone}
                      </Text>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Button
              label={alunoEmEdicao !== null ? "Salvar alterações" : "Salvar aluno"}
              onPress={cadastrarAluno}
            />
          </Card>
        )}

        <View style={styles.titleRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Lista de alunos</Text>
          <Text style={[styles.counterText, { color: theme.textMuted }]}>
            {alunos.length} cadastrados
          </Text>
        </View>

        {alunos.map((aluno) => (
          <Card key={aluno.id} style={styles.studentCard}>
            <View style={styles.studentHeader}>
              <View style={[styles.studentIcon, { backgroundColor: theme.infoBg }]}>
                <BackpackIcon size={22} color={theme.primary} weight="bold" />
              </View>

              <View style={styles.studentTextArea}>
                <Text style={[styles.studentName, { color: theme.text }]}>{aluno.nome}</Text>
                <Text style={[styles.studentInfo, { color: theme.textSecondary }]}>
                  {aluno.serie} • Turno da {aluno.turno.toLowerCase()}
                </Text>
                <Text style={[styles.studentPoint, { color: theme.primary }]}>{aluno.ponto}</Text>
                <Text style={[styles.studentInfo, { color: theme.textSecondary }]}>
                  Responsável:{" "}
                  {responsaveisDisponiveis.find((r) => r.id === aluno.responsavelId)?.nome ??
                    "Não vinculado"}
                </Text>
              </View>
            </View>

            <View style={styles.studentActions}>
              <View style={styles.actionButton}>
                <Button label="Editar" variant="secondary" onPress={() => editarAluno(aluno)} />
              </View>

              <View style={styles.actionButton}>
                <Button label="Remover" variant="danger" onPress={() => remove(aluno.id)} />
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
  optionsList: {
    gap: 10,
    marginBottom: 16,
  },
  option: {
    padding: 13,
    borderRadius: 12,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },
  optionInfo: {
    fontSize: 12,
    marginTop: 4,
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
  studentCard: {
    marginBottom: 14,
  },
  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  studentIcon: {
    width: 44,
    height: 44,
    borderRadius: Radii.small,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  studentTextArea: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  studentInfo: {
    fontSize: 13,
    marginTop: 4,
  },
  studentPoint: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  studentActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
  },
});
