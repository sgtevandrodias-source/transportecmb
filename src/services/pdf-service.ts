import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

import { Aluno, AlunoMotorista, Ponto, Viagem } from "@/domain/types";
import { rosterService } from "@/services/roster-service";

const TEXTO_SITUACAO: Record<AlunoMotorista["situacao"], string> = {
  aguardando: "Aguardando",
  embarcou: "Embarcou",
  desembarcou: "Desembarcou",
  ausente: "Ausente",
  revisitar: "Revisitar ponto",
  "nao-localizado": "Não localizado",
  cancelado: "Cancelado",
};

const TEXTO_CONFIRMACAO: Record<AlunoMotorista["confirmacaoResponsavel"], string> = {
  aguardando: "Aguardando resposta",
  vai: "Confirmado",
  "nao-vai": "Não vai",
  "nao-sei": "Ainda não sabe",
};

function escaparHtml(texto: string): string {
  return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function montarSecaoViagem(viagem: Viagem, roster: AlunoMotorista[]): string {
  const linhas = roster
    .map(
      (aluno) => `
        <tr>
          <td>${escaparHtml(aluno.nome)}</td>
          <td>${escaparHtml(aluno.ponto)}</td>
          <td>${TEXTO_CONFIRMACAO[aluno.confirmacaoResponsavel]}</td>
          <td>${TEXTO_SITUACAO[aluno.situacao]}</td>
        </tr>`,
    )
    .join("");

  return `
    <section>
      <h2>${viagem.sentido === "ida" ? "Ida para o CMB" : "Volta do CMB"} — Turno ${escaparHtml(viagem.turno)}</h2>
      <p>Horário: ${escaparHtml(viagem.horario)} • Motorista: ${escaparHtml(viagem.motorista)}</p>
      <table>
        <thead>
          <tr><th>Aluno</th><th>Ponto</th><th>Confirmação</th><th>Situação</th></tr>
        </thead>
        <tbody>${linhas || '<tr><td colspan="4">Nenhum aluno confirmado nesta viagem.</td></tr>'}</tbody>
      </table>
    </section>`;
}

async function montarHtmlDoDia(
  data: string,
  viagensDoDia: Viagem[],
  todosOsAlunos: Aluno[],
  pontos: Ponto[],
): Promise<string> {
  const secoes = await Promise.all(
    viagensDoDia.map(async (viagem) => {
      const roster = await rosterService.montarRoster(viagem, todosOsAlunos, pontos);
      return montarSecaoViagem(viagem, roster);
    }),
  );

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Arial, sans-serif; color: #0F2A45; padding: 24px; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          .subtitulo { color: #54677A; font-size: 13px; margin-bottom: 24px; }
          h2 { font-size: 16px; margin-bottom: 4px; color: #075A9C; }
          p { font-size: 12px; color: #54677A; margin-top: 0; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
          th, td { border: 1px solid #E1E7ED; padding: 6px 8px; font-size: 12px; text-align: left; }
          th { background-color: #E3EEFA; }
        </style>
      </head>
      <body>
        <h1>Rota CMB — Viagens do dia</h1>
        <div class="subtitulo">${escaparHtml(data)} • Tavares Transportes</div>
        ${secoes.join("") || "<p>Nenhuma viagem programada para esta data.</p>"}
      </body>
    </html>`;
}

/**
 * Gera o PDF só localmente no aparelho: no navegador, o expo-print abre o
 * diálogo de impressão do próprio navegador (o usuário escolhe "Salvar como
 * PDF" ali); no app nativo, salva um arquivo temporário e abre o menu de
 * compartilhar/salvar do sistema. Em nenhum dos dois casos o conteúdo passa
 * pelo backend — é só HTML montado a partir do que já está na tela.
 */
async function gerarPdfDoDia(
  data: string,
  viagensDoDia: Viagem[],
  todosOsAlunos: Aluno[],
  pontos: Ponto[],
): Promise<void> {
  const html = await montarHtmlDoDia(data, viagensDoDia, todosOsAlunos, pontos);

  if (Platform.OS === "web") {
    // No navegador o expo-print não gera um arquivo (nem tem onde salvar um
    // fora do sandbox) — só abre o diálogo de impressão nativo, onde o
    // usuário escolhe "Salvar como PDF".
    await Print.printToFileAsync({ html });
    return;
  }

  const { uri } = await Print.printToFileAsync({ html });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf" });
  }
}

export const pdfService = { gerarPdfDoDia };
