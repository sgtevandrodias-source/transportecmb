import { StyleSheet, TouchableOpacity, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { CaretLeftIcon, type Icon } from "@/components/ui/icons";
import { Radii } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type BaseProps = {
  title: string;
  subtitle?: string;
};

type FormHeaderProps = BaseProps & {
  variant: "form";
  onBack: () => void;
};

type HeroHeaderProps = BaseProps & {
  variant: "hero";
  icon?: Icon;
  onBack?: () => void;
};

type DashboardHeaderProps = BaseProps & {
  variant: "dashboard";
  rightActionLabel?: string;
  onRightAction?: () => void;
};

type ScreenHeaderProps = FormHeaderProps | HeroHeaderProps | DashboardHeaderProps;

function BackButton({ onPress, color, style }: { onPress: () => void; color: string; style?: object }) {
  return (
    <TouchableOpacity style={[styles.backButton, style]} onPress={onPress}>
      <CaretLeftIcon size={16} color={color} weight="bold" />
      <Text style={[styles.backButtonText, { color }]}>Voltar</Text>
    </TouchableOpacity>
  );
}

export function ScreenHeader(props: ScreenHeaderProps) {
  const theme = useTheme();
  const headerStyle = [styles.header, { backgroundColor: theme.primaryDeep }];

  if (props.variant === "form") {
    return (
      <View style={headerStyle}>
        <BackButton onPress={props.onBack} color={theme.onPrimary} />

        <Text style={[styles.formTitle, { color: theme.onPrimary }]}>{props.title}</Text>

        {props.subtitle && (
          <Text style={[styles.formSubtitle, { color: theme.onPrimaryMuted }]}>
            {props.subtitle}
          </Text>
        )}
      </View>
    );
  }

  if (props.variant === "hero") {
    return (
      <View style={[headerStyle, styles.heroHeader]}>
        {props.onBack && (
          <BackButton onPress={props.onBack} color={theme.onPrimary} style={styles.heroBackButton} />
        )}

        {props.icon && (
          <View style={[styles.logoBadge, { backgroundColor: theme.onPrimaryMuted }]}>
            <props.icon size={30} color={theme.primaryDeep} weight="bold" />
          </View>
        )}

        <Text style={[styles.heroTitle, { color: theme.onPrimary }]}>{props.title}</Text>

        {props.subtitle && (
          <Text style={[styles.heroSubtitle, { color: theme.onPrimaryMuted }]}>
            {props.subtitle}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={[headerStyle, styles.dashboardHeader]}>
      <View>
        <Text style={[styles.dashboardTitle, { color: theme.onPrimary }]}>{props.title}</Text>

        {props.subtitle && (
          <Text style={[styles.dashboardSubtitle, { color: theme.onPrimaryMuted }]}>
            {props.subtitle}
          </Text>
        )}
      </View>

      {props.rightActionLabel && props.onRightAction && (
        <TouchableOpacity style={styles.rightAction} onPress={props.onRightAction}>
          <Text style={[styles.rightActionText, { color: theme.onPrimary }]}>
            {props.rightActionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 42,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: Radii.xlarge,
    borderBottomRightRadius: Radii.xlarge,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingRight: 16,
    marginBottom: 4,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  formSubtitle: {
    fontSize: 13,
    marginTop: 3,
    textAlign: "center",
  },

  heroHeader: {
    alignItems: "center",
  },
  heroBackButton: {
    marginBottom: 0,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: Radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: 27,
    fontWeight: "800",
    marginTop: 4,
  },
  heroSubtitle: {
    fontSize: 15,
    marginTop: 3,
  },

  dashboardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dashboardTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  dashboardSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  rightAction: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  rightActionText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
