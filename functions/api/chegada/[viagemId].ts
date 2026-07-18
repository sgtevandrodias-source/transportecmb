import type { Env } from "../../_lib/env";
import { erro, json } from "../../_lib/http";

type RegistroChegada = {
  viagemId: number;
  horario: string;
  dataHora: string;
  sentido: string;
  destino: string;
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const viagemId = Number(context.params.viagemId);

  const registro = await context.env.DB.prepare(
    "SELECT viagem_id as viagemId, horario, data_hora as dataHora, sentido, destino FROM chegadas WHERE viagem_id = ?",
  )
    .bind(viagemId)
    .first<RegistroChegada>();

  return json(registro ?? null);
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const viagemId = Number(context.params.viagemId);
  const corpo = await context.request.json<Partial<RegistroChegada>>().catch(() => null);

  if (!corpo?.horario || !corpo.dataHora || !corpo.sentido || !corpo.destino) {
    return erro("Preencha todos os dados da chegada.");
  }

  await context.env.DB.prepare(
    `INSERT INTO chegadas (viagem_id, horario, data_hora, sentido, destino)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT (viagem_id)
     DO UPDATE SET horario = excluded.horario, data_hora = excluded.data_hora, sentido = excluded.sentido, destino = excluded.destino`,
  )
    .bind(viagemId, corpo.horario, corpo.dataHora, corpo.sentido, corpo.destino)
    .run();

  return json({ ok: true }, 201);
};
