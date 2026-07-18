/**
 * Ícones usados no app, reexportados de um único lugar — se o conjunto de
 * ícones mudar no futuro, só este arquivo precisa mudar. Substitui os
 * emojis usados até agora (renderização inconsistente entre SOs, sem
 * controle de peso/cor).
 *
 * Importante: cada ícone é importado do seu arquivo individual
 * (`phosphor-react-native/src/icons/<Nome>`), não do pacote raiz — o
 * pacote raiz reexporta as ~1500 famílias de ícones da biblioteca inteira,
 * o que faz o bundler processar todos os arquivos só para pegar um punhado
 * de ícones.
 */
export { ArrowLeftIcon } from "phosphor-react-native/src/icons/ArrowLeft";
export { ArrowsClockwiseIcon } from "phosphor-react-native/src/icons/ArrowsClockwise";
export { BackpackIcon } from "phosphor-react-native/src/icons/Backpack";
export { BellIcon } from "phosphor-react-native/src/icons/Bell";
export { BriefcaseIcon } from "phosphor-react-native/src/icons/Briefcase";
export { BuildingsIcon } from "phosphor-react-native/src/icons/Buildings";
export { BusIcon } from "phosphor-react-native/src/icons/Bus";
export { CalendarBlankIcon } from "phosphor-react-native/src/icons/CalendarBlank";
export { CaretLeftIcon } from "phosphor-react-native/src/icons/CaretLeft";
export { CaretRightIcon } from "phosphor-react-native/src/icons/CaretRight";
export { CheckCircleIcon } from "phosphor-react-native/src/icons/CheckCircle";
export { CheckIcon } from "phosphor-react-native/src/icons/Check";
export { ClockIcon } from "phosphor-react-native/src/icons/Clock";
export { FilePdfIcon } from "phosphor-react-native/src/icons/FilePdf";
export { HourglassIcon } from "phosphor-react-native/src/icons/Hourglass";
export { HouseIcon } from "phosphor-react-native/src/icons/House";
export { LockIcon } from "phosphor-react-native/src/icons/Lock";
export { MapPinIcon } from "phosphor-react-native/src/icons/MapPin";
export { PencilSimpleIcon } from "phosphor-react-native/src/icons/PencilSimple";
export { PlusIcon } from "phosphor-react-native/src/icons/Plus";
export { SignOutIcon } from "phosphor-react-native/src/icons/SignOut";
export { SteeringWheelIcon } from "phosphor-react-native/src/icons/SteeringWheel";
export { TrashIcon } from "phosphor-react-native/src/icons/Trash";
export { UserCircleIcon } from "phosphor-react-native/src/icons/UserCircle";
export { UsersThreeIcon } from "phosphor-react-native/src/icons/UsersThree";
export { WarningCircleIcon } from "phosphor-react-native/src/icons/WarningCircle";
export { XCircleIcon } from "phosphor-react-native/src/icons/XCircle";
export { XIcon } from "phosphor-react-native/src/icons/X";

export type { Icon, IconProps, IconWeight } from "phosphor-react-native";
