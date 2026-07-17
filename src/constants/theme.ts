import '@/global.css';

/**
 * Paleta do Rota CMB (Tavares Transportes). O azul de marca (#075A9C)
 * permanece inalterado no modo claro — é a identidade que pais, motoristas
 * e gestores já reconhecem — mas passa a fazer parte de uma escala em vez
 * de carregar sozinho toda a hierarquia visual. O âmbar (`accent`) é o
 * único tom de apoio, usado com moderação nos poucos pontos que precisam
 * se destacar de verdade.
 *
 * `primaryDeep` é sempre a versão mais escura/rica do azul (fundo de
 * cabeçalho, hover do botão principal) — em ambos os modos, não inverte
 * com o tema. Para texto que precisa ler bem tanto sobre fundo claro
 * quanto escuro (ex.: título sobre um card tintado), use `primary`, que
 * esse sim inverte por modo.
 */
export const Colors = {
  light: {
    page: '#E9EEF3',
    surface: '#FFFFFF',
    surfaceAlt: '#F5F7FA',
    border: '#E1E7ED',
    primary: '#075A9C',
    primaryDeep: '#0B3B63',
    onPrimary: '#FFFFFF',
    onPrimaryMuted: '#CFE4FA',
    accent: '#C97A2B',
    accentBg: '#FBEEDD',
    text: '#0F2A45',
    textSecondary: '#54677A',
    textMuted: '#7C8CA0',
    success: '#1B8A4B',
    successBg: '#E1F5E9',
    danger: '#C2372B',
    dangerBg: '#FBE4E1',
    warning: '#B4740A',
    warningBg: '#FCEFD9',
    info: '#075A9C',
    infoBg: '#E3EEFA',
  },
  dark: {
    page: '#0A1520',
    surface: '#111F2E',
    surfaceAlt: '#0D1A26',
    border: '#22374A',
    primary: '#4DA3E8',
    primaryDeep: '#123C64',
    onPrimary: '#FFFFFF',
    onPrimaryMuted: '#CFE4FA',
    accent: '#E3A356',
    accentBg: '#3A2A15',
    text: '#EAF1F8',
    textSecondary: '#A9BDCF',
    textMuted: '#7E93A6',
    success: '#7FE0A8',
    successBg: '#153524',
    danger: '#F0A399',
    dangerBg: '#3A1D19',
    warning: '#F0C978',
    warningBg: '#3A2C10',
    info: '#4DA3E8',
    infoBg: '#12314A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * `display` (Plus Jakarta Sans) é usada em títulos e números de destaque —
 * dá caráter institucional sem ser fria. `body` (Inter) é usada em texto
 * corrido, listas e formulários — mantém legibilidade em telas densas
 * (lista de alunos, horários, status). Os nomes precisam bater exatamente
 * com as chaves carregadas via `useFonts` em `_layout.tsx`.
 */
export const FontFamily = {
  display: {
    semibold: 'PlusJakartaSans_600SemiBold',
    bold: 'PlusJakartaSans_700Bold',
    extrabold: 'PlusJakartaSans_800ExtraBold',
  },
  body: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radii = {
  small: 10,
  medium: 14,
  large: 18,
  xlarge: 28,
  pill: 999,
} as const;

/**
 * Sombra suave + borda sutil (aplicada junto da cor `border` do tema) no
 * lugar da sombra difusa única que qualquer app React Native tem por
 * padrão — resultado mais "acabado", menos genérico.
 */
export const CardShadow = {
  shadowColor: '#0B2038',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 2,
} as const;

export const MaxContentWidth = 480;
