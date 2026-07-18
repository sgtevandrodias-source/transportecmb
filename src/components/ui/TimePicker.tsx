import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { ClockIcon } from "@/components/ui/icons";
import { Radii } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type TimePickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

const HORAS = Array.from({ length: 24 }, (_, indice) => String(indice).padStart(2, "0"));
const MINUTOS = Array.from({ length: 12 }, (_, indice) => String(indice * 5).padStart(2, "0"));

function paraPartes(valor: string): { hora: string; minuto: string } | null {
  const [hora, minuto] = valor.split(":");

  if (!HORAS.includes(hora) || !minuto) {
    return null;
  }

  return { hora, minuto: MINUTOS.includes(minuto) ? minuto : "00" };
}

/** Seletor de horário em duas colunas (hora / minuto) — evita digitação livre e funciona igual em web e nativo. */
export function TimePicker({ label, value, onChange }: TimePickerProps) {
  const theme = useTheme();
  const partesAtuais = paraPartes(value);

  const [aberto, setAberto] = useState(false);
  const [hora, setHora] = useState(partesAtuais?.hora ?? "06");
  const [minuto, setMinuto] = useState(partesAtuais?.minuto ?? "00");

  function abrir() {
    const partes = paraPartes(value);
    setHora(partes?.hora ?? "06");
    setMinuto(partes?.minuto ?? "00");
    setAberto(true);
  }

  function confirmar() {
    onChange(`${hora}:${minuto}`);
    setAberto(false);
  }

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>

      <TouchableOpacity
        style={[styles.field, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
        onPress={abrir}
      >
        <ClockIcon size={18} color={theme.textMuted} weight="bold" />
        <Text style={[styles.fieldText, { color: value ? theme.text : theme.textMuted }]}>
          {value || "Selecionar horário"}
        </Text>
      </TouchableOpacity>

      <Modal visible={aberto} transparent animationType="fade" onRequestClose={() => setAberto(false)}>
        <Pressable style={styles.backdrop} onPress={() => setAberto(false)}>
          <Pressable style={[styles.modalCard, { backgroundColor: theme.surface }]} onPress={() => {}}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Horário</Text>

            <View style={styles.columnsRow}>
              <ScrollView style={styles.column} showsVerticalScrollIndicator={false}>
                {HORAS.map((opcao) => (
                  <TouchableOpacity key={opcao} style={styles.optionRow} onPress={() => setHora(opcao)}>
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: opcao === hora ? theme.primary : theme.textSecondary,
                          fontWeight: opcao === hora ? "800" : "500",
                        },
                      ]}
                    >
                      {opcao}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.separator, { color: theme.text }]}>:</Text>

              <ScrollView style={styles.column} showsVerticalScrollIndicator={false}>
                {MINUTOS.map((opcao) => (
                  <TouchableOpacity key={opcao} style={styles.optionRow} onPress={() => setMinuto(opcao)}>
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: opcao === minuto ? theme.primary : theme.textSecondary,
                          fontWeight: opcao === minuto ? "800" : "500",
                        },
                      ]}
                    >
                      {opcao}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Button label={`Confirmar ${hora}:${minuto}`} onPress={confirmar} />
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
    maxWidth: 320,
    borderRadius: Radii.large,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 14,
  },
  columnsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 220,
    marginBottom: 18,
  },
  column: {
    flex: 1,
  },
  separator: {
    fontSize: 20,
    fontWeight: "800",
    marginHorizontal: 8,
  },
  optionRow: {
    paddingVertical: 10,
    alignItems: "center",
  },
  optionText: {
    fontSize: 17,
  },
});
