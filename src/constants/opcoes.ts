/**
 * Turno é digitado em dois formulários separados (Alunos e Viagens) e
 * precisa bater exatamente para o motorista ver os alunos certos
 * (`rosterService.montarRoster`). Uma lista fixa em vez de texto livre
 * elimina divergências por digitação/maiúsculas.
 */
export const TURNOS = ["Manhã", "Tarde", "Integral", "Noite"] as const;

export type Turno = (typeof TURNOS)[number];
