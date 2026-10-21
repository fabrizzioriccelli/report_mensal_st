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
  /* Os "EDITAR AQUI" ficam na página (guia para quem abre no editor), mas não vão para o e-mail. */
  assert.ok(/<!-- EDITAR AQUI: PERÍODO/.test(modeloHtml()) && /<!-- EDITAR AQUI: APRENDIZADO/.test(modeloHtml()), "EDITAR AQUI na página");
  assert.ok(!/<!-- EDITAR AQUI|data-campo=|data-tom=/.test(M.paraEmail(modeloHtml())), "o e-mail não leva EDITAR AQUI nem as marcas do resumo");
  assert.ok(!/<!--(?!\[if|<!\[endif\]|secao:| EDITAR AQUI)/.test(modeloHtml()), "os outros comentários continuam saindo");
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

/* ---------- 4.2: e-mail-resumo editorial, Transformation Hub (logo e links), link do report completo ---------- */
/* Mês SINTÉTICO completo (números de teste, não são resultados reais). */
var COMPLETO = [
  "[EDICAO]", "mes: Março", "ano: 2027", "proximo_mes: Abril", "pasta_imagens: assets/icones", "contato: time@empresa.com",
  "link_report_completo: https://empresa.sharepoint.com/sites/cs/report-atual.html",
  "[ABERTURA]", "frase: Mês de teste,", "frase_final: tudo sintético.",
  "[PROJETO PRINCIPAL]", "nome: Projeto Alfa", "resumo: Resumo do projeto alfa.", "imagem: icone-prancheta.png", "tipo: peca", "link: https://empresa.sharepoint.com/:i:/s/site/abc",
  "[NUMERO 1]", "valor: 12,5%", "titulo: Taxa A", "detalhe: era 10%", "variacao: +25%",
  "[NUMERO 2]", "valor: R$ 1,00", "titulo: Custo B", "variacao: -Menos", "variacao_cor: verde",
  "[NUMERO 3]", "valor: 3x", "titulo: Índice C", "detalhe: base 1x", "variacao: Acima", "variacao_cor: ambar",
  "[DESTAQUE]", "categoria: Grupo · Teste", "titulo: Destaque Beta", "texto: Texto do destaque.", "imagem: icone-lupa.png", "link: https://empresa.sharepoint.com/:i:/s/site/d",
  "[RESULTADO 1]", "valor: 40", "titulo: Itens", "detalhe: base 30",
  "[LANCAMENTO 1]", "status: No ar", "status_cor: verde", "nome: Lançamento Um", "texto: Texto um.", "imagem: icone-lupa.png", "link: https://empresa.sharepoint.com/:i:/s/site/l1",
  "[LANCAMENTO 2]", "status: Em teste", "status_cor: ambar", "nome: Lançamento Dois", "texto: Texto dois.", "imagem: icone-lupa.png",
  "[LANCAMENTO 3]", "nome: Lançamento Três", "imagem: icone-lupa.png",
  "[LANCAMENTO 4]", "nome: Lançamento Quatro", "imagem: icone-lupa.png",
  "[CREATIVE X]", "anterior: 70%", "atual: 75%", "periodo: fev vs. mar", "significado: Frase do CX.",
  "[FOI BEM 1]", "texto: Bem um.", "[FOI BEM 2]", "texto: Bem dois.", "[FOI BEM 3]", "texto: Bem três.",
  "[A MELHORAR 1]", "texto: Melhorar um.",
  "[TRANSFORMATION]", "titulo: Como estamos transformando<br>a forma de criar.",
  "[TRANSFORMATION 1]", "nome: Agente Um", "texto: Apoio aos pedidos.", "logo: icone-prancheta.png", "descricao_logo: Logo do Agente Um",
  "links: Documento modelo | https://empresa.sharepoint.com/:w:/s/site/doc ; Agente | https://empresa.sharepoint.com/sites/agente",
  "[TRANSFORMATION 2]", "status: Previsão: abr/27", "status_cor: ambar", "nome: Agente Dois", "texto: Textos alinhados.", "icones: icone-lupa", "links: Agente Dois | [INSERIR LINK]",
  "[APRENDIZADO 1]", "titulo: Aprendizado A", "texto: Texto A.", "levamos: levar A.",
  "[APRENDIZADO 2]", "titulo: Aprendizado B",
  "[FOCO]", "prioridade: Foco do teste.", "texto: Texto do foco.",
  "[AGENDA 1]", "data: 12 ABR", "titulo: Evento um", "detalhe: Detalhe um.",
  "[AGENDA 2]", "data: A DEFINIR", "titulo: Evento dois"
].join("\n");

teste("Transformation Hub: logo no lugar dos ícones, links extras com seta e link pendente sem clique", function () {
  var r = montar(COMPLETO);
  assert.ok(r.ok, JSON.stringify(niveis(r, "erro")));
  var t = r.html.slice(r.html.indexOf("<!--secao:transformation-->"), r.html.indexOf("<!--secao:aprendizados-->"));
  assert.ok(/alt="Logo do Agente Um"/.test(t) && r.imagens.some(function (i) { return /Agente|TRANSFORMATION 1 \(logo\)/.test(i.papel) && i.w === 56; }), "logo de 56 px");
  assert.ok(/href="https:\/\/empresa\.sharepoint\.com\/:w:\/s\/site\/doc"[^>]*>Documento modelo&nbsp;&#8594;<\/a>/.test(t) && /Agente&nbsp;&#8594;<\/a>/.test(t), "dois links no projeto 1");
  assert.ok(/<span title="Link ainda não definido"[^>]*>Agente Dois&nbsp;&#8594;<\/span>/.test(t), "link pendente aparece sem clique");
  assert.ok(niveis(r, "pendencia").some(function (p) { return /TRANSFORMATION 2\] links \(Agente Dois\)/.test(p.msg); }), "pendência do link");
  assert.ok(r.links.some(function (l) { return l.rotulo === "Documento modelo"; }), "links extras entram na lista de conferência");
  assert.ok(/Documento modelo: https:\/\/empresa\.sharepoint\.com\/:w:/.test(r.texto), "texto puro leva o link");
  var semIcone = t.split('data-bloco="transformation-2"')[0];
  assert.ok(!/icone-prancheta|@@IMG\d+@@" width="32"/.test(semIcone.split('data-bloco="transformation-1"')[1] || ""), "com logo, sem ícones");
});

teste("link_report_completo vira a meta da página e sai do e-mail; caminho local vale, sem aviso", function () {
  var r = montar(COMPLETO);
  assert.ok(/<meta name="report-completo" content="https:\/\/empresa\.sharepoint\.com\/sites\/cs\/report-atual\.html">/.test(r.html));
  assert.ok(!/report-completo/.test(M.paraEmail(r.html)));
  var local = montar(COMPLETO.replace("link_report_completo: https://empresa.sharepoint.com/sites/cs/report-atual.html", "link_report_completo: C:\\Users\\eu\\report.html"));
  assert.ok(/<meta name="report-completo" content="file:\/\/\/C:\/Users\/eu\/report\.html">/.test(local.html) && !niveis(local, "aviso").some(function (p) { return /link_report_completo/.test(p.msg); }));
  var js = montar(COMPLETO.replace("link_report_completo: https://empresa.sharepoint.com/sites/cs/report-atual.html", "link_report_completo: javascript:alert(1)"));
  assert.ok(!/report-completo/.test(js.html) && niveis(js, "erro").some(function (p) { return /link_report_completo/.test(p.msg); }));
});

teste("dadosDoResumo: lê da página cada campo e lista os indicadores candidatos (sem criar nenhum)", function () {
  var r = M.dadosDoResumo(montar(COMPLETO).html), d = r.d;
  assert.strictEqual(d.periodo, "MARÇO 2027");
  assert.strictEqual(d.frase, "Mês de teste,"); assert.strictEqual(d.frase_final, "tudo sintético.");
  assert.strictEqual(d.principal.nome, "Projeto Alfa"); assert.strictEqual(d.principal.resumo, "Resumo do projeto alfa.", "sem o \"Ver peça\"");
  assert.deepStrictEqual(d.numeros.map(function (n) { return n.valor + "|" + n.tom_variacao; }), ["12,5%|verde", "R$ 1,00|verde", "3x|ambar"]);
  assert.strictEqual(d.numeros[1].detalhe, "", "número sem detalhe fica vazio (não inventa)");
  assert.deepStrictEqual(d.indicadores.map(function (x) { return x.chave + "|" + x.valor + "|" + x.grupo; }),
    ["numero-1|12,5%|Projeto principal", "numero-2|R$ 1,00|Projeto principal", "numero-3|3x|Projeto principal", "resultado-1|40|Destaque do mês", "cx|75%|Creative X"]);
  assert.strictEqual(d.cx.anterior + ">" + d.cx.atual + " " + d.cx.variacao + " " + d.cx.tom, "70%>75% +5 p.p. verde");
  assert.deepStrictEqual(d.tem, { campanhas: true, aprendizados: true, transformation: true, proximos: true });
  assert.strictEqual(r.pendencias.length, 0, r.pendencias.join(" | "));
});

teste("emailResumo: curto, até 3 indicadores, um único destino (o botão \"Acessar report completo\")", function () {
  var html = montar(COMPLETO).html, LINK = "https://empresa.sharepoint.com/sites/cs/report-atual.html";
  var r = M.emailResumo(html, { link: LINK });
  assert.deepStrictEqual(r.indicadores, ["numero-1", "numero-2", "numero-3"], "padrão: os números do projeto principal");
  var hrefs = r.html.match(/href="[^"]*"/g) || [];
  assert.ok(hrefs.length === 1 && hrefs[0] === 'href="' + LINK + '"', hrefs.join(" "));
  /* Botão que sobrevive ao envio pelo Outlook: célula com fundo e link de texto, sem VML (o Outlook vira imagem sem link). */
  assert.ok(/Acessar report completo/.test(r.html) && !/<v:|\bvml\b|\[if mso\]><v/i.test(r.html.replace(/xmlns:v="[^"]*"/, "")), "botão sem VML");
  assert.ok(/<td align="center" bgcolor="#EC0000"[^>]*><a class="cta fx" href="/.test(r.html), "botão: célula vermelha com o link no texto");
  /* Cantos retos de propósito: o que a prévia mostra é o que chega depois que o Outlook reescreve o e-mail. */
  assert.ok(!/border-radius/.test(r.html), "sem cantos arredondados no resumo");
  assert.ok(!/<p[^>]*line-height:\d+px;(?!mso-line-height-rule)/.test(r.html), "altura de linha exata também no Outlook");
  assert.ok(/12,5%/.test(r.html) && /R\$ 1,00/.test(r.html) && /3x/.test(r.html) && /Projeto Alfa/.test(r.html));
  assert.ok(!/data-campo|data-tom|secao:|<script|&#9654;|Ver peça|Documento modelo|Evento um|Aprendizado A|Lançamento Um/.test(r.html), "estático, sem links das peças e sem o detalhe das seções");
  assert.ok(!/\{\{|\}\}/.test(r.html));
  assert.strictEqual(M.conferirHtml(r.html).filter(function (x) { return x.nivel === "erro"; }).length, 0);
  /* Escolha da pessoa: outros indicadores; nunca mais de 3; chave que não existe é ignorada. */
  var e = M.emailResumo(html, { link: LINK, indicadores: ["cx", "resultado-1", "numero-1", "numero-2", "nao-existe"] });
  assert.deepStrictEqual(e.indicadores, ["cx", "resultado-1", "numero-1"]);
  assert.ok(/75%/.test(e.html) && /Creative X/.test(e.html) && !/R\$ 1,00/.test(e.html));
  /* Sem link: aviso no lugar do botão, nenhum link. */
  var s = M.emailResumo(html, {});
  assert.ok(!/href=/.test(s.html) && /FALTA O LINK DO REPORT COMPLETO/.test(s.html) && !s.temLink);
  /* Sem nenhum número na página: o e-mail sai só com a frase e a chamada (nada é inventado). */
  var semNum = montar(COMPLETO.replace(/\[NUMERO 1\][\s\S]*?\[DESTAQUE\]/, "[DESTAQUE]").replace(/\[RESULTADO 1\][^\[]*/, "").replace(/\[CREATIVE X\][^\[]*/, "")).html;
  var z = M.emailResumo(semNum, { link: LINK });
  assert.deepStrictEqual(z.indicadores, []);
  assert.ok(!/PRINCIPAIS RESULTADOS/.test(z.html) && /Acessar report completo/.test(z.html));
});

teste("emailResumo acompanha a edição da página; página antiga avisa; modelo vira pendência", function () {
  var html = montar(COMPLETO).html;
  var editado = html.replace(/(data-campo="numero-1\.valor"[^>]*>)12,5%/, "$118,0%").replace(/(data-campo="frase"[^>]*>)Mês de teste,/, "$1Frase editada,");
  var r = M.emailResumo(editado, { link: "https://empresa.sharepoint.com/x" });
  assert.ok(/18,0%/.test(r.html) && !/12,5%/.test(r.html) && /Frase editada/.test(r.html));
  assert.ok(M.emailResumo(html.replace(/ data-campo="[^"]*"/g, ""), {}).erro, "página sem os campos: avisa para gerar de novo");
  assert.ok(M.dadosDoResumo(montar(MODELO).html).pendencias.length > 10, "modelo: Lorem e X viram pendências do resumo");
});

teste("importarDados: resposta do Copilot (blocos do arquivo de dados) vira campos da página", function () {
  var r = M.importarDados(["[EDICAO]", "mes: Novembro", "ano: 2099", "proximo_mes: Dezembro", "", "[NUMERO 1]", "valor: 12,5%", "titulo: Taxa A", "variacao: -10%",
    "[NUMERO 2]", "valor: R$ 1,00", "variacao: +5%", "variacao_cor: ambar", "[CREATIVE X]", "atual: 75%", "variacao: -2 p.p.",
    "[LANCAMENTO 1]", "status: No ar", "status_cor: verde", "nome: Peça", "[DESTAQUE]", "categoria: Grupo · Teste", "[BLOCO INVENTADO]", "x: 1"].join("\n"));
  var c = r.campos;
  assert.strictEqual(c.periodo.texto, "NOVEMBRO 2099");
  assert.strictEqual(c["foco.mes"].texto, "DEZEMBRO");
  assert.strictEqual(c["numero-1.valor"].texto, "12,5%");
  assert.strictEqual(c["numero-1.variacao"].tipo, "etiqueta"); assert.ok(/^▼/.test(c["numero-1.variacao"].texto)); assert.strictEqual(c["numero-1.variacao"].tom, "verde");
  assert.ok(/^▲ \+5%$/.test(c["numero-2.variacao"].texto) && c["numero-2.variacao"].tom === "ambar");
  assert.ok(/2 p\.p\./.test(c["cx.variacao"].texto) && c["cx.variacao"].tom === "ambar", "Creative X caiu: âmbar");
  assert.strictEqual(c["lancamento-1.status"].texto, "● No ar");
  assert.strictEqual(c["destaque.categoria"].texto, "GRUPO · TESTE");
  assert.ok(r.problemas.some(function (p) { return /BLOCO INVENTADO/.test(p.msg); }), "bloco desconhecido é avisado, não aplicado");
  assert.strictEqual(M.nomeDoReport("NOVEMBRO 2099"), "report-2099-11.html");
  assert.strictEqual(M.nomeDoReport("[MÊS] [ANO]"), "report.html");
});

teste("importarDados: todos os blocos da biblioteca de prompts (docs/PROMPTS_COPILOT.md) são aceitos", function () {
  var doc = ler("docs/PROMPTS_COPILOT.md"), ref = /### Formato de blocos[\s\S]*?```text\n([\s\S]*?)```/.exec(doc)[1];
  var blocos = ref.split("\n").filter(Boolean).map(function (l) {
    var m = /^\[([^\]]+)\](?:\s+a\s+\[(\d+)\])?\s+(.*)$/.exec(l.trim()), nome = m[1].replace(/ \d+$/, " 1");
    return "[" + nome + "]\n" + m[3].split(" · ").map(function (c) { c = c.trim(); return c + ": " + (/_cor$/.test(c) ? "verde" : c === "mes" ? "Janeiro" : c === "ano" ? "2099" : "Teste " + c); }).join("\n");
  }).join("\n\n");
  var r = M.importarDados(blocos);
  assert.deepStrictEqual(r.problemas, [], JSON.stringify(r.problemas));
  /* Todo campo importável tem lugar no modelo em branco do emulador (tools/coringa.js). */
  var janela = {}; new Function("window", fs.readFileSync(path.join(RAIZ, "tools/coringa.js"), "utf8"))(janela);
  var faltam = Object.keys(r.campos).filter(function (k) { return janela.CORINGA_HTML.indexOf('data-campo="' + k + '"') < 0; });
  assert.deepStrictEqual(faltam, [], "campos sem lugar no modelo em branco");
});

teste("normalizarLink: aceita qualquer link válido sem aviso (https, http, arquivo, mailto/tel/msteams, sem https://, relativo, link dentro de um texto); só recusa o que executa código", function () {
  var n = M.normalizarLink;
  assert.deepStrictEqual([n("https://empresa.sharepoint.com/x").url, n("https://empresa.sharepoint.com/x").avisos.length], ["https://empresa.sharepoint.com/x", 0]);
  assert.deepStrictEqual([n("http://intranet/x").url, n("http://intranet/x").avisos.length], ["http://intranet/x", 0]);
  assert.strictEqual(n("Link do report: https://empresa.sharepoint.com/:u:/r/sites/cs/r.html?csf=1&web=1.").url, "https://empresa.sharepoint.com/:u:/r/sites/cs/r.html?csf=1&web=1", "link dentro de um texto");
  assert.strictEqual(n("<https://empresa.sharepoint.com/x>").url, "https://empresa.sharepoint.com/x");
  assert.strictEqual(n("//empresa.sharepoint.com/x").url, "https://empresa.sharepoint.com/x");
  assert.strictEqual(n('"C:\\Users\\Fulano Silva\\Downloads\\report-2026-10.html"').url, "file:///C:/Users/Fulano%20Silva/Downloads/report-2026-10.html");
  assert.strictEqual(n("C:\\Pasta\\Relatório #1.html").url, "file:///C:/Pasta/Relat%C3%B3rio%20%231.html");
  assert.strictEqual(n("\\\\servidor\\area\\report.html").url, "file://servidor/area/report.html");
  assert.strictEqual(n("file:///C:/Users/x/report%202026.html").url, "file:///C:/Users/x/report%202026.html");
  assert.ok(n("C:\\x.html").tipo === "arquivo" && !n("C:\\x.html").avisos.length && /onde esse caminho existe/.test(n("C:\\x.html").info), "arquivo: nota informativa, não aviso");
  ["javascript:alert(1)", " JavaScript:x", "data:text/html,x", "vbscript:x"].forEach(function (x) { assert.ok(n(x).erro && !n(x).url, x); });
  assert.strictEqual(n("https://tem espaço.com/a b").url, "https://tem%20espaço.com/a%20b");
  [["mailto:time@empresa.com", "outro"], ["tel:+551100000000", "outro"], ["msteams://teams.microsoft.com/l/x", "outro"]].forEach(function (c) { assert.deepStrictEqual([n(c[0]).url, n(c[0]).tipo, n(c[0]).avisos.length], [c[0], c[1], 0], c[0]); });
  assert.deepStrictEqual([n("www.example.com/report").url, n("www.example.com/report").avisos.length], ["https://www.example.com/report", 0]);
  assert.strictEqual(n("empresa.sharepoint.com/sites/cs/r.html").url, "https://empresa.sharepoint.com/sites/cs/r.html");
  [["report-2026-10.html", "report-2026-10.html"], ["pasta/plano.pdf#p2", "pasta/plano.pdf#p2"], ["abc", "abc"], ["/sites/area/r.html", "/sites/area/r.html"]].forEach(function (c) { assert.deepStrictEqual([n(c[0]).url, n(c[0]).tipo, n(c[0]).avisos.length, !!n(c[0]).info], [c[1], "relativo", 0, true], c[0]); });
  assert.deepStrictEqual(n(""), { url: "", tipo: "", avisos: [], info: "", erro: "" });
  /* o botão do e-mail-resumo aceita o link de arquivo; a conferência avisa, sem bloquear */
  var r = M.emailResumo(montar(COMPLETO).html, { link: "C:\\Users\\Fulano\\report.html" });
  assert.ok(r.temLink && (r.html.match(/href="file:\/\/\/C:\/Users\/Fulano\/report\.html"/g) || []).length === 1 && !/FALTA O LINK/.test(r.html));
  var conf = M.conferirHtml(r.html).filter(function (x) { return /arquivo local/.test(x.msg); });
  assert.ok(conf.length === 1 && conf[0].nivel === "info", "link de arquivo: informação, não aviso");
});

teste("e-mail-resumo sem repetição: nome do projeto (não \"Projeto principal\"), detalhe que só repete o número sai, número que a frase já diz não vem marcado", function () {
  var base = MINIMO.replace("nome: Projeto", "nome: Milheiros").replace("valor: 10%\ntitulo: CTR\ndetalhe: era 5%", "valor: 28\ntitulo: Contas abertas\ndetalhe: 28 contas abertas no Milheiros") +
    "\n[NUMERO 2]\nvalor: R$ 1,20\ntitulo: Custo por conta\ndetalhe: Referência: R$ 1,50";
  var r = montar(base), res = M.emailResumo(r.html, { link: "https://example.com/r" }), txt = res.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  assert.ok(/PRINCIPAIS RESULTADOS Milheiros 28 Contas abertas/.test(txt) && !/Projeto principal/.test(txt), "o nome do projeto, sem \"Projeto principal:\" · " + txt.slice(txt.indexOf("PRINCIPAIS"), txt.indexOf("PRINCIPAIS") + 90));
  assert.ok(!/28 contas abertas no Milheiros/.test(txt) && /Referência: R\$ 1,50/.test(txt), "o detalhe que repete o número sai; o que acrescenta fica");
  var r2 = montar(base.replace("frase: Um mês", "frase: Milheiros: 28 contas abertas")), res2 = M.emailResumo(r2.html, { link: "https://example.com/r" }), t2 = res2.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  assert.deepStrictEqual(res2.indicadores, ["numero-2"], "o número da frase não vem marcado");
  assert.ok(res2.candidatos.filter(function (x) { return x.chave === "numero-1"; })[0].na_frase, "o candidato fica marcado como \"já está na frase\"");
  var corpo2 = t2.slice(t2.indexOf("REPORT MENSAL"));
  assert.ok(!/PRINCIPAIS RESULTADOS Milheiros/.test(corpo2) && (corpo2.match(/28 contas abertas/gi) || []).length === 1 && !/ 28 Contas abertas/.test(corpo2), "nem o número nem o nome do projeto se repetem · " + corpo2.slice(0, 220));
  var r3 = M.emailResumo(r2.html, { link: "https://example.com/r", indicadores: ["numero-1"] });
  assert.deepStrictEqual(r3.indicadores, ["numero-1"], "se a pessoa escolhe, vale a escolha (o emulador avisa)");
});

teste("ícone da aba: a página do report leva o Santander + PF (PNG 16/32, SVG, celular), só na aba; os e-mails não", function () {
  var r = montar(COMPLETO), h = r.html, head = h.slice(0, h.indexOf("</head>"));
  assert.ok(/<link rel="icon" type="image\/png" sizes="32x32" href="data:image\/png;base64,/.test(head) && /sizes="16x16"/.test(head) && /<link rel="apple-touch-icon" sizes="180x180"/.test(head), "PNG 32, 16 e 180 no cabeçalho");
  assert.ok(/<link rel="icon" type="image\/svg\+xml" sizes="any" href="data:image\/svg\+xml,[^"]*EC0000[^"]*PF%3C\/text/.test(head), "SVG com a chama e o PF");
  assert.strictEqual((h.match(/santander-pf|PF%3C\/text/g) || []).length, 1, "o símbolo não entra no conteúdo do report");
  assert.ok(!/rel="(icon|apple-touch-icon)"/.test(M.paraEmail(h)) && !/rel="(icon|apple-touch-icon)"/.test(M.limparHtmlEditado(h).html) && !/rel="(icon|apple-touch-icon)"/.test(M.emailResumido(h, { link: "https://example.com/r" }).html), "nenhum e-mail leva o ícone");
  assert.ok(!/rel="icon"/.test(M.emailResumo(h, { link: "https://example.com/r" }).html));
});

teste("vários tópicos novos ([TOPICO], [TOPICO B], [TOPICO C], [TOPICO D]), cada um no seu layout, entram na página, no texto e no e-mail-resumo", function () {
  var dados = MINIMO + "\n" + [
    "[TOPICO]", "rotulo: Testes", "titulo: O que testamos", "layout: lista",
    "[TOPICO 1]", "nome: Teste de chamada", "status: Em teste", "links: Plano | https://empresa.sharepoint.com/x",
    "[TOPICO B]", "rotulo: Pesquisas", "titulo: O que ouvimos", "layout: colunas",
    "[TOPICO B 1]", "nome: Pesquisa A", "texto: Achado A.", "[TOPICO B 2]", "nome: Pesquisa B", "imagens: icone-lupa.png", "[TOPICO B 3]", "nome: Pesquisa C", "[TOPICO B 4]", "nome: Pesquisa D",
    "[TOPICO C]", "rotulo: Eventos", "layout: cartões",
    "[TOPICO C 1]", "nome: Evento 1", "imagens: icone-prancheta.png", "[TOPICO C 2]", "nome: Evento 2", "[TOPICO C 3]", "nome: Evento 3", "[TOPICO C 4]", "nome: Evento 4", "links: Fotos | fotos/evento-4.html",
    "[TOPICO D]", "rotulo: Mídia", "titulo: Números de mídia", "layout: numeros",
    "[TOPICO D 1]", "valor: 1,2 mi", "nome: Alcance", "texto: Fictício.", "[TOPICO D 2]", "valor: 3%", "nome: CTR"
  ].join("\n");
  var r = montar(dados), h = r.html;
  assert.ok(r.ok, JSON.stringify(niveis(r, "erro")));
  var pos = ["topico", "topicob", "topicoc", "topicod"].map(function (id) { return h.indexOf("<!--secao:" + id + "-->"); });
  assert.ok(pos[0] > 0 && pos[1] > pos[0] && pos[2] > pos[1] && pos[3] > pos[2] && h.indexOf("<!--secao:foco-->") < 0 || pos[3] < h.indexOf("<!--secao:rodape-->"), "na ordem, antes do encerramento");
  ["lista", "colunas", "cartoes", "numeros"].forEach(function (l) { assert.strictEqual((h.match(new RegExp('data-layout="' + l + '"', "g")) || []).length, 1, l); });
  assert.ok(niveis(r, "aviso").some(function (p) { return /TOPICO B\] o layout colunas leva até 3/.test(p.msg); }), "colunas: até 3");
  assert.ok(!/data-item="topicob-4"/.test(h) && /data-item="topicob-3"[^>]*width="184"/.test(h), "3 colunas de 184");
  assert.ok(/data-img="topicob-2-print-1"[^>]*>/.test(h) && / width="184"[^>]*data-img="topicob-2-print-1"|data-img="topicob-2-print-1"/.test(h));
  assert.ok(/data-item="topicoc-4"[^>]*width="184"[^>]*style="width:184px;padding-top:28px;"/.test(h), "4º cartão na 2ª linha");
  assert.ok(/href="fotos\/evento-4.html"/.test(h), "endereço relativo vale como link");
  assert.ok(/data-campo="topicod-1.valor"[^>]*>1,2 mi</.test(h) && /data-item="topicod-2"[^>]*width="288"/.test(h), "números: 2 × 288");
  assert.ok(/data-campo="topicoc.rotulo">EVENTOS</.test(h) && /data-campo="topicod.rotulo">MÍDIA</.test(h));
  assert.ok(/PESQUISAS: O que ouvimos/.test(r.texto) && /1,2 mi · Alcance/.test(r.texto), "versão em texto");
  assert.deepStrictEqual(M.secoesDoHtml(h).filter(function (x) { return /^topico/.test(x.id); }).map(function (x) { return x.nome; }), ["Tópico: TESTES", "Tópico: PESQUISAS", "Tópico: EVENTOS", "Tópico: MÍDIA"]);
  /* e-mail-resumo: cada tópico com rótulo, título e itens; os números viram indicadores que dá para escolher */
  var res = M.emailResumo(h, { link: "https://empresa.sharepoint.com/r" });
  ["TESTES", "PESQUISAS", "EVENTOS", "MÍDIA"].forEach(function (x) { assert.ok(res.html.indexOf(">" + x + "</p>") > 0, x); });
  assert.ok(/<b>Teste de chamada<\/b><span[^>]*>&nbsp;·&nbsp;Em teste</.test(res.html) && /E mais 0|E mais/.test(res.html) === false, "itens, sem \"E mais\" quando cabe");
  assert.ok(/>1,2 mi<\/b>&nbsp;·&nbsp;<b>Alcance</.test(res.html));
  assert.ok(/Testes, pesquisas, eventos e mídia, com as peças/.test(res.html), "a chamada cita os tópicos");
  var c = res.candidatos.filter(function (x) { return x.grupo === "Mídia"; });
  assert.deepStrictEqual(c.map(function (x) { return x.chave + "|" + x.valor; }), ["topicod-1|1,2 mi", "topicod-2|3%"]);
  var res2 = M.emailResumo(h, { link: "https://empresa.sharepoint.com/r", indicadores: ["topicod-1"] });
  assert.ok(/>1,2 mi<\/p>/.test(res2.html) && /Números de mídia/.test(res2.html), "número do tópico escolhido como indicador");
  /* importar do Copilot: [TOPICO C 2] e o rótulo em maiúsculas */
  var im = M.importarDados("[TOPICO C]\nrotulo: Eventos\n[TOPICO D 1]\nvalor: -5%");
  assert.strictEqual(im.campos["topicoc.rotulo"].texto, "EVENTOS"); assert.strictEqual(im.campos["topicod-1.valor"].texto, "−5%");
  /* layout desconhecido: lista, com aviso */
  var rr = montar(MINIMO + "\n[TOPICO]\nlayout: mosaico\n[TOPICO 1]\nnome: X");
  assert.ok(/data-layout="lista"/.test(rr.html) && niveis(rr, "aviso").some(function (p) { return /layout deve ser/.test(p.msg); }));
});

teste("PDF anexo no Transformation Hub: vai dentro da página, abre em nova aba; no e-mail vira texto", function () {
  var r = montar(COMPLETO.replace("links: Agente Dois | [INSERIR LINK]", "links: Documento fictício (PDF) | one-brief.pdf"), { existe: function (c) { return c === "assets/icones/one-brief.pdf" || existe(c); } });
  assert.ok(r.ok, JSON.stringify(niveis(r, "erro")));
  assert.strictEqual(r.anexos.length, 1);
  assert.ok(/<a href="#" data-anexo="@@ANX1@@" target="_blank" class="cta"[^>]*>Documento fictício \(PDF\)&nbsp;&#8594;<\/a>/.test(r.html));
  var pag = M.trocarAnexos(r.html, function () { return "data:application/pdf;base64,JVBERi0="; });
  assert.ok(/data-anexo="data:application\/pdf;base64,JVBERi0="/.test(pag));
  var em = M.paraEmail(pag);
  assert.ok(!/data-anexo|application\/pdf/.test(em) && /Documento fictício \(PDF\) \(no report completo\)/.test(em), "no e-mail: texto, sem o PDF");
  var faltando = montar(COMPLETO.replace("links: Agente Dois | [INSERIR LINK]", "links: Documento | nao-existe.pdf"));
  assert.ok(niveis(faltando, "erro").some(function (p) { return /documento não encontrado/.test(p.msg); }));
});

teste("novo tópico (ex.: Testes): seção reservada só aparece com [TOPICO 1], na ordem certa, com links e imagens", function () {
  assert.ok(montar(MINIMO).html.indexOf("<!--secao:topico-->") < 0, "sem [TOPICO 1], a seção não aparece");
  var dados = MINIMO + "\n" + [
    "[APRENDIZADO 1]", "titulo: Aprender", "texto: Algo.",
    "[TOPICO]", "rotulo: Testes", "titulo: O que testamos", "texto: Testes A/B do mês.",
    "[TOPICO 1]", "status: Em teste", "status_cor: ambar", "nome: Teste de chamada", "texto: Duas versões do título.",
    "links: Plano do teste | https://empresa.sharepoint.com/:w:/s/site/plano ; Resultado | [link]",
    "imagens: icone-prancheta.png, icone-lupa.png", "descricao_imagens: Versão A | Versão B",
    "[TOPICO 2]", "nome: Teste de imagem",
    "[FOCO]", "prioridade: Foco"
  ].join("\n");
  var r = montar(dados);
  assert.ok(r.ok, JSON.stringify(niveis(r, "erro")));
  var h = r.html, a = h.indexOf("<!--secao:aprendizados-->"), t = h.indexOf("<!--secao:topico-->"), f = h.indexOf("<!--secao:foco-->");
  assert.ok(a > 0 && t > a && f > t, "entre O que aprendemos e o Foco");
  assert.ok(/>0\d<\/span>&nbsp;&nbsp;<span data-campo="topico.rotulo">TESTES<\/span>/.test(h), "rótulo em maiúsculas, com o número da seção");
  assert.ok(/data-item="topico-1"/.test(h) && /data-item="topico-2"/.test(h) && /data-campo="topico-1.status"/.test(h));
  assert.ok(/href="https:\/\/empresa.sharepoint.com\/:w:\/s\/site\/plano"[^>]*class="cta"[^>]*>Plano do teste&nbsp;&#8594;<\/a>/.test(h), "link de verdade");
  assert.ok(/title="Link ainda não definido"[^>]*>Resultado&nbsp;&#8594;/.test(h), "link pendente não vira clique");
  assert.ok(/Plano do teste&nbsp;&#8594;<\/a><br><span title="Link ainda não definido"/.test(h), "um link embaixo do outro");
  var ims = h.match(/<img\b[^>]*data-img="topico-1-print-\d"[^>]*>/g) || [];
  assert.strictEqual(ims.length, 2);
  ims.forEach(function (x) { assert.ok(/ width="288"/.test(x) && /data-ampliar="@@IMG\d+@@"/.test(x), x); });
  assert.ok(/alt="Versão A"/.test(h) && /alt="Versão B"/.test(h));
  assert.ok(/TESTES: O que testamos/.test(r.texto) && /Plano do teste: https:/.test(r.texto), "versão em texto do e-mail");
  assert.ok(r.links.some(function (l) { return /Testes 1 · Plano do teste/.test(l.onde); }), "link na lista de testar antes de enviar");
  var im = M.importarDados("[TOPICO]\ntitulo: Testes do mês\n[TOPICO 2]\nnome: Teste B\nstatus: Concluído\nstatus_cor: verde");
  assert.deepStrictEqual(im.problemas, []);
  assert.strictEqual(im.campos["topico.titulo"].texto, "Testes do mês");
  assert.strictEqual(im.campos["topico-2.nome"].texto, "Teste B");
  assert.strictEqual(im.campos["topico-2.status"].tom, "verde");
});

teste("marcas de edição (data-img, data-item, data-campo) existem na página e saem do e-mail", function () {
  var html = montar(COMPLETO).html;
  assert.ok(/data-img="principal"/.test(html) && /data-img="destaque"/.test(html) && /data-img="transformation-1-logo"/.test(html));
  assert.ok(/data-item="numero-1"/.test(html) && /data-item="lancamento-4"/.test(html) && /data-item="agenda-2"/.test(html));
  var em = M.paraEmail(html), limpo = M.limparHtmlEditado(html).html;
  [em, limpo].forEach(function (h) { assert.ok(!/data-(img|item|campo|tom)=|EDITAR AQUI|report-completo/.test(h)); });
});

console.log("\n" + (testes - falhas) + " de " + testes + " testes passaram.");
process.exit(falhas ? 1 : 0);
