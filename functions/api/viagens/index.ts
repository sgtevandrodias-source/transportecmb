import type { Env } from "../../_lib/env";
import { erro, json } from "../../_lib/http";

type Viagem = {
  id: number;
  data: string;
  sentido: string;
  turno: string;
  horario: string;
  motorista: string;
  status: string;
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { results } = await context.env.DB.prepare(
    "SELECT id, data, sentido, turno, horario, motorista, status FROM viagens ORDER BY id DESC",
  ).all<Viagem>();

  return json(results);
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const corpo = await context.request.json<Partial<Viagem>>().catch(() => null);

  if (
    !corpo?.data?.trim() ||
    !corpo.sentido ||
    !corpo.turno?.trim() ||
    !corpo.horario?.trim() ||
    !corpo.motorista?.trim() ||
    !corpo.status
  ) {
    return erro("Preencha todos os campos da viagem.");
  }

  const resultado = await context.env.DB.prepare(
    "INSERT INTO viagens (data, sentido, turno, horario, motorista, status) VALUES (?, ?, ?, ?, ?, ?)",
  )
    .bind(
      corpo.data.trim(),
      corpo.sentido,
      corpo.turno.trim(),
      corpo.horario.trim(),
      corpo.motorista.trim(),
      corpo.status,
    )
    .run();

  const viagem: Viagem = {
    id: resultado.meta.last_row_id as number,
    data: corpo.data.trim(),
    sentido: corpo.sentido,
    turno: corpo.turno.trim(),
    horario: corpo.horario.trim(),
    motorista: corpo.motorista.trim(),
    status: corpo.status,
  };

  return json(viagem, 201);
};
