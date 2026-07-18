import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

import { TURNOS } from "@/constants/opcoes";
import { Aluno, AlunoMotorista, Ponto, SentidoViagem, Viagem } from "@/domain/types";
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

type GrupoPorTurno = {
  turno: string;
  ida: Viagem | null;
  volta: Viagem | null;
};

function escaparHtml(texto: string): string {
  return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Um dia pode ter até 4 viagens (ida/volta de cada turno) — agrupa por
 * turno para o relatório mostrar, lado a lado, a presença na ida e na volta
 * do mesmo turno, em vez de 4 seções soltas sem relação entre si.
 */
function agruparPorTurno(viagens: Viagem[]): GrupoPorTurno[] {
  const porTurno = new Map<string, { ida: Viagem | null; volta: Viagem | null }>();

  for (const viagem of viagens) {
    const grupo = porTurno.get(viagem.turno) ?? { ida: null, volta: null };
    grupo[viagem.sentido] = viagem;
    porTurno.set(viagem.turno, grupo);
  }

  const turnosConhecidos = TURNOS as readonly string[];

  return Array.from(porTurno.entries())
    .sort(([turnoA], [turnoB]) => {
      const indiceA = turnosConhecidos.indexOf(turnoA);
      const indiceB = turnosConhecidos.indexOf(turnoB);

      if (indiceA === -1 && indiceB === -1) return turnoA.localeCompare(turnoB);
      if (indiceA === -1) return 1;
      if (indiceB === -1) return -1;
      return indiceA - indiceB;
    })
    .map(([turno, { ida, volta }]) => ({ turno, ida, volta }));
}

function montarTabelaPresenca(roster: AlunoMotorista[]): string {
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
    <table>
      <thead>
        <tr><th>Aluno</th><th>Ponto</th><th>Confirmação</th><th>Situação</th></tr>
      </thead>
      <tbody>${linhas || '<tr><td colspan="4">Nenhum aluno confirmado nesta viagem.</td></tr>'}</tbody>
    </table>`;
}

async function montarSubsecaoSentido(
  viagem: Viagem | null,
  sentido: SentidoViagem,
  todosOsAlunos: Aluno[],
  pontos: Ponto[],
): Promise<string> {
  const titulo = sentido === "ida" ? "Presenças na ida" : "Presenças na volta";

  if (!viagem) {
    return `
      <div class="subsecao">
        <h3>${titulo}</h3>
        <p class="aviso">Nenhuma viagem de ${sentido} cadastrada para este turno nesta data.</p>
      </div>`;
  }

  const roster = await rosterService.montarRoster(viagem, todosOsAlunos, pontos);

  return `
    <div class="subsecao">
      <h3>${titulo}</h3>
      <p>Horário: ${escaparHtml(viagem.horario)} • Motorista: ${escaparHtml(viagem.motorista)} • Status: ${escaparHtml(textoStatus(viagem.status))}</p>
      ${montarTabelaPresenca(roster)}
    </div>`;
}

function textoStatus(status: Viagem["status"]): string {
  switch (status) {
    case "em-andamento":
      return "Em andamento";
    case "finalizada":
      return "Finalizada";
    case "cancelada":
      return "Cancelada";
    default:
      return "Programada";
  }
}

async function montarSecaoTurno(
  grupo: GrupoPorTurno,
  todosOsAlunos: Aluno[],
  pontos: Ponto[],
): Promise<string> {
  const [ida, volta] = await Promise.all([
    montarSubsecaoSentido(grupo.ida, "ida", todosOsAlunos, pontos),
    montarSubsecaoSentido(grupo.volta, "volta", todosOsAlunos, pontos),
  ]);

  return `
    <section class="turno">
      <h2>Turno ${escaparHtml(grupo.turno)}</h2>
      ${ida}
      ${volta}
    </section>`;
}

async function montarHtmlDoDia(
  data: string,
  viagensDoDia: Viagem[],
  todosOsAlunos: Aluno[],
  pontos: Ponto[],
): Promise<string> {
  const grupos = agruparPorTurno(viagensDoDia);

  const secoes = await Promise.all(
    grupos.map((grupo) => montarSecaoTurno(grupo, todosOsAlunos, pontos)),
  );

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Arial, sans-serif; color: #0F2A45; padding: 24px; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          .subtitulo { color: #54677A; font-size: 13px; margin-bottom: 24px; }
          .turno { margin-bottom: 30px; padding-bottom: 6px; border-bottom: 2px solid #E1E7ED; }
          h2 { font-size: 17px; margin-bottom: 10px; color: #075A9C; }
          .subsecao { margin-bottom: 18px; }
          h3 { font-size: 14px; margin-bottom: 4px; color: #0F2A45; }
          p { font-size: 12px; color: #54677A; margin-top: 0; margin-bottom: 8px; }
          .aviso { font-style: italic; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
          th, td { border: 1px solid #E1E7ED; padding: 6px 8px; font-size: 12px; text-align: left; }
          th { background-color: #E3EEFA; }
        </style>
      </head>
      <body>
        <h1>Rota CMB — Lista de presença do dia</h1>
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
    // No navegador, expo-print não usa o HTML recebido — o shim web do
    // pacote ignora o parâmetro e só chama window.print() na página atual
    // (imprimiria a própria tela de Viagens, não o relatório). Por isso o
    // relatório é aberto numa aba própria com só esse conteúdo, e essa aba
    // é impressa — o usuário escolhe "Salvar como PDF" no diálogo do
    // navegador, sempre local, sem passar pelo backend.
    const janela = window.open("", "_blank");

    if (!janela) {
      throw new Error(
        "Não foi possível abrir a janela de impressão. Verifique se o navegador está bloqueando pop-ups.",
      );
    }

    janela.document.write(html);
    janela.document.close();
    janela.focus();
    janela.print();
    return;
  }

  const { uri } = await Print.printToFileAsync({ html });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf" });
  }
}

export const pdfService = { gerarPdfDoDia };
