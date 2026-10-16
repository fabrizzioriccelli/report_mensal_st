# Arquitetura: como o report funciona de verdade

Este documento registra as decisões técnicas da versão funcional do report. O objetivo foi transformar o layout aprovado em uma ferramenta que funcione para **todos os destinatários**, dentro de um ambiente bancário restrito. Ordem de prioridade usada em cada decisão:

1. segurança e políticas corporativas;
2. funcionar para todos os destinatários;
3. compatibilidade com Outlook e `.eml`;
4. clareza da experiência;
5. facilidade de atualização;
6. peso;
7. interatividade;
8. sofisticação técnica.

Quando uma solução mais sofisticada prejudicava um item de cima, ela foi descartada.

## Visão geral

```text
  O QUE VOCÊ EDITA                    O QUE FAZ FUNCIONAR (não precisa abrir)
  ─────────────────                   ──────────────────────────────────────
  dados/AAAA-MM.txt  ─┐
  config/marca.txt   ─┼──►  gerar-report.html  ──►  tools/motor.js  ──►  template/report.html
  assets/AAAA-MM/    ─┘     (abre no Edge)          (confere e monta)     (layout aprovado)
                                    │
                                    ├──►  report-AAAA-MM.eml   → Outlook → envio
                                    └──►  AAAA-MM.html         → reports/ (arquivo do mês)
```

- **Você edita só texto** (`dados/AAAA-MM.txt`) e coloca imagens numa pasta. Não abre HTML.
- **A página `gerar-report.html`** roda no Edge ou Chrome, direto do arquivo, sem instalação, sem servidor e sem internet.
- **O HTML do e-mail continua sendo HTML de e-mail**: tabelas, estilos inline, nada de JavaScript. Toda a "inteligência" fica na geração, não no e-mail.

### Por que separar dados, template e geração

| Antes | Agora |
|---|---|
| Editar um HTML de 550 linhas, procurando `EDITAR AQUI` | Editar um arquivo de texto com `campo: valor` |
| Cor repetida em 50 lugares | Cor definida 1 vez em `config/marca.txt` |
| Link, imagem e tipo espalhados | Imagem, tipo e link juntos no bloco de cada peça |
| Placeholder esquecido só aparecia na conferência visual | A geração lista cada pendência com o número da linha e bloqueia a versão final |
| Imagem precisava ser exportada no tamanho certo | A página reduz, recorta e desenha o ▶ sozinha |
| Barra do Creative X com duas larguras que precisavam somar 100% | Barra e variação calculadas a partir de "anterior" e "atual" |

A automação só foi criada porque **reduz** o trabalho mensal e os erros possíveis. Ela não exige instalar nada: usa o navegador que já existe na máquina.

## As 4 decisões

### 1. Renderização do e-mail

**Solução:** o HTML aprovado, em tabelas com estilos inline, largura fixa de 680 px e regras de celular em `@media` (empilham as colunas onde o cliente aceita).

- Cada texto tem uma classe `ft` (títulos) ou `fx` (texto). Num bloco que só o Outlook para Windows lê (`<!--[if mso]>`), essas classes recebem a fonte configurada para ele.
- O Outlook para Windows lê só a 1ª fonte da lista e cai para Times New Roman se ela não existir. Por isso ele tem uma configuração própria, com uma fonte só.
- **Grade única:** a área de conteúdo tem 600 px, dividida em 3 colunas de 184 px com espaços de 24 px. Capa, números, destaque, lançamentos, Creative X, aprendizados e agenda usam as mesmas linhas, e as divisórias ficam no meio dos espaços. As larguras são fixas em px, que o Outlook para Windows respeita melhor que porcentagens. No celular, os espaços somem e as colunas empilham, todas na mesma margem. Entre seções, o espaço é sempre de 40 px.
- Os números da abertura ficam um em cada coluna da grade (184 px), alinhados pelo topo, e não quebram linha (`nowrap`). Com 4 números, 4 colunas iguais de 132 px.

**Limitações:**
- No Outlook para Windows, os cantos aparecem retos e o layout é sempre o de 680 px.
- O efeito de passar o mouse (sublinhado nos botões) só aparece onde o cliente aceita.

### 2. Assets do e-mail (o que precisa aparecer no corpo)

**Solução: imagens embutidas no `.eml` (anexos inline, `cid:`).** É o modo A, o padrão.

| Opção | No Outlook para Windows | No Outlook na Web e no celular | Rede restrita | Decisão |
|---|---|---|---|---|
| **A. Embutida no .eml (`cid:`)** | Aparece sem clicar em "Baixar imagens" | Aparece | Não depende de rede | **Usada** |
| B. Hospedada num servidor interno (`https://`) | Bloqueada até "Baixar imagens", salvo política da TI | Depende do acesso ao servidor | Depende do servidor ser alcançável por todos | Opcional (`modo: hospedadas`), **validar com TI** |
| Hospedada no SharePoint | **Não aparece**: o Outlook não faz login para buscar imagem | Geralmente não aparece | — | Descartada |
| CDN ou serviço público | Bloqueada ou proibida pela política | Bloqueada | Proibido | Descartada |
| Caminho de rede (`\\servidor\...`) ou `file://` | Não aparece para o destinatário; é um risco de segurança conhecido e costuma ser bloqueado | Não funciona | — | **Bloqueada pela ferramenta** |
| Base64 no HTML (`data:`) | Não aparece | Varia | — | Descartada |

**Peso:** cada imagem é reduzida para o dobro do tamanho em que aparece. As que ocupam a tela inteira no celular vão com até 700 px. Nos testes, fotos de 3 a 8 MB viraram 27 a 64 KB cada, e o `.eml` com 11 imagens ficou com ~520 KB (o modelo em branco, ~200 KB). Um PNG já otimizado é mantido como está.

### 3. Conteúdo ampliado (peça em tamanho grande)

**Solução: a miniatura e o texto "Ver peça →" levam a um link do SharePoint** (modo B dos links), onde a peça abre no visualizador do Microsoft 365, com login e permissões da empresa.

| Opção | Funciona no Outlook para Windows? | Decisão |
|---|---|---|
| **Link para o arquivo no SharePoint/OneDrive** | Sim: abre o navegador, com login corporativo | **Usada** |
| Link para uma página interna aprovada (intranet) | Sim, se todos tiverem acesso | Aceita (modo C) |
| Modal/lightbox em CSS ou JavaScript | Não: o Outlook não executa JavaScript e não suporta CSS interativo | Descartada |
| Link para a imagem anexada (`cid:`) | Não é confiável em nenhum cliente | Descartada |

O clique abre o destino corporativo; o e-mail não tenta simular uma janela.

### 4. Vídeo com som

**Solução: miniatura com ▶ desenhado na própria imagem + texto "▶ Assistir" → link do vídeo no Stream (SharePoint).** O Stream abre o player corporativo com som, controles, legendas e as permissões do arquivo.

| Opção | Outlook para Windows | Outlook na Web | Outlook iOS/Android | Decisão |
|---|---|---|---|---|
| **Miniatura + link para o Stream** | Funciona | Funciona | Funciona (pode pedir login) | **Usada** |
| `<video>` dentro do e-mail | Não toca | Não toca | Não toca | Descartada |
| iframe/embed do Stream | Removido | Removido | Removido | Descartada |
| GIF animado de prévia | Versões antigas mostram só o 1º quadro | Toca | Toca | Não usado (peso; sem som de qualquer forma) |
| Link direto para o `.mp4` | Abre o player do navegador, sem as legendas e os controles do Stream | — | — | A ferramenta avisa |

O ▶ faz parte da imagem: aparece em qualquer cliente, inclusive no Outlook para Windows, que não sobrepõe elementos.

## E-mail-resumo: campos marcados e regras de seleção (4.2)

O e-mail-resumo **não corta** o report: ele tem template próprio (`RESUMO_TPL` em `tools/motor.js`), estático, com um único link (o botão "Ver report completo", em VML no Outlook para Windows e link com fundo nos demais).

- **De onde vêm os dados:** cada texto e número do template do report tem um atributo `data-campo` (ex.: `numero-1.valor`, `lancamento-2.nome`, `transformation-3.status`, `cx.atual`, `agenda-1.data`). Etiquetas guardam o tom em `data-tom` (verde/âmbar). `dadosDoResumo(html)` lê esses campos da página, na ordem; `emailResumo(html, {link, botao, blocos})` monta o e-mail.
- **Por que da página, e não do arquivo de dados:** o conversor recebe só o `.html` (que pode ter sido editado no Chrome). Lendo a página, o resumo sempre reflete o que está publicado. Como a página sai do arquivo de dados, continua havendo uma única fonte.
- **Regras de seleção:** `RESUMO_REGRAS` (quantos itens de cada lista entram, sempre os primeiros). Nada é resumido por máquina.
- **Onde os atributos vivem:** só na página. `paraEmail` e `limparHtmlEditado` tiram `data-campo`, `data-tom`, os comentários `EDITAR AQUI` e a meta `report-completo` dos e-mails.
- **Movimento independente do conteúdo:** o script do movimento reconhece a estrutura (marcas de seção, números com fonte grande, a barra do Creative X), não os textos de um mês. Trocar texto, número ou imagem não exige mexer em código.

## Emulador: edição na própria página (4.3)

- **Uma página, três papéis:** o emulador abre o report num `iframe` (`srcdoc`, `sandbox="allow-same-origin"`, sem script: o movimento fica parado na edição). A página de fora instrumenta o documento: `contenteditable` nos `[data-campo]`, barra flutuante para `img[data-img]`, links (`a.cta`, `a[data-anexo]`, link pendente) e `[data-item]`.
- **Marcas do template:** `data-campo` (texto ou número; também lido pelo e-mail-resumo), `data-tom` (verde/âmbar), `data-img` (imagem trocável; cópias de computador e celular têm a mesma chave), `data-item` (item ocultável) e `<!--secao:x-->` (seções). Saem de todo e-mail (`paraEmail`, `limparHtmlEditado`).
- **Salvar:** o documento é clonado, perde as marcas do editor (`contenteditable`, `data-ed-*`, barra, CSS) e os nós ocultados, renumera as seções e passa por `Motor.paginaInterativa` (script do movimento, ampliação, vídeo e PDF). Grava com `showSaveFilePicker` (Chrome/Edge) ou baixa. Páginas de antes da 4.3 (frase do mês com a segunda parte dentro) são normalizadas ao abrir.
- **Imagens:** recortadas e reduzidas no navegador (`canvas`) para o dobro do tamanho na tela (JPEG 0,86; PNG para logo e selo); a versão ampliada vai até 1400 px; vídeo ganha a miniatura com ▶.
- **Rascunho:** IndexedDB (`emulador-report`), só no navegador do computador, apagado ao salvar.
- **Importação:** `Motor.importarDados` lê o formato de blocos (`ler`) e devolve `{campos: {"numero-1.valor": {texto, tipo, tom}}}`; variação ganha a seta e o tom.

### Modelo em branco (coringa)

`dados/CORINGA.txt` (máximo de cada seção; textos [entre colchetes]; números em X; imagens neutras de `assets/coringa/`) → página gerada pelo `gerar-report.html` → `tools/coringa.js` (`window.CORINGA_HTML`, com `<` escapado). Depois de mudar o template: gere a página do CORINGA, atualize `tools/coringa.js`, rode `node tools/montar-avulso.js` e os testes.

### Kit

`node tools/montar-avulso.js` embute `tools/motor.js` e `tools/coringa.js` no emulador (`kit/emulador-report.html`, ~0,8 MB), que funciona sozinho em qualquer pasta. As chamadas da apresentação usam links relativos (`emulador-report.html`, `guia-operacional.pdf`, report do mês): no PowerPoint e no PDF, resolvem a partir da pasta da apresentação.

## Progressive enhancement

| Camada | O que é | Onde funciona |
|---|---|---|
| Base | Texto + link escrito por extenso | **Todos**, inclusive quem lê só texto: o `.eml` leva uma versão em texto puro com os links |
| Padrão | Layout, imagens, miniaturas, "Ver peça →" e "▶ Assistir" | Todos os Outlooks |
| Melhoria | Cantos arredondados, colunas empilhadas no celular, sublinhado ao passar o mouse | Outlook na Web, novo Outlook, Mac, iOS, Android |

O conteúdo nunca depende da camada de melhoria.

**Imagens bloqueadas ou que não carregam:**
- toda imagem tem `width`, `height` e um `alt` descritivo ("Vídeo: Lorem ipsum dolor sit amet (assistir ao vídeo)"), então o layout não desmonta;
- o texto principal de cada bloco está em HTML, nunca dentro de imagem;
- o botão do link é texto, não imagem: continua clicável mesmo sem imagens.

## Sistema de links (CTAs)

Quatro tipos, cada um com um texto fixo. A pessoa sempre sabe o que vai acontecer:

| `tipo:` | Texto no e-mail | Destino |
|---|---|---|
| `peca` | Ver peça → | Peça em tamanho grande (SharePoint) |
| `video` | ▶ Assistir | Vídeo no Stream |
| `projeto` | Ver projeto → | Documento, apresentação ou página |
| `demo` | Ver demonstração → | Protótipo ou demonstração |

**Regras:**
- Sem link, sem botão.
- O botão fica no fim da frase do próprio bloco, sem linha extra.
- A miniatura leva ao mesmo link do botão.
- O título não é link, para manter o visual editorial.
- Nunca há área clicável sem texto que diga a ação.

## Validações automáticas

| Verificação | Resultado |
|---|---|
| Bloco ou campo com nome errado, linha sem `:`, campo obrigatório vazio | Erro, com arquivo e linha |
| Imagem, ícone ou formiguinha que não existe | Erro |
| Conteúdo de exemplo: Lorem Ipsum, `X` nos números (`X%`, `R$ X`, `XX/XX`), "Mês", "AAAA" | Pendência: só gera RASCUNHO |
| Texto `[entre colchetes]` em qualquer campo | Pendência: só gera RASCUNHO, com "[RASCUNHO]" no assunto |
| Link com `\\servidor`, `C:\`, `file:`, `javascript:` ou espaço | Erro |
| Link `http://`, fora dos domínios aprovados, de incorporação (embed), de download, do Stream Clássico ou direto para `.mp4` | Aviso |
| Cor fora do formato `#RRGGBB`; fonte com caracteres que quebram o HTML | Erro |
| HTML final com script, vídeo, iframe, flex/grid, imagem de fundo, `rgba()`, base64, fonte externa, imagem sem `width`/`alt` | Erro |
| Texto longo demais para o espaço (frase do mês, números) | Aviso |

O que a ferramenta **não** consegue verificar: se o link abre e se o destinatário tem permissão. Um link do SharePoint exige login, e a página roda fora dele. Para isso existem a lista "Teste os links" e o teste com outra pessoa (veja [LINKS_SHAREPOINT_STREAM.md](LINKS_SHAREPOINT_STREAM.md)).

## Auditoria de dependências externas

| Item | Resultado |
|---|---|
| E-mail final | Nenhuma requisição externa. Imagens só por `cid:`; nenhuma fonte, CSS ou script externo. A única URL é o identificador padrão `xmlns` do HTML, que não é carregado |
| Fontes | No e-mail, só fontes instaladas (Santander, se houver; senão Arial), configuráveis. Os `.otf` de `assets/fonts/` entram só na prévia e na página `.html`, embutidos; nunca no `.eml` |
| `gerar-report.html` | Carrega apenas `tools/motor.js`, local. Sem CDN, sem bibliotecas, sem chamadas de rede |
| `tools/motor.js` | JavaScript puro, sem dependências |
| Testes (`tests/`) | Opcionais, para desenvolvimento. `motor.test.js` usa só o Node.js; `ferramenta.e2e.js`, `emulador.e2e.js` e `movimento.e2e.js` usam o Playwright. Nenhum deles é necessário para gerar o report |

## Modos de operação

| Modo | Para quê | Onde configurar | Status |
|---|---|---|---|
| **A. Imagens embutidas** | Formiguinha, miniaturas, ícones | `config/marca.txt` → `modo: embutidas` | Padrão |
| **B. SharePoint / Microsoft 365** | Peça ampliada e vídeo | Campo `link:` de cada peça | Padrão para os links. **Validar** tipo de link e permissões com a TI |
| **C. Recursos internos aprovados** | Imagens hospedadas num servidor interno ou links para a intranet | `modo: hospedadas` + `endereco_base`; ou `link:` | Opcional. **VALIDAR COM TI / SEGURANÇA / ADMINISTRAÇÃO MICROSOFT 365** |

## O que foi testado e o que não foi

| Teste | Status |
|---|---|
| Motor: 31 testes automáticos (`node tests/motor.test.js`), inclusive estado vazio, provisórios (Lorem/X), formiguinha só no rodapé e paleta do Brand Guide | Passam |
| Página de geração, de ponta a ponta no Chromium (escolher pasta, conferir, baixar `.eml` e `.html`), sem erro no console, e e-mail sem vazar para o lado em 1440, 1024, 768, 430, 390, 360 e 320 px | Passa (`tests/ferramenta.e2e.js`) |
| Fonte `.otf` colocada em `assets/fonts/` (arquivo de teste no lugar da oficial) | Entra na prévia e no `.html` e carrega; fora do `.eml` |
| Fotos do banco de imagens nos espaços do modelo (teste local, fora do repositório) | Nada vaza de 320 a 1440 px; a peça do destaque aparece no celular |
| Todas as imagens bloqueadas | Mesma altura de página; cada espaço mostra a descrição (`alt`) |
| Imagem original de 3000 px e de 4,8 MB reduzida e recortada | Conferido visualmente |
| Versão final (sem pendências, com links): botão liberado, links nos CTAs, assunto sem [RASCUNHO] | Conferido |
| Estrutura do `.eml` (MIME, texto + HTML, `cid:`, linhas ≤ 76) | Conferido com o leitor de e-mail do Python |
| Layout gerado = layout aprovado (estrutura, grade e seções), com os ajustes do Brand Guide | Comparado por captura de tela |
| **Outlook para Windows, novo Outlook, Outlook na Web, Outlook iOS/Android** | **Não testado**: não há Outlook neste ambiente |
| **Links reais do SharePoint/Stream, permissões, vídeo com som** | **Não testado**: depende do ambiente do banco |

Por isso, o primeiro envio precisa passar pelo **teste piloto com outra pessoa** descrito em [CORPORATE_SETUP.md](CORPORATE_SETUP.md).

## Brand Guide: como foi aplicado num e-mail

O Brand Guide Santander Brasil (maio/2026) foi escrito para peças (posts, banners, telas). O e-mail tem limites próprios (Outlook, largura de 600 px, fontes instaladas). Regra seguida: **aplicar o guia sem quebrar o layout aprovado nem o Outlook**.

| Regra do guia | No report |
|---|---|
| Fundo só em Branco, Lisboa, Rio e Vermelho Santander (3.2) | Aplicado em todo o e-mail; teste automático confere |
| Sobre branco: títulos em vermelho, textos em preto (3.2) | Aplicado |
| Tons de apoio só pontuais (3.2) | Em elementos pequenos: etiquetas de variação, barra do Creative X e etiqueta do número de cada seção, com uma cor por momento da história (resultados, qualidade e transformação, aprendizado) |
| Headline (títulos), Micro Text (apoio), Condensed (impacto), Script (voz do cliente) (3.3) | Headline Bold, Micro Text Regular/Bold, Condensed Bold na capa; Script não usada. Sem itálico |
| Símbolo como assinatura em canais internos; branco sobre vermelho; assinatura no canto inferior direito (3.1, 3.10) | Chama branca na capa e no rodapé, à direita |
| Imagem enquadrada com raio = metade da margem (3.10) | Margem do e-mail: 40 px → raio 20 px |
| Retângulos com raio = 5% do lado menor **do formato**; sem retângulo quadrado (3.6) | Formato do e-mail: 680 px → **34 px** (cartão, capa, faixa de números, Transformation, Foco, rodapé); no celular (~390 px) → **20 px** (classes `ra`, `rt`, `rb`). Cartões internos: 20 px |
| Margem = 8% do lado menor (3.10) | **Adaptado:** a margem de 40 px foi mantida. 8% de 680 px seria 54 px e quebraria a grade de 3 colunas aprovada |
| Fundo vermelho pede foto com pouco vermelho (3.10) | Orientação de fotos em `assets/fotos/README.md` |
| Ícones com traço Vermelho Santander, da biblioteca oficial (3.8) | Os 2 ícones recoloridos para o vermelho; ícones novos devem vir do Portal da Marca |
| Botão de Início ("Começa agora") como encerramento (3.4) | **Não aplicado:** é um arquivo oficial do Portal da Marca, que não foi recebido. Os botões do report são links de texto ("Ver peça →"), que funcionam em qualquer Outlook |
| Balões de fala para a resposta do banco, nunca como rótulo genérico (3.5) | **Não usados:** o report não tem diálogo cliente/banco, e o guia proíbe usar balões só para destacar texto |
| Voz simples, pessoal e justa; tom "papo reto"; frases até 80 caracteres; sem justificado (2.1, 2.2) | Textos fixos curtos e diretos; limites e dicas no guia mensal e nos prompts do Copilot |
