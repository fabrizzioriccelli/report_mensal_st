/*
 * Testes do motor do report (tools/motor.js).
 * Uso técnico, opcional: precisa do Node.js. Não é necessário para gerar o report.
 *   node tests/motor.test.js
 */
"use strict";
var fs = require("fs"), path = require("path"), assert = require("assert");
var M = require("../tools/motor.js");
var RAIZ = path.join(__dirname, "..");
function ler(p) { return fs.readFileSync(path.join(RAIZ, p), "utf8"); }
function existe(p) { return fs.existsSync(path.join(RAIZ, p)); }
var MARCA = ler("config/marca.txt"), TEMPLATE = ler("template/report.html");
function montar(dados, extra) {
  return M.montar(Object.assign({ dados: dados, arquivoDados: "teste.txt", marca: MARCA, template: TEMPLATE, existe: existe }, extra || {}));
}
var MINIMO = [
  "[EDICAO]", "mes: Outubro", "ano: 2026", "proximo_mes: Novembro", "pasta_imagens: assets/2026-09",
  "[ABERTURA]", "frase: Um mês", "frase_final: de teste.",
  "[PROJETO PRINCIPAL]", "nome: Projeto", "imagem: openai-ads.jpg", "tipo: peca", "link: https://empresa.sharepoint.com/:i:/s/site/abc",
  "[NUMERO 1]", "valor: 10%", "titulo: CTR", "detalhe: era 5%", "variacao: +100%"
].join("\n");

var testes = 0, falhas = 0;
function teste(nome, fn) {
  testes++;
  try { fn(); console.log("  ok  " + nome); } catch (e) { falhas++; console.log("  FALHOU  " + nome + "\n        " + e.message); }
}
function niveis(r, n) { return r.problemas.filter(function (p) { return p.nivel === n; }); }

console.log("Motor do report");

teste("o report de setembro monta sem erros", function () {
  var r = montar(ler("dados/2026-09.txt"));
  assert.ok(r.ok, JSON.stringify(niveis(r, "erro")));
  assert.strictEqual(r.imagens.length, 12); /* logo (capa e rodapé) + 5 peças + 3 formiguinhas + 2 ícones */
  assert.ok(!/\{\{|\}\}/.test(r.html), "sobrou {{campo}} no HTML");
  assert.ok(niveis(r, "pendencia").length > 0, "setembro tem pendências de propósito");
  assert.strictEqual(r.nomeArquivo, "report-2026-09");
});

teste("o modelo em branco monta (com pendências, sem erros)", function () {
  var r = montar(ler("dados/MODELO.txt"), { existe: function () { return true; } });
  assert.ok(r.ok, JSON.stringify(niveis(r, "erro")));
});

teste("dados mínimos: sem pendências e com CTA da peça", function () {
  var r = montar(MINIMO);
  assert.ok(r.ok, JSON.stringify(niveis(r, "erro")));
  assert.strictEqual(niveis(r, "pendencia").length, 0);
  assert.ok(r.html.indexOf('href="https://empresa.sharepoint.com/:i:/s/site/abc"') > 0);
  assert.ok(r.html.indexOf("Ver peça&nbsp;&#8594;") > 0);
  assert.ok(r.html.indexOf("O QUE LANÇAMOS") < 0, "seção sem conteúdo não aparece");
});

teste("sem link: sem CTA e imagem sem <a>", function () {
  var r = montar(MINIMO.replace(/link: .*/, "link:"));
  assert.ok(r.ok);
  assert.ok(r.html.indexOf("Ver peça") < 0);
  assert.ok(!/<a [^>]*>\s*<img/.test(r.html));
});

teste("vídeo: CTA Assistir e play desenhado na miniatura", function () {
  var r = montar(MINIMO.replace("tipo: peca", "tipo: video"));
  assert.ok(r.html.indexOf("&#9654;&nbsp;Assistir") > 0);
  assert.ok(r.imagens.some(function (i) { return i.play && /openai-ads/.test(i.caminho); }));
});

teste("logo: arquivo faltando vira pendência e espaço tracejado; sem logo, nada aparece", function () {
  var r = M.montar({ dados: MINIMO, marca: MARCA.replace("arquivo: assets/marca/logo-santander-branco.png", "arquivo: assets/marca/nao-existe.png"), template: TEMPLATE, existe: existe });
  assert.ok(r.ok && niveis(r, "pendencia").some(function (p) { return /Logo não encontrado/.test(p.msg); }));
  assert.ok(r.html.indexOf(">LOGO</p>") > 0);
  r = M.montar({ dados: MINIMO, marca: MARCA.replace("arquivo: assets/marca/logo-santander-branco.png", "arquivo:"), template: TEMPLATE, existe: existe });
  assert.ok(r.ok && r.html.indexOf(">LOGO</p>") < 0 && !r.imagens.some(function (i) { return i.papel === "logo"; }));
});

teste("bloco desconhecido e linha sem dois-pontos viram erro com número da linha", function () {
  var r = montar(MINIMO + "\n[NUMEROS 2]\nvalor: 1\nlinha solta");
  assert.ok(!r.ok);
  var e = niveis(r, "erro");
  assert.ok(e.some(function (p) { return /desconhecido/.test(p.msg) && p.linha === 19; }));
  assert.ok(e.some(function (p) { return /sem ":"/.test(p.msg) && p.linha === 21; }));
});

teste("arquivo salvo sem UTF-8 (acentos perdidos) vira erro claro", function () {
  var r = montar(MINIMO.replace("Um mês", "Um m\uFFFDs"));
  assert.ok(!r.ok && niveis(r, "erro").some(function (p) { return /UTF-8/.test(p.msg) && p.linha === 7; }));
});

teste("campo obrigatório vazio vira erro", function () {
  var r = montar(MINIMO.replace("frase: Um mês", "frase:"));
  assert.ok(!r.ok && niveis(r, "erro").some(function (p) { return /frase/.test(p.msg); }));
});

teste("imagem que não existe vira erro", function () {
  var r = montar(MINIMO.replace("openai-ads.jpg", "nao-existe.jpg"));
  assert.ok(!r.ok && niveis(r, "erro").some(function (p) { return /não encontrada/.test(p.msg); }));
});

teste("links: caminho de rede e arquivo local são bloqueados", function () {
  assert.strictEqual(M.conferirLink("\\\\servidor\\pasta\\a.jpg", "peca", [])[0].nivel, "erro");
  assert.strictEqual(M.conferirLink("file:///C:/a.jpg", "peca", [])[0].nivel, "erro");
  assert.strictEqual(M.conferirLink("C:\\Users\\a.jpg", "peca", [])[0].nivel, "erro");
  assert.strictEqual(M.conferirLink("javascript:alert(1)", "peca", [])[0].nivel, "erro");
  assert.strictEqual(M.conferirLink("https://a b.com", "peca", [])[0].nivel, "erro");
});

teste("links: placeholder é pendência; https interno passa; domínio fora da lista avisa", function () {
  assert.strictEqual(M.conferirLink("[COLE O LINK]", "peca", [])[0].nivel, "pendencia");
  assert.deepStrictEqual(M.conferirLink("https://empresa.sharepoint.com/:v:/s/x/abc", "video", ["empresa.sharepoint.com"]), []);
  assert.strictEqual(M.conferirLink("https://outro.com/x", "peca", ["empresa.sharepoint.com"])[0].nivel, "aviso");
  assert.strictEqual(M.conferirLink("https://empresa.sharepoint.com/_layouts/15/embed.aspx?x=1", "video", [])[0].nivel, "aviso");
  assert.strictEqual(M.conferirLink("https://empresa.sharepoint.com/a.mp4", "video", [])[0].nivel, "aviso");
});

teste("pendência em link do placeholder gera CTA com #link-pendente (só rascunho)", function () {
  var r = montar(MINIMO.replace(/link: .*/, "link: [COLE O LINK]"));
  assert.ok(r.html.indexOf('href="#link-pendente"') > 0);
  assert.ok(niveis(r, "pendencia").length === 1);
});

teste("texto do usuário é escapado (só <br> é aceito)", function () {
  var r = montar(MINIMO.replace("frase: Um mês", "frase: <b>A</b> & B<br>C"));
  assert.ok(r.html.indexOf("&lt;b&gt;A&lt;/b&gt; &amp; B<br>C") > 0);
});

teste("Creative X: variação e barra calculadas", function () {
  var r = montar(MINIMO + "\n[CREATIVE X]\nanterior: 72%\natual: 80%");
  assert.ok(r.html.indexOf("+8 p.p.") > 0);
  assert.ok(r.html.indexOf('width="80%" height="8"') > 0 && r.html.indexOf('width="20%" height="8"') > 0);
});

teste("marca: cor inválida vira erro", function () {
  var r = M.montar({ dados: MINIMO, marca: MARCA.replace("marca: #9E1218", "marca: vermelho"), template: TEMPLATE, existe: existe });
  assert.ok(!r.ok && r.problemas.some(function (p) { return /Cor "marca"/.test(p.msg); }));
});

teste("marca: fonte do Outlook vira uma fonte só, com aspas se tiver espaço", function () {
  var r = M.montar({ dados: MINIMO, marca: MARCA.replace("titulos_outlook_windows: Georgia", "titulos_outlook_windows: Fonte Oficial, Georgia"), template: TEMPLATE, existe: existe });
  assert.ok(r.html.indexOf(".ft{font-family:'Fonte Oficial',serif !important;}") > 0);
});

teste(".eml: estrutura MIME, assunto codificado e cid", function () {
  var eml = M.gerarEml({ assunto: "Report de Março 2026 · teste longo para dobrar o assunto", html: '<img src="cid:img01-a.png@report">', texto: "Olá",
    imagens: [{ cid: "img01-a.png@report", nome: "img01-a.png", bytes: new Uint8Array([1, 2, 3]) }], semente: "t" });
  assert.ok(/^X-Unsent: 1\r\n/.test(eml));
  assert.ok(eml.indexOf('multipart/alternative; boundary="=_alt_t"') > 0 && eml.indexOf('multipart/related; boundary="=_rel_t"') > 0);
  eml.split("\r\n").forEach(function (l) { assert.ok(l.length <= 78, "linha longa: " + l.slice(0, 40)); });
  var assunto = eml.match(/Subject: ([\s\S]*?)\r\nMIME/)[1].replace(/\r\n /g, "");
  var dec = assunto.replace(/=\?UTF-8\?B\?([^?]+)\?=/g, function (m, b) { return Buffer.from(b, "base64").toString("utf8"); });
  assert.strictEqual(dec, "Report de Março 2026 · teste longo para dobrar o assunto");
  assert.ok(eml.indexOf("Content-ID: <img01-a.png@report>") > 0);
});

teste("base64 e crc32 corretos", function () {
  ["", "a", "ab", "abc", "Olá, mundo ✓"].forEach(function (s) { assert.strictEqual(M.base64(M.utf8(s)), Buffer.from(s, "utf8").toString("base64")); });
  assert.strictEqual(M.crc32(M.utf8("123456789")), 0xCBF43926);
});

teste("conferência de HTML detecta recursos que o Outlook não aceita", function () {
  var r = M.conferirHtml('<div style="display:flex"><script></script><img src="file:///a.jpg"></div>');
  assert.ok(r.length >= 3);
  assert.deepStrictEqual(M.conferirHtml('<img src="cid:a" width="10" alt="">'), []);
});

console.log("\n" + (testes - falhas) + " de " + testes + " testes passaram.");
process.exit(falhas ? 1 : 0);
