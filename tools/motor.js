/*
 * MOTOR DO REPORT · Creative Strategy PF
 * ======================================================================
 * Código técnico. Você NÃO precisa abrir este arquivo no dia a dia.
 * No dia a dia, edite dados/AAAA-MM.txt (conteúdo) e, raramente,
 * config/marca.txt (fontes, cores, imagens, links).
 *
 * O que este arquivo faz:
 *   1. lê os arquivos "campo: valor" (dados do mês e marca);
 *   2. confere tudo (campos, imagens, links, pendências);
 *   3. monta o modelo do e-mail e aplica no template/report.html;
 *   4. gera a versão em texto puro e o arquivo .eml (MIME).
 *
 * Roda no navegador (tools/gerar-report.html carrega este arquivo) e no
 * Node.js (testes em tests/). Sem nenhuma dependência externa.
 * ======================================================================
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Motor = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  /* Versão do projeto (veja CHANGELOG.md). Aparece na página de geração e nos arquivos gerados. */
  var VERSAO = "3.4 (2026-10-13)";

  /* =================================================================== */
  /* 1. LEITURA DOS ARQUIVOS "campo: valor"                               */
  /* =================================================================== */

  function semAcento(s) { return String(s).normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function chaveBloco(s) { return semAcento(s).trim().toUpperCase().replace(/\s+/g, " "); }
  function chaveCampo(s) { return semAcento(s).trim().toLowerCase().replace(/[\s-]+/g, "_"); }

  function problema(lista, nivel, arquivo, linha, msg) {
    lista.push({ nivel: nivel, arquivo: arquivo || "", linha: linha || 0, msg: msg });
  }

  /* Lê o texto e devolve { blocos: { "NOME": { nome, linha, campos: { campo: {valor, linha} } } }, problemas } */
  function ler(texto, arquivo) {
    var out = { arquivo: arquivo, blocos: {}, ordem: [], problemas: [] };
    var atual = null;
    /* Arquivo salvo como ANSI (e não UTF-8) chega com "�" no lugar dos acentos. */
    var ruim = String(texto).split(/\r\n|\r|\n/).map(function (l, i) { return l.indexOf("\uFFFD") >= 0 ? i + 1 : 0; }).filter(Boolean);
    if (ruim.length) problema(out.problemas, "erro", arquivo, ruim[0], "O arquivo não está salvo em UTF-8 e os acentos foram perdidos (linhas " + ruim.slice(0, 5).join(", ") + (ruim.length > 5 ? "…" : "") + "). No Bloco de Notas: Arquivo → Salvar como → Codificação: UTF-8. Depois confira os acentos dessas linhas.");
    String(texto).replace(/^﻿/, "").split(/\r\n|\r|\n/).forEach(function (bruta, i) {
      var n = i + 1, linha = bruta.trim();
      if (!linha || linha.charAt(0) === "#") return;
      var m = linha.match(/^\[([^\]]+)\]$/);
      if (m) {
        var k = chaveBloco(m[1]);
        if (out.blocos[k]) {
          problema(out.problemas, "erro", arquivo, n, "O bloco [" + m[1].trim() + "] aparece duas vezes (a 1ª vez na linha " + out.blocos[k].linha + "). Apague um ou troque o número.");
          atual = { campos: {} }; /* descarta o repetido */
          return;
        }
        atual = out.blocos[k] = { nome: m[1].trim(), chave: k, linha: n, campos: {} };
        out.ordem.push(k);
        return;
      }
      var c = linha.indexOf(":");
      if (c < 1) { problema(out.problemas, "erro", arquivo, n, "Linha sem \":\". Use o formato  campo: valor  (ou comece a linha com # para escrever um comentário)."); return; }
      if (!atual) { problema(out.problemas, "erro", arquivo, n, "Campo antes do primeiro [BLOCO]."); return; }
      var campo = chaveCampo(linha.slice(0, c));
      if (atual.campos[campo]) problema(out.problemas, "aviso", arquivo, n, "Campo \"" + campo + "\" repetido no bloco [" + atual.nome + "]: vale este, o da linha " + atual.campos[campo].linha + " é ignorado.");
      atual.campos[campo] = { valor: linha.slice(c + 1).trim(), linha: n };
    });
    return out;
  }

  /* =================================================================== */
  /* 2. ESQUEMAS: quais blocos e campos existem                           */
  /* =================================================================== */
  /* 1 = obrigatório, 0 = opcional. "max" = bloco numerado (NUMERO 1, 2…) */

  var NUM = { valor: 1, titulo: 0, detalhe: 0, variacao: 0, variacao_cor: 0 };
  var PECA = { imagem: 0, descricao_imagem: 0, enquadramento: 0, tipo: 0, link: 0 };
  function junta() { var o = {}; for (var i = 0; i < arguments.length; i++) for (var k in arguments[i]) o[k] = arguments[i][k]; return o; }

  var ESQUEMA_DADOS = [
    { bloco: "EDICAO", obrigatorio: true, campos: { mes: 1, ano: 1, proximo_mes: 1, pasta_imagens: 1, contato: 0 } },
    { bloco: "ABERTURA", obrigatorio: true, campos: { frase: 1, frase_final: 0, previa: 0 } },
    { bloco: "PROJETO PRINCIPAL", obrigatorio: true, campos: junta({ nome: 1, resumo: 0 }, PECA) },
    { bloco: "NUMERO", max: 4, campos: NUM },
    { bloco: "LANCAMOS", campos: { titulo: 0 } },
    { bloco: "DESTAQUE", campos: junta({ categoria: 0, titulo: 1, texto: 0, nota: 0 }, PECA) },
    { bloco: "RESULTADO", max: 3, campos: NUM },
    { bloco: "LANCAMENTO", max: 3, campos: junta({ status: 0, status_cor: 0, nome: 1, texto: 0 }, PECA) },
    { bloco: "CREATIVE X", campos: { subtitulo: 0, anterior: 0, atual: 1, variacao: 0, periodo: 0, referencia: 0, significado: 0 } },
    { bloco: "TRANSFORMATION", campos: { titulo: 0 } },
    { bloco: "TRANSFORMATION", max: 3, campos: junta({ status: 0, status_cor: 0, nome: 1, texto: 0, citacao: 0, resultado: 0, icones: 0 }, PECA) },
    { bloco: "APRENDIZADO", max: 3, campos: { titulo: 1, texto: 0, levamos: 0 } },
    { bloco: "FOCO", campos: { prioridade: 1, texto: 0 } },
    { bloco: "AGENDA", max: 6, campos: { data: 0, titulo: 1, detalhe: 0 } }
  ];

  var CORES = ["marca", "titulo", "texto", "texto_corpo", "texto_apoio", "positivo", "positivo_fundo", "atencao", "atencao_fundo", "fundo_pagina", "fundo_email"];
  var CORES_APOIO = ["grupo_resultados", "grupo_resultados_fundo", "grupo_evolucao", "grupo_evolucao_fundo", "grupo_aprendizado", "grupo_aprendizado_fundo",
    "capa_selo", "capa_filete", "capa_destaque", "abertura_fundo", "abertura_linha", "linha", "creative_x", "creative_x_anterior", "transformation", "transformation_titulo",
    "transformation_fundo", "transformation_linha", "transformation_placeholder_fundo", "transformation_placeholder_borda", "foco_rotulo", "foco_texto", "rodape_claro", "rodape_fundo",
    "placeholder_fundo", "placeholder_borda"];
  function obrig(lista) { var o = {}; lista.forEach(function (k) { o[k] = 1; }); return o; }

  var ESQUEMA_MARCA = [
    { bloco: "FONTES", obrigatorio: true, campos: { titulos: 1, texto: 1, impacto: 0, titulos_outlook_windows: 1, texto_outlook_windows: 1 } },
    { bloco: "LOGO", campos: { arquivo: 0, largura: 0, descricao: 0 } },
    { bloco: "CORES", obrigatorio: true, campos: obrig(CORES) },
    { bloco: "CORES DE APOIO", obrigatorio: true, campos: obrig(CORES_APOIO) },
    { bloco: "IMAGENS", obrigatorio: true, campos: { modo: 1, endereco_base: 0, qualidade_jpg: 0 } },
    { bloco: "LINKS", campos: { dominios_permitidos: 0 } },
    { bloco: "FORMIGUINHA", campos: { arquivo: 0, descricao: 0 } }
  ];

  /* Confere blocos e campos contra o esquema. Devolve { simples: {BLOCO: campos}, listas: {BLOCO: [campos…]} } */
  function conferirEsquema(lido, esquema, prob) {
    var simples = {}, listas = {};
    lido.ordem.forEach(function (k) {
      var b = lido.blocos[k], m = k.match(/^(.*?)\s+(\d+)$/), base = m ? m[1] : k, idx = m ? +m[2] : 0;
      var def = esquema.filter(function (e) { return e.bloco === base && (idx ? e.max : !e.max); })[0];
      if (!def) {
        var nomes = esquema.map(function (e) { return "[" + e.bloco + (e.max ? " 1" : "") + "]"; }).join(", ");
        problema(prob, "erro", lido.arquivo, b.linha, "Bloco [" + b.nome + "] desconhecido. Os blocos possíveis são: " + nomes + ".");
        return;
      }
      if (idx && (idx < 1 || idx > def.max)) {
        problema(prob, "erro", lido.arquivo, b.linha, "[" + b.nome + "]: cabem no máximo " + def.max + " blocos [" + base + "] (de 1 a " + def.max + ").");
        return;
      }
      Object.keys(b.campos).forEach(function (c) {
        if (!(c in def.campos)) problema(prob, "aviso", lido.arquivo, b.campos[c].linha, "Campo \"" + c + "\" não existe no bloco [" + b.nome + "] e foi ignorado. Campos possíveis: " + Object.keys(def.campos).join(", ") + ".");
      });
      Object.keys(def.campos).forEach(function (c) {
        if (def.campos[c] && !(b.campos[c] && b.campos[c].valor)) problema(prob, "erro", lido.arquivo, b.linha, "Bloco [" + b.nome + "]: o campo \"" + c + "\" é obrigatório e está vazio ou faltando.");
      });
      var v = { _linha: b.linha, _nome: b.nome, _linhas: {} };
      Object.keys(def.campos).forEach(function (c) { v[c] = b.campos[c] ? b.campos[c].valor : ""; v._linhas[c] = b.campos[c] ? b.campos[c].linha : b.linha; });
      if (idx) { (listas[base] = listas[base] || []).push({ idx: idx, v: v }); }
      else simples[base] = v;
    });
    esquema.forEach(function (e) {
      if (e.obrigatorio && !simples[e.bloco]) problema(prob, "erro", lido.arquivo, 0, "Falta o bloco [" + e.bloco + "].");
    });
    Object.keys(listas).forEach(function (k) { listas[k] = listas[k].sort(function (a, b) { return a.idx - b.idx; }).map(function (x) { return x.v; }); });
    return { simples: simples, listas: listas };
  }

  /* =================================================================== */
  /* 3. LINKS                                                             */
  /* =================================================================== */

  var CTA = {
    peca: { rotulo: "Ver peça&nbsp;&#8594;", texto: "Ver peça", alt: "Ver peça" },
    video: { rotulo: "&#9654;&nbsp;Assistir", texto: "Assistir", alt: "Assistir ao vídeo" },
    projeto: { rotulo: "Ver projeto&nbsp;&#8594;", texto: "Ver projeto", alt: "Ver projeto" },
    demo: { rotulo: "Ver demonstração&nbsp;&#8594;", texto: "Ver demonstração", alt: "Ver demonstração" }
  };
  /* Qual parte da imagem fica no recorte. */
  var ENQUADRAMENTOS = ["centro", "topo", "baixo", "esquerda", "direita"];

  function ehPendencia(s) { return /\[[^\]]*\]/.test(s); }
  /* Conteúdo PROVISÓRIO do modelo: Lorem Ipsum nos textos e "X" nos números (X%, R$ X, +X p.p., XX/XX).
     Aparece com visual de template, mas conta como pendência: a versão final só sai com dados reais. */
  var CAMPOS_NUMERICOS = ["valor", "detalhe", "variacao", "anterior", "atual", "data", "status", "resultado", "periodo", "referencia"];
  function provisorio(s, campo) {
    s = String(s || "");
    if (/\blorem\b|\bipsum\b/i.test(s)) return "texto de exemplo (Lorem Ipsum)";
    if (CAMPOS_NUMERICOS.indexOf(campo) >= 0 && /(^|[^A-Za-zÀ-ÿ])X{1,2}(?![A-Za-zÀ-ÿ])/.test(s)) return "valor de exemplo (X)";
    if (/AAAA|\bMM\b/.test(s) && campo === "pasta_imagens") return "pasta do mês (AAAA-MM)";
    return "";
  }

  /* Confere um link. Devolve [] (ok) ou [{nivel, msg}]. */
  function conferirLink(url, tipo, dominios) {
    var p = [];
    if (!url) return p;
    if (ehPendencia(url)) return [{ nivel: "pendencia", msg: "ainda não preenchido: " + url }];
    if (/^\\\\|^[a-z]:\\/i.test(url) || /^file:/i.test(url))
      return [{ nivel: "erro", msg: "é um caminho de rede ou de arquivo (" + url.slice(0, 40) + "…). Ele só abre no seu computador e o Outlook bloqueia esse tipo de endereço. Use o link de compartilhamento do SharePoint/Stream." }];
    if (/^(javascript|data|vbscript):/i.test(url)) return [{ nivel: "erro", msg: "endereço não permitido em e-mail." }];
    if (/\s/.test(url)) return [{ nivel: "erro", msg: "o link tem espaço. Copie de novo pelo botão \"Copiar link\" do SharePoint/Stream." }];
    var u;
    try { u = new URL(url); } catch (e) { return [{ nivel: "erro", msg: "não é um endereço válido. Ele precisa começar com https://" }]; }
    if (u.protocol === "http:") p.push({ nivel: "aviso", msg: "começa com http:// (sem segurança). Prefira o endereço https://." });
    else if (u.protocol !== "https:") return [{ nivel: "erro", msg: "precisa começar com https://" }];
    var host = u.hostname.toLowerCase();
    if (dominios.length && !dominios.some(function (d) { return host === d || host.slice(-(d.length + 1)) === "." + d; }))
      p.push({ nivel: "aviso", msg: "aponta para " + host + ", que não está em dominios_permitidos (config/marca.txt). Confirme que é um endereço interno aprovado." });
    if (/\/_layouts\/15\/embed|embed\.aspx|[?&]embed=|\/embed\//i.test(url))
      p.push({ nivel: "aviso", msg: "é um link de incorporação (embed). Em e-mail ele não toca; use o link de compartilhamento (\"Copiar link\")." });
    if (/[?&]download=1/i.test(url)) p.push({ nivel: "aviso", msg: "é um link de download: o arquivo baixa em vez de abrir. Use o link de compartilhamento." });
    if (/(^|\.)microsoftstream\.com$/i.test(host)) p.push({ nivel: "aviso", msg: "é do Stream (Clássico), que a Microsoft desativou. Use o link do vídeo no novo Stream (SharePoint/OneDrive)." });
    if (tipo === "video" && /\.(mp4|mov|m4v|webm)(\?|$)/i.test(u.pathname)) p.push({ nivel: "aviso", msg: "aponta direto para o arquivo de vídeo. Prefira o link de compartilhamento do Stream: abre o player com som, legendas e as permissões do arquivo." });
    return p;
  }

  /* =================================================================== */
  /* 4. HTML SEGURO                                                       */
  /* =================================================================== */

  function Seguro(s) { this.s = String(s); }
  Seguro.prototype.toString = function () { return this.s; };
  function seguro(s) { return new Seguro(s); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  /* Texto do usuário → HTML. Só <br> é aceito como marcação. */
  function textoSeguro(s) { return seguro(esc(s || "").replace(/&lt;br\s*\/?&gt;/gi, "<br>")); }
  function semBr(s) { return String(s || "").replace(/<br\s*\/?>/gi, " ").replace(/\s+/g, " ").trim(); }
  /* Números: "R$ 29" não quebra entre R$ e 29; "-12%" usa o sinal de menos tipográfico. */
  function numeroSeguro(s) { return seguro(esc(s || "").replace(/^-\s*/, "&minus;").replace(/R\$ /g, function () { return "R$&nbsp;"; })); }
  function maiusculas(s) { return String(s || "").toLocaleUpperCase("pt-BR"); }
  function categoria(s) { return seguro(esc(maiusculas(s)).replace(/\s+·\s+/g, "&nbsp;&nbsp;·&nbsp;&nbsp;")); }

  /* =================================================================== */
  /* 5. MINI-TEMPLATE (subconjunto do Mustache)                           */
  /* =================================================================== */
  /*  {{campo}}   valor (escapado, exceto o que já é HTML seguro)
      {{#campo}}…{{/campo}}  lista: repete · valor: mostra se não vazio
      {{^campo}}…{{/campo}}  mostra se vazio
      {{! comentário }}                                                  */

  function compilar(tpl) {
    tpl = tpl.replace(/\{\{![\s\S]*?\}\}/g, "");
    var re = /\{\{\s*([#^\/]?)\s*([\w.@]+)\s*\}\}/g, raiz = { filhos: [] }, pilha = [raiz], ult = 0, m;
    while ((m = re.exec(tpl))) {
      if (m.index > ult) pilha[pilha.length - 1].filhos.push(tpl.slice(ult, m.index));
      ult = re.lastIndex;
      if (m[1] === "#" || m[1] === "^") {
        var no = { tipo: m[1], nome: m[2], filhos: [] };
        pilha[pilha.length - 1].filhos.push(no); pilha.push(no);
      } else if (m[1] === "/") {
        var aberto = pilha.pop();
        if (!aberto || aberto.nome !== m[2]) throw new Error("Template: {{/" + m[2] + "}} fecha " + (aberto ? "{{#" + aberto.nome + "}}" : "nada") + ".");
      } else pilha[pilha.length - 1].filhos.push({ tipo: "v", nome: m[2] });
    }
    if (pilha.length > 1) throw new Error("Template: {{#" + pilha[pilha.length - 1].nome + "}} não foi fechado.");
    if (ult < tpl.length) raiz.filhos.push(tpl.slice(ult));
    return raiz;
  }
  function busca(nome, pilha) {
    if (nome === ".") return pilha[pilha.length - 1];
    var partes = nome.split(".");
    for (var i = pilha.length - 1; i >= 0; i--) {
      var o = pilha[i];
      if (o !== null && typeof o === "object" && !(o instanceof Seguro) && partes[0] in o) {
        for (var j = 0; j < partes.length; j++) {
          if (o === null || o === undefined || typeof o !== "object" || !(partes[j] in o)) throw new Error("Template: campo inexistente {{" + nome + "}}.");
          o = o[partes[j]];
        }
        return o;
      }
    }
    throw new Error("Template: campo inexistente {{" + nome + "}}.");
  }
  function cheio(v) { return v instanceof Seguro ? v.s !== "" : Array.isArray(v) ? v.length > 0 : !!v; }
  function saida(v) { return v === null || v === undefined || v === false ? "" : v instanceof Seguro ? v.s : typeof v === "number" ? String(v) : esc(v); }
  function desenhar(no, pilha) {
    var r = "";
    no.filhos.forEach(function (f) {
      if (typeof f === "string") { r += f; return; }
      var v = busca(f.nome, pilha);
      if (f.tipo === "v") { r += saida(v); return; }
      if (f.tipo === "^") { if (!cheio(v)) r += desenhar(f, pilha); return; }
      if (!cheio(v)) return;
      if (Array.isArray(v)) v.forEach(function (it) { r += desenhar(f, pilha.concat([it])); });
      else if (typeof v === "object" && !(v instanceof Seguro)) r += desenhar(f, pilha.concat([v]));
      else r += desenhar(f, pilha);
    });
    return r;
  }
  function aplicar(tpl, modelo) { return desenhar(compilar(tpl), [modelo]); }

  /* Remove comentários de edição, mantendo os condicionais do Outlook (<!--[if mso]>). */
  function semComentarios(html) { return html.replace(/<!--(?!\[if|<!\[endif\]|>)[\s\S]*?-->/g, ""); }

  /* =================================================================== */
  /* 6. MODELO DO E-MAIL                                                  */
  /* =================================================================== */

  /* GRADE do e-mail (computador): 600 px de conteúdo = 3 colunas de 184 px + 2 espaços de 24 px.
     Todas as seções usam essas linhas, para tudo ficar alinhado de cima a baixo. */
  var COL = 184, ESP = 24, LARGURA = 600;
  /* Divide "total" em n colunas com espaços de 24 px entre elas (a soma fecha exata). */
  function colunas(total, n) {
    var base = Math.floor((total - ESP * (n - 1)) / n), sobra = total - ESP * (n - 1) - base * n, r = [];
    for (var i = 0; i < n; i++) r.push(base + (i < sobra ? 1 : 0));
    return r;
  }

  function lerNumero(s) { var m = String(s || "").replace(/\s/g, "").match(/^(-?\d+(?:[.,]\d+)?)%?$/); return m ? parseFloat(m[1].replace(",", ".")) : null; }
  function fmtPP(n) { var r = Math.round(n * 10) / 10; return (r > 0 ? "+" : r < 0 ? "-" : "") + String(Math.abs(r)).replace(".", ",") + " p.p."; }

  /*
   * montar(entrada) → { ok, problemas, modelo, imagens, html, texto, assunto, nomeArquivo, links }
   *   entrada.dados, entrada.arquivoDados, entrada.marca, entrada.template
   *   entrada.existe(caminho) → true/false  (o arquivo existe na pasta do projeto?)
   *   entrada.medidas[caminho] → {w, h}     (tamanho real da imagem, se já lido)
   */
  function montar(entrada) {
    var prob = [];
    var arqD = entrada.arquivoDados || "dados", arqM = "config/marca.txt";
    var lidoD = ler(entrada.dados, arqD), lidoM = ler(entrada.marca, arqM);
    prob = prob.concat(lidoD.problemas, lidoM.problemas);
    var D = conferirEsquema(lidoD, ESQUEMA_DADOS, prob), M = conferirEsquema(lidoM, ESQUEMA_MARCA, prob);
    var existe = entrada.existe || function () { return true; }, medidas = entrada.medidas || {};
    if (prob.some(function (p) { return p.nivel === "erro"; })) return { ok: false, problemas: prob };

    /* ---- Marca ---- */
    var cor = {};
    var todas = junta(M.simples.CORES, M.simples["CORES DE APOIO"]);
    CORES.concat(CORES_APOIO).forEach(function (k) {
      var v = todas[k];
      if (!/^#[0-9a-f]{6}$/i.test(v)) problema(prob, "erro", arqM, todas._linhas[k], "Cor \"" + k + "\" inválida (" + v + "). Use # e 6 dígitos hexadecimais, ex.: #9E1218.");
      cor[k] = seguro(String(v).toUpperCase());
    });
    /* ---- Campos ainda não preenchidos ([INSERIR …]) ----
       No rascunho eles aparecem marcados em âmbar, para ninguém confundir com conteúdo.
       Números, scores e variações viram uma etiqueta pequena (não um número falso).
       A versão final nunca tem pendências: a ferramenta não deixa gerar. */
    var PEND = "background:" + cor.atencao_fundo + ";color:" + cor.atencao + ";border-radius:3px;";
    function marcarPendencias(html) { return html.replace(/\[[^\]<]*\]/g, function (m) { return '<span style="' + PEND + '">' + m + "</span>"; }); }
    function texto(s) { return seguro(marcarPendencias(textoSeguro(s).s)); }
    function chip(s) {
      return seguro('<span style="display:inline-block;' + PEND + "font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:15px;font-weight:bold;font-style:normal;letter-spacing:0;white-space:normal;vertical-align:middle;padding:3px 6px;border:1px dashed " + cor.placeholder_borda + ';">' + esc(s) + "</span>");
    }
    function numero(s) { return ehPendencia(s) ? chip(s) : numeroSeguro(s); }
    var F = M.simples.FONTES, fonte = {};
    if (!F.impacto) F.impacto = F.titulos;
    ["titulos", "texto", "impacto", "titulos_outlook_windows", "texto_outlook_windows"].forEach(function (k) {
      var v = F[k];
      if (/["<>;{}]/.test(v)) problema(prob, "erro", arqM, F._linhas[k], "Fonte \"" + k + "\": não use aspas duplas, ponto e vírgula nem < >. Para nomes com espaço use aspas simples: 'Nome da Fonte'.");
      if (/outlook/.test(k)) {
        var unica = v.split(",")[0].trim().replace(/^'|'$/g, "");
        if (v.indexOf(",") >= 0) problema(prob, "aviso", arqM, F._linhas[k], "\"" + k + "\": o Outlook para Windows usa só a 1ª fonte (" + unica + "). As outras foram ignoradas.");
        v = (/\s/.test(unica) ? "'" + unica + "'" : unica) + (k === "titulos_outlook_windows" ? ",serif" : ",sans-serif");
      }
      fonte[k] = seguro(v);
    });
    var I = M.simples.IMAGENS, modo = chaveCampo(I.modo);
    if (modo !== "embutidas" && modo !== "hospedadas") problema(prob, "erro", arqM, I._linhas.modo, "modo de imagens deve ser \"embutidas\" ou \"hospedadas\".");
    var base = I.endereco_base;
    if (modo === "hospedadas" && !/^https:\/\/\S+$/i.test(base)) problema(prob, "erro", arqM, I._linhas.endereco_base, "No modo hospedadas, preencha endereco_base com um endereço https:// interno (VALIDAR COM TI).");
    var qualidade = I.qualidade_jpg ? parseInt(I.qualidade_jpg, 10) : 82;
    if (!(qualidade >= 60 && qualidade <= 95)) { problema(prob, "aviso", arqM, I._linhas.qualidade_jpg, "qualidade_jpg deve ficar entre 60 e 95. Usei 82."); qualidade = 82; }
    var dominios = ((M.simples.LINKS || {}).dominios_permitidos || "").split(",").map(function (d) { return d.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, ""); }).filter(Boolean);

    /* ---- Pendências: qualquer [texto entre colchetes] nos dados ---- */
    lidoD.ordem.forEach(function (k) {
      var b = lidoD.blocos[k];
      Object.keys(b.campos).forEach(function (c) {
        var v = b.campos[c].valor, m = v.match(/\[[^\]]*\]/g), pv = provisorio(v, c);
        if (m && c !== "link" && c !== "imagem") problema(prob, "pendencia", arqD, b.campos[c].linha, "[" + b.nome + "] " + c + ": " + m.join(" "));
        else if (pv) problema(prob, "pendencia", arqD, b.campos[c].linha, "[" + b.nome + "] " + c + ": " + pv + ". Troque pelo conteúdo do mês.");
        if (/<(?!br\s*\/?>)[a-z\/!]/i.test(v)) problema(prob, "aviso", arqD, b.campos[c].linha, "[" + b.nome + "] " + c + ": o texto tem uma marcação HTML. Só <br> é aceito; o resto aparece como texto.");
      });
    });

    /* ---- Imagens ---- */
    var E = D.simples.EDICAO, pasta = E.pasta_imagens.replace(/\\/g, "/").replace(/^\.?\/+|\/+$/g, "");
    var imagens = [], porCaminho = {};
    function caminhoImagem(nome) { return nome.indexOf("/") >= 0 ? nome.replace(/^\.?\/+/, "") : pasta + "/" + nome; }
    /* Registra uma imagem do e-mail. w/h = tamanho na tela (px). recorte = encaixa exatamente em w × h.
       fluida = no celular ocupa a largura da tela, então é exportada com até 700 px. */
    function imagem(caminho, w, h, op) {
      op = op || {};
      var med = medidas[caminho];
      if (!h && med) h = Math.round(w * med.h / med.w);
      var chave = caminho + "|" + w + "|" + (h || "") + "|" + (op.play ? 1 : 0) + "|" + (op.ancora || "");
      var reg = porCaminho[chave];
      if (!reg) {
        reg = { id: imagens.length + 1, caminho: caminho, w: w, h: h || 0, recorte: !!op.recorte, play: !!op.play, papel: op.papel || "", fluida: !!op.fluida, ancora: op.ancora || "centro" };
        reg.token = "@@IMG" + reg.id + "@@";
        imagens.push(reg); porCaminho[chave] = reg;
      }
      return { src: seguro(reg.token), w: w, h: h || "", alt: op.alt || "" };
    }
    /* Espaço da imagem ainda não escolhida: superfície Lisboa com a indicação do formato (só no rascunho). */
    function placeholder(w, h, rotulo, raio, video) {
      var bg = cor.placeholder_fundo.s, bd = cor.placeholder_borda.s, larg = typeof w === "number" ? w + "px" : w;
      return seguro('<table role="presentation" width="' + w + '" cellpadding="0" cellspacing="0" border="0" style="width:' + larg + ';"><tr>' +
        '<td height="' + h + '" align="center" valign="middle" bgcolor="' + bg + '" style="height:' + h + "px;background:" + bg + ";border:1px solid " + bd + ";border-radius:" + raio + 'px;">' +
        '<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:14px;font-weight:bold;color:' + cor.marca.s + ';letter-spacing:1.5px;">' + (video ? "&#9654; VÍDEO" : "IMAGEM") + "</p>" +
        '<p style="margin:3px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:9px;line-height:12px;color:' + cor.texto_apoio.s + ';">' + esc(rotulo) + "</p></td></tr></table>");
    }

    /* Peça (imagem + link + CTA) de um item */
    function peca(v, nomeBloco, w, h, raio, op, tipoPadrao) {
      var tipo = chaveCampo(v.tipo || tipoPadrao || "peca");
      if (!CTA[tipo]) { problema(prob, "erro", arqD, v._linhas.tipo, "[" + nomeBloco + "] tipo \"" + v.tipo + "\" não existe. Use: peca, video, projeto ou demo."); tipo = "peca"; }
      var link = v.link || "", r = { tipo: tipo, img: null, img_m: null, placeholder: null, placeholder_m: null, cta: seguro(""), link: "" };
      conferirLink(link, tipo, dominios).forEach(function (x) { problema(prob, x.nivel, arqD, v._linhas.link, "[" + nomeBloco + "] link: " + x.msg); });
      var href = !link || ehPendencia(link) || /^(javascript|data|vbscript|file):/i.test(link) || /^\\\\|^[a-z]:\\/i.test(link) ? "" : link;
      if (link && !href) {
        /* Link ainda não preenchido (só no rascunho): mostra onde o botão vai ficar, sem ser clicável. */
        r.cta = seguro('<span title="Link ainda não definido" style="color:' + ((op && op.corCtaPendente) || cor.texto_apoio) + ';font-weight:bold;white-space:nowrap;">' + CTA[tipo].rotulo + "</span>");
      } else if (href) {
        r.link = href;
        r.cta = seguro('<a href="' + esc(href) + '" target="_blank" class="cta" style="color:' + ((op && op.corCta) || cor.marca.s) + ';font-weight:bold;text-decoration:none;white-space:nowrap;">' + CTA[tipo].rotulo + "</a>");
      } else if (link === "" && v.tipo !== undefined) {
        problema(prob, "info", arqD, v._linhas.link, "[" + nomeBloco + "] sem link: a peça aparece sem \"" + CTA[tipo].texto + "\".");
      }
      var nome = v.imagem || "", desc = v.descricao_imagem || semBr(v.nome || v.titulo || "");
      if (nome && ehPendencia(nome)) {
        r.placeholder = placeholder(w, h || Math.round(w * 1.6), (op && op.dica) || (w * 2) + " px de largura", raio, tipo === "video");
        if (op && op.celular) r.placeholder_m = placeholder("100%", op.celular.h, "horizontal no celular", raio, tipo === "video");
        problema(prob, "pendencia", arqD, v._linhas.imagem, "[" + nomeBloco + "] imagem: " + nome);
      } else if (nome) {
        var cam = caminhoImagem(nome);
        if (!existe(cam)) problema(prob, "erro", arqD, v._linhas.imagem, "[" + nomeBloco + "] imagem não encontrada: " + cam + ". Confira o nome do arquivo (maiúsculas, acentos, extensão .jpg/.png).");
        var alt = (tipo === "video" ? "Vídeo: " : "") + desc + (href ? " (" + CTA[tipo].alt.toLowerCase() + ")" : "");
        var anc = chaveCampo(v.enquadramento || "centro");
        if (ENQUADRAMENTOS.indexOf(anc) < 0) { problema(prob, "aviso", arqD, v._linhas.enquadramento, "[" + nomeBloco + "] enquadramento deve ser " + ENQUADRAMENTOS.join(", ") + ". Usei centro."); anc = "centro"; }
        r.img = imagem(cam, w, h, { recorte: !!h, play: tipo === "video", alt: alt, papel: nomeBloco, fluida: !!(op && op.fluida), ancora: anc });
        r.img.link = href;
        /* Versão para celular (outro formato, ex.: horizontal no lugar da vertical) */
        if (op && op.celular) { r.img_m = imagem(cam, op.celular.w, op.celular.h, { recorte: true, play: tipo === "video", alt: alt, papel: nomeBloco + " (celular)", fluida: true, ancora: op.celular.ancora || anc }); r.img_m.link = href; }
      }
      return r;
    }
    function comCta(txt, p) {
      var t = texto(txt).s, c = p.cta.s;
      return seguro(t && c ? t + " " + c : t || c);
    }
    function etiqueta(texto_, corNome, simbolo) {
      var verde = chaveCampo(corNome || "verde") !== "ambar";
      /* Etiqueta: não quebra no computador; no celular pode quebrar (classe wrap-m) para nunca vazar da tela. */
      return seguro('<span class="wrap-m" style="display:inline-block;background:' + (verde ? cor.positivo_fundo : cor.atencao_fundo) + ";color:" + (verde ? cor.positivo : cor.atencao) +
        ';font-weight:bold;padding:0 7px;border-radius:999px;white-space:' + (ehPendencia(texto_) ? "normal" : "nowrap") + ';">' + simbolo + " " + texto(texto_).s + "</span>");
    }
    function variacao(v, nomeBloco) {
      if (!v.variacao) return seguro("");
      if (ehPendencia(v.variacao)) return chip(v.variacao);
      if (v.variacao_cor && ["verde", "ambar"].indexOf(chaveCampo(v.variacao_cor)) < 0) problema(prob, "aviso", arqD, v._linhas.variacao_cor, "[" + nomeBloco + "] variacao_cor deve ser verde ou ambar.");
      var desce = /^[-−]/.test(v.variacao);
      var t = v.variacao.replace(/^[-−]\s*/, "");
      var verde = chaveCampo(v.variacao_cor || "verde") !== "ambar";
      return seguro('<span style="display:inline-block;background:' + (verde ? cor.positivo_fundo : cor.atencao_fundo) + ";color:" + (verde ? cor.positivo : cor.atencao) +
        ';font-weight:bold;padding:0 7px;border-radius:999px;white-space:nowrap;">' + (desce ? "&#9660; &minus;" : "&#9650; ") + esc(t) + "</span>");
    }
    function status(v, nomeBloco) {
      if (!v.status) return seguro("");
      curto(v, "status", 30, nomeBloco);
      var c = chaveCampo(v.status_cor || "ambar");
      if (["verde", "ambar"].indexOf(c) < 0) problema(prob, "aviso", arqD, v._linhas.status_cor, "[" + nomeBloco + "] status_cor deve ser verde ou ambar.");
      return etiqueta(v.status, c, c === "verde" ? "&#9679;" : "&#9675;");
    }
    function curto(v, campo, max, nomeBloco) {
      var s = semBr(v[campo]);
      if (s.length > max && !ehPendencia(s)) problema(prob, "aviso", arqD, v._linhas[campo], "[" + nomeBloco + "] " + campo + " com " + s.length + " caracteres (recomendado até " + max + "). Pode quebrar em mais linhas.");
    }
    /* Formiguinha (config/marca.txt, bloco [FORMIGUINHA]): o arquivo original, no encerramento (rodapé). */
    var FM = M.simples.FORMIGUINHA || {}, camFormiga = (FM.arquivo || "").replace(/\\/g, "/").replace(/^\.?\/+/, "");
    if (camFormiga && !existe(camFormiga)) { problema(prob, "erro", arqM, FM._linhas.arquivo, "Formiguinha não encontrada: " + camFormiga + ". Confira o nome do arquivo em config/marca.txt."); camFormiga = ""; }
    function formiga(w, papel) { return camFormiga ? imagem(camFormiga, w, 0, { alt: FM.descricao || "Formiguinha", papel: papel }) : null; }

    /* Logo (config/marca.txt, bloco [LOGO]) */
    var LG = M.simples.LOGO || {}, logo = null, rodapeLogo = null;
    if (LG.arquivo) {
      var lw = parseInt(LG.largura || "32", 10);
      if (!(lw >= 20 && lw <= 200)) { problema(prob, "aviso", arqM, LG._linhas.largura, "Logo: largura deve ficar entre 20 e 200 px. Usei 32."); lw = 32; }
      var lc = LG.arquivo.replace(/\\/g, "/").replace(/^\.?\/+/, "");
      if (existe(lc)) {
        logo = { img: imagem(lc, lw, 0, { alt: LG.descricao || "Santander", papel: "logo" }), placeholder: null };
        rodapeLogo = imagem(lc, lw, 0, { alt: LG.descricao || "Santander", papel: "logo" });
      }
      else {
        problema(prob, "pendencia", arqM, LG._linhas.arquivo, "Logo não encontrado: " + lc + ". Salve o logo oficial (versão branca, PNG) nesse caminho ou ajuste o nome em config/marca.txt.");
        logo = { img: null, placeholder: seguro('<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td height="20" align="center" valign="middle" style="height:20px;width:' + lw + "px;border:1px dashed " + cor.foco_rotulo.s +
          ';border-radius:4px;"><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:9px;line-height:12px;font-weight:bold;color:' + cor.foco_rotulo.s + ';letter-spacing:1.5px;">LOGO</p></td></tr></table>') };
      }
    }

    var A = D.simples.ABERTURA, P = D.simples["PROJETO PRINCIPAL"], L = D.listas;
    var mes = E.mes.trim(), ano = E.ano.trim(), prox = E.proximo_mes.trim();
    var periodoOk = mesNumero(mes) > 0 && /^\d{4}$/.test(ano);
    if (!ehPendencia(mes) && !mesNumero(mes)) problema(prob, "pendencia", arqD, E._linhas.mes, "[EDICAO] mes: escreva o nome do mês (ex.: Outubro).");
    if (!ehPendencia(ano) && !/^\d{4}$/.test(ano)) problema(prob, "pendencia", arqD, E._linhas.ano, "[EDICAO] ano: escreva o ano com 4 dígitos (ex.: 2026).");
    if (!ehPendencia(prox) && !mesNumero(prox)) problema(prob, "pendencia", arqD, E._linhas.proximo_mes, "[EDICAO] proximo_mes: escreva o nome do mês seguinte (ex.: Novembro).");
    curto(A, "frase", 28, "ABERTURA");
    var secoes = 0;
    function proxSecao() { secoes++; return (secoes < 10 ? "0" : "") + secoes; }

    /* 01 · Abertura */
    var pp = peca(P, "PROJETO PRINCIPAL", COL, COL, 20, { dica: "368 x 368 px", fluida: true, corCta: "#FFFFFF", corCtaPendente: "#F5DECF" });
    var nums = (L.NUMERO || []);
    /* Grade: até 3 números, um por coluna de 184 px (alinhados com as seções de baixo); 4 números, 4 colunas iguais. */
    var larg = nums.length <= 3 ? nums.map(function () { return COL; }) : colunas(LARGURA, nums.length);
    var sobra = nums.length && nums.length < 3 ? LARGURA - nums.length * COL - (nums.length - 1) * ESP : 0;
    var abertura = {
      n: proxSecao(), frase: texto(A.frase), frase_final: texto(A.frase_final),
      nome: texto(P.nome), resumo_cta: comCta(P.resumo, pp), peca: pp,
      numeros: nums.map(function (v, i) {
        curto(v, "valor", 11, "NUMERO " + (i + 1));
        return {
          valor: numero(v.valor), titulo: texto(v.titulo), detalhe: texto(v.detalhe), variacao: variacao(v, "NUMERO " + (i + 1)),
          largura: larg[i], principal: i === 0, primeiro: i === 0,
          cor_valor: i === 0 ? cor.marca : cor.texto, cor_filete: i === 0 ? cor.marca : cor.texto,
          classe_m: nums.length === 3 ? "third" : "half",
          estilo: "padding:0 0 20px 0;"
        };
      }),
      sobra: sobra
    };

    /* 02 · O que lançamos */
    var DS = D.simples.DESTAQUE, lanc = L.LANCAMENTO || [], res = L.RESULTADO || [];
    var lancamos = null;
    if (DS || lanc.length) {
      /* Destaque: peça na coluna 1 (184 x 300, recortada) e texto nas colunas 2 e 3 (392 px). */
      /* No celular a coluna da peça some; a mesma imagem entra em formato horizontal, na largura da tela, acima do texto. */
      var dsp = DS ? peca(DS, "DESTAQUE", COL, 300, 20, { dica: "368 x 600 px", celular: { w: 350, h: 200 } }) : null;
      var textoDestaque = dsp && (dsp.img || dsp.placeholder) ? LARGURA - COL - ESP : LARGURA;
      var lr = res.length ? colunas(textoDestaque, res.length) : [];
      var lc = lanc.length ? colunas(LARGURA, lanc.length) : [];
      lancamos = {
        n: proxSecao(), titulo: texto((D.simples.LANCAMOS || {}).titulo || ""), tem_compactos: lanc.length > 0, colunas_compactos: lanc.length * 2 - 1,
        destaque: DS ? {
          categoria: seguro(marcarPendencias(categoria(DS.categoria).s)), titulo: texto(DS.titulo), texto_cta: comCta(DS.texto, dsp), peca: dsp, nota: texto(DS.nota), tem_resultados: res.length > 0,
          largura_texto: textoDestaque, colunas: res.length * 3 - 2,
          resultados: res.map(function (v, i) {
            return {
              valor: numero(v.valor), titulo: texto(v.titulo), detalhe: texto(v.detalhe), variacao: variacao(v, "RESULTADO " + (i + 1)),
              largura: lr[i], primeiro: i === 0, estilo: "padding:14px 0 0 0;", classe_m: res.length === 3 ? "third" : "half"
            };
          })
        } : null,
        compactos: lanc.map(function (v, i) {
          var nb = "LANCAMENTO " + (i + 1), p = peca(v, nb, COL, 72, 20, { dica: "700 x 274 px", fluida: true }), ult = i === lanc.length - 1;
          return { status: status(v, nb), nome: texto(v.nome), texto_cta: comCta(v.texto, p), peca: p, largura: lc[i], primeiro: i === 0, classe: ult ? "col" : "col gap" };
        })
      };
    }

    /* 03 · Creative X */
    var CX = D.simples["CREATIVE X"], cx = null;
    if (CX) {
      var at = lerNumero(CX.atual), an = lerNumero(CX.anterior);
      if (at === null && !provisorio(CX.atual, "atual") && !ehPendencia(CX.atual)) problema(prob, "aviso", arqD, CX._linhas.atual, "[CREATIVE X] atual \"" + CX.atual + "\" não é um número em %: a barra fica vazia.");
      var vari = CX.variacao, dif = at !== null && an !== null ? at - an : null;
      if (!vari && dif === null && !ehPendencia(CX.anterior) && !ehPendencia(CX.atual)) problema(prob, "pendencia", arqD, CX._linhas.variacao, "[CREATIVE X] variacao: preencha \"anterior\" com um número em % (ou escreva a variação).");
      /* Sem os dois números, nada é calculado: aparece a etiqueta [INSERIR EVOLUÇÃO], nunca um valor inventado. */
      if (!vari) vari = dif !== null ? fmtPP(dif) : "[INSERIR EVOLUÇÃO]";
      var queda = /^[-−]/.test(vari), pend = ehPendencia(vari);
      var barra = at === null ? 0 : Math.max(1, Math.min(99, Math.round(at)));
      cx = {
        n: proxSecao(), subtitulo: texto(CX.subtitulo), anterior: numero(CX.anterior), atual: numero(CX.atual),
        variacao: pend ? chip(vari) : seguro(esc(vari).replace(/^[-−]\s*/, "&minus;")), variacao_pendente: pend,
        variacao_cor: queda ? cor.atencao : cor.positivo, variacao_fundo: queda ? cor.atencao_fundo : cor.positivo_fundo,
        periodo: texto(CX.periodo), referencia: texto(CX.referencia), significado: texto(CX.significado),
        tem_barra: barra > 0, barra: barra + "%", resto: (100 - barra) + "%"
      };
    }

    /* 04 · Creative Transformation */
    var tr = L.TRANSFORMATION || [], transformation = null;
    if (tr.length) {
      transformation = {
        n: proxSecao(), titulo: texto((D.simples.TRANSFORMATION || {}).titulo || ""),
        projetos: tr.map(function (v, i) {
          var nb = "TRANSFORMATION " + (i + 1), p = peca(v, nb, 68, 52, 8, { dica: "136 x 104 px" }, "projeto");
          var icones = (v.icones || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean).map(function (ic, j) {
            var cam = "assets/icones/" + ic.replace(/\.png$/i, "") + ".png";
            if (!existe(cam)) problema(prob, "erro", arqD, v._linhas.icones, "[" + nb + "] ícone não encontrado: " + cam);
            var im = imagem(cam, 32, 32, { alt: "", papel: "icone" });
            im.margem = j ? "margin-left:4px;" : "";
            return im;
          });
          return {
            status: status(v, nb), nome: texto(v.nome), texto_cta: comCta(v.texto, p), citacao: texto(v.citacao), resultado: texto(v.resultado),
            icones: icones, peca: p, tem_visual: icones.length > 0 || !!p.img || !!p.placeholder,
            borda: i < tr.length - 1 ? "border-bottom:1px solid " + cor.transformation_linha.s + ";" : ""
          };
        })
      };
    }

    /* 05 · O que aprendemos */
    var ap = L.APRENDIZADO || [], aprendizados = null;
    if (ap.length) {
      var la = colunas(LARGURA, ap.length);
      aprendizados = {
        n: proxSecao(),
        itens: ap.map(function (v, i) {
          var ult = i === ap.length - 1;
          return {
            numero: i + 1, titulo: texto(v.titulo), texto: texto(v.texto), levamos: texto(v.levamos), largura: la[i], primeiro: i === 0, classe: ult ? "col" : "col gap"
          };
        })
      };
    }

    /* 06 · Foco */
    var FO = D.simples.FOCO, foco = FO ? {
      n: proxSecao(), mes: texto(maiusculas(prox)), prioridade: texto(FO.prioridade), texto: texto(FO.texto)
    } : null;

    /* 07 · Também vem aí */
    var ag = L.AGENDA || [], agenda = null;
    if (ag.length) {
      var linhas = [];
      for (var i = 0; i < ag.length; i += 3) {
        var celulas = ag.slice(i, i + 3).map(function (v, j) {
          var m = String(v.data || "").trim().match(/^(\d{1,2}|XX?)\s+(\S.*)$/);
          return {
            dia: m ? m[1] : "", mes: m ? maiusculas(m[2]) : "", rotulo: m ? "" : texto(maiusculas(v.data || "")),
            titulo: texto(v.titulo), detalhe: texto(v.detalhe), vazio: false, primeiro: j === 0
          };
        });
        while (celulas.length < 3) celulas.push({ vazio: true, primeiro: false });
        linhas.push({ celulas: celulas, filete: i === 0 ? cor.texto : cor.linha });
      }
      agenda = { n: proxSecao(), linhas: linhas };
    }

    var assunto = "Creative Strategy PF | Report de " + mes + " " + ano;
    var modelo = {
      assunto: assunto, previa: texto(A.previa || semBr(A.frase + " " + A.frase_final)),
      logo: logo, rodape_logo: rodapeLogo, rodape_formiga: formiga(64, "formiguinha"), edicao: texto(maiusculas(mes + " " + ano)), proximo_mes: prox, proximo_mes_minusculo: texto(ehPendencia(prox) ? prox : prox.toLocaleLowerCase("pt-BR")), contato: texto(E.contato),
      cor: cor, fonte: fonte,
      abertura: abertura, lancamos: lancamos, cx: cx, transformation: transformation, aprendizados: aprendizados, foco: foco, agenda: agenda
    };

    if (prob.some(function (p) { return p.nivel === "erro"; })) return { ok: false, problemas: prob };

    var html;
    try { html = aplicar(semComentarios(entrada.template), modelo).replace(/\n[ \t]*\n(\s*\n)+/g, "\n\n"); }
    catch (e) { problema(prob, "erro", "template/report.html", 0, e.message); return { ok: false, problemas: prob }; }

    /* Links do report (para a lista de "testar antes de enviar") */
    var links = [];
    function regLink(onde, p) { if (p && p.link) links.push({ onde: onde, tipo: p.tipo, rotulo: CTA[p.tipo].texto, url: p.link }); }
    regLink("Projeto principal · " + semBr(P.nome), pp);
    if (lancamos) {
      if (lancamos.destaque) regLink("Destaque · " + semBr(DS.titulo), lancamos.destaque.peca);
      lanc.forEach(function (v, i) { regLink("Lançamento " + (i + 1) + " · " + semBr(v.nome), lancamos.compactos[i].peca); });
    }
    if (transformation) tr.forEach(function (v, i) { regLink("Transformation " + (i + 1) + " · " + semBr(v.nome), transformation.projetos[i].peca); });

    /* Nome do arquivo: report-AAAA-MM (no modelo em branco, report-MODELO). */
    var slug = periodoOk ? ano + "-" + String(mesNumero(mes)).padStart(2, "0") : "MODELO";
    return {
      ok: true, problemas: prob, modelo: modelo, imagens: imagens, html: html, links: links,
      texto: textoPuro(D, links), assunto: assunto, nomeArquivo: ("report-" + slug).replace(/[^\w-]/g, ""),
      config: { modo: modo, base: base, qualidade: qualidade / 100, dominios: dominios, corMarca: cor.marca.s }
    };
  }

  var MESES = ["janeiro", "fevereiro", "marco", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  function mesNumero(m) { return MESES.indexOf(chaveCampo(m)) + 1; }

  /* =================================================================== */
  /* 7. VERSÃO EM TEXTO PURO (vai junto no .eml)                          */
  /* =================================================================== */
  /* Quem não vê HTML (alguns leitores, pré-visualizações, acessibilidade)
     recebe o mesmo conteúdo em texto, com os links escritos por extenso. */
  function textoPuro(D, links) {
    var S = D.simples, L = D.listas, o = [];
    function t(s) { return semBr(s); }
    function num(v) { return "- " + t(v.valor) + (v.titulo ? " · " + t(v.titulo) : "") + (v.detalhe ? " (" + t(v.detalhe) + ")" : "") + (v.variacao ? " · " + t(v.variacao) : ""); }
    function lk(v) { return v.link && !ehPendencia(v.link) ? "  " + (CTA[chaveCampo(v.tipo || "peca")] || CTA.peca).texto + ": " + v.link : ""; }
    var E = S.EDICAO;
    o.push("CREATIVE STRATEGY PF · REPORT MENSAL · " + maiusculas(E.mes + " " + E.ano), "");
    o.push(t(S.ABERTURA.frase + " " + S.ABERTURA.frase_final), "");
    o.push("PROJETO PRINCIPAL: " + t(S["PROJETO PRINCIPAL"].nome), t(S["PROJETO PRINCIPAL"].resumo));
    (L.NUMERO || []).forEach(function (v) { o.push(num(v)); });
    var l = lk(S["PROJETO PRINCIPAL"]); if (l) o.push(l);
    if (S.DESTAQUE || (L.LANCAMENTO || []).length) {
      o.push("", "O QUE LANÇAMOS" + (S.LANCAMOS && S.LANCAMOS.titulo ? ": " + t(S.LANCAMOS.titulo) : ""));
      if (S.DESTAQUE) {
        o.push("", t(S.DESTAQUE.titulo) + (S.DESTAQUE.categoria ? " (" + t(S.DESTAQUE.categoria) + ")" : ""), t(S.DESTAQUE.texto));
        (L.RESULTADO || []).forEach(function (v) { o.push(num(v)); });
        l = lk(S.DESTAQUE); if (l) o.push(l);
      }
      (L.LANCAMENTO || []).forEach(function (v) { o.push("", t(v.nome) + (v.status ? " · " + t(v.status) : ""), t(v.texto)); l = lk(v); if (l) o.push(l); });
    }
    if (S["CREATIVE X"]) { var c = S["CREATIVE X"]; o.push("", "CREATIVE X: " + (c.anterior ? t(c.anterior) + " -> " : "") + t(c.atual) + (c.periodo ? " (" + t(c.periodo) + ")" : ""), t(c.referencia), t(c.significado)); }
    if ((L.TRANSFORMATION || []).length) {
      o.push("", "CREATIVE TRANSFORMATION");
      L.TRANSFORMATION.forEach(function (v) { o.push("", t(v.nome) + (v.status ? " · " + t(v.status) : ""), t(v.texto)); if (v.resultado) o.push("Resultado: " + t(v.resultado)); l = lk(v); if (l) o.push(l); });
    }
    if ((L.APRENDIZADO || []).length) { o.push("", "O QUE APRENDEMOS"); L.APRENDIZADO.forEach(function (v, i) { o.push((i + 1) + ". " + t(v.titulo) + ": " + t(v.texto) + (v.levamos ? " Levamos: " + t(v.levamos) : "")); }); }
    if (S.FOCO) o.push("", "FOCO DE " + maiusculas(E.proximo_mes) + ": " + t(S.FOCO.prioridade), t(S.FOCO.texto));
    if ((L.AGENDA || []).length) { o.push("", "TAMBÉM VEM AÍ"); L.AGENDA.forEach(function (v) { o.push("- " + t(v.data) + " · " + t(v.titulo) + (v.detalhe ? " (" + t(v.detalhe) + ")" : "")); }); }
    o.push("", "Até " + E.proximo_mes.toLowerCase() + ".", E.contato ? "Dúvidas, sugestões ou pedidos: " + t(E.contato) : "");
    return o.filter(function (x, i, a) { return !(x === "" && a[i - 1] === ""); }).join("\r\n").trim() + "\r\n";
  }

  /* =================================================================== */
  /* 8. CONFERÊNCIA DE COMPATIBILIDADE DO HTML FINAL                      */
  /* =================================================================== */
  var REGRAS = [
    [/<script/i, "erro", "Tem <script>: nenhum Outlook executa JavaScript."],
    [/<(video|audio|iframe|embed|object|form)\b/i, "erro", "Tem vídeo, iframe ou formulário: o Outlook remove. Use miniatura + link."],
    [/display\s*:\s*(flex|grid)/i, "erro", "Usa flex/grid: o Outlook para Windows ignora."],
    [/position\s*:\s*(absolute|fixed|relative)/i, "erro", "Usa position: o Outlook ignora."],
    [/background-image|url\(/i, "erro", "Imagem de fundo: o Outlook para Windows não mostra."],
    [/rgba?\(/i, "erro", "Cor em rgb()/rgba(): use hexadecimal (#9E1218)."],
    [/src="data:/i, "erro", "Imagem em base64 dentro do HTML: o Outlook bloqueia."],
    [/@import|<link\b|@font-face/i, "erro", "Fonte ou CSS externo: o Outlook não carrega. Use fontes instaladas (config/marca.txt)."],
    [/src="(file:|\\\\|[a-z]:\\)/i, "erro", "Imagem apontando para arquivo local ou caminho de rede: o destinatário não vê e o Outlook bloqueia."],
    [/href="(file:|\\\\|[a-z]:\\)/i, "erro", "Link para arquivo local ou caminho de rede: não abre para o destinatário."],
    [/<img(?![^>]*\bwidth=")[^>]*>/i, "erro", "Imagem sem o atributo width: o Outlook pode mostrar no tamanho original."],
    [/<img(?![^>]*\balt=")[^>]*>/i, "erro", "Imagem sem alt: quem bloqueia imagens não vê nada no lugar."],
    [/href="#/i, "pendencia", "Link ainda sem endereço (#…)."]
  ];
  function conferirHtml(html) {
    var r = [];
    REGRAS.forEach(function (x) { if (x[0].test(html)) r.push({ nivel: x[1], msg: x[2] }); });
    var t = tamanhoUtf8(html);
    if (t > 102 * 1024) r.push({ nivel: "aviso", msg: "HTML com " + Math.round(t / 1024) + " KB: acima de ~100 KB alguns clientes cortam a mensagem." });
    return r;
  }

  /* =================================================================== */
  /* 9. ARQUIVO .EML (MIME)                                               */
  /* =================================================================== */

  function utf8(s) { return typeof TextEncoder !== "undefined" ? new TextEncoder().encode(s) : Uint8Array.from(Buffer.from(s, "utf8")); }
  function tamanhoUtf8(s) { return utf8(s).length; }
  var B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  function base64(bytes) {
    var r = "", i;
    for (i = 0; i + 2 < bytes.length; i += 3) {
      var n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
      r += B64[n >> 18 & 63] + B64[n >> 12 & 63] + B64[n >> 6 & 63] + B64[n & 63];
    }
    if (i < bytes.length) {
      var a = bytes[i], b = i + 1 < bytes.length ? bytes[i + 1] : 0, m = (a << 16) | (b << 8);
      r += B64[m >> 18 & 63] + B64[m >> 12 & 63] + (i + 1 < bytes.length ? B64[m >> 6 & 63] : "=") + "=";
    }
    return r;
  }
  function quebra76(s) { return s.replace(/.{1,76}/g, "$&\r\n"); }
  /* Assunto com acentos: palavras codificadas (RFC 2047) de no máximo 75 caracteres cada. */
  function assuntoMime(s) {
    if (/^[\x20-\x7e]*$/.test(s)) return s;
    var partes = [], atual = "";
    Array.from(s).forEach(function (ch) {
      if (utf8(atual + ch).length > 42) { partes.push(atual); atual = ""; }
      atual += ch;
    });
    if (atual) partes.push(atual);
    return partes.map(function (p) { return "=?UTF-8?B?" + base64(utf8(p)) + "?="; }).join("\r\n ");
  }
  function tipoMime(nome) {
    var ext = nome.split(".").pop().toLowerCase();
    return { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif" }[ext] || "application/octet-stream";
  }

  /*
   * gerarEml({ assunto, html, texto, imagens: [{ cid, nome, bytes }], semente })
   *   Estrutura:  multipart/alternative
   *                 ├─ text/plain           (versão em texto, com links)
   *                 └─ multipart/related
   *                      ├─ text/html       (o report)
   *                      └─ image/* (cid)   (imagens embutidas)
   */
  function gerarEml(o) {
    var s = o.semente || Date.now().toString(36);
    var b1 = "=_alt_" + s, b2 = "=_rel_" + s;
    var L = [
      "X-Unsent: 1",
      "Subject: " + assuntoMime(o.assunto),
      "MIME-Version: 1.0",
      "Content-Language: pt-BR",
      'Content-Type: multipart/alternative; boundary="' + b1 + '"',
      "",
      "This is a multi-part message in MIME format.",
      "",
      "--" + b1,
      'Content-Type: text/plain; charset="utf-8"',
      "Content-Transfer-Encoding: base64",
      "",
      quebra76(base64(utf8(o.texto || ""))),
      "--" + b1,
      'Content-Type: multipart/related; boundary="' + b2 + '"; type="text/html"',
      "",
      "--" + b2,
      'Content-Type: text/html; charset="utf-8"',
      "Content-Transfer-Encoding: base64",
      "",
      quebra76(base64(utf8(o.html)))
    ];
    (o.imagens || []).forEach(function (im) {
      /* Cabeçalhos dobrados (linha seguinte começa com espaço) para nenhuma linha passar de 78 caracteres. */
      L.push("--" + b2, "Content-Type: " + tipoMime(im.nome) + ";", ' name="' + im.nome + '"', "Content-Transfer-Encoding: base64",
        "Content-ID: <" + im.cid + ">", "Content-Disposition: inline;", ' filename="' + im.nome + '"', "", quebra76(base64(im.bytes)));
    });
    L.push("--" + b2 + "--", "", "--" + b1 + "--", "");
    return L.join("\r\n");
  }

  /* Troca os marcadores @@IMGn@@ pelo endereço final de cada imagem. */
  function trocarImagens(html, fn) { return html.replace(/@@IMG(\d+)@@/g, function (m, id) { return fn(+id); }); }

  /* =================================================================== */
  /* 10. ZIP SIMPLES (sem compressão) para o modo "hospedadas"            */
  /* =================================================================== */
  var CRC = (function () { var t = [], c; for (var n = 0; n < 256; n++) { c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(b) { var c = 0xFFFFFFFF; for (var i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function zip(arquivos) {
    var partes = [], central = [], pos = 0;
    function u16(v) { return [v & 255, v >> 8 & 255]; }
    function u32(v) { return [v & 255, v >> 8 & 255, v >> 16 & 255, v >>> 24 & 255]; }
    arquivos.forEach(function (f) {
      var nome = utf8(f.nome), crc = crc32(f.bytes), n = f.bytes.length;
      var loc = [].concat(u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(0), u16(0), u32(crc), u32(n), u32(n), u16(nome.length), u16(0));
      partes.push(Uint8Array.from(loc), nome, f.bytes);
      central.push([].concat(u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0), u32(crc), u32(n), u32(n), u16(nome.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(pos)), nome);
      pos += loc.length + nome.length + n;
    });
    var tamCentral = 0;
    central.forEach(function (c) { var b = c instanceof Uint8Array ? c : Uint8Array.from(c); partes.push(b); tamCentral += b.length; });
    partes.push(Uint8Array.from([].concat(u32(0x06054b50), u16(0), u16(0), u16(arquivos.length), u16(arquivos.length), u32(tamCentral), u32(pos), u16(0))));
    var total = partes.reduce(function (s, p) { return s + p.length; }, 0), out = new Uint8Array(total), o = 0;
    partes.forEach(function (p) { out.set(p, o); o += p.length; });
    return out;
  }

  return {
    VERSAO: VERSAO, ler: ler, montar: montar, aplicar: aplicar, conferirLink: conferirLink, conferirHtml: conferirHtml,
    gerarEml: gerarEml, trocarImagens: trocarImagens, semComentarios: semComentarios,
    base64: base64, utf8: utf8, zip: zip, crc32: crc32, assuntoMime: assuntoMime, tipoMime: tipoMime,
    CTA: CTA, ESQUEMA_DADOS: ESQUEMA_DADOS, ESQUEMA_MARCA: ESQUEMA_MARCA, seguro: seguro, texto: textoSeguro
  };
});
