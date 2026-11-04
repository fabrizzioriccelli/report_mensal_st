/*
 * Guia operacional unificado PF + PJ (kit/guia-operacional.pptx), no sistema visual da referência
 * "Boas práticas nas redes sociais" (Santander): página 20 x 11,25 in, navegação em pílulas no topo
 * de cada página (Índice · 01…14, a seção atual em destaque), índice com cartões clicáveis, aberturas
 * de seção em Vermelho Santander com cartão branco, conteúdo em fundo Lisboa com cartões brancos,
 * rodapé com o nome do guia e da seção, número da página e a chama.
 * As telas são capturas REAIS dos emuladores (tools/guia/capturas.js), com marcações discretas
 * (contorno e número) nas posições exatas gravadas na captura.
 * Uso técnico (quem mantém a ferramenta; precisa do pptxgenjs):
 *   node tools/guia/capturas.js <pasta>   e depois   node tools/guia/gerar-guia.js <pasta> [saida.pptx]
 */
"use strict";
var path = require("path"), fs = require("fs");
var PptxGenJS = require("pptxgenjs");
var RAIZ = path.join(__dirname, "..", "..");
var CAP = path.resolve(process.argv[2] || "capturas"), SAIDA = path.resolve(process.argv[3] || path.join(RAIZ, "kit", "guia-operacional.pptx"));
var META = JSON.parse(fs.readFileSync(path.join(CAP, "capturas.json"), "utf8"));
var VERSAO = require(path.join(RAIZ, "tools", "motor.js")).VERSAO;

/* ---------- sistema visual (medidas da referência, em pontos de 1440 x 810) ---------- */
var C = { vm: "EC0000", boston: "CC0000", rio: "F5DECF", lisboa: "FAF1E9", br: "FFFFFF", pt: "000000", txt: "333333", cinza: "767676", linha: "E8DCD3", verde: "21634F", verdeF: "A3E0CE", ambar: "945400", ambarF: "FFE1B9" };
var FT = "Santander Headline", FX = "Santander Micro Text";
var GUIA = "Guia operacional · Report mensal PF e PJ";
function I(pt) { return pt / 72; }
var CHAMA_BR = path.join(RAIZ, "assets/marca/chama-santander-branca.png"), CHAMA_VM = path.join(RAIZ, "assets/marca/chama-santander.png");

var SECOES = [
  ["Conhecendo os emuladores", "conhecendo"], ["Escolhendo PF ou PJ", "escolhendo"], ["Primeiros passos", "primeiros"], ["Atualizando informações", "atualizando"],
  ["Imagens e mídias", "imagens"], ["Adicionar e organizar", "organizar"], ["Visualizando", "visualizando"], ["Gerando o HTML", "html"], ["E-mail-resumo", "resumo"],
  ["Link do report", "link"], ["Arquivo .eml", "eml"], ["Prompts do Copilot", "prompts"], ["Solução de problemas", "problemas"], ["Checklist mensal", "checklist"]
];
var pres = new PptxGenJS();
pres.defineLayout({ name: "GUIA", width: 20, height: 11.25 });
pres.layout = "GUIA";
pres.title = "Guia operacional · Report mensal PF e PJ";
pres.author = "Creative Strategy";
pres.company = "Santander";

/* Duas passadas: a 1ª só conta as páginas (para os links do índice e das pílulas); a 2ª desenha. */
var PAGINAS = [], INICIO = {}, PAG_INDICE = 2;
function pagina(tipo, sec, fn) { PAGINAS.push({ tipo: tipo, sec: sec, fn: fn }); if (sec && !INICIO[sec]) INICIO[sec] = PAGINAS.length; }

/* ---------- primitivas ---------- */
function texto(sl, t, o) {
  var runs = Array.isArray(t) ? t : [{ text: t, options: {} }];
  runs = runs.map(function (r) { r = typeof r === "string" ? { text: r, options: {} } : r; if (o.link && !r.options.hyperlink) r.options.hyperlink = JSON.parse(JSON.stringify(o.link)); return r; });
  sl.addText(runs, {
    x: I(o.x), y: I(o.y), w: I(o.w), h: I(o.h || o.s * 1.6), margin: 0, isTextBox: true,
    fontFace: o.f === "fx" ? FX : FT, fontSize: o.s, bold: o.b !== undefined ? o.b : o.f !== "fx", color: o.c || C.pt,
    align: o.al || "left", valign: o.va || "top", lineSpacingMultiple: o.ls || (o.f === "fx" ? 1.18 : 1.02), paraSpaceAfter: o.pa || 0, charSpacing: o.cs || 0,
    fit: "none"
  });
}
function caixa(sl, x, y, w, h, o) {
  o = o || {};
  sl.addShape(o.r === 0 ? pres.shapes.RECTANGLE : pres.shapes.ROUNDED_RECTANGLE, {
    x: I(x), y: I(y), w: I(w), h: I(h), rectRadius: o.r === 0 ? undefined : I(o.r || 20),
    fill: o.fill ? { color: o.fill } : { type: "none" }, line: o.line ? { color: o.line, width: o.lw || 1 } : { type: "none" }, hyperlink: o.link
  });
}
function pilula(sl, t, x, y, w, h, o) {
  caixa(sl, x, y, w, h, { r: h / 2, fill: o.fill, line: o.line, lw: o.lw || 1, link: o.link ? JSON.parse(JSON.stringify(o.link)) : undefined });
  texto(sl, [{ text: t, options: { hyperlink: o.link ? JSON.parse(JSON.stringify(o.link)) : undefined } }], { x: x, y: y, w: w, h: h, s: o.s || 12.8, c: o.c, al: "center", va: "middle", f: o.f });
}
function circulo(sl, t, x, y, d, fill, cor, s) {
  sl.addShape(pres.shapes.OVAL, { x: I(x), y: I(y), w: I(d), h: I(d), fill: { color: fill }, line: { type: "none" } });
  texto(sl, t, { x: x, y: y, w: d, h: d, s: s || d * 0.5, c: cor, al: "center", va: "middle" });
}
function seta(sl, x, y, d, fill, cor, link) {
  sl.addShape(pres.shapes.OVAL, { x: I(x), y: I(y), w: I(d), h: I(d), fill: { color: fill }, line: { type: "none" }, hyperlink: link });
  texto(sl, [{ text: "→", options: { hyperlink: link } }], { x: x, y: y - 1, w: d, h: d, s: d * 0.55, c: cor, al: "center", va: "middle" });
}

/* ---------- moldura da página: cabeçalho, pílulas, rodapé ---------- */
function moldura(sl, secIdx, escuro, numPag) {
  var cTxt = escuro ? C.br : C.pt;
  texto(sl, GUIA, { x: 65, y: 34, w: 420, h: 22, s: 13.5, c: cTxt, link: { slide: PAG_INDICE, tooltip: "Índice" } });
  /* pílulas: da direita para a esquerda */
  var itens = [{ t: "Índice", w: 76, alvo: PAG_INDICE, atual: false }];
  SECOES.forEach(function (s, i) {
    var n = (i < 9 ? "0" : "") + (i + 1), atual = i === secIdx;
    itens.push({ t: atual ? n + "  " + s[0] : n, w: atual ? Math.round(36 + (n + "  " + s[0]).length * 6.9) : 37, alvo: INICIO[s[1]], atual: atual });
  });
  var total = itens.reduce(function (a, b) { return a + b.w; }, 0) + 5 * (itens.length - 1), x = 1377 - total;
  itens.forEach(function (it) {
    var cor = escuro ? (it.atual ? C.vm : C.br) : (it.atual ? C.br : C.vm), fill = it.atual ? (escuro ? C.br : C.vm) : undefined, line = escuro ? C.br : C.vm;
    pilula(sl, it.t, x, 33, it.w, 30, { fill: fill, line: line, c: cor, s: 11.5, link: it.alvo ? { slide: it.alvo, tooltip: it.t } : undefined });
    x += it.w + 5;
  });
  /* rodapé */
  var sec = secIdx >= 0 ? SECOES[secIdx][0] : "";
  texto(sl, GUIA + (sec ? "  ·  " + sec : ""), { x: 65, y: 757, w: 700, h: 20, s: 13.5, f: "fx", b: false, c: escuro ? C.br : C.cinza });
  texto(sl, String(numPag).padStart(2, "0"), { x: 1290, y: 755, w: 40, h: 22, s: 15, c: cTxt, al: "right" });
  sl.addImage({ path: escuro ? CHAMA_BR : CHAMA_VM, x: I(1340), y: I(749), w: I(30), h: I(28.3) });
}
/* etiqueta discreta do segmento: PF (contorno vermelho) e PJ (balão Rio com texto Boston, como no Empresas) */
function tags(sl, segs, x, y) {
  segs.forEach(function (s) {
    var w = 46;
    if (s === "PF") pilula(sl, "PF", x, y, w, 26, { fill: C.br, line: C.vm, c: C.vm, s: 12 });
    else pilula(sl, "PJ", x, y, w, 26, { fill: C.rio, c: C.boston, s: 12 });
    x += w + 6;
  });
}
function titulo(sl, t, sub, segs) {
  texto(sl, t, { x: 65, y: 88, w: 1100, h: 56, s: 42, c: C.vm });
  if (segs) tags(sl, segs, 1377 - segs.length * 52 + 6, 102);
  /* subtítulo longo (ex.: objetivo de um prompt): menor, em até duas linhas, sem encostar no conteúdo */
  if (sub) texto(sl, sub, sub.length > 105 ? { x: 65, y: 146, w: 1310, h: 44, s: 16, c: C.pt } : { x: 65, y: 150, w: 1310, h: 34, s: 23, c: C.pt });
}

/* ---------- blocos de conteúdo ---------- */
/* lista de passos numerados num cartão branco: cada passo [destaque, texto] */
function passos(sl, x, y, w, h, lista, o) {
  o = o || {};
  caixa(sl, x, y, w, h, { fill: C.br, r: 20 });
  var cy = y + 22, s = o.s || 15.5, alt = o.alt || 0;
  if (o.cab) { texto(sl, o.cab, { x: x + 26, y: cy, w: w - 52, h: 30, s: 19, c: C.pt }); cy += 38; }
  lista.forEach(function (p, i) {
    var linhas = Math.max(1, Math.ceil((p[0].length + p[1].length + 2) / ((w - 90) / (s * 0.5)))), hh = alt || Math.max(30, linhas * s * 1.24 + 8);
    circulo(sl, String(i + 1), x + 24, cy + 1, 26, C.vm, C.br, 13);
    texto(sl, [{ text: p[0] + (p[1] ? " " : ""), options: { bold: true, color: C.pt, fontFace: FT } }, { text: p[1], options: { bold: false, color: C.txt, fontFace: FX } }],
      { x: x + 62, y: cy, w: w - 88, h: hh, s: s, f: "fx" });
    cy += hh + 10;
    if (i < lista.length - 1) sl.addShape(pres.shapes.LINE, { x: I(x + 62), y: I(cy - 6), w: I(w - 88), h: 0, line: { color: C.linha, width: 0.75 } });
  });
  return cy;
}
function confirmar(sl, x, y, w, h, t, rot) {
  caixa(sl, x, y, w, h, { fill: C.br, r: 20 });
  circulo(sl, "✓", x + 22, y + 18, 28, C.verde, C.br, 15);
  texto(sl, rot || "Como confirmar", { x: x + 60, y: y + 19, w: w - 80, h: 26, s: 17, c: C.pt });
  texto(sl, t, { x: x + 60, y: y + 46, w: w - 84, h: h - 54, s: 14.5, f: "fx", b: false, c: C.txt });
}
function atencao(sl, x, y, w, h, t, rot) {
  caixa(sl, x, y, w, h, { fill: C.br, r: 20 });
  circulo(sl, "!", x + 22, y + 18, 28, C.ambar, C.br, 16);
  texto(sl, rot || "Atenção", { x: x + 60, y: y + 19, w: w - 80, h: 26, s: 17, c: C.pt });
  texto(sl, t, { x: x + 60, y: y + 46, w: w - 84, h: h - 54, s: 14.5, f: "fx", b: false, c: C.txt });
}
/* diferença do PJ: balão Rio com texto Boston (o mesmo do Empresas) */
function diferencaPJ(sl, x, y, w, h, t) {
  caixa(sl, x, y, w, h, { fill: C.br, r: 20 });
  pilula(sl, "No PJ", x + 20, y + 18, 74, 26, { fill: C.rio, c: C.boston, s: 12.5 });
  texto(sl, t, { x: x + 108, y: y + 19, w: w - 128, h: h - 30, s: 14.5, f: "fx", b: false, c: C.txt });
}
/* captura real, enquadrada num cartão branco, com as marcações [{i: índice da caixa, n: número}] */
function captura(sl, nome, x, y, w, h, marcas, o) {
  o = o || {};
  var m = META[nome]; if (!m) throw new Error("captura não encontrada: " + nome);
  caixa(sl, x, y, w, h, { fill: C.br, r: 20 });
  var pad = 14, cab = o.rot ? 30 : 0, bw = w - pad * 2, bh = h - pad * 2 - cab, esc = Math.min(bw / m.w, bh / m.h), iw = m.w * esc, ih = m.h * esc, ix = x + pad + (bw - iw) / 2, iy = y + pad + cab + (bh - ih) / 2;
  if (o.rot) { texto(sl, o.rot, { x: x + pad + 4, y: y + 12, w: w - 40, h: 22, s: 12.5, c: C.cinza, cs: 1.5 }); if (o.seg) tags(sl, [o.seg], x + w - pad - 46, y + 9); }
  sl.addImage({ path: path.join(CAP, m.arquivo), x: I(ix), y: I(iy), w: I(iw), h: I(ih), altText: "Captura de tela real do emulador: " + (m.legenda || nome) + " (dados fictícios de treinamento)" });
  sl.addShape(pres.shapes.RECTANGLE, { x: I(ix), y: I(iy), w: I(iw), h: I(ih), fill: { type: "none" }, line: { color: C.linha, width: 0.75 } });
  (marcas || []).forEach(function (mk) {
    var c = m.caixas[mk.i]; if (!c) throw new Error("marca sem caixa: " + nome + " #" + mk.i);
    /* a marcação fica dentro da imagem: o que passa da borda é cortado (e o que está fora não é marcado) */
    var x0 = Math.max(0, c.x), y0 = Math.max(0, c.y), x1 = Math.min(1, c.x + c.w), y1 = Math.min(1, c.y + c.h);
    if (x1 - x0 < 0.01 || y1 - y0 < 0.01) throw new Error("marca fora da captura: " + nome + " #" + mk.i);
    var bx = Math.max(ix, ix + x0 * iw - 3), by = Math.max(iy, iy + y0 * ih - 3), bw2 = Math.min(ix + iw, ix + x1 * iw + 3) - bx, bh2 = Math.min(iy + ih, iy + y1 * ih + 3) - by;
    caixa(sl, bx, by, bw2, bh2, { r: 6, line: C.vm, lw: 2.25 });
    if (mk.n) circulo(sl, String(mk.n), Math.max(ix - 6, bx - 13), Math.max(iy - 6, by - 13), 26, C.vm, C.br, 13);
  });
  texto(sl, w < 460 ? "CAPTURA REAL · FICTÍCIO" : "CAPTURA REAL · DADOS FICTÍCIOS DE TREINAMENTO", { x: x + 14, y: y + h + 5, w: w - 28, h: 14, s: 9, c: C.cinza, cs: 1.2, al: "right" });
}
/* esquema de pastas ou passos (não é captura de tela) */
function esquema(sl, x, y, w, h, linhas, rot) {
  caixa(sl, x, y, w, h, { fill: C.br, r: 20 });
  texto(sl, rot || "ESQUEMA (NÃO É CAPTURA DE TELA)", { x: x + 24, y: y + 18, w: w - 48, h: 18, s: 11, c: C.cinza, cs: 1.5 });
  sl.addText(linhas.join("\n"), { x: I(x + 24), y: I(y + 44), w: I(w - 48), h: I(h - 60), margin: 0, fontFace: "Courier New", fontSize: 13.5, color: C.txt, valign: "top", isTextBox: true, lineSpacingMultiple: 1.15 });
}
function tabela(sl, x, y, w, cab, linhas, larg, o) {
  o = o || {};
  var rows = [cab.map(function (t) { return { text: t, options: { bold: true, fontFace: FT, color: C.br, fill: { color: C.vm }, fontSize: o.s || 13.5 } }; })];
  linhas.forEach(function (l, i) {
    rows.push(l.map(function (t, j) {
      var r = typeof t === "object" ? t : { text: String(t) };
      return { text: r.text, options: { fontFace: j === 0 ? FT : FX, bold: j === 0, color: C.pt, fill: { color: i % 2 ? "FFF8F3" : C.br }, fontSize: o.s || 13.5, hyperlink: r.link } };
    }));
  });
  sl.addTable(rows, { x: I(x), y: I(y), w: I(w), colW: larg.map(I), border: { type: "solid", color: C.linha, pt: 0.75 }, margin: 0.08, valign: "middle", rowH: I(o.rowH || 30), autoPage: false });
}
function cartaoTexto(sl, x, y, w, h, cab, t, o) {
  o = o || {};
  caixa(sl, x, y, w, h, { fill: o.fill || C.br, r: 20, link: o.link });
  if (o.eyebrow) pilula(sl, o.eyebrow, x + 22, y + 20, Math.max(64, o.eyebrow.length * 7.4 + 24), 24, { fill: o.eyeFill || C.rio, c: o.eyeCor || C.boston, s: 11.5 });
  var oy = o.eyebrow ? 56 : 22;
  texto(sl, cab, { x: x + 24, y: y + oy, w: w - 48, h: 30, s: o.sc || 20, c: o.cc || C.pt, link: o.link });
  if (t) texto(sl, t, { x: x + 24, y: y + oy + (o.sc || 20) * 1.6, w: w - 48, h: h - oy - 40, s: o.st || 14.5, f: "fx", b: false, c: o.ct || C.txt });
}

/* ---------- tipos de página ---------- */
function divisor(secKey, texto1, frase, eyebrow, cap) {
  pagina("divisor", secKey, function (sl, n) {
    var si = SECOES.findIndex(function (s) { return s[1] === secKey; });
    sl.background = { color: C.vm };
    moldura(sl, si, true, n);
    texto(sl, (si < 9 ? "0" : "") + (si + 1), { x: 65, y: 112, w: 200, h: 34, s: 24, c: C.br });
    texto(sl, SECOES[si][0], { x: 65, y: 148, w: 720, h: 170, s: 62, c: C.br, ls: 0.98 });
    texto(sl, texto1, { x: 65, y: 380, w: 690, h: 300, s: 20, f: "fx", b: false, c: C.br, ls: 1.25 });
    caixa(sl, 850, 98, 527, 620, { fill: C.br, r: 34 });
    pilula(sl, eyebrow || "Nesta seção", 878, 128, Math.max(110, (eyebrow || "Nesta seção").length * 7.6 + 30), 28, { fill: C.rio, c: C.boston, s: 12.5 });
    texto(sl, frase, { x: 878, y: 172, w: 470, h: cap ? 180 : 500, s: 31, c: C.vm, ls: 1.05 });
    if (cap) {
      var m = META[cap], bw = 471, bh = 300, esc = Math.min(bw / m.w, bh / m.h), iw = m.w * esc, ih = m.h * esc;
      sl.addImage({ path: path.join(CAP, m.arquivo), x: I(878 + (bw - iw) / 2), y: I(392 + (bh - ih) / 2), w: I(iw), h: I(ih), altText: "Captura real do emulador (dados fictícios)" });
      sl.addShape(pres.shapes.RECTANGLE, { x: I(878 + (bw - iw) / 2), y: I(392 + (bh - ih) / 2), w: I(iw), h: I(ih), fill: { type: "none" }, line: { color: C.linha, width: 0.75 } });
    }
  });
}
function conteudo(secKey, fn) {
  pagina("conteudo", secKey, function (sl, n) {
    var si = SECOES.findIndex(function (s) { return s[1] === secKey; });
    sl.background = { color: C.lisboa };
    moldura(sl, si, false, n);
    fn(sl, n);
  });
}

module.exports = { pres: pres, pagina: pagina, conteudo: conteudo, divisor: divisor, texto: texto, caixa: caixa, pilula: pilula, circulo: circulo, seta: seta, moldura: moldura, tags: tags, titulo: titulo,
  passos: passos, confirmar: confirmar, atencao: atencao, diferencaPJ: diferencaPJ, captura: captura, esquema: esquema, tabela: tabela, cartaoTexto: cartaoTexto, C: C, I: I, SECOES: SECOES, INICIO: INICIO,
  PAGINAS: PAGINAS, META: META, RAIZ: RAIZ, CAP: CAP, VERSAO: VERSAO, CHAMA_BR: CHAMA_BR, FT: FT, FX: FX };

if (require.main === module) {
  require("./conteudo-guia.js")(module.exports);
  PAGINAS.forEach(function (pg, i) { var sl = pres.addSlide(); pg.fn(sl, i + 1); });
  pres.writeFile({ fileName: SAIDA }).then(function () { console.log("Guia: " + path.relative(RAIZ, SAIDA) + " (" + PAGINAS.length + " páginas)"); });
}
