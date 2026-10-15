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
/* Dados SINTÉTICOS de teste (não são resultados reais). A imagem é um ícone do próprio projeto. */
var MINIMO = [
  "[EDICAO]", "mes: Outubro", "ano: 2026", "proximo_mes: Novembro", "pasta_imagens: assets/icones",
  "[ABERTURA]", "frase: Um mês", "frase_final: de teste.",
  "[PROJETO PRINCIPAL]", "nome: Projeto", "imagem: icone-prancheta.png", "tipo: peca", "link: https://empresa.sharepoint.com/:i:/s/site/abc",
  "[NUMERO 1]", "valor: 10%", "titulo: CTR", "detalhe: era 5%", "variacao: +100%"
].join("\n");
var MODELO = ler("dados/MODELO.txt");

var testes = 0, falhas = 0;
function teste(nome, fn) {
  testes++;
  try { fn(); console.log("  ok  " + nome); } catch (e) { falhas++; console.log("  FALHOU  " + nome + "\n        " + e.message); }
}
function niveis(r, n) { return r.problemas.filter(function (p) { return p.nivel === n; }); }

console.log("Motor do report");

teste("o modelo em branco monta sem erros, só com pendências", function () {
  var r = montar(MODELO);
  assert.ok(r.ok, JSON.stringify(niveis(r, "erro")));
  assert.ok(niveis(r, "pendencia").length > 30, "o modelo deve listar os campos de exemplo (Lorem, X, [INSERIR …])");
  assert.ok(!/\{\{|\}\}/.test(r.html), "sobrou {{campo}} no HTML");
  assert.strictEqual(r.nomeArquivo, "report-MODELO");
});

teste("estado vazio: nenhum NaN/undefined/null e nenhum número inventado", function () {
  var r = montar(MODELO), visivel = r.html.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ");
  assert.ok(!/\b(NaN|undefined|null|Infinity)\b/.test(visivel), "valor técnico aparecendo no e-mail");
  assert.ok(!/\d+(,\d+)?\s?(%|p\.p\.)/.test(visivel), "nenhum número inventado: só X%, X p.p., R$ X");
  assert.ok(visivel.indexOf("+X p.p.") > 0 && visivel.indexOf("X%") > 0 && visivel.indexOf("R$&nbsp;X") > 0, "indicadores como X%");
  assert.ok(r.html.indexOf('width="100%" height="8"') > 0, "barra do Creative X vazia (cinza inteira), sem cálculo com X");
  assert.ok(!/href="#/.test(r.html), "link pendente não pode virar link clicável");
  assert.ok(r.html.indexOf(">IMAGEM</p>") > 0, "espaço de imagem identificado");
  assert.ok(/Lorem ipsum/.test(visivel), "textos de exemplo em Lorem Ipsum");
});

teste("provisórios: Lorem Ipsum e X contam como pendência (não liberam a versão final)", function () {
  var r = montar(MINIMO.replace("frase: Um mês", "frase: Lorem ipsum").replace("valor: 10%", "valor: X%"));
  var p = niveis(r, "pendencia").map(function (x) { return x.msg; }).join(" | ");
  assert.ok(/frase: texto de exemplo/.test(p) && /valor: valor de exemplo/.test(p), p);
  r = montar(MINIMO.replace("mes: Outubro", "mes: Mês").replace("ano: 2026", "ano: AAAA"));
  assert.ok(niveis(r, "pendencia").length === 2 && r.nomeArquivo === "report-MODELO");
  r = montar(MINIMO.replace("titulo: CTR", "titulo: Creative X"));
  assert.strictEqual(niveis(r, "pendencia").length, 0, "X em nome (Creative X) não é placeholder");
});

teste("Brand Guide: títulos em vermelho, fontes Santander primeiro, sem itálico, sem fundo fora da paleta", function () {
  var r = montar(MODELO);
  assert.ok(r.html.indexOf("font-family:'Santander Headline', Arial") > 0);
  assert.ok(r.html.indexOf("font-family:'Santander Micro Text', Arial") > 0);
  assert.ok(r.html.indexOf("font-family:'Santander Condensed', 'Santander Headline', Arial") > 0);
  assert.ok(!/font-style:italic|<i[ >]/.test(r.html), "as famílias Santander do guia não têm itálico");
  var fundos = (r.html.match(/(?:bgcolor="|background:)(#[0-9A-F]{6})/gi) || []).map(function (x) { return x.slice(-7).toUpperCase(); });
  /* principais + apoio só em elementos pontuais: etiquetas de variação, barra, etiqueta do número da seção */
  var permitidos = ["#FFFFFF", "#FBF1EA", "#F5DECF", "#EC0000", "#A3E0CE", "#FFE1B9", "#E2E2E2", "#CDECEE", "#F0CAE1", "#FFC3CF", "#803262"];
  fundos.forEach(function (f) { assert.ok(permitidos.indexOf(f) >= 0, "fundo fora da paleta: " + f); });
});

teste("grade da abertura: 3 números em colunas de 184 px; 4 números em 4 colunas iguais", function () {
  var r = montar(MODELO);
  assert.deepStrictEqual(r.modelo.abertura.numeros.map(function (n) { return n.largura; }), [184, 184, 184]);
  var quatro = MODELO.replace("[LANCAMOS]", "[NUMERO 4]\nvalor: X\ntitulo: Lorem ipsum\n\n[LANCAMOS]");
  r = montar(quatro);
  assert.deepStrictEqual(r.modelo.abertura.numeros.map(function (n) { return n.largura; }), [132, 132, 132, 132]);
  r = montar(MINIMO);
  assert.strictEqual(r.modelo.abertura.numeros[0].largura + r.modelo.abertura.sobra, 600, "1 número: coluna 1 e o resto vazio");
});

teste("Brand Guide: cantos de 34 px (5% do formato de 680 px) e 20 px no celular; e-mail começa na capa", function () {
  var r = montar(MODELO);
  assert.ok((r.html.match(/border-radius:34px/g) || []).length >= 6, "retângulos com 34 px");
  assert.ok(/\.ra\{border-radius:20px !important;\}/.test(r.html), "20 px no celular");
  assert.ok(r.html.indexOf("Olá!") < 0, "sem faixa de saudação antes da capa");
});

teste("celular: 3 números em terços, selo vira linha sob o nome, formiguinha ao lado do texto, textos maiores", function () {
  var r = montar(MODELO);
  assert.ok(r.modelo.abertura.numeros.every(function (n) { return n.classe_m === "third"; }));
  assert.ok(r.modelo.lancamos.destaque.resultados.every(function (n) { return n.classe_m === "third"; }));
  var quatro = montar(MODELO.replace("[LANCAMOS]", "[NUMERO 4]\nvalor: X\ntitulo: Lorem ipsum\n\n[LANCAMOS]"));
  assert.ok(quatro.modelo.abertura.numeros.every(function (n) { return n.classe_m === "half"; }), "4 números: 2 por linha");
  assert.ok(/\.third\{display:inline-block !important;width:32% !important;/.test(r.html));
  assert.ok(r.html.indexOf('<td class="fant"') > 0 && r.html.indexOf('<td class="fw"') > 0);
  assert.ok((r.html.match(/class="fx tm/g) || []).length >= 10, "textos de leitura com 14 px no celular");
});

teste("formiguinha: só no encerramento (rodapé), com o arquivo original", function () {
  var r = montar(MODELO);
  var f = r.imagens.filter(function (i) { return i.papel === "formiguinha"; });
  assert.strictEqual(f.length, 1);
  assert.strictEqual((r.html.match(new RegExp(f[0].token, "g")) || []).length, 1, "uma aparição só");
  assert.ok(r.html.indexOf(f[0].token) > r.html.indexOf("Até "), "fica no rodapé");
  f.forEach(function (i) { assert.strictEqual(i.caminho, "assets/formiguinha/formiguinha.png"); });
  var semFormiga = M.montar({ dados: MODELO, marca: MARCA.replace("arquivo: assets/formiguinha/formiguinha.png", "arquivo:"), template: TEMPLATE, existe: existe });
  assert.ok(semFormiga.ok && !semFormiga.imagens.some(function (i) { return i.papel === "formiguinha"; }));
});

teste("chama: logo da capa e do rodapé é a chama branca", function () {
  var r = montar(MINIMO);
  var l = r.imagens.filter(function (i) { return i.papel === "logo"; });
  assert.strictEqual(l.length, 1, "capa e rodapé usam a mesma imagem (vai uma vez só no .eml)");
  assert.strictEqual(l[0].caminho, "assets/marca/chama-santander-branca.png");
  assert.strictEqual((r.html.match(new RegExp(l[0].token, "g")) || []).length, 2, "chama na capa e no rodapé");
});

teste("Parte 2 no celular: o destaque ganha versão horizontal (show-m)", function () {
  var d = MINIMO + "\n[DESTAQUE]\ntitulo: Destaque de teste\nimagem: icone-lupa.png\nenquadramento: direita\ntipo: peca\nlink: https://empresa.sharepoint.com/:i:/s/x/y";
  var r = montar(d);
  assert.ok(r.ok, JSON.stringify(niveis(r, "erro")));
  var m = r.imagens.filter(function (i) { return /celular/.test(i.papel); });
  assert.strictEqual(m.length, 1);
  assert.ok(m[0].fluida && m[0].recorte && m[0].w === 350 && m[0].h === 200 && m[0].ancora === "direita");
  assert.ok(r.html.indexOf('class="show-m"') > 0);
  assert.ok(r.html.indexOf('class="hide-m" width="184"') > 0, "no computador a peça vertical continua");
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
  assert.ok(r.imagens.some(function (i) { return i.play && /icone-prancheta/.test(i.caminho); }));
});

teste("logo: arquivo faltando vira pendência e espaço tracejado; sem logo, nada aparece", function () {
  var r = M.montar({ dados: MINIMO, marca: MARCA.replace("arquivo: assets/marca/chama-santander-branca.png", "arquivo: assets/marca/nao-existe.png"), template: TEMPLATE, existe: existe });
  assert.ok(r.ok && niveis(r, "pendencia").some(function (p) { return /Logo não encontrado/.test(p.msg); }));
  assert.ok(r.html.indexOf(">LOGO</p>") > 0);
  r = M.montar({ dados: MINIMO, marca: MARCA.replace("arquivo: assets/marca/chama-santander-branca.png", "arquivo:"), template: TEMPLATE, existe: existe });
  assert.ok(r.ok && r.html.indexOf(">LOGO</p>") < 0 && !r.imagens.some(function (i) { return i.papel === "logo"; }));
});

teste("enquadramento do recorte: centro/topo/baixo/esquerda/direita; valor inválido vira aviso", function () {
  var r = montar(MINIMO.replace("tipo: peca", "enquadramento: baixo\ntipo: peca"));
  assert.ok(r.imagens.some(function (i) { return i.ancora === "baixo"; }));
  r = montar(MINIMO.replace("tipo: peca", "enquadramento: esquerda\ntipo: peca"));
  assert.ok(r.imagens.some(function (i) { return i.ancora === "esquerda"; }));
  r = montar(MINIMO.replace("tipo: peca", "enquadramento: lado\ntipo: peca"));
  assert.ok(r.ok && niveis(r, "aviso").some(function (p) { return /enquadramento/.test(p.msg); }));
});

teste("grade: colunas de 184 px nas seções de 3 colunas", function () {
  var r = montar(MODELO);
  assert.ok((r.html.match(/width="184"/g) || []).length >= 9, "esperava colunas de 184 px");
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
  var r = montar(MINIMO.replace("icone-prancheta.png", "nao-existe.jpg"));
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

teste("link pendente: botão aparece em cinza, sem ser clicável (só rascunho)", function () {
  var r = montar(MINIMO.replace(/link: .*/, "link: [INSERIR LINK]"));
  /* na capa vermelha, em Rio (contraste); nas outras seções, em cinza */
  assert.ok(/<span title="Link ainda não definido" style="color:#F5DECF;[^"]*">Ver peça&nbsp;&#8594;<\/span>/.test(r.html));
  var m = montar(MODELO);
  assert.ok(/<span title="Link ainda não definido" style="color:#767676;[^"]*">Ver peça&nbsp;&#8594;<\/span>/.test(m.html));
  assert.ok(!/<a [^>]*>\s*<img/.test(r.html) && !/href="#/.test(r.html));
  assert.ok(niveis(r, "pendencia").length === 1);
});

teste("número pendente vira etiqueta pequena (não estoura a coluna)", function () {
  var r = montar(MINIMO.replace("valor: 10%", "valor: [INSERIR RESULTADO]").replace("variacao: +100%", "variacao: [INSERIR VARIAÇÃO]"));
  assert.ok(/<span style="display:inline-block;[^"]*font-size:11px[^"]*">\[INSERIR RESULTADO\]<\/span>/.test(r.html));
  assert.ok(r.html.indexOf("&#9650; [INSERIR") < 0, "variação pendente sem seta");
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
  var r = M.montar({ dados: MINIMO, marca: MARCA.replace("marca: #EC0000", "marca: vermelho"), template: TEMPLATE, existe: existe });
  assert.ok(!r.ok && r.problemas.some(function (p) { return /Cor "marca"/.test(p.msg); }));
});

teste("marca: fonte do Outlook vira uma fonte só, com aspas se tiver espaço", function () {
  var r = M.montar({ dados: MINIMO, marca: MARCA.replace("titulos_outlook_windows: Arial", "titulos_outlook_windows: Fonte Oficial, Georgia"), template: TEMPLATE, existe: existe });
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

teste("capa: foto do projeto principal com 220 px (20% maior que a coluna), quadrada", function () {
  var r = montar(MINIMO);
  assert.ok(r.imagens.some(function (i) { return i.papel === "PROJETO PRINCIPAL" && i.w === 220 && i.h === 220 && i.recorte; }));
  assert.ok(r.html.indexOf('width="356"') > 0 && r.html.indexOf('width="220"') > 0, "texto 356 + 24 + foto 220 = 600");
});

teste("ampliar: peça sem link abre maior no navegador; no e-mail não há script nem versão ampliada", function () {
  var r = montar(MINIMO.replace("link: https://empresa.sharepoint.com/:i:/s/site/abc", "link:"));
  var amp = r.imagens.filter(function (i) { return i.ampliada; });
  assert.strictEqual(amp.length, 1, "uma versão ampliada por peça");
  assert.ok(amp[0].w <= 1400 && !amp[0].recorte, "ampliada: inteira, até 1400 px");
  assert.ok(/data-ampliar="@@IMG\d+@@"/.test(r.html));
  var email = M.paraEmail(r.html);
  assert.ok(email.indexOf("data-ampliar") < 0 && email.indexOf("data-legenda") < 0);
  assert.deepStrictEqual(M.conferirHtml(email.replace(/@@IMG\d+@@/g, "cid:x")).filter(function (x) { return x.nivel === "erro"; }), []);
  var nav = M.paraNavegador(r.html);
  assert.ok(nav.indexOf("<script>") > 0 && nav.indexOf("img[data-ampliar]") > 0 && nav.indexOf("Escape") > 0);
  assert.strictEqual(M.paraNavegador("<html><body></body></html>"), "<html><body></body></html>", "sem peça, nada é injetado");
});

teste("ampliar: peça com link continua sendo link (a âncora envolve a imagem)", function () {
  var r = montar(MINIMO);
  assert.ok(/<a href="https:\/\/empresa\.sharepoint\.com[^"]*" target="_blank"[^>]*><img [^>]*data-ampliar=/.test(r.html));
});

teste("foco: selo da campanha ao lado do título (computador) e acima (celular)", function () {
  var r = montar(MINIMO + "\n[FOCO]\nprioridade: Campanha\nselo: icone-lupa.png\ndescricao_selo: Selo da campanha");
  assert.ok(r.ok, JSON.stringify(niveis(r, "erro")));
  var selos = r.imagens.filter(function (i) { return /^selo/.test(i.papel); });
  assert.deepStrictEqual(selos.map(function (i) { return i.w; }).sort(), [160, 184]);
  assert.ok(r.html.indexOf('alt="Selo da campanha"') > 0);
  r = montar(MINIMO + "\n[FOCO]\nprioridade: Campanha\nselo: nao-existe.png");
  assert.ok(!r.ok && niveis(r, "erro").some(function (p) { return /selo não encontrado/.test(p.msg); }));
});

teste("destaque: número longo em 3 resultados gera aviso (não cabe no celular)", function () {
  var base = MINIMO + "\n[DESTAQUE]\ntitulo: T\n[RESULTADO 1]\nvalor: R$ 1.234,56\n[RESULTADO 2]\nvalor: 2\n[RESULTADO 3]\nvalor: 3";
  var r = montar(base);
  assert.ok(niveis(r, "aviso").some(function (p) { return /RESULTADO 1\] valor/.test(p.msg); }));
  r = montar(base.replace("R$ 1.234,56", "2x"));
  assert.ok(!niveis(r, "aviso").some(function (p) { return /RESULTADO/.test(p.msg); }));
});

teste("resumo das campanhas: foi bem (verde) e a melhorar (âmbar), em duas colunas", function () {
  var r = montar(MINIMO + "\n[FOI BEM 1]\ntexto: Ponto bom\n[A MELHORAR 1]\ntexto: Ponto fraco");
  assert.ok(r.ok, JSON.stringify(niveis(r, "erro")));
  assert.ok(r.html.indexOf("FOI BEM") > 0 && r.html.indexOf("A MELHORAR") > 0 && r.html.indexOf("RESUMO DAS CAMPANHAS") > 0);
  assert.ok(/border-top:2px solid #21634F/.test(r.html) && /border-top:2px solid #945400/.test(r.html));
  assert.ok((r.html.match(/width="288"/g) || []).length >= 2, "duas colunas de 288 px");
  assert.ok(r.texto.indexOf("+ Ponto bom") >= 0 && r.texto.indexOf("! Ponto fraco") >= 0);
  assert.ok(montar(MINIMO).html.indexOf("RESUMO DAS CAMPANHAS") < 0, "sem os blocos, o resumo não aparece");
});

teste("variação em texto com seta para baixo não ganha sinal de menos", function () {
  var r = montar(MINIMO.replace("variacao: +100%", "variacao: -Menos da metade"));
  assert.ok(r.html.indexOf("&#9660; Menos da metade") > 0);
  r = montar(MINIMO.replace("variacao: +100%", "variacao: -12%"));
  assert.ok(r.html.indexOf("&#9660; &minus;12%") > 0);
});

teste("vídeo da peça: toca no clique da página do navegador; no e-mail some (sem script, sem arquivo)", function () {
  var ex = function (p) { return /video-teste\.mp4$/.test(p) || existe(p); };
  var r = M.montar({ dados: MINIMO.replace("tipo: peca", "tipo: video\nvideo: video-teste.mp4"), arquivoDados: "t.txt", marca: MARCA, template: TEMPLATE, existe: ex });
  assert.ok(r.ok, JSON.stringify(niveis(r, "erro")));
  assert.strictEqual(r.videos.length, 1);
  assert.ok(/data-video="@@VID1@@"/.test(r.html));
  assert.ok(M.paraEmail(r.html).indexOf("data-video") < 0);
  var nav = M.paraNavegador(M.trocarVideos(r.html, function () { return "x.mp4"; }));
  assert.ok(nav.indexOf('data-video="x.mp4"') > 0 && nav.indexOf("createElement('video')") > 0);
  r = M.montar({ dados: MINIMO.replace("tipo: peca", "tipo: video\nvideo: nao-existe.mp4"), arquivoDados: "t.txt", marca: MARCA, template: TEMPLATE, existe: existe });
  assert.ok(!r.ok && niveis(r, "erro").some(function (p) { return /vídeo não encontrado/.test(p.msg); }));
});

teste("lançamentos: até 6, em linhas de 3 colunas de 184 px", function () {
  var bl = "";
  for (var i = 1; i <= 4; i++) bl += "\n[LANCAMENTO " + i + "]\nnome: L" + i + "\nimagem: icone-lupa.png";
  var r = montar(MINIMO + bl);
  assert.ok(r.ok, JSON.stringify(niveis(r, "erro")));
  var m = r.modelo.lancamos.linhas_compactos;
  assert.strictEqual(m.length, 2);
  assert.strictEqual(m[1].itens.length, 3, "a 2ª linha é completada com espaço vazio");
  assert.ok(m[1].itens[1].vazio && m[1].itens[0].largura === 184);
});

teste("foto do banco de imagens (assets/fotos/) não abre ampliada", function () {
  var ex = function (p) { return /^assets\/fotos\//.test(p) || existe(p); };
  var r = M.montar({ dados: MINIMO.replace("imagem: icone-prancheta.png", "imagem: assets/fotos/foto-x.jpg"), arquivoDados: "t.txt", marca: MARCA, template: TEMPLATE, existe: ex });
  assert.ok(r.ok && !r.imagens.some(function (i) { return i.ampliada; }));
});

/* ---------- HTML editado no navegador → e-mail (converter-html-eml.html) ---------- */
teste("limparHtmlEditado tira script, janela de ampliação, vídeo e marcas do clique e da edição", function () {
  var h = '<!-- saved from url=(0014)about:internet -->\n<html><head><!--[if mso]><noscript><xml></xml></noscript><![endif]--><style>\n/* Ampliar peças (só na página do navegador) */\n#amp{display:flex}</style></head>' +
    '<body contenteditable="true"><p spellcheck="false">Oi</p><img src="data:image/png;base64,AAAA" data-ampliar="x" data-legenda="y" tabindex="0" role="button" aria-label="Ampliar: y" title="Clique para ampliar" alt="a">' +
    '<table role="presentation"><tr><td>x</td></tr></table><div id="amp" role="dialog"><button>×</button><img><video controls></video><p></p></div><script>alert(1)</script></body></html>';
  var r = M.limparHtmlEditado(h);
  assert.ok(!/<script|id="amp"|<video|data-ampliar|data-legenda|tabindex|role="button"|aria-label|title="Clique|contenteditable|spellcheck|saved from|Ampliar peças/.test(r.html), r.html);
  assert.ok(/<noscript>/.test(r.html) && /role="presentation"/.test(r.html) && /alt="a"/.test(r.html), "mantém o que é do e-mail");
  assert.ok(r.saiu.length >= 6);
});

teste("imagensDoHtml lista sem repetir; origemImagem classifica", function () {
  var h = '<img src="data:image/png;base64,AA"><img alt="x" src="data:image/png;base64,AA"><img src="https://x.com/a.png"><img src="p_files/b.png">';
  assert.deepStrictEqual(M.imagensDoHtml(h), ["data:image/png;base64,AA", "https://x.com/a.png", "p_files/b.png"]);
  assert.deepStrictEqual(["data:image/jpeg;base64,A", "data:image/webp;base64,A", "cid:x", "https://a", "blob:file:///x", "a.png"].map(M.origemImagem),
    ["embutida", "embutida-incompativel", "cid", "internet", "blob", "arquivo"]);
});

teste("deBase64 desfaz base64 (todas as sobras) e imagemDeDataUri devolve bytes e extensão", function () {
  [0, 1, 2, 3, 4, 5, 257].forEach(function (n) {
    var b = new Uint8Array(n); for (var i = 0; i < n; i++) b[i] = (i * 37) & 255;
    assert.deepStrictEqual(Array.from(M.deBase64(M.base64(b))), Array.from(b));
  });
  var d = M.imagemDeDataUri("data:image/jpeg;base64," + M.base64(Uint8Array.from([255, 216, 255])));
  assert.strictEqual(d.ext, "jpg"); assert.deepStrictEqual(Array.from(d.bytes), [255, 216, 255]);
  assert.strictEqual(M.imagemDeDataUri("https://x"), null);
});

teste("trocarSrc, assuntoDoHtml, textoDoHtml e origemDoHtml", function () {
  assert.strictEqual(M.trocarSrc('<img alt="a" src="X"><img src="Y">', { X: "cid:1" }), '<img alt="a" src="cid:1"><img src="Y">');
  assert.strictEqual(M.assuntoDoHtml("<title>Report de Outubro &amp; mais</title>"), "Report de Outubro & mais");
  var t = M.textoDoHtml('<html><head><title>T</title><style>p{}</style></head><body><p>Olá&nbsp;mundo</p><!-- x --><p><a href="https://a.b/c">Ver peça</a></p></body></html>');
  assert.ok(/Olá mundo/.test(t) && /Ver peça \(https:\/\/a\.b\/c\)/.test(t) && !/p\{\}|T\n/.test(t), t);
  assert.deepStrictEqual(M.origemDoHtml("<!-- Arquivo gerado por gerar-report.html (versão 3.7 (2026-10-15)) a partir de dados/2026-10.txt em 1 -->"), { versao: "3.7 (2026-10-15)", dados: "dados/2026-10.txt" });
  assert.strictEqual(M.origemDoHtml("<html>"), null);
});

teste("o backup convertido vira e-mail sem nenhuma imagem embutida no HTML", function () {
  var nav = M.paraNavegador(ler("report_backup.html").replace(/<img\b([^>]*?)\ssrc="(data:image\/[^"]+)"/, function (m, a, s) { return m + ' data-ampliar="' + s + '"'; }));
  var limpo = M.limparHtmlEditado(nav).html, mapa = {};
  M.imagensDoHtml(limpo).forEach(function (s, i) { assert.ok(M.imagemDeDataUri(s)); mapa[s] = "cid:img" + i; });
  var final = M.trocarSrc(limpo, mapa);
  assert.ok(!/src="data:|<script|data-ampliar/.test(final));
  assert.deepStrictEqual(M.conferirHtml(final).filter(function (x) { return x.nivel === "erro"; }), []);
});

/* ---------- E-mail resumido + versão interativa ---------- */
function modeloHtml() {
  var r = M.montar({ dados: MODELO, arquivoDados: "MODELO.txt", marca: MARCA, template: TEMPLATE, existe: existe });
  assert.ok(r.html, JSON.stringify(niveis(r, "erro")));
  return r.html;
}

teste("o report sai com as marcas de seção, na ordem do template", function () {
  assert.deepStrictEqual(M.secoesDoHtml(modeloHtml()).map(function (x) { return x.id; }),
    ["capa", "lancamos", "cx", "resumo", "transformation", "aprendizados", "foco", "agenda", "rodape"]);
  assert.ok(/<!--secao:fim-->/.test(modeloHtml()));
  assert.ok(!/<!-- EDITAR AQUI/.test(modeloHtml()), "os outros comentários continuam saindo");
});

teste("emailResumido: só as seções escolhidas, botão com o link antes do encerramento, seções renumeradas", function () {
  var link = "https://empresa.sharepoint.com/sites/x/report.html?a=1&b=2";
  var r = M.emailResumido(modeloHtml(), { link: link });
  assert.deepStrictEqual(r.mantidas, ["capa", "resumo", "foco", "rodape"]);
  assert.deepStrictEqual(r.fora, ["lancamos", "cx", "transformation", "aprendizados", "agenda"]);
  assert.ok(r.html.indexOf('href="https://empresa.sharepoint.com/sites/x/report.html?a=1&amp;b=2"') > 0, "link escapado no href");
  assert.ok(r.html.indexOf("<!--secao:interativo-->") < r.html.indexOf("<!--secao:rodape-->"), "botão antes do encerramento");
  assert.ok(!/<!--secao:(lancamos|cx|agenda)-->/.test(r.html) && /Na versão completa estão também: O que lançamos, Creative X/.test(r.html));
  var nums = (r.html.match(/border-radius:999px;padding:0 7px;letter-spacing:1px;">(\d\d)</g) || []).map(function (x) { return x.slice(-3, -1); });
  assert.deepStrictEqual(nums, ["01", "02"]);
  assert.ok(r.html.length < modeloHtml().length * 0.7);
  assert.ok(M.emailResumido("<html><body>sem marcas</body></html>", { link: link }).erro);
  var c = M.conferirHtml(r.html).filter(function (x) { return x.nivel === "erro"; });
  assert.deepStrictEqual(c, []);
});

teste("ligarVideos: miniatura de vídeo sem link passa a abrir a versão interativa; com link fica como está", function () {
  var h = '<img src="a" alt="Vídeo: x"><a href="https://y"><img src="b" alt="Vídeo: z"></a><img src="c" alt="Foto">';
  var r = M.ligarVideos(h, "https://l");
  assert.strictEqual(r.n, 1);
  assert.strictEqual(r.html, '<a href="https://l" target="_blank" style="text-decoration:none;"><img src="a" alt="Vídeo: x"></a><a href="https://y"><img src="b" alt="Vídeo: z"></a><img src="c" alt="Foto">');
});

teste("paginaInterativa: tira o que o navegador acrescentou e mantém script e ampliação", function () {
  var nav = M.paraNavegador('<html><head></head><body><img src="data:image/png;base64,AA" data-ampliar="data:image/png;base64,AA" alt="x"></body></html>');
  var salvo = "<!-- saved from url=(0014)about:internet -->\n" + nav.replace('alt="x">', 'alt="x" tabindex="0" role="button" aria-label="Ampliar: x" title="Clique para ampliar">')
    .replace("</body>", '<div id="amp" role="dialog"><button>×</button><img><video></video><p></p></div></body>');
  var r = M.paginaInterativa(salvo);
  assert.ok(r.interativa && /<script>/.test(r.html) && /data-ampliar=/.test(r.html));
  assert.ok(!/id="amp"| tabindex="0"| aria-label="Ampliar| title="Clique|saved from/.test(r.html), "sobrou algo do navegador");
});

/* ---------- 4.0: Transformation Hub com prints, miniatura de vídeo sem ▶, botão "Assistir ao vídeo" ---------- */
var COM_PRINTS = MINIMO + "\n" + [
  "[TRANSFORMATION]", "titulo: Hub",
  "[TRANSFORMATION 1]", "nome: Agente", "texto: Em testes.", "prints: icone-prancheta.png, icone-lupa.png", "descricao_prints: Tela do agente | Resultado do teste",
  "[TRANSFORMATION 2]", "nome: Outro", "prints: [INSERIR PRINT]"
].join("\n");

teste("Transformation Hub: rótulo novo e prints na largura do cartão (2 × 240), ampliáveis só na página", function () {
  var r = montar(COM_PRINTS);
  assert.ok(r.ok, JSON.stringify(niveis(r, "erro")));
  assert.ok(/TRANSFORMATION HUB/.test(r.html) && !/CREATIVE TRANSFORMATION/.test(r.html));
  assert.ok(/data-bloco="transformation-1"/.test(r.html) && /data-bloco="transformation-2"/.test(r.html));
  var prints = r.html.match(/<img\b[^>]*alt="(Tela do agente|Resultado do teste)"[^>]*>/g) || [];
  assert.strictEqual(prints.length, 2);
  prints.forEach(function (t) { assert.ok(/ width="240"/.test(t) && / data-ampliar="@@IMG\d+@@"/.test(t) && /class="fluid"/.test(t), t); });
  assert.strictEqual(niveis(r, "pendencia").filter(function (x) { return /\[TRANSFORMATION 2\] prints/.test(x.msg); }).length, 1, "print pendente vira uma pendência");
  assert.ok(/print · 1008 px/.test(r.html), "espaço do print pendente aparece no rascunho (1 print = 504 px)");
  assert.ok(prints.every(function (t) { var id = / data-ampliar="@@IMG(\d+)@@"/.exec(t)[1]; return r.imagens[id - 1].ampliada; }), "o clique abre a versão ampliada");
  assert.ok(!/data-ampliar/.test(M.paraEmail(r.html)));
});

teste("prints: mais de 3 gera aviso e usa os 3 primeiros (3 × 152)", function () {
  var r = montar(COM_PRINTS.replace("prints: icone-prancheta.png, icone-lupa.png", "prints: icone-prancheta.png, icone-lupa.png, icone-prancheta.png, icone-lupa.png"));
  assert.ok(niveis(r, "aviso").some(function (x) { return /até 3/.test(x.msg); }));
  assert.strictEqual((r.html.match(/<img\b[^>]*alt="(Tela do agente|Resultado do teste|Print: Agente)"[^>]*width="152"|<img\b[^>]*width="152"[^>]*alt="(Tela do agente|Resultado do teste|Print: Agente)"/g) || []).length, 3);
});

teste("vídeo: miniatura sem ▶ só na página (data-thumb, soPagina) e fora do e-mail", function () {
  var r = montar(MINIMO.replace("tipo: peca", "tipo: video").replace("link: https://empresa.sharepoint.com/:i:/s/site/abc", "link: https://empresa.sharepoint.com/:v:/s/site/abc"));
  assert.ok(r.ok, JSON.stringify(niveis(r, "erro")));
  var thumb = r.imagens.filter(function (i) { return i.soPagina; });
  assert.strictEqual(thumb.length, 1); assert.ok(!thumb[0].play);
  assert.ok(r.imagens.some(function (i) { return i.play && !i.soPagina && i.caminho === thumb[0].caminho; }), "a do e-mail continua com ▶");
  assert.ok(new RegExp('data-thumb="' + thumb[0].token + '"').test(r.html));
  assert.ok(!/data-thumb/.test(M.paraEmail(r.html)));
});

teste("miniaturasSemPlay: troca pela versão sem ▶, tira o link e o \"Vídeo:\"; conta as antigas", function () {
  var h = '<a href="https://v"><img src="COM" alt="Vídeo: Capa (assistir ao vídeo)" data-video="v" data-thumb="SEM"></a><img src="X" alt="Vídeo: antiga">';
  var r = M.miniaturasSemPlay(h);
  assert.strictEqual(r.trocadas, 1); assert.strictEqual(r.comPlay, 1);
  assert.strictEqual(r.html, '<img src="SEM" alt="Capa" data-video="v" data-thumb="SEM"><img src="X" alt="Vídeo: antiga">');
});

teste("botão \"Assistir ao vídeo\": existe só na página; limpar e paginaInterativa tiram o que o navegador montou", function () {
  var nav = M.paraNavegador('<html><head></head><body><img src="data:image/png;base64,AA" data-video="data:video/mp4;base64,AA" alt="v"></body></html>');
  assert.ok(/vidpill/.test(nav) && /Assistir ao v/.test(nav));
  var salvo = nav.replace("</body>", '<button type="button" class="vidpill" tabindex="-1">▶&nbsp; Assistir ao vídeo</button></body>');
  assert.ok(!/class="vidpill"/.test(M.limparHtmlEditado(salvo).html));
  var pg = M.paginaInterativa(salvo);
  assert.ok(!/<button[^>]*class="vidpill"/.test(pg.html) && /<script>/.test(pg.html));
});

teste("emailResumido não liga vídeos ao link (só o completo com botão, ligar: true)", function () {
  var html = M.emailResumido(M.montar({ dados: MODELO, arquivoDados: "MODELO.txt", marca: MARCA, template: TEMPLATE, existe: existe }).html, { link: "https://a.b/c" }).html;
  var r = M.emailResumido('<!--secao:capa--><img src="a" alt="Vídeo: x"><!--secao:fim-->', { link: "https://a.b/c" });
  assert.ok(!/<a href="https:\/\/a\.b\/c" target="_blank" style="text-decoration:none;"><img/.test(r.html));
  var l = M.emailResumido('<!--secao:capa--><img src="a" alt="Vídeo: x"><!--secao:fim-->', { link: "https://a.b/c", ligar: true, manter: ["capa"] });
  assert.strictEqual(l.videos, 1);
  assert.ok(html.length > 0);
});

teste("movimento: só na página, script injetado uma vez (de novo troca, não duplica), marcas saem no e-mail", function () {
  var h = '<html><head></head><body><table><!--secao:capa--><tr><td><p style="font-size:30px">12,5%</p></td></tr><!--secao:fim--></table></body></html>';
  var nav = M.paraNavegador(h), duas = M.paraNavegador(nav);
  assert.ok(/bl\.id='leitura'/.test(nav) && /\[data-motion\] \[data-rv\]/.test(nav));
  assert.strictEqual((duas.match(/box\.id='amp'/g) || []).length, 1);
  assert.strictEqual((duas.match(/Ampliar peças/g) || []).length, 1);
  var salvo = nav.replace("<html>", '<html data-motion="">').replace("<td>", '<td data-rv="on">').replace('<p style', '<p data-conta="ok" style').replace("</body>", '<div id="leitura" aria-hidden="true" style="transform: scaleX(0.4);"></div></body>');
  var limpo = M.limparHtmlEditado(salvo).html;
  assert.ok(!/data-(rv|motion|conta)|id="leitura"|<script/.test(limpo), limpo);
  assert.ok(/12,5%/.test(limpo));
  assert.ok(!/leitura|data-motion/.test(M.paraEmail(h)));
});

console.log("\n" + (testes - falhas) + " de " + testes + " testes passaram.");
process.exit(falhas ? 1 : 0);
