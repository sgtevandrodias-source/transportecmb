import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { CalendarBlankIcon, CaretLeftIcon, CaretRightIcon } from "@/components/ui/icons";
import { Radii } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type DatePickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

const DIAS_DA_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function paraData(valor: string): Date | null {
  const partes = valor.split("/").map(Number);

  if (partes.length !== 3 || partes.some(Number.isNaN)) {
    return null;
  }

  const [dia, mes, ano] = partes;
  return new Date(ano, mes - 1, dia);
}

function formatarData(data: Date): string {
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${data.getFullYear()}`;
}

/** Calendário simples (grade de dias do mês) — evita depender de um seletor nativo que não cobre a versão web do app. */
export function DatePicker({ label, value, onChange }: DatePickerProps) {
  const theme = useTheme();
  const dataSelecionada = useMemo(() => paraData(value), [value]);

  const [aberto, setAberto] = useState(false);
  const [mesVisivel, setMesVisivel] = useState(() => dataSelecionada ?? new Date());

  function abrir() {
    setMesVisivel(dataSelecionada ?? new Date());
    setAberto(true);
  }

  function mudarMes(delta: number) {
    setMesVisivel((atual) => new Date(atual.getFullYear(), atual.getMonth() + delta, 1));
  }

  function selecionarDia(dia: number) {
    onChange(formatarData(new Date(mesVisivel.getFullYear(), mesVisivel.getMonth(), dia)));
    setAberto(false);
  }

  const primeiroDiaDoMes = new Date(mesVisivel.getFullYear(), mesVisivel.getMonth(), 1).getDay();
  const totalDiasNoMes = new Date(mesVisivel.getFullYear(), mesVisivel.getMonth() + 1, 0).getDate();
  const celulas: (number | null)[] = [
    ...Array(primeiroDiaDoMes).fill(null),
    ...Array.from({ length: totalDiasNoMes }, (_, indice) => indice + 1),
  ];

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>

      <TouchableOpacity
        style={[styles.field, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
        onPress={abrir}
      >
        <CalendarBlankIcon size={18} color={theme.textMuted} weight="bold" />
        <Text style={[styles.fieldText, { color: value ? theme.text : theme.textMuted }]}>
          {value || "Selecionar data"}
        </Text>
      </TouchableOpacity>

      <Modal visible={aberto} transparent animationType="fade" onRequestClose={() => setAberto(false)}>
        <Pressable style={styles.backdrop} onPress={() => setAberto(false)}>
          <Pressable style={[styles.modalCard, { backgroundColor: theme.surface }]} onPress={() => {}}>
            <View style={styles.monthHeader}>
              <TouchableOpacity onPress={() => mudarMes(-1)} style={styles.monthNavButton}>
                <CaretLeftIcon size={18} color={theme.primary} weight="bold" />
              </TouchableOpacity>

              <Text style={[styles.monthLabel, { color: theme.text }]}>
                {MESES[mesVisivel.getMonth()]} de {mesVisivel.getFullYear()}
              </Text>

              <TouchableOpacity onPress={() => mudarMes(1)} style={styles.monthNavButton}>
                <CaretRightIcon size={18} color={theme.primary} weight="bold" />
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {DIAS_DA_SEMANA.map((dia) => (
                <Text key={dia} style={[styles.weekDayText, { color: theme.textMuted }]}>
                  {dia}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {celulas.map((dia, indice) => {
                if (dia === null) {
                  return <View key={`vazio-${indice}`} style={styles.dayCell} />;
                }

                const ehSelecionado =
                  dataSelecionada?.getDate() === dia &&
                  dataSelecionada?.getMonth() === mesVisivel.getMonth() &&
                  dataSelecionada?.getFullYear() === mesVisivel.getFullYear();

                return (
                  <TouchableOpacity
                    key={dia}
                    style={styles.dayCell}
                    onPress={() => selecionarDia(dia)}
                  >
                    <View
                      style={[
                        styles.dayCircle,
                        ehSelecionado && { backgroundColor: theme.primary },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          { color: ehSelecionado ? theme.onPrimary : theme.text },
                        ]}
                      >
                        {dia}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 7,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: Radii.small,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  fieldText: {
    fontSize: 15,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(6, 16, 28, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: Radii.large,
    padding: 20,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  monthNavButton: {
    padding: 8,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  weekRow: {
    flexDirection: "row",
  },
  weekDayText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
