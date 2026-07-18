import type { Env } from "../../_lib/env";
import type { Data } from "../_middleware";
import { json } from "../../_lib/http";

export const onRequestGet: PagesFunction<Env, string, Data> = async (context) => {
  return json({ usuario: context.data.usuario });
};
