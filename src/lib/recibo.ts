import type { Recibo } from "./types";

export const MESES_RECIBO = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const _UNIDADES = [
  "", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove",
  "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove",
];
const _DEZENAS = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const _CENTENAS = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

function _numeroPorExtenso(n: number): string {
  if (n === 0) return "zero";
  if (n === 100) return "cem";
  const c = Math.floor(n / 100);
  const resto = n % 100;
  const d = Math.floor(resto / 10);
  const u = resto % 10;
  const partes: string[] = [];
  if (c > 0) partes.push(_CENTENAS[c]);
  if (resto > 0) {
    if (resto < 20) partes.push(_UNIDADES[resto]);
    else {
      if (d > 0) partes.push(_DEZENAS[d]);
      if (u > 0) partes.push(_UNIDADES[u]);
    }
  }
  return partes.join(" e ");
}

export function valorPorExtenso(valor: number): string {
  const reais = Math.floor(valor);
  const centavos = Math.round((valor - reais) * 100);
  const partes: string[] = [];
  if (reais > 0) partes.push(`${_numeroPorExtenso(reais)} ${reais === 1 ? "real" : "reais"}`);
  if (centavos > 0) partes.push(`${_numeroPorExtenso(centavos)} centavo${centavos !== 1 ? "s" : ""}`);
  return partes.length > 0 ? partes.join(" e ") : "zero reais";
}

export function parseReferenciaFromDescricao(
  descricao: string,
  emitidoEm: string,
): { mes: string; ano: string } {
  const match = descricao.match(/—\s*([A-Za-zçãõáéíóúâêôàü]+)\/(\d{4})/u);
  if (match) return { mes: match[1], ano: match[2] };
  const d = new Date(emitidoEm);
  return {
    mes: MESES_RECIBO[d.getUTCMonth()],
    ano: String(d.getUTCFullYear()),
  };
}

export function gerarHtmlRecibo(recibo: Recibo, grupoNome: string): string {
  const { mes: mesRef, ano: anoRef } = parseReferenciaFromDescricao(recibo.descricao, recibo.emitidoEm);
  const dataEmissao = new Date(recibo.emitidoEm).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric", timeZone: "UTC",
  });
  const valorFmt = `R$ ${recibo.valor.toFixed(2).replace(".", ",")}`;
  const extenso = valorPorExtenso(recibo.valor);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const assinaturaUrl = `${origin}/assinatura-tesoureiro.png`;
  const logoUrl = `${origin}/logo-rcc.png`;

  const via = (label: string) => `
    <div class="page">
      <div class="stripe"></div>
      <div class="watermark">RCC</div>
      <div class="content">
        <div class="header">
          <div class="org-left">
            <div class="logo-card">
              <img src="${logoUrl}" alt="RCC Diocese de Barreiras" class="logo-img"
                   onerror="this.style.display='none'">
            </div>
            <div>
              <div class="org-name">Renovação Carismática Católica</div>
              <div class="org-diocese">Diocese de Barreiras — Bahia</div>
              <div class="org-info">
                CNPJ: 15.617.255/0001-75 &nbsp;|&nbsp; Barreiras – BA<br>
                Contribuição Mensal dos Grupos de Oração
              </div>
            </div>
          </div>
          <div class="badge-area">
            <div class="badge-label">Comprovante</div>
            <div class="badge">${label}</div>
          </div>
        </div>

        <div class="title-row">
          <div class="title">Recibo de Contribuição Mensal</div>
          <div class="title-line"></div>
        </div>

        <div class="field-block">
          <div class="field-label">Grupo de Oração</div>
          <div class="field-value">${grupoNome}</div>
        </div>

        <div class="grid-2col">
          <div class="field-block">
            <div class="field-label">Mês de Referência</div>
            <div class="field-value">${mesRef}</div>
          </div>
          <div class="field-block">
            <div class="field-label">Ano</div>
            <div class="field-value">${anoRef}</div>
          </div>
        </div>

        <div class="grid-equal">
          <div class="field-block">
            <div class="field-label">Valor Pago</div>
            <div class="field-value valor-big">${valorFmt}</div>
          </div>
          <div class="field-block">
            <div class="field-label">Forma de Pagamento</div>
            <div class="field-value">Contribuição Mensal</div>
          </div>
        </div>

        <div class="descricao-text">
          Recebemos a quantia de <strong>${extenso} (${valorFmt})</strong> referente à contribuição mensal
          do grupo de oração acima identificado, junto à Renovação Carismática Católica – Diocese de Barreiras.
        </div>

        <div class="divider"></div>

        <div class="sig-area">
          <div class="sig-block">
            <div class="sig-scribble">
              <img src="${assinaturaUrl}" alt="Assinatura" class="sig-img"
                   onerror="this.style.display='none'">
            </div>
            <div class="sig-line">
              <div class="sig-name">Fabrício Christian da Silva Cavalcante</div>
              <div class="sig-title">Tesoureiro – RCC Diocese de Barreiras</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <span>Emitido em: ${dataEmissao} &nbsp;|&nbsp; Documento válido. RCC Diocese de Barreiras, BA.</span>
          <span style="font-family: 'Courier New', monospace;">${recibo.codigo}</span>
        </div>
      </div>
    </div>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Recibo ${recibo.codigo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, 'Times New Roman', serif; color: #2d2d2d; background: #ece4d3; padding: 12px 0; }
    .page {
      position: relative;
      width: 210mm;
      min-height: 130mm;
      margin: 0 auto 18px;
      background: #f5efe1;
      border: 1px solid #c8b87a;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    .stripe {
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 12px;
      background: linear-gradient(180deg, #1e5c1e 0%, #4a8a2e 35%, #c9b73a 70%, #f4c542 100%);
    }
    .watermark {
      position: absolute;
      right: 14mm; top: 50%;
      transform: translateY(-30%);
      font-size: 110px;
      font-weight: 900;
      color: rgba(120, 95, 30, 0.08);
      letter-spacing: 4px;
      pointer-events: none;
      font-family: Georgia, serif;
    }
    .content { position: relative; padding: 14mm 18mm 10mm 26mm; }
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding-bottom: 10px;
      margin-bottom: 14px;
    }
    .org-left { display: flex; align-items: center; gap: 14px; }
    .logo-card {
      width: 96px;
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .logo-img { max-width: 96px; max-height: 110px; object-fit: contain; display: block; }
    .org-name { font-size: 19px; font-weight: 700; color: #2d2d2d; font-family: Georgia, serif; font-style: italic; }
    .org-diocese { font-size: 10px; color: #b8860b; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; margin-top: 3px; }
    .org-info { font-size: 9.5px; color: #555; margin-top: 5px; line-height: 1.55; }
    .badge-area { text-align: right; padding-top: 2px; }
    .badge-label { font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: #888; margin-bottom: 5px; font-weight: 600; }
    .badge {
      background: #1a4d1a;
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      padding: 6px 14px;
      border-radius: 4px;
      display: inline-block;
    }
    .title-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    .title { font-size: 15px; font-weight: 700; font-style: italic; color: #1a1a1a; white-space: nowrap; }
    .title-line { flex: 1; height: 2px; background: linear-gradient(to right, #b8860b 0%, #d4c089 60%, transparent 100%); }
    .field-block { margin-bottom: 12px; }
    .field-label {
      font-size: 8px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1.2px; color: #b8860b; margin-bottom: 3px;
    }
    .field-value {
      font-size: 13px; color: #1a1a1a; padding-bottom: 4px;
      border-bottom: 1px dashed #999; min-height: 22px;
      font-family: Georgia, serif;
    }
    .grid-2col { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 10px; }
    .grid-equal { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 10px; }
    .valor-big { font-size: 22px; font-weight: 700; color: #1a4d1a; font-family: Georgia, serif; border-bottom: 2px solid #1a4d1a; }
    .descricao-text {
      font-size: 11.5px; color: #333; line-height: 1.7;
      margin: 14px 0 6px;
      font-style: italic;
    }
    .divider { border-top: 1px solid #c8b87a; margin: 8px 0; }
    .sig-area { display: flex; justify-content: flex-end; margin-top: 6px; }
    .sig-block { text-align: center; min-width: 280px; position: relative; }
    .sig-scribble { height: 56px; display: flex; justify-content: center; align-items: flex-end; }
    .sig-img { max-height: 56px; max-width: 220px; object-fit: contain; mix-blend-mode: multiply; }
    .sig-line { border-top: 1px solid #2d2d2d; padding-top: 4px; }
    .sig-name { font-size: 11.5px; font-weight: 700; color: #1a1a1a; }
    .sig-title { font-size: 9px; text-transform: uppercase; letter-spacing: 0.8px; color: #b8860b; font-weight: 600; margin-top: 2px; }
    .footer {
      border-top: 1px solid #c8b87a;
      margin-top: 12px; padding-top: 6px;
      display: flex; justify-content: space-between;
      font-size: 8.5px; color: #aaa;
    }
    .cut-line {
      max-width: 210mm;
      margin: 0 auto;
      display: flex; align-items: center; gap: 10px;
      padding: 6px 18mm;
      font-size: 9px; color: #888; letter-spacing: 2px; text-transform: uppercase;
    }
    .cut-line::before, .cut-line::after {
      content: ""; flex: 1; border-top: 1.5px dashed #999;
    }
    .cut-line .scissors { font-size: 14px; }
    .toolbar {
      max-width: 210mm; margin: 0 auto 12px;
      display: flex; justify-content: flex-end; gap: 8px;
    }
    .toolbar button {
      background: #1a4d1a; color: #fff; border: none; padding: 8px 16px;
      font-family: inherit; font-size: 13px; font-weight: 600;
      border-radius: 4px; cursor: pointer;
    }
    .toolbar button.secondary { background: #fff; color: #1a4d1a; border: 1px solid #1a4d1a; }
    .toolbar button:hover { opacity: 0.9; }
    @media print {
      body { background: #fff; padding: 0; }
      .page { border: none; box-shadow: none; margin: 0 auto; page-break-inside: avoid; }
      .toolbar { display: none; }
      .cut-line { padding: 4px 18mm; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <button class="secondary" onclick="window.close()">Fechar</button>
    <button onclick="window.print()">Imprimir / Salvar PDF</button>
  </div>
  ${via("1ª VIA – PAGADOR")}
  <div class="cut-line"><span class="scissors">&#9986;</span> RECORTE AQUI</div>
  ${via("2ª VIA – TESOURARIA")}
</body>
</html>`;
}

export function visualizarRecibo(recibo: Recibo, grupoNome: string) {
  const html = gerarHtmlRecibo(recibo, grupoNome);
  const win = window.open("", "_blank", "width=900,height=820");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

export function imprimirRecibo(recibo: Recibo, grupoNome: string) {
  const html = gerarHtmlRecibo(recibo, grupoNome).replace(
    "</body>",
    `<script>
      window.addEventListener('load', function() {
        setTimeout(function() {
          window.print();
          window.addEventListener('afterprint', function() { window.close(); });
        }, 250);
      });
    </script></body>`,
  );
  const win = window.open("", "_blank", "width=900,height=820");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

export function referenciaLabel(recibo: Recibo): string {
  const { mes, ano } = parseReferenciaFromDescricao(recibo.descricao, recibo.emitidoEm);
  return `${mes}/${ano}`;
}

const _MES_INDEX: Record<string, number> = MESES_RECIBO.reduce(
  (acc, nome, i) => {
    acc[nome.toLowerCase()] = i;
    return acc;
  },
  {} as Record<string, number>,
);

export function referenciaKey(recibo: Recibo): string {
  const { mes, ano } = parseReferenciaFromDescricao(recibo.descricao, recibo.emitidoEm);
  const idx = _MES_INDEX[mes.toLowerCase()] ?? 0;
  return `${ano}-${String(idx + 1).padStart(2, "0")}`;
}
