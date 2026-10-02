/* =====================================================================
   TEMPLATE DO REPORT · Creative Strategy PF
   ---------------------------------------------------------------------
   Layout fixo (fiel ao report original). Conteúdo vem do JSON do mês.
   Funciona no navegador (gerador.html) e no Node (build.js), sem
   dependências. Duas saídas a partir do mesmo conteúdo:

   renderEmail(conteudo, opcoes) → HTML de e-mail: tabelas + estilos
     inline, sem JavaScript, sem flex/grid, sem vídeo embutido.
     Compatível com Outlook clássico (motor do Word), novo Outlook,
     Outlook na Web e apps móveis.
   renderWeb(conteudo, opcoes)   → página web interativa (vídeo em
     modal, ampliação de imagens). Para publicar no SharePoint.

   opcoes.src(caminho)        → como cada imagem é referenciada
                                (caminho relativo, "cid:..." ou URL).
   opcoes.emailThumb(caminho) → caminho da miniatura com play gravado.
   ===================================================================== */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.ReportTemplate = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* ---------- Tokens do layout original ---------- */
  var RED = "#9E1218", RED_LINE = "#C34A50", INK = "#1A1A1A", TEXT = "#2B2B2B",
      GRAY = "#5C5C5C", MUTED = "#7A7A7A", RULE = "#D6D6D6", SOFT = "#F3EFED";
  var FONT = "Arial, Helvetica, sans-serif";

  /* ---------- Utilitários ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function rich(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"); }
  function isUrl(s) { return /^https?:\/\//i.test(String(s || "").trim()); }
  function isPlaceholder(s) { return /\[[^\]]*\]/.test(String(s || "")); }
  function upper(s) { return String(s || "").toLocaleUpperCase("pt-BR"); }
  function num(v) {
    if (typeof v === "number") return v;
    var m = String(v || "").replace(/\./g, "").replace(",", ".").match(/-?\d+(\.\d+)?/);
    return m && !isPlaceholder(v) ? parseFloat(m[0]) : NaN;
  }
  function fmtAcessos(v) {
    var n = num(v);
    if (!isNaN(n) && typeof v === "number") return n.toLocaleString("pt-BR") + " acessos";
    return esc(v);
  }
  function extractIframeSrc(s) {
    var m = String(s || "").match(/<iframe[^>]*?\ssrc\s*=\s*["']([^"']+)["']/i);
    return m ? m[1].replace(/&amp;/g, "&") : String(s || "").trim();
  }
  function videoMap(c) {
    var map = {};
    ((c.videos && c.videos.itens) || []).forEach(function (v) { map[v.id] = v; });
    return map;
  }
  /* Top vídeos: ordena por acessos quando todos são números */
  function topVideos(c) {
    var t = c.topVideos || {}; if (t.mostrar === false) return [];
    var map = videoMap(c);
    var list = (t.videos || []).map(function (id) { return map[id]; }).filter(Boolean);
    var allNum = list.length && list.every(function (v) { return !isNaN(num(v.acessos)) && typeof v.acessos === "number"; });
    if (allNum) list = list.slice().sort(function (a, b) { return b.acessos - a.acessos; });
    return list;
  }

  /* ---------- Validação: placeholders e itens pendentes ---------- */
  function validate(c) {
    var pend = [];
    (function walk(o, path) {
      if (Array.isArray(o)) { o.forEach(function (v, i) { walk(v, path + "[" + i + "]"); }); return; }
      if (o && typeof o === "object") { Object.keys(o).forEach(function (k) { if (k.charAt(0) !== "_") walk(o[k], path ? path + "." + k : k); }); return; }
      if (typeof o === "string" && isPlaceholder(o)) pend.push({ campo: path, valor: o });
    })(c, "");
    ((c.videos && c.videos.itens) || []).forEach(function (v, i) {
      if (!isUrl(v.link)) pend.push({ campo: "videos.itens[" + i + "].link", valor: "sem link do Stream: no e-mail a miniatura não fica clicável" });
    });
    return pend;
  }
  /* Lista todas as imagens usadas (para gerar anexos inline / checar peso) */
  function collectImages(c) {
    var out = [];
    function add(src, kind) { if (src && out.every(function (x) { return x.src !== src; })) out.push({ src: src, kind: kind || "imagem" }); }
    add(c.imagens && c.imagens.formiga && c.imagens.formiga.src);
    var r = c.resultados || {};
    (r.cases || []).forEach(function (cs) { if (cs.midia && cs.midia.src) add(cs.midia.src); });
    if (r.excelencia) { add(r.excelencia.logo && r.excelencia.logo.src); add(r.excelencia.imagem && r.excelencia.imagem.src); }
    var vm = videoMap(c);
    if (c.abertura && c.abertura.mostrar !== false && vm[c.abertura.video]) add(vm[c.abertura.video].thumb, "video");
    ((c.temas && c.temas.itens) || []).forEach(function (t) {
      var m = t.midia || {};
      if (m.tipo === "imagem") add(m.src);
      if (m.tipo === "video" && vm[m.video]) add(vm[m.video].thumb, "video");
      if (m.tipo === "icones") (m.itens || []).forEach(function (i) { add(i.src); });
    });
    topVideos(c).forEach(function (v) { add(v.thumb, "video"); });
    ((c.vemAi && c.vemAi.itens) || []).forEach(function (i) { if (i.imagem) add(i.imagem.src); });
    return out;
  }
  function playVersion(p) { return String(p || "").replace(/(\.[a-z0-9]+)$/i, "-play$1"); }

  /* =====================================================================
     E-MAIL (Outlook-safe)
     Regras: tabelas, estilos inline, larguras fixas em px com fallback
     mso, cores em hexadecimal, nenhuma imagem de fundo, nenhum script.
     ===================================================================== */
  function renderEmail(c, opt) {
    opt = opt || {};
    var src = opt.src || function (p) { return p; };
    var thumb = opt.emailThumb || function (p) { return playVersion(p); }; /* devolve caminho; src() é aplicado depois */
    var W = 800, PAD = 36, CW = W - PAD * 2; /* 728 */
    var m = c.meta || {}, vm = videoMap(c);

    function f(size, weight, color, lh, extra) {
      return "font-family:" + FONT + ";font-size:" + size + "px;line-height:" + lh + "px;font-weight:" + (weight || 400) +
        ";color:" + color + ";mso-line-height-rule:exactly;" + (extra || "");
    }
    /* Outlook clássico: espaçamento confiável só com margin em <p> e padding em <td> */
    function p(html, style) { return '<p style="margin:0;' + String(style || "").replace(/padding-top:/g, "margin-top:") + '">' + html + "</p>"; }
    function gap(px, html) { return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="padding-top:' + px + 'px;">' + html + "</td></tr></table>"; }
    function img(path, w, h, alt, extra) {
      return '<img src="' + esc(src(path)) + '" width="' + w + '"' + (h ? ' height="' + h + '"' : "") + ' alt="' + esc(alt || "") +
        '" style="display:block;border:0;outline:none;text-decoration:none;width:' + w + "px;" + (h ? "height:" + h + "px;" : "height:auto;") + "max-width:100%;" + (extra || "") + '"' + (w >= 150 ? ' class="fluid"' : "") + ">";
    }
    function table(inner, attrs) {
      return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" ' + (attrs || 'width="100%"') + ">" + inner + "</table>";
    }
    function rule(h, color, pad) {
      return '<tr><td class="px" style="padding:' + (pad || "0 " + PAD + "px") + '">' +
        table('<tr><td height="' + h + '" bgcolor="' + color + '" style="height:' + h + "px;background:" + color + ';font-size:0;line-height:0;">&nbsp;</td></tr>') + "</td></tr>";
    }
    function sectionHead(numero, titulo) {
      return '<tr><td class="px" style="padding:12px ' + PAD + 'px 14px;">' +
        '<span style="' + f(18, 700, RED, 22) + '">' + esc(numero) + "</span>&nbsp;&nbsp;&nbsp;" +
        '<span style="' + f(11, 700, INK, 22, "letter-spacing:1px;") + '">' + esc(upper(titulo)) + "</span></td></tr>";
    }
    function bullet(tipo) {
      return '<span style="' + f(9, 400, RED, 14) + '">' + (tipo === "feito" ? "&#9679;" : "&#9675;") + "</span>&nbsp;";
    }
    function videoThumb(v, w, h, alt) {
      var im = img(v.thumb ? thumb(v.thumb) : "", w, h, alt || "Assistir ao vídeo: " + v.titulo);
      return isUrl(v.link) ? '<a href="' + esc(v.link) + '" target="_blank" style="text-decoration:none;">' + im + "</a>" : im;
    }

    var out = [];
    /* --- Cabeçalho do documento --- */
    out.push('<!DOCTYPE html>\n<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta http-equiv="X-UA-Compatible" content="IE=edge">\n<meta name="x-apple-disable-message-reformatting">\n<meta name="color-scheme" content="light">\n<meta name="supported-color-schemes" content="light">\n<title>' + esc(m.assuntoEmail || (m.time + " · " + m.rotulo + " " + m.mes + " " + m.ano)) + "</title>\n" +
      "<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>" +
      "<style>table,td,p,span,a,h1{font-family:Arial,Helvetica,sans-serif !important;}</style><![endif]-->\n" +
      "<style>\n  body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}\n  table{border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;}\n  img{-ms-interpolation-mode:bicubic;}\n  a{color:" + RED + ";}\n" +
      "  @media only screen and (max-width:620px){\n    .container{width:100% !important;}\n    .px{padding-left:18px !important;padding-right:18px !important;}\n    .full{width:100% !important;}\n    .col{display:block !important;width:100% !important;border-left:0 !important;padding-left:0 !important;padding-right:0 !important;padding-bottom:18px !important;}\n    .fluid{width:100% !important;height:auto !important;}\n    .col.pad{padding:14px 18px !important;}\n    .pad table{width:100% !important;}\n    .h1{font-size:30px !important;line-height:34px !important;}\n    .hide-m{display:none !important;}\n  }\n</style>\n</head>\n");
    out.push('<body style="margin:0;padding:0;background:#EFEFEF;" bgcolor="#EFEFEF">\n');
    out.push('<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#EFEFEF;">' + esc(m.preheader || "") + "&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>\n");
    out.push(table('<tr><td align="center" style="padding:16px 0;">' +
      '<!--[if mso]><table role="presentation" width="' + W + '" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->' +
      '<table role="presentation" class="container" width="' + W + '" cellpadding="0" cellspacing="0" border="0" bgcolor="#FFFFFF" style="width:' + W + 'px;max-width:' + W + 'px;background:#FFFFFF;">', 'width="100%" bgcolor="#EFEFEF"').replace(/<\/table>$/, ""));

    /* --- Barra vermelha + cabeçalho com a formiga --- */
    out.push('<tr><td height="10" bgcolor="' + RED + '" style="height:10px;background:' + RED + ';font-size:0;line-height:0;">&nbsp;</td></tr>');
    var ant = c.imagens && c.imagens.formiga;
    out.push('<tr><td class="px" style="padding:26px ' + PAD + 'px 0;">' + table("<tr>" +
      '<td valign="top" style="padding-top:6px;">' +
      '<h1 class="h1" style="margin:0;' + f(38, 700, RED, 42, "letter-spacing:-1px;") + '">' + esc(m.time) + "</h1>" +
      p(esc(upper(m.rotulo)) + " | " + esc(upper(m.mes + " " + m.ano)), "padding-top:8px;" + f(15, 700, INK, 20)) +
      p(esc(m.subtitulo), "padding-top:6px;" + f(12, 400, GRAY, 17)) + "</td>" +
      (ant ? '<td valign="top" align="right" width="88" style="width:88px;">' + img(ant.src, 80, 102, ant.alt) + "</td>" : "") +
      "</tr>") + "</td></tr>");
    out.push(rule(2, INK, "16px " + PAD + "px 0"));

    /* --- Abertura editorial + vídeo-resumo do mês (herdado da versão 1) --- */
    var A = c.abertura;
    if (A && A.mostrar !== false) {
      var av = vm[A.video];
      var manchete = (A.manchete || []).map(function (l, i, arr) {
        return p(esc(l), f(40, 700, i === arr.length - 1 ? RED : INK, 42, "letter-spacing:-1.5px;"));
      }).join("");
      var chamada = '<span style="' + f(12, 700, RED, 16) + '">&#9654;</span>&nbsp;&nbsp;' + esc(A.chamada || "Assistir");
      var vidCell = av ? '<td valign="top" class="col" width="340" style="width:340px;">' + videoThumb(av, 340, Math.round(340 / 1.7787), "Assistir: " + av.titulo) +
        gap(9, isUrl(av.link) ? '<a href="' + esc(av.link) + '" target="_blank" style="' + f(12, 700, INK, 16, "text-decoration:none;") + '">' + chamada + " &#8250;</a>" : p(chamada, f(12, 700, INK, 16))) +
        p(esc(av.duracao) + " · resumo em vídeo no Stream", "padding-top:2px;" + f(10.5, 400, MUTED, 14)) + "</td>" : "";
      out.push('<tr><td class="px" style="padding:24px ' + PAD + 'px 4px;">' + table('<tr><td valign="middle" class="col" style="padding-right:28px;">' + manchete +
        p(rich(A.resumo), "padding-top:14px;" + f(13.5, 400, TEXT, 20)) + "</td>" + vidCell + "</tr>") + "</td></tr>");
      out.push(rule(1, RULE, "20px " + PAD + "px 0"));
    }

    /* --- 01 Principais resultados --- */
    var R = c.resultados || {};
    out.push(sectionHead("01", R.titulo || "Principais resultados"));
    var imp = R.impacto || {}, grupos = R.grupos || [];
    var gCells = grupos.map(function (g, gi) {
      var k = (g.kpis || []).map(function (kp) {
        return '<td valign="top" style="padding:10px 10px 0 0;">' + p(esc(kp.valor), f(26, 700, "#FFFFFF", 30, "white-space:nowrap;")) +
          p(esc(kp.rotulo), "padding-top:3px;" + f(11, 700, "#FFFFFF", 14)) + "</td>";
      }).join("");
      return '<td valign="top" class="col pad"' + (gi ? "" : ' width="218" style="width:218px;') + (gi ? ' style="' : "") + 'padding:18px 6px 18px ' + (gi ? 10 : 16) + 'px;">' +
        table('<tr><td style="border-left:' + (gi ? "0" : "1px solid " + RED_LINE) + ";padding-left:" + (gi ? 0 : 16) + 'px;">' +
          table('<tr><td style="border-bottom:1px solid ' + RED_LINE + ';padding-bottom:5px;">' + p(esc(g.rotulo), f(10, 400, "#FFFFFF", 14, "white-space:nowrap;")) + "</td></tr><tr><td>" + table("<tr>" + k + "</tr>") + "</td></tr>") +
          "</td></tr>") + "</td>";
    }).join("");
    out.push('<tr><td class="px" style="padding:0 ' + PAD + 'px;">' + table('<tr><td valign="top" class="col pad" width="196" style="width:196px;padding:18px 0 18px 18px;">' +
      p(esc(imp.rotulo), f(11, 400, "#FFFFFF", 15)) + p(esc(imp.valor), "padding-top:6px;" + f(30, 700, "#FFFFFF", 34, "letter-spacing:-.5px;white-space:nowrap;")) +
      p(esc(imp.legenda), "padding-top:6px;" + f(11, 400, "#FFFFFF", 15)) + "</td>" + gCells + "</tr>", 'width="100%" bgcolor="' + RED + '" style="background:' + RED + ';"') + "</td></tr>");

    /* Cases 1.1 e 1.2 */
    var cases = R.cases || [];
    function caseCell(cs, i) {
      var linhas = (cs.linhas || []).map(function (l) {
        return '<tr><td style="border-top:1px solid ' + RULE + ';padding:7px 0;" width="78">' + p(esc(l.rotulo), f(11.5, 400, TEXT, 16)) + "</td>" +
          '<td style="border-top:1px solid ' + RULE + ';padding:7px 0;">' + p('<span style="' + f(11.5, 400, MUTED, 16) + '">' + esc(l.de) + " &#8594; </span>" +
            '<span style="' + f(21, 700, RED, 24) + '">' + esc(l.para) + "</span>", f(11.5, 400, MUTED, 24)) + "</td></tr>";
      }).join("");
      var mid = cs.midia || {};
      return '<td valign="top" class="col" width="' + (CW / 2 - 17) + '" style="width:' + (CW / 2 - 17) + "px;padding:" + (i ? "18px 0 0 16px;border-left:1px solid " + RULE : "18px 16px 0 0") + ';">' +
        p(esc(cs.numero), f(11, 700, RED, 15)) + p(esc(cs.titulo), "padding-top:4px;" + f(14.5, 700, INK, 19)) +
        table('<tr>' + (mid.src ? '<td valign="top" width="80" style="width:80px;padding:10px 12px 0 0;" class="hide-m">' + img(mid.src, 80, 162, mid.alt) + "</td>" : "") +
          '<td valign="top" style="padding-top:10px;">' + p("O que foi feito", f(10, 400, MUTED, 13)) + p(rich(cs.feito), "padding-top:3px;" + f(11.5, 400, TEXT, 16)) +
          table('<tr><td style="padding:9px 0 4px;">' + p(esc(cs.resultadoRotulo || "Resultado"), f(10, 400, MUTED, 13)) + '</td><td align="right" style="padding:9px 0 4px;">' +
            p(esc(cs.resultadoDestaque || ""), f(10, 700, RED, 13)) + "</td></tr>") + table(linhas) +
          (cs.nota ? p(esc(cs.nota), "padding-top:6px;" + f(9.5, 400, MUTED, 13)) : "") + "</td></tr>") + "</td>";
    }
    out.push('<tr><td class="px" style="padding:0 ' + PAD + 'px;">' + table("<tr>" + cases.map(caseCell).join("") + "</tr>") + "</td></tr>");

    /* 1.3 Excelência criativa */
    var X = R.excelencia;
    if (X) {
      var scores = (X.scores || []).map(function (s, i) {
        return '<td valign="middle" class="col pad" style="padding:14px 14px;' + (i ? "border-left:1px solid " + RULE + ";" : "") + '">' + table("<tr>" +
          '<td valign="middle" style="padding-right:10px;">' + p(esc(s.valor), f(38, 700, RED, 40, "letter-spacing:-1px;white-space:nowrap;")) + "</td>" +
          '<td valign="middle">' + p(esc(s.titulo), f(11, 700, INK, 14)) + p(rich(s.texto), "padding-top:2px;" + f(11, 400, TEXT, 14)) + "</td></tr>") + "</td>";
      }).join("");
      out.push('<tr><td class="px" style="padding:20px ' + PAD + 'px 0;">' + table("<tr>" +
        '<td valign="top" class="col pad" width="150" bgcolor="' + RED + '" style="width:150px;background:' + RED + ';padding:12px 14px;">' +
        p(esc(X.numero + " " + X.titulo), f(11, 700, "#FFFFFF", 14)) + p(esc(X.subtitulo), f(11, 700, "#FFFFFF", 14)) +
        (X.logo && X.logo.src ? gap(10, img(X.logo.src, 122, 36, X.logo.alt)) : "") + "</td>" + scores +
        (X.imagem && X.imagem.src ? '<td valign="top" width="160" class="hide-m" style="width:160px;">' + img(X.imagem.src, 160, 85, X.imagem.alt) + "</td>" : "") +
        "</tr>", 'width="100%" style="border:1px solid ' + RULE + ';"') + "</td></tr>");
    }

    /* --- 02 Principais temas --- */
    out.push(rule(2, INK, "22px " + PAD + "px 0"));
    var T = c.temas || {}, itens = T.itens || [];
    out.push(sectionHead("02", T.titulo || "Principais temas"));
    var colW = Math.floor((CW - 3 * 33) / 4); /* 157 */
    var temaCells = itens.map(function (t, i) {
      var mid = t.midia || {}, media = "";
      if (mid.tipo === "imagem") media = img(mid.src, colW, Math.round(colW / 2.54), mid.alt);
      else if (mid.tipo === "video" && vm[mid.video]) media = videoThumb(vm[mid.video], colW, Math.round(colW / 2.54));
      else if (mid.tipo === "icones") media = table("<tr>" + (mid.itens || []).map(function (ic) {
        return '<td align="center" valign="top" style="padding:8px 4px;">' + img(ic.src, 34, 34, "", "margin:0 auto;") + p(esc(ic.rotulo), "padding-top:4px;" + f(10.5, 700, INK, 13)) + "</td>";
      }).join("") + "</tr>", 'width="100%" bgcolor="' + SOFT + '" style="background:' + SOFT + ';"');
      var status = (t.status || []).map(function (s) { return p(bullet(s.tipo) + esc(s.texto), f(10, 400, GRAY, 15)); }).join("");
      var quotes = (t.citacoes || []).map(function (q) { return p("&#8220;" + esc(q) + "&#8221;", "padding-top:6px;" + f(10.5, 400, GRAY, 14, "font-style:italic;")); }).join("");
      return '<td valign="top" class="col" width="' + colW + '" style="width:' + colW + "px;" + (i ? "border-left:1px solid " + RULE + ";padding-left:16px;" : "") + (i < itens.length - 1 ? "padding-right:16px;" : "") + '">' +
        p(esc(t.numero), f(11, 700, RED, 15)) + p(esc(t.titulo), "padding-top:3px;" + f(13.5, 700, INK, 18)) +
        (t.observacao ? p(esc(t.observacao), f(10.5, 400, GRAY, 15)) : "") +
        gap(8, status) + gap(8, media) +
        (t.texto ? p(rich(t.texto), "padding-top:8px;" + f(11, 400, TEXT, 15)) : "") + quotes + "</td>";
    }).join("");
    out.push('<tr><td class="px" style="padding:0 ' + PAD + 'px;">' + table("<tr>" + temaCells + "</tr>") + "</td></tr>");

    /* --- Top vídeos do mês (opcional; estilo "cinema" herdado da versão 1) --- */
    var tv = topVideos(c);
    if (tv.length) {
      var cine = c.topVideos.estilo === "cinema";
      var K = cine ? { bg: "#120D0C", title: "#FFFFFF", rank: "#FF4D42", txt: "#F7F1EC", meta: "#C9BFB9", cta: "#FF8A80" } : { bg: "#FFFFFF", title: INK, rank: RED, txt: INK, meta: GRAY, cta: RED };
      var inner = cine ? CW - 40 : CW, vw = Math.floor((inner - 2 * 16) / 3);
      var vCells = tv.slice(0, 3).map(function (v, i) {
        var cta = isUrl(v.link) ? '<a href="' + esc(v.link) + '" target="_blank" style="' + f(11, 700, K.cta, 15, "text-decoration:none;") + '">Assistir no Stream &#8250;</a>' : p("[link do Stream pendente]", f(10, 400, K.meta, 15));
        return '<td valign="top" class="col" width="' + vw + '" style="width:' + vw + "px;" + (i < 2 ? "padding-right:16px;" : "") + '">' +
          table('<tr><td valign="top" width="34" style="width:34px;">' + p(String(i + 1).padStart(2, "0"), f(20, 700, K.rank, 22)) + '</td><td valign="top">' +
            p(esc(v.titulo), f(12, 700, K.txt, 16)) + p(fmtAcessos(v.acessos) + " · " + esc(v.duracao), "padding-top:2px;" + f(10.5, 400, K.meta, 14)) + "</td></tr>") +
          gap(10, videoThumb(v, vw, Math.round(vw / 2.54))) + gap(7, cta) + "</td>";
      }).join("");
      var head = '<span style="' + f(13, 700, K.rank, 22) + '">&#9654;</span>&nbsp;&nbsp;<span style="' + f(11, 700, K.title, 22, "letter-spacing:1px;") + '">' + esc(upper(c.topVideos.titulo || "Top vídeos do mês")) + "</span>";
      if (cine) {
        out.push('<tr><td class="px" style="padding:26px ' + PAD + 'px 0;">' + table('<tr><td class="pad" style="padding:18px 20px 4px;">' + head + "</td></tr>" +
          '<tr><td class="pad" style="padding:10px 20px 20px;">' + table("<tr>" + vCells + "</tr>") + "</td></tr>", 'width="100%" bgcolor="' + K.bg + '" style="background:' + K.bg + ';"') + "</td></tr>");
      } else {
        out.push(rule(1, RULE, "22px " + PAD + "px 0"));
        out.push('<tr><td class="px" style="padding:12px ' + PAD + 'px 12px;">' + head + "</td></tr>");
        out.push('<tr><td class="px" style="padding:0 ' + PAD + 'px;">' + table("<tr>" + vCells + "</tr>") + "</td></tr>");
      }
    }

    /* --- 03 Vem aí: linha do tempo --- */
    out.push(rule(2, INK, "22px " + PAD + "px 0"));
    var V = c.vemAi || {}, vi = V.itens || [];
    out.push(sectionHead("03", V.titulo || "Vem aí"));
    var n = vi.length || 1, cellW = Math.floor(CW / n);
    var line = vi.map(function (it, i) {
      var dot = it.marcador === "cheio" ? "&#9679;" : "&#9675;";
      var last = i === n - 1;
      return '<td width="' + cellW + '" style="width:' + cellW + 'px;">' + table("<tr>" +
        '<td width="14" style="width:14px;' + f(15, 400, RED, 14) + '">' + dot + "</td>" +
        '<td valign="middle">' + table('<tr><td height="2" style="height:0;font-size:0;line-height:0;border-top:2px ' + (last ? "dashed" : "solid") + " " + RED + ';">&nbsp;</td></tr>') + "</td></tr>") + "</td>";
    }).join("");
    var cont = vi.map(function (it) {
      return '<td valign="top" class="col" width="' + cellW + '" style="width:' + cellW + 'px;padding:6px 10px 0 0;">' +
        p(esc(it.numero + " · " + it.data), f(10, 700, RED, 14)) + p(esc(it.titulo), "padding-top:3px;" + f(12, 700, INK, 15)) +
        p(rich(it.texto), "padding-top:3px;" + f(10.5, 400, GRAY, 14)) +
        (it.imagem && it.imagem.src ? gap(8, img(it.imagem.src, cellW - 10, Math.round((cellW - 10) / 2.48), it.imagem.alt)) : "") + "</td>";
    }).join("");
    out.push('<tr><td class="px" style="padding:2px ' + PAD + 'px 0;">' + table('<tr class="hide-m">' + line + "</tr>") + table("<tr>" + cont + "</tr>") + "</td></tr>");

    /* --- Versão interativa (botão compatível com Outlook via VML) --- */
    var li = c.links && c.links.versaoInterativa;
    if (isUrl(li)) {
      out.push('<tr><td class="px" align="left" style="padding:26px ' + PAD + 'px 0;">' +
        '<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="' + esc(li) + '" style="height:40px;v-text-anchor:middle;width:300px;" arcsize="50%" stroke="f" fillcolor="' + RED + '"><center style="color:#ffffff;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;">Abrir a versão interativa &#8250;</center></v:roundrect><![endif]-->' +
        '<!--[if !mso]><!--><a href="' + esc(li) + '" target="_blank" style="display:inline-block;background:' + RED + ";border-radius:20px;padding:11px 24px;" + f(13, 700, "#FFFFFF", 18, "text-decoration:none;") + '">Abrir a versão interativa &#8250;</a><!--<![endif]-->' + "</td></tr>");
    }

    /* --- Rodapé (com encerramento escuro herdado da versão 1, se ativo) --- */
    var rd = c.rodape || {}, En = c.encerramento;
    if (En && En.mostrar !== false) {
      out.push('<tr><td style="padding-top:34px;"></td></tr>');
      out.push('<tr><td class="px" bgcolor="#1B1716" style="background:#1B1716;padding:30px ' + PAD + 'px 0;">' + table("<tr>" +
        '<td valign="bottom" class="col">' + p(esc(En.texto) + '<span style="color:#FF4D42;">.</span>', f(38, 700, "#FFFFFF", 42, "letter-spacing:-1px;")) +
        (En.nota ? p(esc(En.nota), "padding-top:8px;" + f(12, 400, "#B9AEA8", 17)) : "") + "</td>" +
        (ant ? '<td valign="bottom" align="right" width="92" class="hide-m" style="width:92px;">' + table('<tr><td bgcolor="#FFFFFF" style="background:#FFFFFF;padding:4px;">' + img(ant.src, 72, 92, ant.alt) + "</td></tr>", 'align="right"') + "</td>" : "") +
        "</tr>") + "</td></tr>");
      out.push('<tr><td class="px" bgcolor="#1B1716" style="background:#1B1716;padding:22px ' + PAD + 'px 24px;">' + table('<tr><td style="border-top:1px solid #3A3533;padding-top:12px;">' +
        p(esc(rd.esquerda), f(10, 700, "#B9AEA8", 14)) + '</td><td align="right" style="border-top:1px solid #3A3533;padding-top:12px;">' + p(esc(rd.direita), f(10, 700, "#B9AEA8", 14)) + "</td></tr>") + "</td></tr>");
    } else {
      out.push(rule(1, RULE, "34px " + PAD + "px 0"));
      out.push('<tr><td class="px" style="padding:10px ' + PAD + 'px 22px;">' + table("<tr>" +
        "<td>" + p(esc(rd.esquerda), f(10, 700, GRAY, 14)) + '</td><td align="right">' + p(esc(rd.direita), f(10, 700, GRAY, 14)) + "</td></tr>") + "</td></tr>");
    }
    out.push('</table><!--[if mso]></td></tr></table><![endif]--></td></tr></table>\n</body>\n</html>\n');
    return out.join("\n");
  }

  /* =====================================================================
     WEB (versão interativa, mesmo layout)
     ===================================================================== */
  var WEB_CSS = [
    ":root{--red:" + RED + ";--red-line:#C9585D;--ink:" + INK + ";--text:" + TEXT + ";--gray:" + GRAY + ";--muted:" + MUTED + ";--rule:" + RULE + ";--soft:" + SOFT + ";",
    "--font:'Santander Text','Segoe UI',Arial,Helvetica,sans-serif;--maxw:1286px;--gut:clamp(16px,4.5vw,64px)}",
    "*,*::before,*::after{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#fff;color:var(--text);font-family:var(--font);-webkit-font-smoothing:antialiased}",
    "img{display:block;max-width:100%}p,h1,h2,h3{margin:0}a{color:inherit}",
    ":focus-visible{outline:3px solid var(--ink);outline-offset:3px}",
    ".bar{position:sticky;top:0;z-index:20;height:10px;background:var(--red)}.bar i{position:absolute;inset:0 auto 0 0;width:0;background:#6E0C10}",
    ".page{max-width:calc(var(--maxw) + 2*var(--gut));margin:0 auto;padding:0 var(--gut) 40px}",
    "header.top{display:grid;grid-template-columns:1fr auto;gap:24px;padding-top:clamp(24px,4vw,46px)}",
    "h1{color:var(--red);font-size:clamp(36px,4.7vw,66px);line-height:1.05;letter-spacing:-.025em;font-weight:800;margin-top:clamp(8px,2vw,28px)}",
    ".rep{font-size:clamp(16px,1.7vw,24px);font-weight:800;color:var(--ink);margin-top:10px}.sub{font-size:clamp(14px,1.2vw,17px);color:var(--gray);margin-top:10px}",
    ".ant{width:clamp(84px,9.7vw,137px)}.ant img{width:100%;height:auto}",
    ".rule{height:2px;background:var(--ink);margin-top:22px}.rule.thin{height:1px;background:var(--rule)}",
    ".sec{display:flex;align-items:baseline;gap:16px;padding:14px 0 18px}.sec b{color:var(--red);font-size:clamp(22px,2vw,28px);font-weight:800}.sec span{font-size:clamp(13px,1.2vw,17px);font-weight:800;letter-spacing:.06em;color:var(--ink)}",
    ".band{background:var(--red);color:#fff;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr) minmax(0,1.35fr);gap:0 clamp(16px,2.4vw,32px);padding:clamp(18px,2.2vw,30px) clamp(18px,2.3vw,32px)}",
    ".band .lab{font-size:clamp(13px,1.1vw,15px)}.band .big{font-size:clamp(36px,4.1vw,58px);font-weight:800;letter-spacing:-.02em;line-height:1.1;margin:6px 0 8px;white-space:nowrap}.band .leg{font-size:clamp(13px,1.1vw,15px);line-height:1.45}",
    ".band .grp{border-left:1px solid var(--red-line);padding-left:clamp(16px,2.4vw,32px)}.band .grp+.grp{border-left:0;padding-left:0}",
    ".band .gl{font-size:clamp(12px,1vw,14px);border-bottom:1px solid var(--red-line);padding-bottom:8px}",
    ".kpis{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:12px;margin-top:12px}.kpi .v{font-size:clamp(28px,3.4vw,48px);font-weight:800;line-height:1.1;white-space:nowrap}.kpi .l{font-size:clamp(12px,1.05vw,15px);font-weight:700;margin-top:6px;line-height:1.25}",
    ".cases{display:grid;grid-template-columns:1fr 1fr;margin-top:26px}.case{padding-right:32px}.case+.case{padding:0 0 0 32px;border-left:1px solid var(--rule)}",
    ".k{color:var(--red);font-size:14px;font-weight:800}.case h2{font-size:clamp(19px,1.75vw,25px);font-weight:800;color:var(--ink);margin-top:8px;line-height:1.25}",
    ".cbody{display:grid;grid-template-columns:clamp(96px,11.5vw,160px) 1fr;gap:clamp(14px,1.8vw,24px);margin-top:16px}.cbody .cimg img{width:100%;height:auto}",
    ".mini{font-size:14px;color:var(--muted)}.feito{font-size:clamp(14px,1.2vw,16.5px);line-height:1.5;margin-top:4px;color:var(--text)}.feito strong,.q strong{color:var(--ink)}",
    ".rhead{display:flex;justify-content:space-between;gap:12px;margin-top:16px;padding-bottom:6px}.rhead b{color:var(--red);font-size:14px}",
    ".rrow{display:grid;grid-template-columns:7.5em 1fr;align-items:center;border-top:1px solid var(--rule);padding:10px 0;font-size:clamp(14px,1.2vw,16.5px)}",
    ".rrow .de{color:var(--muted)}.rrow .para{color:var(--red);font-weight:800;font-size:clamp(24px,2.5vw,36px);letter-spacing:-.01em}.note{font-size:13px;color:var(--muted);margin-top:6px}",
    ".exc{display:grid;grid-template-columns:minmax(150px,.75fr) 1fr 1fr minmax(0,1fr);border:1px solid var(--rule);margin-top:26px;min-height:148px}",
    ".exc .red{background:var(--red);color:#fff;padding:20px;font-size:15px;font-weight:700;line-height:1.4}.exc .red img{margin-top:14px;width:100%;max-width:204px}",
    ".score{display:flex;align-items:center;gap:18px;padding:16px 24px}.score+.score{border-left:1px solid var(--rule)}.score .v{color:var(--red);font-size:clamp(46px,5.2vw,74px);font-weight:800;letter-spacing:-.03em}",
    ".score .t{font-size:15px;line-height:1.35}.score .t b{color:var(--ink)}.exc .ph{overflow:hidden;background:#111}.exc .ph img{width:100%;height:100%;object-fit:cover}",
    ".temas{display:grid;grid-template-columns:repeat(4,minmax(0,1fr))}.tema{padding:0 24px}.tema:first-child{padding-left:0}.tema:last-child{padding-right:0}.tema+.tema{border-left:1px solid var(--rule)}",
    ".tema h3{font-size:clamp(18px,1.6vw,22px);font-weight:800;color:var(--ink);margin-top:10px;line-height:1.25}.obs{font-size:15px;color:var(--gray);margin-top:4px}",
    ".st{margin-top:14px;font-size:14px;color:var(--gray);line-height:1.6}.st i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:8px;border:1.5px solid var(--red);vertical-align:-1px}.st i.f{background:var(--red)}",
    ".media{margin-top:12px;position:relative;aspect-ratio:2.54;overflow:hidden;background:var(--soft)}.media img{width:100%;height:100%;object-fit:cover}",
    ".icons{display:flex;justify-content:space-around;align-items:center;height:100%;padding:10px}.icons div{text-align:center;font-weight:800;font-size:15px;color:var(--ink)}.icons img{width:50px;height:50px;margin:0 auto 6px}",
    ".tema p.tx{margin-top:12px;font-size:clamp(14px,1.15vw,15.5px);line-height:1.45}.q{font-style:italic;color:var(--gray);font-size:14px;line-height:1.45;margin-top:10px}",
    ".play{position:absolute;left:12px;bottom:12px;width:38px;height:38px;border-radius:50%;background:#fff;display:grid;place-items:center;box-shadow:0 4px 14px rgba(0,0,0,.35);transition:transform .25s}",
    ".play::after{content:'';border-left:12px solid var(--red);border-top:7px solid transparent;border-bottom:7px solid transparent;margin-left:3px}",
    "button.vid,button.zoom{all:unset;display:block;cursor:pointer;width:100%;height:100%}button.vid:hover .play,button.vid:focus-visible .play{transform:scale(1.12)}",
    "button.vid img,button.zoom img{transition:transform .6s}button.vid:hover img,button.zoom:hover img{transform:scale(1.04)}button.vid:focus-visible,button.zoom:focus-visible{outline:3px solid var(--ink);outline-offset:2px}",
    ".tops{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:32px}.top .h{display:flex;gap:14px;align-items:baseline}.top .r{color:var(--red);font-size:28px;font-weight:800}.top b{display:block;font-size:17px;color:var(--ink)}.top small{color:var(--gray);font-size:14px}",
    ".tl{display:grid;grid-template-columns:repeat(var(--n),minmax(0,1fr));gap:0 20px;position:relative;margin-top:6px}",
    ".tl li{list-style:none;position:relative;padding-top:28px}.tl li::before{content:'';position:absolute;left:0;right:-20px;top:7px;border-top:2px solid var(--red)}.tl li:last-child::before{border-top-style:dashed;right:0}",
    ".tl li::after{content:'';position:absolute;left:0;top:0;width:16px;height:16px;border-radius:50%;border:2px solid var(--red);background:#fff}.tl li.c::after{background:var(--red)}",
    ".tl .d{color:var(--red);font-size:14px;font-weight:800}.tl b{display:block;font-size:clamp(16px,1.4vw,20px);color:var(--ink);margin-top:4px;line-height:1.25}.tl p{font-size:15px;color:var(--gray);line-height:1.45;margin-top:4px}.tl .media{aspect-ratio:2.48;margin-top:12px}",
    "ol.tl{padding:0;margin:6px 0 0}",
    "footer.f{display:flex;justify-content:space-between;border-top:1px solid var(--rule);margin-top:56px;padding-top:16px;font-size:14px;font-weight:700;color:var(--gray)}",
    ".cta{display:inline-flex;margin-top:12px;color:var(--red);font-weight:800;font-size:14px;text-decoration:none}",
    "dialog.m{border:0;padding:0;background:#0d0909;color:#fff;width:min(1100px,94vw);border-radius:14px;overflow:hidden}dialog.m::backdrop{background:rgba(10,6,5,.82)}",
    "dialog.m .st2{aspect-ratio:16/9;background:#000;display:grid;place-items:center}dialog.m iframe,dialog.m video{width:100%;height:100%;border:0}dialog.m .zimg{max-height:82vh;width:auto;margin:auto}",
    "dialog.m .bar2{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:14px 18px}dialog.m .bar2 p{font-weight:700}dialog.m .bar2 small{display:block;color:#bbb;font-weight:400;margin-top:2px}",
    "dialog.m .x{all:unset;cursor:pointer;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.14);display:grid;place-items:center;font-size:22px}dialog.m .x:focus-visible{outline:3px solid #fff}",
    "dialog.m .msg{padding:40px;text-align:center;line-height:1.6}dialog.m a.btn{display:inline-block;margin-top:14px;background:var(--red);color:#fff;text-decoration:none;font-weight:700;padding:10px 20px;border-radius:20px}",
    ".rv{opacity:0;transform:translateY(14px);transition:opacity .7s,transform .7s}.rv.in{opacity:1;transform:none}",
    "@media (max-width:960px){.band{grid-template-columns:1fr}.band .grp{border-left:0;padding:14px 0 0;border-top:1px solid var(--red-line);margin-top:14px}.band .grp+.grp{border-top:0;margin-top:0}",
    ".cases{grid-template-columns:1fr}.case,.case+.case{padding:0;border:0}.case+.case{margin-top:32px}.exc{grid-template-columns:1fr 1fr}.exc .ph{display:none}.score+.score{border-left:0}",
    ".temas{grid-template-columns:1fr 1fr;gap:32px 0}.tema:nth-child(odd){padding-left:0;border-left:0}.tema:nth-child(even){padding-right:0}.tops{grid-template-columns:1fr}.tl{grid-template-columns:1fr 1fr;gap:20px}.tl li::before{display:none}}",
    "@media (max-width:560px){.temas{grid-template-columns:1fr}.tema{padding:0!important;border:0!important}.exc{grid-template-columns:1fr}.tl{grid-template-columns:1fr}.cbody{grid-template-columns:90px 1fr}}",
    "@media (prefers-reduced-motion:reduce){*{transition:none!important;scroll-behavior:auto!important}.rv{opacity:1;transform:none}}",
    "@media print{.bar{position:static}.rv{opacity:1;transform:none}dialog{display:none}}"
  ].join("\n");

  var WEB_JS = [
    "(function(){var D=JSON.parse(document.getElementById('report-data').textContent);var V={};(D.videos||[]).forEach(function(v){V[v.id]=v});",
    "var dlg=document.getElementById('m'),stage=dlg.querySelector('.st2'),tt=dlg.querySelector('.bar2 p');var opener=null;",
    "function isUrl(s){return /^https?:\\/\\//i.test(s||'')}function hostOk(u){try{var h=new URL(u).hostname;return (D.allowedEmbedHosts||[]).some(function(d){return h===d||h.slice(-d.length-1)==='.'+d})}catch(e){return false}}",
    "function el(t,a,txt){var e=document.createElement(t);for(var k in a)e.setAttribute(k,a[k]);if(txt)e.textContent=txt;return e}",
    "function open(title,sub,node){opener=document.activeElement;stage.replaceChildren(node);tt.replaceChildren(document.createTextNode(title),el('small',{},sub||''));if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','');dlg.querySelector('.x').focus()}",
    "function close(){stage.replaceChildren();dlg.close();if(opener)opener.focus()}dlg.querySelector('.x').onclick=close;dlg.addEventListener('close',function(){stage.replaceChildren()});dlg.addEventListener('click',function(e){if(e.target===dlg)close()});",
    "document.addEventListener('click',function(e){var b=e.target.closest('[data-video]');if(b){var v=V[b.dataset.video];if(!v)return;var sub=(v.acessos||'')+' · '+(v.duracao||'');",
    "if(v.embed&&hostOk(v.embed)){open(v.titulo,sub,el('iframe',{src:v.embed,title:'Vídeo: '+v.titulo,allow:'autoplay; fullscreen; picture-in-picture',allowfullscreen:''}));return}",
    "if(v.arquivo){var vd=el('video',{src:v.arquivo,controls:'',autoplay:'',playsinline:'','aria-label':'Vídeo: '+v.titulo});open(v.titulo,sub,vd);return}",
    "if(isUrl(v.link)){window.open(v.link,'_blank','noopener');return}",
    "var m=el('div',{class:'msg'});m.append(el('p',{},'Vídeo ainda não configurado.'),el('p',{},'Cole o link do Stream (e, se quiser tocar aqui dentro, o código de incorporação) no JSON do mês.'));open(v.titulo,sub,m);return}",
    "var z=e.target.closest('[data-zoom]');if(z){var im=el('img',{src:z.dataset.zoom,alt:z.querySelector('img').alt,class:'zimg'});open(z.querySelector('img').alt,'',im)}});",
    "var bar=document.querySelector('.bar i');function pr(){var h=document.documentElement.scrollHeight-innerHeight;bar.style.width=(h>0?scrollY/h*100:0)+'%'}addEventListener('scroll',pr,{passive:true});pr();",
    "if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&'IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);count(x.target)}})},{rootMargin:'0px 0px -6% 0px'});",
    "document.querySelectorAll('.rv').forEach(function(n){io.observe(n)})}else document.querySelectorAll('.rv').forEach(function(n){n.classList.add('in')});",
    "function count(scope){scope.querySelectorAll('[data-count]').forEach(function(n){var t=n.textContent,m=t.match(/^([^\\d]*)(\\d+(?:[.,]\\d+)?)(.*)$/);if(!m)return;var dec=(m[2].split(/[.,]/)[1]||'').length,end=parseFloat(m[2].replace(',','.')),t0=performance.now();",
    "(function step(now){var k=Math.min(1,(now-t0)/1100),e=1-Math.pow(1-k,3);n.textContent=m[1]+(end*e).toFixed(dec).replace('.',',')+m[3];if(k<1)requestAnimationFrame(step);else n.textContent=t})(t0)})}",
    "})();"
  ].join("\n");

  function renderWeb(c, opt) {
    opt = opt || {};
    var src = opt.src || function (p) { return p; };
    var m = c.meta || {}, vm = videoMap(c), R = c.resultados || {}, T = c.temas || {}, V = c.vemAi || {};
    function img(o, cls) { return o && o.src ? '<img src="' + esc(src(o.src)) + '" alt="' + esc(o.alt || "") + '"' + (cls ? ' class="' + cls + '"' : "") + ' loading="lazy">' : ""; }
    function zoom(o) { return '<button class="zoom" type="button" data-zoom="' + esc(src(o.src)) + '" aria-label="Ampliar imagem: ' + esc(o.alt || "") + '">' + img(o) + "</button>"; }
    function vid(v) {
      return '<button class="vid" type="button" data-video="' + esc(v.id) + '" aria-haspopup="dialog" aria-label="Assistir: ' + esc(v.titulo) + '">' +
        img({ src: v.thumb, alt: v.titulo }) + '<span class="play" aria-hidden="true"></span></button>';
    }
    var h = [];
    h.push('<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta name="robots" content="noindex">\n<title>' +
      esc(m.time + " · " + m.rotulo + " " + m.mes + " " + m.ano) + "</title>\n<style>\n" + WEB_CSS + "\n</style>\n</head>\n<body>\n");
    h.push('<div class="bar" aria-hidden="true"><i></i></div>\n<main class="page">');
    var ant = c.imagens && c.imagens.formiga;
    h.push('<header class="top"><div><h1>' + esc(m.time) + '</h1><p class="rep">' + esc(upper(m.rotulo)) + " | " + esc(upper(m.mes + " " + m.ano)) + '</p><p class="sub">' + esc(m.subtitulo) + "</p></div>" +
      (ant ? '<div class="ant">' + img(ant) + "</div>" : "") + "</header>");
    h.push('<div class="rule"></div><div class="sec"><b>01</b><span>' + esc(upper(R.titulo)) + "</span></div>");
    var imp = R.impacto || {};
    h.push('<section class="band rv" aria-label="Impacto do mês"><div><p class="lab">' + esc(imp.rotulo) + '</p><p class="big" data-count>' + esc(imp.valor) + '</p><p class="leg">' + esc(imp.legenda) + "</p></div>" +
      (R.grupos || []).map(function (g) {
        return '<div class="grp"><p class="gl">' + esc(g.rotulo) + '</p><div class="kpis">' + (g.kpis || []).map(function (k) {
          return '<div class="kpi"><p class="v" data-count>' + esc(k.valor) + '</p><p class="l">' + esc(k.rotulo) + "</p></div>";
        }).join("") + "</div></div>";
      }).join("") + "</section>");
    h.push('<section class="cases">' + (R.cases || []).map(function (cs) {
      return '<article class="case rv"><p class="k">' + esc(cs.numero) + "</p><h2>" + esc(cs.titulo) + '</h2><div class="cbody"><div class="cimg">' + (cs.midia && cs.midia.src ? zoom(cs.midia) : "") + "</div><div>" +
        '<p class="mini">O que foi feito</p><p class="feito">' + rich(cs.feito) + '</p><div class="rhead"><span class="mini">' + esc(cs.resultadoRotulo || "Resultado") + "</span><b>" + esc(cs.resultadoDestaque || "") + "</b></div>" +
        (cs.linhas || []).map(function (l) { return '<div class="rrow"><span>' + esc(l.rotulo) + '</span><span><span class="de">' + esc(l.de) + ' →</span> <span class="para">' + esc(l.para) + "</span></span></div>"; }).join("") +
        (cs.nota ? '<p class="note">' + esc(cs.nota) + "</p>" : "") + "</div></div></article>";
    }).join("") + "</section>");
    var X = R.excelencia;
    if (X) h.push('<section class="exc rv" aria-label="' + esc(X.numero + " " + X.titulo) + '"><div class="red">' + esc(X.numero + " " + X.titulo) + "<br>" + esc(X.subtitulo) + img(X.logo) + "</div>" +
      (X.scores || []).map(function (s) { return '<div class="score"><span class="v" data-count>' + esc(s.valor) + '</span><p class="t"><b>' + esc(s.titulo) + "</b><br>" + rich(s.texto) + "</p></div>"; }).join("") +
      '<div class="ph">' + img(X.imagem) + "</div></section>");
    h.push('<div class="rule"></div><div class="sec"><b>02</b><span>' + esc(upper(T.titulo)) + '</span></div><section class="temas">' + (T.itens || []).map(function (t) {
      var md = t.midia || {}, media = "";
      if (md.tipo === "imagem") media = '<div class="media">' + zoom(md) + "</div>";
      else if (md.tipo === "video" && vm[md.video]) media = '<div class="media">' + vid(vm[md.video]) + "</div>";
      else if (md.tipo === "icones") media = '<div class="media"><div class="icons">' + (md.itens || []).map(function (i) { return "<div>" + img({ src: i.src, alt: "" }) + esc(i.rotulo) + "</div>"; }).join("") + "</div></div>";
      return '<article class="tema rv"><p class="k">' + esc(t.numero) + "</p><h3>" + esc(t.titulo) + "</h3>" + (t.observacao ? '<p class="obs">' + esc(t.observacao) + "</p>" : "") +
        '<p class="st">' + (t.status || []).map(function (s) { return '<i class="' + (s.tipo === "feito" ? "f" : "") + '"></i>' + esc(s.texto); }).join("<br>") + "</p>" + media +
        (t.texto ? '<p class="tx">' + rich(t.texto) + "</p>" : "") + (t.citacoes || []).map(function (q) { return '<p class="q">“' + esc(q) + "”</p>"; }).join("") + "</article>";
    }).join("") + "</section>");
    var tv = topVideos(c);
    if (tv.length) h.push('<div class="rule thin" style="margin-top:40px"></div><div class="sec"><b aria-hidden="true">▶</b><span>' + esc(upper(c.topVideos.titulo)) + '</span></div><section class="tops">' +
      tv.slice(0, 3).map(function (v, i) {
        return '<article class="top rv"><div class="h"><span class="r">' + String(i + 1).padStart(2, "0") + "</span><div><b>" + esc(v.titulo) + "</b><small>" + fmtAcessos(v.acessos) + " · " + esc(v.duracao) + '</small></div></div><div class="media">' + vid(v) + "</div>" +
          (isUrl(v.link) ? '<a class="cta" href="' + esc(v.link) + '" target="_blank" rel="noopener">Abrir no Stream ›</a>' : "") + "</article>";
      }).join("") + "</section>");
    h.push('<div class="rule"></div><div class="sec"><b>03</b><span>' + esc(upper(V.titulo)) + '</span></div><ol class="tl" style="--n:' + (V.itens || []).length + '">' + (V.itens || []).map(function (it) {
      return '<li class="' + (it.marcador === "cheio" ? "c" : "") + ' rv"><span class="d">' + esc(it.numero + " · " + it.data) + "</span><b>" + esc(it.titulo) + "</b><p>" + rich(it.texto) + "</p>" +
        (it.imagem && it.imagem.src ? '<div class="media">' + zoom(it.imagem) + "</div>" : "") + "</li>";
    }).join("") + "</ol>");
    var rd = c.rodape || {};
    h.push('<footer class="f"><span>' + esc(rd.esquerda) + "</span><span>" + esc(rd.direita) + "</span></footer></main>");
    h.push('<dialog class="m" id="m" aria-label="Visualização"><div class="st2"></div><div class="bar2"><p></p><button class="x" type="button" aria-label="Fechar">×</button></div></dialog>');
    var data = {
      allowedEmbedHosts: opt.allowedEmbedHosts || ["sharepoint.com"],
      videos: ((c.videos && c.videos.itens) || []).map(function (v) {
        return { id: v.id, titulo: v.titulo, acessos: typeof v.acessos === "number" ? v.acessos.toLocaleString("pt-BR") + " acessos" : String(v.acessos || ""), duracao: v.duracao || "",
          link: v.link || "", embed: extractIframeSrc(v.embed), arquivo: v.arquivo ? src(v.arquivo) : "" };
      })
    };
    h.push('<script type="application/json" id="report-data">' + JSON.stringify(data).replace(/</g, "\\u003c") + "</script>\n<script>\n" + WEB_JS + "\n</script>\n</body>\n</html>\n");
    return h.join("\n");
  }

  /* ---------- Checagem de compatibilidade do HTML de e-mail ---------- */
  function lintEmail(html) {
    var rules = [
      [/<script/i, "Tem <script>: nenhum cliente de e-mail executa JavaScript."],
      [/<video|<iframe|<embed|<object/i, "Tem vídeo/iframe embutido: o Outlook remove. Use miniatura + link."],
      [/display\s*:\s*(flex|grid)/i, "Usa flex/grid: o Outlook clássico (motor do Word) ignora."],
      [/position\s*:\s*(absolute|fixed|relative)/i, "Usa position: o Outlook ignora."],
      [/rgba?\(/i, "Cor em rgb/rgba: o Outlook clássico exige hexadecimal."],
      [/background-image|url\(/i, "Imagem de fundo: o Outlook clássico só exibe com VML."],
      [/src="data:/i, "Imagem em base64 (data URI): o Outlook clássico bloqueia. Use anexo inline (cid:)."]
    ];
    var issues = rules.filter(function (r) { return r[0].test(html); }).map(function (r) { return r[1]; });
    var kb = Math.round((typeof Buffer !== "undefined" ? Buffer.byteLength(html) : new Blob([html]).size) / 1024);
    if (kb > 100) issues.push("HTML com " + kb + " KB: acima de ~100 KB alguns clientes cortam a mensagem.");
    return { kb: kb, issues: issues };
  }

  return { renderEmail: renderEmail, renderWeb: renderWeb, validate: validate, collectImages: collectImages, topVideos: topVideos,
           lintEmail: lintEmail, playVersion: playVersion, isUrl: isUrl, extractIframeSrc: extractIframeSrc, version: "2.0" };
});
