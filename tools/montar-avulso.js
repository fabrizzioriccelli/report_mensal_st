/*
 * Monta a versão avulsa do emulador: um único arquivo .html, com o motor (tools/motor.js) e o
 * modelo em branco embutidos. É o arquivo que o time recebe e abre com dois cliques no Chrome ou
 * no Edge, em qualquer pasta. Uso técnico (quem mantém a ferramenta):
 *   node tools/montar-avulso.js [destino]      PF (padrão: kit/emulador-report.html)
 *   node tools/montar-avulso.js pj [destino]   PJ (padrão: kit/emulador-report-pj.html)
 * O PJ é o MESMO emulador (converter-html-eml.html), com o segmento PJ: modelo em branco do PJ
 * (tools/coringa-pj.js), nome "Emulador Report PJ", ícone Santander + PJ e cabeçalho em Rio.
 */
"use strict";
var fs = require("fs"), path = require("path");
var RAIZ = path.join(__dirname, "..");
var pj = process.argv[2] === "pj", arg = process.argv[pj ? 3 : 2];
var destino = path.resolve(arg || path.join(RAIZ, "kit", pj ? "emulador-report-pj.html" : "emulador-report.html"));
function embutir(arq, comentario) {
  /* Dentro de <script>, "</script" fecharia o bloco e "<!--" muda o modo de leitura do navegador. */
  var js = fs.readFileSync(path.join(RAIZ, arq), "utf8").replace(/<\/script/gi, "<\\/script").replace(/<!--/g, "\\x3C!--");
  return "<script>\n/* " + comentario + " */\n" + js + "\n</script>";
}
function troca(h, de, para) {
  if (h.split(de).length !== 2) throw new Error("não encontrei (uma vez só): " + String(de).slice(0, 80));
  return h.split(de).join(para);
}
var h = fs.readFileSync(path.join(RAIZ, "converter-html-eml.html"), "utf8");
h = troca(h, '<script src="tools/motor.js"></script>', embutir("tools/motor.js", "tools/motor.js embutido: esta versão funciona sozinha, sem a pasta do projeto."));
h = troca(h, '<script src="tools/coringa.js"></script>', pj
  ? embutir("tools/coringa-pj.js", "tools/coringa-pj.js embutido: o modelo em branco do PJ (Santander Empresas).") + '\n<script>window.SEGMENTO = "pj";</script>'
  : embutir("tools/coringa.js", "tools/coringa.js embutido: o modelo em branco."));
h = troca(h, "  Precisa de tools/motor.js e tools/coringa.js na mesma estrutura de pastas\n  (a versão avulsa, para o time, já traz os dois embutidos).",
  "  Versão avulsa: o motor e o modelo em branco estão embutidos. Funciona\n  sozinha, em qualquer pasta (dois cliques: abre no navegador).");
if (pj) {
  var M = require(path.join(RAIZ, "tools", "motor.js"));
  /* ícone da aba: os <link rel="icon"> do PF saem; entram os do PJ (os mesmos do report PJ salvo) */
  var ini = h.indexOf("<!-- Ícone da aba: Santander + PF"), fim = h.indexOf("<title>Emulador Report PF</title>");
  if (ini < 0 || fim < ini) throw new Error("não encontrei o bloco do ícone da aba");
  h = h.slice(0, ini) + "<!-- Ícone da aba: Santander + PJ (assets/marca/svg/santander-pj.svg; PNG 16, 32 e 180 px em assets/marca/), embutido para funcionar em qualquer pasta. -->\n" +
    M.ICONE_TAG_PJ + "\n" + h.slice(fim);
  h = troca(h, "<title>Emulador Report PF</title>", "<title>Emulador Report PJ</title>");
  h = troca(h, "<h1>Emulador Report PF</h1>", "<h1>Emulador Report PJ</h1>");
  /* símbolo no cabeçalho: o mesmo SVG do ícone da aba (Santander + PJ), na placa branca */
  var svgPJ = (/<link rel="icon" type="image\/svg\+xml" sizes="any" href="([^"]+)">/.exec(M.ICONE_TAG_PJ) || [])[1];
  h = h.replace(/(<span class="marca-pf"><img src=")[^"]+(" alt=")Santander PF(")/, function (m, a, b, c) { return a + svgPJ + b + "Santander PJ" + c; });
  if (h.indexOf('alt="Santander PJ"') < 0) throw new Error("não troquei o símbolo do cabeçalho");
  /* cabeçalho em Rio (a cor de destaque do Santander Empresas), texto em Preto: os dois emuladores não se confundem */
  h = troca(h, "</style>\n</head>", "  /* Emulador Report PJ: cabeçalho em Rio (Brand Guide Santander Empresas), texto em Preto */\n" +
    "  header{background:#F5DECF;color:#000}header h1,header p,header #versao{color:#000}\n</style>\n</head>");
}
fs.mkdirSync(path.dirname(destino), { recursive: true });
fs.writeFileSync(destino, h);
console.log("Emulador avulso" + (pj ? " PJ" : "") + ": " + path.relative(RAIZ, destino) + " (" + Math.round(Buffer.byteLength(h) / 1024) + " KB)");
