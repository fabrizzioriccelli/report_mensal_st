/*
 * Conteúdo do guia operacional unificado PF + PJ (usado por tools/guia/gerar-guia.js).
 * Cada passo responde: o que fazer, onde clicar, o que selecionar, o que acontece e como confirmar.
 * Fluxo só com Chrome/Edge e o Explorador de Arquivos do Windows. Links: só os arquivos do kit
 * (mesma pasta do guia) e as páginas do próprio guia.
 */
"use strict";
var fs = require("fs"), path = require("path");
module.exports = function (G) {
  var C = G.C, T = G.texto, cx = G.caixa;
  var KIT = { pf: "emulador-report.html", pj: "emulador-report-pj.html", coringaPF: "report-coringa.html", coringaPJ: "report-coringa-pj.html", exemploPF: "report-exemplo.html", exemploPJ: "report-exemplo-pj.html" };
  function irPara(sec) { return { slide: G.INICIO[sec] || 2 }; }

  /* ================= CAPA ================= */
  G.pagina("capa", null, function (sl) {
    sl.background = { color: C.lisboa };
    cx(sl, 65, 65, 600, 680, { fill: C.vm, r: 40 });
    T(sl, "Guia operacional · versão " + G.VERSAO.split(" ")[0], { x: 105, y: 112, w: 520, h: 26, s: 19.5, f: "fx", b: false, c: C.br });
    T(sl, "Como atualizar e enviar o report mensal", { x: 105, y: 160, w: 530, h: 260, s: 58, c: C.br, ls: 0.98 });
    T(sl, "Um guia para os dois emuladores: Report PF (Creative Strategy PF) e Report PJ (Santander Empresas). Os mesmos passos, cada um com a sua identidade.", { x: 105, y: 440, w: 520, h: 120, s: 21, f: "fx", b: false, c: C.br, ls: 1.25 });
    G.pilula(sl, "Começa agora  →", 105, 640, 230, 48, { fill: C.br, c: C.vm, s: 19, link: { slide: 2, tooltip: "Índice" } });
    /* as duas telas, reais */
    var caps = [["pf-report", 712, "PF"], ["pj-report", 1052, "PJ"]];
    caps.forEach(function (c) {
      var m = G.META[c[0]], w = 310, h = 590;
      cx(sl, c[1], 95, w + 24, h + 24, { fill: C.br, r: 28 });
      var esc = Math.min(w / m.w, h / m.h);
      sl.addImage({ path: path.join(G.CAP, m.arquivo), x: G.I(c[1] + 12 + (w - m.w * esc) / 2), y: G.I(107), w: G.I(m.w * esc), h: G.I(m.h * esc), altText: "Captura real do report " + c[2] + " (dados fictícios)" });
      G.tags(sl, [c[2]], c[1] + 12, 720);
      T(sl, c[2] === "PF" ? "Report PF · exemplo fictício" : "Report PJ · exemplo fictício", { x: c[1] + 66, y: 721, w: 250, h: 24, s: 13, c: C.cinza, f: "fx", b: false });
    });
    T(sl, "Todas as telas são capturas reais dos emuladores com conteúdo fictício de treinamento (Janeiro 2099).", { x: 712, y: 760, w: 660, h: 18, s: 11.5, f: "fx", b: false, c: C.cinza });
  });

  /* ================= ÍNDICE ================= */
  G.pagina("indice", null, function (sl, n) {
    sl.background = { color: C.br };
    cx(sl, 65, 65, 430, 680, { fill: C.vm, r: 34 });
    T(sl, "Índice", { x: 105, y: 100, w: 360, h: 100, s: 80, c: C.br });
    T(sl, "O passo a passo do mês, do primeiro clique ao e-mail no Outlook. Os procedimentos iguais aparecem uma vez; o que muda no PJ vem marcado.", { x: 105, y: 232, w: 360, h: 200, s: 19, f: "fx", b: false, c: C.br, ls: 1.25 });
    G.tags(sl, ["PF"], 105, 470); T(sl, "Creative Strategy PF", { x: 160, y: 471, w: 300, h: 24, s: 15, f: "fx", b: false, c: C.br });
    G.tags(sl, ["PJ"], 105, 506); T(sl, "Santander Empresas", { x: 160, y: 507, w: 300, h: 24, s: 15, f: "fx", b: false, c: C.br });
    T(sl, "Clique em uma seção para ir até ela. No alto de cada página, as pílulas levam de volta ao índice ou a outra seção.", { x: 105, y: 600, w: 360, h: 90, s: 17, c: C.br, ls: 1.15 });
    var cols = [530, 960], hh = 86, gap = 10;
    G.SECOES.forEach(function (s, i) {
      var col = i % 2, lin = Math.floor(i / 2), x = cols[col], y = 65 + lin * (hh + gap), w = 417, alvo = G.INICIO[s[1]];
      cx(sl, x, y, w, hh, { fill: C.lisboa, r: 18, link: { slide: alvo, tooltip: s[0] } });
      T(sl, [{ text: (i < 9 ? "0" : "") + (i + 1), options: { hyperlink: { slide: alvo } } }], { x: x + 22, y: y + 22, w: 60, h: 44, s: 34, c: C.vm });
      T(sl, [{ text: s[0], options: { hyperlink: { slide: alvo } } }], { x: x + 92, y: y + 18, w: 250, h: 28, s: 19, c: C.pt });
      T(sl, "p. " + String(alvo).padStart(2, "0"), { x: x + 92, y: y + 50, w: 120, h: 20, s: 13.5, f: "fx", b: false, c: C.cinza });
      G.seta(sl, x + w - 58, y + 22, 40, C.vm, C.br, { slide: alvo, tooltip: s[0] });
    });
    T(sl, String(n).padStart(2, "0"), { x: 1290, y: 755, w: 40, h: 22, s: 15, c: C.pt, al: "right" });
  });

  /* ================= 01 · CONHECENDO ================= */
  G.divisor("conhecendo", "O emulador é a ferramenta do mês: abre o report, deixa editar na própria página, salva o HTML completo e monta o e-mail-resumo para o Outlook. Tudo no Chrome ou no Edge, sem instalar nada.", "Um report completo e um e-mail-resumo saem da mesma página.", "O que é", "pj-editor");
  G.conteudo("conhecendo", function (sl) {
    G.titulo(sl, "O report e o e-mail-resumo", "Duas experiências que saem da mesma página", ["PF", "PJ"]);
    G.cartaoTexto(sl, 65, 205, 420, 250, "O report completo (.html)", "A página do mês, com movimento ao rolar, peças e vídeos no clique. É o arquivo que você salva no emulador e guarda na pasta do mês.", { eyebrow: "1" });
    G.cartaoTexto(sl, 65, 470, 420, 260, "O e-mail-resumo (.eml)", "A porta de entrada: a frase do mês, até 4 destaques e um único botão, \"Acessar report completo\". Abre no Outlook como mensagem nova.", { eyebrow: "2" });
    G.captura(sl, "pf-report", 505, 205, 430, 525, [], { rot: "REPORT PF", seg: "PF" });
    G.captura(sl, "pj-report", 947, 205, 430, 525, [], { rot: "REPORT PJ", seg: "PJ" });
  });
  G.conteudo("conhecendo", function (sl) {
    G.titulo(sl, "Os arquivos do kit", "Guarde todos na mesma pasta: os links deste guia abrem os arquivos pelo nome", ["PF", "PJ"]);
    G.tabela(sl, 65, 205, 1312, ["Arquivo", "O que é", "O que fazer com ele"], [
      [{ text: KIT.pf, link: { url: KIT.pf } }, "Emulador Report PF (Creative Strategy PF)", "Dois cliques: abre no Chrome ou no Edge"],
      [{ text: KIT.pj, link: { url: KIT.pj } }, "Emulador Report PJ (Santander Empresas)", "Dois cliques: abre no Chrome ou no Edge"],
      [{ text: KIT.coringaPF, link: { url: KIT.coringaPF } }, "Modelo em branco do PF (o mesmo do botão \"Começar do modelo em branco\")", "Só para consulta: o emulador já traz o modelo"],
      [{ text: KIT.coringaPJ, link: { url: KIT.coringaPJ } }, "Modelo em branco do PJ", "Só para consulta: o emulador PJ já traz o modelo"],
      [{ text: KIT.exemploPF + " · " + KIT.exemploPJ }, "Reports de exemplo, com conteúdo fictício (Janeiro 2099)", "Abrir no emulador para treinar"],
      ["report-AAAA-MM.html", "O report do mês, salvo por você (PF ou PJ)", "Guardar na pasta do mês; abrir no emulador para editar de novo"],
      ["report-AAAA-MM-resumo.eml", "O e-mail-resumo, pronto para o Outlook", "Dois cliques: abre uma mensagem nova no Outlook"],
      ["guia-operacional.pdf", "Este guia (.pptx editável ao lado)", "Consultar no passo a passo"]
    ], [330, 560, 422], { rowH: 52, s: 14 });
    G.atencao(sl, 65, 655, 1312, 80, "O report salvo (.html) já leva as imagens e os vídeos dentro. Não é preciso mandar a pasta de imagens junto. Clique no nome de um emulador acima para abrir (o arquivo precisa estar na mesma pasta deste guia).");
  });
  G.conteudo("conhecendo", function (sl) {
    G.titulo(sl, "O mês em 8 passos", "Tempo médio, com os dados aprovados: de 30 a 45 minutos", ["PF", "PJ"]);
    var P = [["Organizar", "Imagens do mês numa pasta, com nomes no padrão.", "primeiros"], ["Abrir", "O emulador do seu segmento (PF ou PJ) no Chrome ou no Edge.", "escolhendo"],
      ["Editar", "Textos, indicadores, imagens, itens e seções, na própria página.", "atualizando"], ["Salvar", "O report do mês (.html), com tudo dentro.", "html"],
      ["Conferir", "Reabrir o salvo, no computador e no celular.", "visualizando"], ["Link", "Colar o link do report completo no emulador.", "link"],
      ["E-mail-resumo", "Até 4 destaques e o botão; baixar o .eml.", "resumo"], ["Enviar", "Pelo Outlook: primeiro para você, depois para a área.", "eml"]];
    P.forEach(function (p, i) {
      var col = i % 4, lin = Math.floor(i / 4), x = 65 + col * 333, y = 215 + lin * 260, alvo = { slide: G.INICIO[p[2]] };
      cx(sl, x, y, 313, 240, { fill: i === 6 ? C.vm : C.br, r: 22, link: alvo });
      T(sl, String(i + 1), { x: x + 24, y: y + 20, w: 60, h: 50, s: 40, c: i === 6 ? C.br : C.vm });
      T(sl, [{ text: p[0], options: { hyperlink: alvo } }], { x: x + 24, y: y + 88, w: 270, h: 30, s: 22, c: i === 6 ? C.br : C.pt });
      T(sl, p[1], { x: x + 24, y: y + 126, w: 265, h: 90, s: 15.5, f: "fx", b: false, c: i === 6 ? C.br : C.txt });
    });
  });

  /* ================= 02 · ESCOLHENDO ================= */
  G.divisor("escolhendo", "PF e PJ são dois emuladores independentes, com o mesmo funcionamento. Cada um tem o seu nome na aba, o seu ícone, o seu modelo em branco e a sua identidade visual.", "Use o emulador do segmento do report. Um não abre o report do outro.", "A regra central", "pj-recusa");
  G.conteudo("escolhendo", function (sl) {
    G.titulo(sl, "PF ou PJ: qual emulador abrir", "Pelo segmento do report do mês", ["PF", "PJ"]);
    [["pf", "Emulador Report PF", "Creative Strategy PF. Capa vermelha, títulos em vermelho, a formiguinha no encerramento.", KIT.pf, KIT.coringaPF, "PF"],
      ["pj", "Emulador Report PJ", "Santander Empresas. Blocos em Rio, títulos em Preto com Santander Condensed, balões e o ícone Santander + PJ.", KIT.pj, KIT.coringaPJ, "PJ"]].forEach(function (e, i) {
      var x = 65 + i * 666;
      G.captura(sl, e[0] + "-inicio", x, 205, 646, 360, [{ i: 0, n: 1 }, { i: 1, n: 2 }], { rot: "TELA INICIAL", seg: e[5] });
      cx(sl, x, 590, 646, 145, { fill: C.br, r: 20 });
      T(sl, e[1], { x: x + 24, y: 606, w: 400, h: 28, s: 21, c: C.pt });
      T(sl, e[2], { x: x + 24, y: 640, w: 600, h: 44, s: 14, f: "fx", b: false, c: C.txt });
      G.pilula(sl, "Abrir " + e[3] + "  →", x + 24, 692, 290, 32, { fill: C.vm, c: C.br, s: 13, link: { url: e[3], tooltip: "Abre o arquivo do kit" } });
      G.pilula(sl, "Modelo em branco", x + 326, 692, 180, 32, { line: C.vm, c: C.vm, s: 13, link: { url: e[4], tooltip: "Abre o modelo em branco do kit" } });
    });
  });
  G.conteudo("escolhendo", function (sl) {
    G.titulo(sl, "O que é igual e o que muda", "As funções são as mesmas; mudam a identidade e os nomes das seções", ["PF", "PJ"]);
    G.tabela(sl, 65, 200, 790, ["", "PF", "PJ"], [
      ["Aba e ícone", "Emulador Report PF · Santander + PF", "Emulador Report PJ · Santander + PJ"],
      ["Abertura", "Capa vermelha: frase, campanha e números", "Abertura (frase), Visão geral (campanha) e Principais resultados"],
      ["Campanhas", "O que lançamos", "Campanhas"],
      ["Indicador do mês", "Creative X", "Indicadores"],
      ["Projetos", "Transformation Hub", "Análises"],
      ["Aprendizados", "O que aprendemos", "Aprendizados"],
      ["Próximo mês", "Foco do próximo mês · Também vem aí", "Próximas iniciativas · Agenda"],
      ["E-mail-resumo", "Faixa vermelha, cartões Lisboa", "Cabeçalho Rio, cartões Rio, texto Preto"]
    ], [190, 300, 300], { rowH: 54, s: 13.5 });
    G.captura(sl, "pj-recusa", 875, 200, 502, 300, [{ i: 0 }], { rot: "REPORT DO OUTRO SEGMENTO", seg: "PJ" });
    G.confirmar(sl, 875, 520, 502, 215, "Abriu o report do outro segmento? O emulador avisa (\"Este é um report PF\" ou \"PJ\"), diz qual emulador abrir e não mexe no report que estava aberto. Os rascunhos guardados também são separados.", "PF e PJ não se misturam");
  });

  /* ================= 03 · PRIMEIROS PASSOS ================= */
  G.divisor("primeiros", "Antes de editar: a pasta do mês no Explorador de Arquivos, as imagens com nomes no padrão e o emulador aberto no navegador.", "Uma pasta por mês, as imagens dentro e o emulador sempre no Chrome ou no Edge.", "Antes de começar", "pf-inicio");
  G.conteudo("primeiros", function (sl) {
    G.titulo(sl, "Pasta do mês no Explorador de Arquivos", "Onde guardar e como achar os arquivos", ["PF", "PJ"]);
    G.passos(sl, 65, 205, 760, 530, [
      ["Abra o Explorador:", "tecla Windows + E (ou o ícone de pasta amarela na barra de tarefas)."],
      ["Crie a pasta do mês:", "em Documentos › Report mensal, botão direito › Novo › Pasta (ou Ctrl+Shift+N). Nome com ano e mês, ex.: 2026-11 (no PJ, 2026-11-pj)."],
      ["Mostre as extensões:", "Windows 11: Exibir › Mostrar › Extensões de nomes de arquivos. Windows 10: aba Exibir › Extensões de nomes de arquivos. Assim o .html e o .eml aparecem no fim do nome."],
      ["Renomeie com F2:", "clique no arquivo, F2, escreva o nome no padrão e Enter. Mantenha a extensão (.png, .jpg). Se o Windows perguntar sobre mudar a extensão, clique em Não."],
      ["Ache o que foi baixado:", "no navegador, Ctrl+J › Mostrar na pasta. O .eml vai sempre para Downloads."]
    ]);
    G.esquema(sl, 845, 205, 532, 530, ["Documentos", "└─ Report mensal", "    ├─ emulador-report.html", "    ├─ emulador-report-pj.html", "    ├─ 2026-11", "    │   ├─ imagens", "    │   │   ├─ campanha_x_principal.jpg", "    │   │   └─ black_friday_selo.png", "    │   └─ report-2026-11.html", "    └─ 2026-11-pj", "        ├─ imagens", "        └─ report-2026-11.html", "", "Downloads", "└─ report-2026-11-resumo.eml"]);
  });
  G.conteudo("primeiros", function (sl) {
    G.titulo(sl, "Padrão de nomes e tamanho das imagens", "O emulador recorta e reduz sozinho; o nome ajuda você a achar", ["PF", "PJ"]);
    G.tabela(sl, 65, 200, 1312, ["Regra", "Certo", "Evite"], [
      ["Só minúsculas, sem acento e sem espaço", "campanha_natal_principal.jpg", "Campanha Natal (final).JPG"],
      ["Palavras separadas por _ (sublinhado)", "black_friday_selo.png", "black-friday selo.png"],
      ["Campanha + o que é a imagem", "one_brief_icone.png", "imagem1.png · Captura de tela.png"],
      ["Formato .png (logos, selos, prints) ou .jpg (fotos e peças)", "agente_x_print.png", ".heic · .webp · .pdf como imagem"]
    ], [520, 396, 396], { rowH: 46, s: 14 });
    G.cartaoTexto(sl, 65, 460, 645, 275, "Tamanho recomendado · PF", "Peça da capa: 440 × 440 px ou mais (quadrada) · Destaque: 368 × 600 px · Lançamentos: 736 × 288 px · Logo do Transformation Hub: 112 × 112 px · Print: 1008 px de largura · Selo: o PNG original, sem redesenhar.", { eyebrow: "PF", eyeFill: C.br, eyeCor: C.vm });
    G.cartaoTexto(sl, 732, 460, 645, 275, "Tamanho recomendado · PJ", "Peça da visão geral: 368 × 460 px ou mais (retângulo VERTICAL: o Brand Guide Empresas não usa formato quadrado) · Campanha em destaque: 368 × 600 px · Outras campanhas: 736 × 288 px · Print da análise: 1008 px de largura.", { eyebrow: "PJ" });
  });
  G.conteudo("primeiros", function (sl) {
    G.titulo(sl, "Abrir o emulador e o report", "Modelo em branco ou o report salvo do mês anterior", ["PF", "PJ"]);
    G.passos(sl, 65, 205, 600, 380, [
      ["No Explorador,", "encontre emulador-report.html (PF) ou emulador-report-pj.html (PJ) e dê dois cliques."],
      ["Abriu em outro programa?", "Botão direito no arquivo › Abrir com › Google Chrome ou Microsoft Edge."],
      ["Mês novo do zero:", "clique em Começar do modelo em branco (1)."],
      ["Continuar um report:", "clique em Abrir um report salvo (.html) (2), escolha o arquivo .html na janela do Explorador e clique em Abrir. Ou arraste o arquivo para a área tracejada."]
    ]);
    G.confirmar(sl, 65, 605, 600, 130, "A página do emulador abre com o passo 1, \"Abra o report\". Com o report aberto, aparece o passo 2, \"Edite e salve o report\", com a página do mês num quadro.");
    G.captura(sl, "pf-inicio", 685, 205, 692, 530, [{ i: 1, n: 3 }, { i: 2, n: 4 }], { rot: "TELA INICIAL", seg: "PF" });
  });
  G.conteudo("primeiros", function (sl) {
    G.titulo(sl, "A tela de edição", "Barra de ferramentas em cima, a página do mês embaixo", ["PF", "PJ"]);
    G.captura(sl, "pj-editor", 65, 200, 830, 535, [{ i: 0, n: 1 }, { i: 1, n: 2 }, { i: 2, n: 3 }, { i: 3, n: 4 }, { i: 4, n: 5 }, { i: 5, n: 6 }], { rot: "TELA DE EDIÇÃO", seg: "PJ" });
    G.passos(sl, 915, 200, 462, 535, [
      ["Salvar report (.html):", "grava o report do mês."], ["Importar conteúdo (Copilot):", "cola os textos organizados pelo Copilot."],
      ["+ Adicionar item:", "assistente para incluir um número, card, texto ou destaque."], ["+ Novo tópico:", "uma seção nova (ex.: Testes), com o layout que você escolhe."],
      ["Desfazer:", "volta a última mudança."], ["Computador · Celular:", "a largura da edição (o mesmo vale para a prévia)."]
    ], { s: 14.5 });
  });

  /* ================= 04 · ATUALIZANDO ================= */
  G.divisor("atualizando", "Textos e números mudam direto na página do mês: clique e escreva. O que não tem dado no mês sai (nunca entra zero nem o número do mês anterior).", "Clique no texto, escreva, Enter. A página mostra na hora como fica.", "Na prática", "pf-indicador");
  G.conteudo("atualizando", function (sl) {
    G.titulo(sl, "Editar um texto", "Frase do mês, títulos, nomes e descrições", ["PF", "PJ"]);
    G.passos(sl, 65, 205, 560, 360, [
      ["Passe o mouse:", "o texto que pode ser editado ganha um contorno tracejado."], ["Clique:", "o contorno fica contínuo e o cursor aparece (1)."],
      ["Escreva:", "selecione tudo com Ctrl+A e digite por cima. Shift+Enter quebra a linha."], ["Termine:", "Enter, ou clique fora. Colar (Ctrl+V) cola só o texto, sem formatação."]
    ]);
    G.confirmar(sl, 65, 585, 560, 150, "O texto novo aparece na página e o aviso \"alterações não salvas\" surge no alto. Errou? Desfazer volta.");
    G.captura(sl, "pf-texto", 645, 205, 732, 530, [{ i: 0, n: 1 }], { rot: "EDITAR UM TEXTO", seg: "PF" });
  });
  G.conteudo("atualizando", function (sl) {
    G.titulo(sl, "Editar um indicador e a etiqueta", "Valor, título, referência e a cor da etiqueta", ["PF", "PJ"]);
    G.passos(sl, 65, 205, 560, 400, [
      ["Valor:", "clique no número grande e escreva (ex.: 12,5% · R$ 1,20 · 1.234), até 10 caracteres (1)."],
      ["Título e referência:", "clique e escreva o que é o número e a base de comparação (ex.: Referência: 10,0%)."],
      ["Etiqueta:", "clique e escreva com o sinal: ▲ +25% ou ▼ −20%. Na barra que aparece, Cor: verde (positivo) ou Cor: âmbar (atenção) (2)."],
      ["Sem dado no mês:", "passe o mouse no item › Tirar item. A grade se ajusta."]
    ]);
    G.atencao(sl, 65, 625, 560, 110, "% é variação relativa (+12%); p.p. é diferença entre duas porcentagens (de 40% para 52% = +12 p.p.). Não troque um pelo outro.");
    G.captura(sl, "pj-indicador", 645, 205, 732, 530, [{ i: 0, n: 1 }, { i: 2, n: 2 }], { rot: "EDITAR UM INDICADOR", seg: "PJ" });
  });
  G.conteudo("atualizando", function (sl) {
    G.titulo(sl, "Importar conteúdo do Copilot", "Cole os blocos organizados (formato [NUMERO 1] · valor: …)", ["PF", "PJ"]);
    G.passos(sl, 65, 205, 560, 380, [
      ["No Copilot,", "use o Prompt 11 (seção 12) e copie a resposta, de [ até o último campo."], ["No emulador,", "clique em Importar conteúdo (Copilot)."],
      ["Cole", "na caixa de texto (1), com Ctrl+V."], ["Clique em Aplicar na página (2).", "O emulador preenche os campos e lista o que ficou de fora."]
    ]);
    G.confirmar(sl, 65, 605, 560, 130, "Os campos mudam na página e o resumo da importação aparece logo abaixo. Confira cada número com a fonte antes de salvar.");
    G.captura(sl, "pj-importar", 645, 205, 732, 530, [{ i: 0, n: 1 }, { i: 1, n: 2 }], { rot: "IMPORTAR CONTEÚDO", seg: "PJ" });
  });
  G.conteudo("atualizando", function (sl) {
    G.titulo(sl, "Mês novo a partir do mês anterior", "Abra o report salvo, troque o período e os números", ["PF", "PJ"]);
    G.passos(sl, 65, 205, 760, 420, [
      ["Abra o report do mês anterior:", "Abrir um report salvo (.html) › a pasta do mês passado › report-AAAA-MM.html."],
      ["Troque o período:", "clique em REPORT MENSAL · MÊS ANO e escreva o mês novo (muda em todos os lugares)."],
      ["Atualize textos, números e imagens", "como nas páginas anteriores."],
      ["Ao salvar,", "o emulador lista os números que ninguém mexeu. Confira: \"Voltar e conferir\" ou \"Salvar assim mesmo\"."]
    ]);
    G.atencao(sl, 845, 205, 532, 200, "Indicador sem dado no mês: tire o item. Nunca deixe o número do mês anterior nem escreva 0.", "Regra do emulador");
    G.diferencaPJ(sl, 845, 425, 532, 200, "O caminho é o mesmo no Emulador Report PJ, com um report PJ. Salve o PJ na pasta do mês do PJ, para não confundir com o PF.");
  });

  /* ================= 05 · IMAGENS E MÍDIAS ================= */
  G.divisor("imagens", "Passe o mouse na imagem e use Trocar imagem: você escolhe o arquivo no Explorador, e o emulador recorta, reduz e coloca no lugar.", "A imagem entra recortada no formato certo, no PF e no PJ.", "Na prática", "pj-imagem");
  G.conteudo("imagens", function (sl) {
    G.titulo(sl, "Trocar uma imagem", "Peça, card, logo, print ou selo", ["PF", "PJ"]);
    G.passos(sl, 65, 205, 560, 420, [
      ["Passe o mouse na imagem:", "aparece a barra da imagem (1)."], ["Clique em Trocar imagem (2).", "Abre a janela do Explorador."],
      ["Selecione o arquivo:", "vá até a pasta imagens do mês, clique no arquivo (.png ou .jpg) e em Abrir."],
      ["Descrição:", "na mesma barra, escreva o que a imagem mostra (vai para quem não vê a imagem)."]
    ]);
    G.confirmar(sl, 65, 645, 560, 90, "A imagem nova aparece no lugar, já recortada. Não gostou do recorte? Desfazer.");
    G.captura(sl, "pj-imagem", 645, 205, 732, 530, [{ i: 0, n: 1 }, { i: 1, n: 2 }], { rot: "TROCAR IMAGEM", seg: "PJ" });
  });
  G.conteudo("imagens", function (sl) {
    G.titulo(sl, "Vídeo e capa de vídeo", "Na página o vídeo toca; no e-mail vai a capa com ▶", ["PF", "PJ"]);
    G.passos(sl, 65, 205, 560, 420, [
      ["Passe o mouse na peça:", "a barra mostra Colocar vídeo (ou Trocar vídeo) (1)."], ["Escolha o arquivo", ".mp4 ou .webm no Explorador; o emulador otimiza ao colocar."],
      ["A capa:", "é a imagem da peça, com o ▶ desenhado. Para trocar, Trocar imagem."], ["No e-mail,", "nenhum programa toca vídeo: a capa abre o link do report."]
    ]);
    G.atencao(sl, 65, 645, 560, 90, "Vídeo muito pesado deixa o report lento para abrir. Prefira vídeos curtos.");
    G.captura(sl, "pf-video", 645, 205, 732, 530, [{ i: 1, n: 1 }], { rot: "VÍDEO", seg: "PF" });
  });
  G.conteudo("imagens", function (sl) {
    G.titulo(sl, "Links e documentos (PDF)", "\"Ver peça\", \"Assistir\" e documentos complementares", ["PF", "PJ"]);
    G.passos(sl, 65, 205, 560, 420, [
      ["Passe o mouse no item:", "a barra mostra + Link e + Imagem (1)."], ["+ Link:", "cole o endereço (https://…) e escreva o texto do link."],
      ["Documento (PDF):", "+ Link › escolha o arquivo PDF: ele vai dentro do report e abre em nova aba."], ["Link que executa código", "(javascript:) é recusado."]
    ]);
    G.confirmar(sl, 65, 645, 560, 90, "O link aparece em vermelho no item. Na página salva, ele abre ao clicar.");
    G.captura(sl, "pj-item", 645, 205, 732, 530, [{ i: 1, n: 1 }], { rot: "BARRA DO ITEM", seg: "PJ" });
  });

  /* ================= 06 · ADICIONAR E ORGANIZAR ================= */
  G.divisor("organizar", "Itens entram e saem com a grade refeita no computador e no celular. Seções mudam de lugar, saem e voltam. Tudo com Desfazer.", "A grade se ajusta sozinha: nada de mexer em tabela.", "Na prática", "pf-alca");
  G.conteudo("organizar", function (sl) {
    G.titulo(sl, "Barra do item: adicionar, mover e tirar", "Números, cards, aprendizados, agenda e tópicos", ["PF", "PJ"]);
    G.passos(sl, 65, 205, 560, 420, [
      ["Passe o mouse no item:", "aparece a barra (1)."], ["+ Adicionar depois:", "um item igual entra logo depois, com textos [entre colchetes]."],
      ["← Antes · Depois →:", "o item troca de lugar com o vizinho."], ["Tirar item:", "o item sai e a grade se refaz."],
      ["+ Adicionar (embaixo do grupo):", "um item novo no fim do grupo (2). Chegou no máximo? O botão avisa."]
    ]);
    G.confirmar(sl, 65, 645, 560, 90, "Os itens ficam alinhados na grade. No modo Celular, eles empilham.");
    G.captura(sl, "pf-item", 645, 205, 732, 530, [{ i: 1, n: 1 }, { i: 2, n: 2 }], { rot: "BARRA DO ITEM", seg: "PF" });
  });
  G.conteudo("organizar", function (sl) {
    G.titulo(sl, "+ Adicionar item (assistente)", "Tipo › onde entra › conteúdo › prévia › confirmar", ["PF", "PJ"]);
    G.passos(sl, 65, 205, 560, 420, [
      ["Clique em + Adicionar item", "na barra de ferramentas."], ["Escolha o tipo:", "Indicador, Card, Texto, Destaque, Imagem, Vídeo ou Conteúdo complementar."],
      ["Escolha onde entra:", "o grupo e a posição."], ["Preencha o conteúdo", "e veja a prévia na própria página (o item novo fica destacado)."],
      ["Confirme,", "ou Voltar e ajustar, ou Cancelar (desfaz a prévia inteira)."]
    ]);
    G.confirmar(sl, 65, 645, 560, 90, "O item novo fica destacado por alguns segundos e passa a se editar como os outros.");
    G.captura(sl, "pj-assistente", 645, 205, 732, 530, [], { rot: "+ ADICIONAR ITEM", seg: "PJ" });
  });
  G.conteudo("organizar", function (sl) {
    G.titulo(sl, "+ Novo tópico", "Um assunto novo, que ainda não tem seção própria (ex.: Testes)", ["PF", "PJ"]);
    G.passos(sl, 65, 205, 560, 420, [
      ["Clique em + Novo tópico.", "Abre a janela do tópico."], ["Escreva o nome", "da seção (1), ex.: Testes."],
      ["Escolha o layout (2):", "Lista, Colunas, Cartões ou Números."], ["Clique em Criar tópico.", "O tópico entra antes do Foco (PF) ou das Próximas iniciativas (PJ)."]
    ]);
    G.confirmar(sl, 65, 645, 560, 90, "A seção nova aparece na página, com o nome em maiúsculas e itens [entre colchetes] para trocar.");
    G.captura(sl, "pj-topico", 645, 205, 732, 530, [{ i: 0, n: 1 }, { i: 1, n: 2 }], { rot: "+ NOVO TÓPICO", seg: "PJ" });
  });
  G.conteudo("organizar", function (sl) {
    G.titulo(sl, "Seções: mover, tirar e mostrar", "Pela alça da seção ou em \"Seções do report\"", ["PF", "PJ"]);
    G.captura(sl, "pj-alca", 65, 200, 650, 300, [{ i: 0, n: 1 }], { rot: "ALÇA DA SEÇÃO", seg: "PJ" });
    G.captura(sl, "pj-secoes", 735, 200, 642, 300, [{ i: 0, n: 2 }, { i: 1 }], { rot: "SEÇÕES DO REPORT", seg: "PJ" });
    G.passos(sl, 65, 530, 870, 205, [
      ["Alça (1):", "passe o mouse no começo da seção: ⠿ Mover seção (arraste) e Tirar seção."],
      ["Seções do report (2):", "desmarque para tirar, marque para mostrar; ↑ ↓ e Posição… mudam a ordem."],
      ["Abertura e encerramento", "não mudam de lugar. A numeração (01, 02…) se ajusta sozinha."]
    ], { s: 14.5 });
    G.confirmar(sl, 955, 530, 422, 205, "A seção sai (ou muda de lugar) na página, e a caixa dela fica desmarcada em Seções do report. Desfazer traz de volta.");
  });

  /* ================= 07 · VISUALIZANDO ================= */
  G.divisor("visualizando", "Confira como o report fica no computador e no celular antes de salvar: o emulador mostra a mesma página nas duas larguras.", "No celular, nada sai para o lado: os itens empilham.", "Antes de salvar", "pj-celular");
  G.conteudo("visualizando", function (sl) {
    G.titulo(sl, "Conferir no tamanho do celular", "Botão Celular na barra de ferramentas", ["PF", "PJ"]);
    G.passos(sl, 65, 205, 560, 400, [
      ["Clique em Celular (1).", "A edição fica com a largura de um celular (390 px)."], ["Role a página inteira:", "textos, números, imagens e cards."],
      ["Confira:", "nada corta nem sai para o lado; os números ficam lado a lado; as colunas empilham."], ["Volte em Computador", "para continuar editando."]
    ]);
    G.confirmar(sl, 65, 625, 560, 110, "No modo Celular, a página do mês cabe inteira na largura, sem barra de rolagem para o lado.");
    G.captura(sl, "pj-celular", 645, 205, 732, 530, [{ i: 0, n: 1 }], { rot: "MODO CELULAR", seg: "PJ" });
  });
  G.conteudo("visualizando", function (sl) {
    G.titulo(sl, "Conferir o report salvo no navegador", "Abra o .html salvo com dois cliques", ["PF", "PJ"]);
    G.captura(sl, "pf-report-celular", 65, 200, 300, 535, [], { rot: "PF · CELULAR", seg: "PF" });
    G.captura(sl, "pj-report-celular", 385, 200, 300, 535, [], { rot: "PJ · CELULAR", seg: "PJ" });
    G.passos(sl, 705, 200, 672, 380, [
      ["No Explorador,", "dois cliques no report-AAAA-MM.html salvo: abre no navegador."], ["Role até o fim:", "as seções aparecem com movimento; peças e vídeos abrem no clique."],
      ["Celular:", "estreite a janela ou abra no celular; o layout de celular vale até 700 px."], ["Aba do navegador:", "o ícone Santander + PF ou + PJ e o título do report."]
    ]);
    G.confirmar(sl, 705, 600, 672, 135, "Tudo aparece: textos, números, imagens e vídeos, sem nada cortado e sem rolagem para o lado. O arquivo funciona em outro computador (as imagens vão dentro).");
  });

  /* ================= 08 · GERANDO O HTML ================= */
  G.divisor("html", "Salvar grava o report do mês num arquivo .html só, com as imagens, os vídeos e o ícone da aba dentro. É ele que você guarda e reabre no mês seguinte.", "Um arquivo só, que abre em qualquer computador.", "O arquivo do mês", "pj-salvar");
  G.conteudo("html", function (sl) {
    G.titulo(sl, "Salvar o report do mês", "Salvar report (.html)", ["PF", "PJ"]);
    G.passos(sl, 65, 205, 560, 420, [
      ["Clique em Salvar report (.html) (1).", "Abre a janela Salvar como do Chrome/Edge."], ["Escolha a pasta do mês", "e confira o nome sugerido: report-AAAA-MM.html."],
      ["Clique em Salvar.", "O aviso de alterações não salvas some (2)."], ["Navegador sem Salvar como?", "O report vai para Downloads; mova para a pasta do mês."]
    ]);
    G.confirmar(sl, 65, 645, 560, 90, "A mensagem \"Salvo: report-AAAA-MM.html\" aparece no alto da edição.");
    G.captura(sl, "pj-salvar", 645, 205, 732, 300, [{ i: 0, n: 1 }, { i: 1, n: 2 }], { rot: "SALVAR", seg: "PJ" });
    G.diferencaPJ(sl, 645, 530, 732, 205, "O report PJ salvo leva a marca do segmento, o ícone Santander + PJ e o título \"Creative Strategy PJ | Report de …\". Ele só abre no Emulador Report PJ.");
  });
  G.conteudo("html", function (sl) {
    G.titulo(sl, "Reabrir e recuperar a edição", "O arquivo salvo e o rascunho guardado no navegador", ["PF", "PJ"]);
    G.passos(sl, 65, 205, 560, 420, [
      ["Reabrir:", "feche a aba (Ctrl+W), abra o emulador de novo › Abrir um report salvo (.html) › o arquivo do mês."],
      ["Confira", "textos, números e imagens: tudo continua como salvou."],
      ["Fechou sem salvar?", "Ao abrir o emulador de novo, aparece Recuperar a edição (1)."],
      ["Recuperar", "volta a edição; Descartar (2) apaga o rascunho."]
    ]);
    G.atencao(sl, 65, 645, 560, 90, "O rascunho fica só neste navegador, neste computador. O que vale é o arquivo salvo.");
    G.captura(sl, "pf-recuperar", 645, 205, 732, 530, [{ i: 1, n: 1 }, { i: 2, n: 2 }], { rot: "RECUPERAR A EDIÇÃO", seg: "PF" });
  });

  /* ================= 09 · E-MAIL-RESUMO ================= */
  G.divisor("resumo", "O e-mail-resumo é montado a partir do report aberto: a frase do mês, até 4 destaques escolhidos por você e um único botão para o report completo.", "Até 4 destaques e um botão. O resto está no report.", "Na prática", "pj-resumo");
  G.conteudo("resumo", function (sl) {
    G.titulo(sl, "Escolher até 4 destaques", "Passo 4 do emulador: Selecionar destaques do e-mail", ["PF", "PJ"]);
    G.passos(sl, 65, 205, 560, 430, [
      ["Parta da sugestão (1):", "os números principais que a frase do mês ainda não diz."], ["Inclua da lista (2):", "clique no que o report oferece, por seção (até 4)."],
      ["Ajuste:", "↑ ↓ reordena; o título e a descrição mudam só no e-mail; imagem e link opcionais."], ["+ Informação nova (3):", "entra marcada para revisão e trava o .eml até \"Revisei\"."],
      ["Texto do botão (4):", "\"Acessar report completo\" (padrão)."]
    ], { s: 14.5 });
    G.atencao(sl, 65, 655, 560, 80, "O valor dos destaques vem sempre da página: mudou o número no report, muda no e-mail.");
    G.captura(sl, "pj-resumo", 645, 205, 732, 530, [{ i: 0, n: 1 }, { i: 1, n: 2 }, { i: 2, n: 3 }, { i: 3, n: 4 }], { rot: "DESTAQUES DO E-MAIL", seg: "PJ" });
  });
  G.conteudo("resumo", function (sl) {
    G.titulo(sl, "Prévia do e-mail-resumo", "Como chega na caixa de entrada, no computador e no celular", ["PF", "PJ"]);
    G.captura(sl, "pf-previa", 65, 200, 640, 535, [], { rot: "PRÉVIA · PF", seg: "PF" });
    G.captura(sl, "pj-previa", 737, 200, 640, 535, [], { rot: "PRÉVIA · PJ", seg: "PJ" });
  });
  G.conteudo("resumo", function (sl) {
    G.titulo(sl, "O que o e-mail-resumo segue", "Regras do emulador, iguais no PF e no PJ", ["PF", "PJ"]);
    [["Um único botão", "O único link do e-mail é o botão do report completo. Links dos destaques entram como texto (\"Saiba mais\"), sem competir com ele."],
      ["Sem o link, espera", "Sem o link do report completo, o .eml não é liberado e a prévia mostra \"FALTA O LINK DO REPORT COMPLETO\" (seção 10)."],
      ["Cantos retos", "Ao enviar, o Outlook para Windows tira os cantos arredondados para todos. A prévia já mostra como chega."],
      ["Modo escuro", "As cores aprovadas são protegidas onde o programa de e-mail deixa. No Outlook clássico, vale o botão do próprio Outlook."],
      ["Imagem do resumo", "Baixar imagem do resumo (.png): uma foto do e-mail, para prévia. O e-mail continua sendo o .eml."],
      ["Tema do segmento", "PF: faixa vermelha e cartões Lisboa. PJ: cabeçalho Rio, cartões Rio, texto Preto e o botão em Vermelho Santander."]].forEach(function (c, i) {
      var x = 65 + (i % 3) * 444, y = 205 + Math.floor(i / 3) * 268;
      G.cartaoTexto(sl, x, y, 424, 248, c[0], c[1], { eyebrow: String(i + 1) });
    });
  });

  /* ================= 10 · LINK ================= */
  G.divisor("link", "O botão do e-mail-resumo leva ao report completo. O emulador aceita qualquer link e avisa quando o Outlook pode bloquear.", "Sem link, o e-mail não sai: nunca vai um botão vazio.", "A regra central", "pj-link");
  G.conteudo("link", function (sl) {
    G.titulo(sl, "Colar o link do report completo", "Passo 3 do emulador", ["PF", "PJ"]);
    G.passos(sl, 65, 205, 560, 430, [
      ["Copie o link do report salvo:", "no OneDrive, botão direito no arquivo › Compartilhar › Copiar link."],
      ["Cole no campo do passo 3 (1)", "com Ctrl+V."], ["Leia a nota embaixo do campo (2):", "ela diz que tipo de link é e se há algum cuidado."],
      ["Caminho do computador (C:\\…)?", "É aceito, mas no e-mail recebido o Outlook para Windows bloqueia link para arquivo. Para enviar, use o link copiado do OneDrive."]
    ], { s: 14.5 });
    G.confirmar(sl, 65, 655, 560, 80, "O botão Baixar e-mail-resumo (.eml) fica liberado no passo 6.");
    G.captura(sl, "pj-link", 645, 205, 732, 300, [{ i: 0, n: 1 }, { i: 1, n: 2 }], { rot: "LINK DO REPORT", seg: "PJ" });
    G.atencao(sl, 645, 530, 732, 205, "Use o link que a área usa para compartilhar o report. Nunca use um link pessoal nem público. O emulador recusa link que executa código (javascript:).");
  });

  /* ================= 11 · EML ================= */
  G.divisor("eml", "O .eml abre no Outlook como mensagem nova, já com o assunto, o resumo e as imagens dentro. Você coloca os destinatários e envia.", "Primeiro para você. Depois, para a área.", "Antes de enviar", "pj-baixar");
  G.conteudo("eml", function (sl) {
    G.titulo(sl, "Baixar o e-mail-resumo (.eml)", "Passos 5 e 6 do emulador", ["PF", "PJ"]);
    G.passos(sl, 65, 205, 560, 430, [
      ["Status (1):", "cada etapa fica verde; um aviso em âmbar diz o que falta."], ["Clique em Baixar e-mail-resumo (.eml) (2).", "O arquivo vai para Downloads."],
      ["Opcional:", "Baixar imagem do resumo (.png) (3) e Baixar e-mail completo (.eml) (4), com o report inteiro."], ["Ache o arquivo:", "Ctrl+J › Mostrar na pasta."]
    ], { s: 14.5 });
    G.confirmar(sl, 65, 655, 560, 80, "Em Downloads aparece report-AAAA-MM-resumo.eml.");
    G.captura(sl, "pj-baixar", 645, 205, 732, 530, [{ i: 0, n: 1 }, { i: 1, n: 2 }, { i: 2, n: 3 }, { i: 3, n: 4 }], { rot: "STATUS E DOWNLOADS", seg: "PJ" });
  });
  G.conteudo("eml", function (sl) {
    G.titulo(sl, "Abrir no Outlook e enviar", "Sempre um teste antes", ["PF", "PJ"]);
    G.passos(sl, 65, 205, 760, 470, [
      ["Dois cliques no .eml", "em Downloads: abre uma mensagem nova no Outlook, com assunto e conteúdo."], ["Teste:", "em Para, coloque o seu e-mail e envie."],
      ["Confira a mensagem recebida:", "imagens, textos e o botão (clique: abre o report completo?)."], ["Teste com uma pessoa do time", "em outro computador."],
      ["Tudo certo?", "Abra o .eml de novo, coloque os destinatários da área e envie."]
    ]);
    G.atencao(sl, 845, 205, 532, 220, "Abriu em outro programa? Botão direito no .eml › Abrir com › Outlook. O botão chegou como imagem, sem clique? Veja Solução de problemas (seção 13).");
    G.confirmar(sl, 845, 445, 532, 230, "A mensagem recebida mostra o resumo igual à prévia do emulador, e o botão abre o report completo.");
  });

  /* ================= 12 · PROMPTS DO COPILOT ================= */
  var md = fs.readFileSync(path.join(G.RAIZ, "docs", "PROMPTS_COPILOT.md"), "utf8");
  var prompts = md.split(/\n## Prompt /).slice(1).map(function (b) {
    var tit = b.split("\n")[0].trim(), campo = {};
    b.replace(/\| \*\*([^*]+)\*\* \| ([^\n]+?) \|\n/g, function (m, k, v) { campo[k.trim()] = v.replace(/`/g, ""); return m; });
    var cod = (/```text\n([\s\S]*?)```/.exec(b) || [])[1] || "";
    return { tit: "Prompt " + tit.replace(/\s*\(.*$/, ""), titCompleto: "Prompt " + tit, campo: campo, cod: cod.trim() };
  });
  var NO_PJ = {
    5: "No PJ, os mesmos blocos preenchem a Abertura (frase), a Visão geral (campanha do mês) e os Principais resultados (números).",
    6: "No PJ, os mesmos blocos preenchem a seção Campanhas (campanha em destaque e outras campanhas do mês).",
    7: "No PJ, o bloco [CREATIVE X] preenche a seção Indicadores (o indicador do mês e os do trimestre).",
    8: "No PJ, o bloco [TRANSFORMATION] preenche a seção Análises (status, texto, resultado e prints).",
    9: "No PJ, a seção se chama Aprendizados (mesmos blocos).",
    10: "No PJ, [FOCO] e [AGENDA] preenchem as Próximas iniciativas e a agenda."
  };
  G.divisor("prompts", "São 13 prompts prontos para o Copilot corporativo transformar os resultados aprovados em conteúdo no formato do report. O Copilot organiza e escreve; quem responde pelos números é a área.", "Do dado à informação, com mais clareza.", "Biblioteca de prompts");
  G.conteudo("prompts", function (sl) {
    G.titulo(sl, "Como usar a biblioteca", "Copilot corporativo, conversa nova por mês", ["PF", "PJ"]);
    G.passos(sl, 65, 205, 700, 530, [
      ["Abra o Copilot corporativo,", "com a sua conta do banco. Dados internos não vão para ferramentas externas."], ["Envie o Prompt 0 (regras),", "uma vez por conversa."],
      ["Anexe ou cole a base do mês:", "planilhas, painéis, relatórios das campanhas."], ["Copie o prompt da página,", "troque o que está [ENTRE COLCHETES] e envie."],
      ["Confira a resposta", "(campo Validação de cada prompt)."], ["Com tudo aprovado,", "use o Prompt 11 e cole em Importar conteúdo (Copilot)."]
    ]);
    G.tabela(sl, 785, 205, 592, ["Momento do mês", "Prompts"], [["Recebi os dados", "1 › 2 › 3 › 4"], ["Vou escrever o report", "5 › 6 › 7 › 8 › 9 › 10"], ["Vou preencher a página", "11"], ["Antes de salvar e enviar", "12"]], [352, 240], { rowH: 48, s: 15 });
    G.diferencaPJ(sl, 785, 470, 592, 265, "Os blocos são os mesmos no PF e no PJ ([NUMERO 1], [DESTAQUE], [CREATIVE X]…). Muda só o nome da seção na página: Creative X vira Indicadores, Transformation Hub vira Análises, Foco vira Próximas iniciativas. As páginas dos prompts 5 a 10 dizem onde cada bloco entra no PJ.");
  });
  prompts.forEach(function (pr) {
    var num = parseInt(pr.tit.replace(/\D+/, ""), 10);
    G.conteudo("prompts", function (sl) {
      G.titulo(sl, pr.titCompleto.length > 52 ? pr.tit : pr.titCompleto, pr.campo["Objetivo"] || "", NO_PJ[num] ? ["PF", "PJ"] : ["PF", "PJ"]);
      cx(sl, 65, 200, 860, 535, { fill: C.br, r: 20 });
      T(sl, "PROMPT (copie e troque o que está [ENTRE COLCHETES])", { x: 89, y: 216, w: 800, h: 18, s: 11, c: C.cinza, cs: 1.5 });
      var linhas = pr.cod.split("\n").length, tam = linhas > 34 ? 10 : linhas > 28 ? 11 : linhas > 22 ? 12 : 13;
      sl.addText(pr.cod, { x: G.I(89), y: G.I(242), w: G.I(812), h: G.I(478), margin: 0, fontFace: "Courier New", fontSize: tam, color: C.txt, valign: "top", isTextBox: true, lineSpacingMultiple: 1.05 });
      var meta = [["Quando usar", pr.campo["Quando usar"]], ["Entradas", pr.campo["Entradas"]], ["Formato de saída", pr.campo["Formato de saída"]], ["Validação", pr.campo["Validação"]], ["Onde entra no report", pr.campo["Onde entra no report"]]].filter(function (m) { return m[1]; });
      var y = 200, hh = NO_PJ[num] ? 74 : 96;
      meta.forEach(function (m) {
        cx(sl, 945, y, 432, hh, { fill: C.br, r: 16 });
        T(sl, m[0].toUpperCase(), { x: 965, y: y + 12, w: 400, h: 16, s: 10.5, c: C.boston, cs: 1.2 });
        T(sl, m[1], { x: 965, y: y + 30, w: 396, h: hh - 36, s: 12, f: "fx", b: false, c: C.txt });
        y += hh + 8;
      });
      if (NO_PJ[num]) G.diferencaPJ(sl, 945, y, 432, 735 - y, NO_PJ[num]);
      sl.addNotes("Texto completo do " + pr.tit + " (para copiar):\n" + pr.cod);
    });
  });

  /* ================= 13 · SOLUÇÃO DE PROBLEMAS ================= */
  G.divisor("problemas", "Os problemas mais comuns e o que fazer em cada um. Quase todos se resolvem no próprio emulador, com Desfazer, Recuperar a edição ou o emulador do segmento certo.", "Antes de refazer tudo: Desfazer e Recuperar a edição.", "Em caso de dúvida");
  G.conteudo("problemas", function (sl) {
    G.titulo(sl, "Problemas comuns: edição e arquivos", "", ["PF", "PJ"]);
    [["\"Este é um report PF\" (ou \"PJ\")", "Você abriu o report no emulador do outro segmento. Abra o emulador certo (seção 02). Nada foi alterado."],
      ["O emulador abriu em outro programa", "Botão direito no arquivo › Abrir com › Google Chrome ou Microsoft Edge."],
      ["Fechei sem salvar", "Abra o emulador de novo no mesmo navegador: Recuperar a edição."],
      ["A imagem ficou cortada", "Desfazer e troque por uma imagem maior, no formato do lugar (no PJ, a peça da visão geral é vertical)."],
      ["Não acho o arquivo salvo", "Ctrl+J no navegador › Mostrar na pasta. Ou procure report-AAAA no Explorador."],
      ["O botão + Adicionar diz \"Máximo\"", "O grupo chegou ao máximo de itens. Tire um item ou use + Novo tópico."]].forEach(function (c, i) {
      var x = 65 + (i % 3) * 444, y = 200 + Math.floor(i / 3) * 272;
      G.cartaoTexto(sl, x, y, 424, 252, c[0], c[1], { eyebrow: "Problema " + (i + 1), sc: 18 });
    });
  });
  G.conteudo("problemas", function (sl) {
    G.titulo(sl, "Problemas comuns: e-mail e envio", "", ["PF", "PJ"]);
    [["O .eml não é liberado", "Falta o link do report completo (seção 10), ou há uma informação nova sem \"Revisei\" (seção 09). O status do passo 5 diz o que falta."],
      ["O botão chegou sem clique", "Link de arquivo (C:\\…) é bloqueado pelo Outlook para quem recebe. Use o link do OneDrive (Compartilhar › Copiar link)."],
      ["Cores diferentes no Outlook escuro", "O Outlook clássico recolore a mensagem no modo escuro. Quem lê no modo claro vê as cores aprovadas."],
      ["Imagens não aparecem", "No Outlook, clique em \"Baixar imagens\". O .eml leva as imagens dentro: confira no teste para você."],
      ["Fonte diferente da Santander", "No e-mail vale a fonte instalada no computador de quem lê; sem ela, Arial (alternativa, não é a oficial)."],
      ["O .eml abriu em outro programa", "Botão direito no .eml › Abrir com › Outlook."]].forEach(function (c, i) {
      var x = 65 + (i % 3) * 444, y = 200 + Math.floor(i / 3) * 272;
      G.cartaoTexto(sl, x, y, 424, 252, c[0], c[1], { eyebrow: "Problema " + (i + 7), sc: 18 });
    });
  });

  /* ================= 14 · CHECKLIST ================= */
  G.divisor("checklist", "Antes, durante e depois do envio: a lista que vale para o PF e para o PJ. Use todo mês.", "Conferiu tudo? Então pode enviar.", "Todo mês");
  G.conteudo("checklist", function (sl) {
    G.titulo(sl, "Checklist mensal", "PF e PJ", ["PF", "PJ"]);
    [["Preparar", ["Resultados aprovados pela área", "Imagens na pasta do mês, com nomes no padrão", "Logos e selos: PNG originais", "Textos organizados (Copilot, prompts 1 a 10)", "Emulador do segmento certo (PF ou PJ)"]],
      ["Editar e salvar", ["Período certo (toda a página)", "Frase do mês e campanha", "Indicadores: valor, base, variação e cor", "Sem dado: item tirado (nunca 0)", "Imagens e descrições", "Links com https://", "Nenhum texto [entre colchetes]", "Salvo como report-AAAA-MM.html", "Reaberto e conferido (computador e celular)"]],
      ["E-mail e envio", ["Link do report completo colado", "Até 4 destaques escolhidos e revisados", "Status todo verde", ".eml baixado e aberto no Outlook", "Enviado primeiro para você, testado", "Testado com uma pessoa do time", "Enviado aos destinatários da área"]]].forEach(function (col, i) {
      var x = 65 + i * 444;
      cx(sl, x, 200, 424, 535, { fill: C.br, r: 20 });
      T(sl, col[0], { x: x + 24, y: 220, w: 380, h: 30, s: 21, c: C.vm });
      col[1].forEach(function (it, j) {
        cx(sl, x + 24, 268 + j * 50, 22, 22, { line: C.vm, lw: 1.5, r: 5 });
        T(sl, it, { x: x + 58, y: 268 + j * 50, w: 345, h: 44, s: 14.5, f: "fx", b: false, c: C.txt });
      });
    });
  });

  /* ================= ENCERRAMENTO ================= */
  G.pagina("fim", null, function (sl) {
    sl.background = { color: C.vm };
    T(sl, "Pronto para o próximo mês.", { x: 76, y: 150, w: 760, h: 200, s: 72, c: C.br, ls: 0.98 });
    T(sl, "Dúvida em algum passo? Volte ao índice e vá direto à seção. Os dois emuladores ficam na mesma pasta deste guia.", { x: 76, y: 380, w: 700, h: 120, s: 24, f: "fx", b: false, c: C.br, ls: 1.25 });
    G.pilula(sl, "Voltar ao índice  →", 76, 560, 260, 50, { fill: C.br, c: C.vm, s: 19, link: { slide: 2, tooltip: "Índice" } });
    G.pilula(sl, "Emulador Report PF", 356, 560, 240, 50, { line: C.br, c: C.br, s: 17, link: { url: KIT.pf } });
    G.pilula(sl, "Emulador Report PJ", 616, 560, 240, 50, { line: C.br, c: C.br, s: 17, link: { url: KIT.pj } });
    cx(sl, 960, 98, 417, 614, { fill: C.br, r: 34 });
    var m = G.META["pj-report-celular"], esc = Math.min(377 / m.w, 574 / m.h);
    sl.addImage({ path: path.join(G.CAP, m.arquivo), x: G.I(960 + (417 - m.w * esc) / 2), y: G.I(118), w: G.I(m.w * esc), h: G.I(m.h * esc), altText: "Captura real do report PJ no celular (dados fictícios)" });
    sl.addImage({ path: G.CHAMA_BR, x: G.I(76), y: G.I(700), w: G.I(40), h: G.I(37.7) });
    T(sl, "Versão " + G.VERSAO + " · conteúdo das telas: fictício (Janeiro 2099)", { x: 130, y: 708, w: 700, h: 22, s: 13.5, f: "fx", b: false, c: C.br });
  });
};
