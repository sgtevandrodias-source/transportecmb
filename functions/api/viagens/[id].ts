import type { Env } from "../../_lib/env";
import { erro, json } from "../../_lib/http";
import { buscarGestores, buscarResponsaveisConfirmados, enviarPushParaVarios } from "../../_lib/push";

const CAMPOS = ["data", "sentido", "turno", "horario", "motorista", "status"];

type ViagemResumo = {
  sentido: string;
  turno: string;
  horario: string;
};

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const id = Number(context.params.id);
  const corpo = await context.request.json<Record<string, unknown>>().catch(() => null);

  if (!corpo) {
    return erro("Corpo inválido.");
  }

  const sets: string[] = [];
  const valores: unknown[] = [];

  for (const campo of CAMPOS) {
    if (campo in corpo) {
      sets.push(`${campo} = ?`);
      valores.push(corpo[campo]);
    }
  }

  if (sets.length === 0) {
    return erro("Nada para atualizar.");
  }

  valores.push(id);

  await context.env.DB.prepare(`UPDATE viagens SET ${sets.join(", ")} WHERE id = ?`)
    .bind(...valores)
    .run();

  if (corpo.status === "em-andamento" || corpo.status === "finalizada") {
    context.waitUntil(notificarMudancaDeStatus(context.env, id, corpo.status));
  }

  return json({ ok: true });
};

async function notificarMudancaDeStatus(
  env: Env,
  viagemId: number,
  status: "em-andamento" | "finalizada",
): Promise<void> {
  const viagem = await env.DB.prepare("SELECT sentido, turno, horario FROM viagens WHERE id = ?")
    .bind(viagemId)
    .first<ViagemResumo>();

  if (!viagem) {
    return;
  }

  const [responsaveis, gestores] = await Promise.all([
    buscarResponsaveisConfirmados(env, viagemId, viagem.sentido),
    buscarGestores(env),
  ]);

  const descricaoSentido = viagem.sentido === "ida" ? "ida para o CMB" : "volta do CMB";

  if (status === "em-andamento") {
    const mensagem = {
      titulo: "Rota CMB",
      corpo: `O motorista iniciou o deslocamento (${descricaoSentido}, turno ${viagem.turno}).`,
    };

    await Promise.all([
      enviarPushParaVarios(env, responsaveis, mensagem),
      enviarPushParaVarios(env, gestores, mensagem),
    ]);

    return;
  }

  await Promise.all([
    enviarPushParaVarios(env, responsaveis, {
      titulo: "Rota CMB",
      corpo: `Viagem ${viagem.sentido === "ida" ? "de ida" : "de volta"} finalizada.`,
    }),
    enviarPushParaVarios(env, gestores, {
      titulo: "Rota CMB",
      corpo: `Viagem concluída: ${descricaoSentido}, turno ${viagem.turno}, horário ${viagem.horario}.`,
    }),
  ]);
}

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const id = Number(context.params.id);
  await context.env.DB.prepare("DELETE FROM viagens WHERE id = ?").bind(id).run();
  return json({ ok: true });
};
