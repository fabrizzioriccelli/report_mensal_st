# Compatibilidade com o Outlook e interatividade possível

O report é distribuído por Outlook. O ponto crítico é o **Outlook clássico para Windows**, que desenha e-mails com o **motor do Word**, e não com um navegador. O que funciona nele funciona nos outros, por isso o template foi escrito para esse motor.

| Cliente | Motor | Observação |
|---|---|---|
| Outlook clássico para Windows (2016, 2019, 2021, Microsoft 365) | Word | O mais restritivo |
| Novo Outlook para Windows | Navegador (Edge) | Aceita mais CSS; remove scripts |
| Outlook na Web | Navegador | Igual ao novo Outlook |
| Outlook para iOS e Android | Nativo/WebView | Aceita CSS de celular (`@media`) |
| Outlook para Mac | WebKit | Bom suporte |

O suporte de cada cliente muda com as atualizações da Microsoft. A tabela reflete o comportamento conhecido e documentado. **Nada aqui foi testado num Outlook real** (este ambiente não tem Outlook): o teste piloto em [CORPORATE_SETUP.md](CORPORATE_SETUP.md) confirma no ambiente do banco.

## Interatividade: o que dá para fazer num e-mail

| Recurso | Outlook Windows (clássico) | Novo Outlook / Web | Celular (iOS/Android) | No report |
|---|---|---|---|---|
| **Link em texto** (`<a href>`) | ✓ | ✓ | ✓ | **Usado**: "Ver peça →", "▶ Assistir" |
| **Imagem clicável** (imagem dentro de `<a>`) | ✓ | ✓ | ✓ | **Usado**: miniaturas abrem o mesmo link do botão |
| Sublinhado ao passar o mouse (`:hover`) | ✕ ignora | △ geralmente aceita | — (sem mouse) | Usado como melhoria; sem ele nada muda |
| Cantos arredondados | ✕ cantos retos (e o envio pelo Outlook tira para todos) | ✓ | ✓ | E-mail completo: usado, o canto reto é o fallback. E-mail-resumo: cantos retos de propósito (4.5) |
| Botão desenhado em VML | △ aparece no rascunho, mas o envio pelo Outlook o transforma em imagem sem link | ✕ | ✕ | **Não usado** (4.5): o botão é célula com fundo + link de texto |
| Colunas que empilham no celular (`@media`) | — | △ | ✓ | Usado |
| JavaScript | ✕ | ✕ removido | ✕ | **Não usado** |
| Modal / lightbox (janela por cima) | ✕ | ✕ | ✕ (só alguns apps não Microsoft) | **Não usado**: o clique abre o SharePoint |
| Abas, acordeão, carrossel em CSS (`:checked`) | ✕ | ✕ | △ | **Não usado** |
| Vídeo dentro do e-mail (`<video>`) | ✕ | ✕ | ✕ (só Apple Mail) | **Não usado**: miniatura + link do Stream |
| iframe / player incorporado | ✕ removido | ✕ removido | ✕ | **Não usado** |
| GIF animado | △ versões antigas mostram só o 1º quadro | ✓ | ✓ | Não usado |
| Formulário, enquete | ✕ | ✕ | ✕ | Não usado |

Legenda: ✓ funciona · △ parcial ou depende da versão · ✕ não funciona.

**Conclusão:** a interação confiável em e-mail é **clicar e abrir um destino**. O report faz isso bem e sem quebrar: cada peça e cada vídeo tem um botão em texto que diz a ação e uma miniatura clicável, e o destino é o SharePoint ou o Stream da empresa. Detalhes da decisão: [ARQUITETURA.md](ARQUITETURA.md).

## Recursos usados no report

| Recurso | Como o report usa |
|---|---|
| ✓ Tabelas para layout, estilo inline | Toda a grade |
| ✓ Cor de fundo em células | Capa, Foco e rodapé em Vermelho Santander; faixa dos números (Rio); Transformation (Lisboa); selo do mês; etiquetas |
| ✓ Bordas em células | Filetes, divisórias, caixas tracejadas (só no rascunho) |
| ✓ `margin` em parágrafos e `padding` em células | Espaçamentos (o Word ignora `margin` em tabelas) |
| ✓ Imagens JPG/PNG com `width`, `height` e `alt` | Peças e fotos em JPG; chama, formiguinha e ícones em PNG transparente; tudo **embutido** no `.eml` (`cid:`) |
| ✓ Fontes instaladas no sistema | Santander Headline / Micro Text / Condensed, se instaladas; senão Arial. Configuráveis em `config/marca.txt` |
| ✓ Caracteres especiais (▶ → ● ○ ▲ ▼) | Play, setas e status, sem imagem |
| ✓ Texto de pré-visualização escondido | O que aparece ao lado do assunto na caixa de entrada |

## Fontes

| Situação | O que acontece |
|---|---|
| Fonte instalada no computador (Arial, fonte Santander instalada pela TI) | Aparece em todos os Outlooks daquele computador |
| Fonte **não** instalada | O navegador usa a próxima da lista. O Outlook para Windows usa a fonte definida em `titulos_outlook_windows`/`texto_outlook_windows` (se ela também faltar, troca por Times New Roman) |
| Fonte de arquivo (`@font-face`: `.otf` do projeto, Google Fonts) | **Não funciona no Outlook para Windows** e é bloqueada no ambiente corporativo. Não vai no `.eml` (a ferramenta recusa). Os `.otf` de `assets/fonts/` entram só na prévia e na página `.html` |

Por isso a fonte é uma **lista**, configurada num lugar só ([CORPORATE_SETUP.md › Fonte oficial](CORPORATE_SETUP.md#2-fonte-oficial)). O Outlook para Windows recebe a dele por um bloco que só ele lê (`<!--[if mso]>`) e pelas classes `ft`/`fx` de cada texto.

## Imagens: embutidas × hospedadas × caminho de rede

| Forma | Outlook para Windows | Outlook na Web / celular | Decisão |
|---|---|---|---|
| **Embutida no .eml (`cid:`)** | Aparece direto | Aparece | **Usada** (modo padrão) |
| Hospedada num servidor interno `https://` | Bloqueada até "Baixar imagens", salvo política da TI | Depende do acesso ao servidor | Opcional, VALIDAR COM TI |
| Hospedada no SharePoint | Não aparece: o Outlook não faz login para buscar imagem | Geralmente não aparece | Descartada |
| Caminho de rede `\\servidor\...` ou `file://`, `C:\` | Não aparece para quem recebe; costuma ser bloqueado por segurança | Não funciona | Recusada pela ferramenta |
| Base64 no HTML (`data:`) | Não aparece | Varia | Recusada pela ferramenta |

## Fallbacks

| Se… | Então… |
|---|---|
| a imagem não carregar ou for bloqueada | O espaço mantém o tamanho (`width`/`height`) e mostra a descrição (`alt`). O texto e o botão continuam lá |
| o cliente não mostrar HTML | O `.eml` leva uma versão em **texto puro** com todo o conteúdo e os links escritos por extenso |
| o cliente ignorar cantos arredondados | Aparecem cantos retos; layout e cores iguais |
| o cliente ignorar `@media` (celular) | Mostra o layout de computador reduzido, sem quebrar |
| a pessoa não tiver a fonte oficial | Usa a fonte de reserva da lista; as colunas têm folga para larguras diferentes |
| o link exigir login | O Microsoft 365 pede o login e depois abre o arquivo |
| a pessoa não tiver permissão | O SharePoint mostra "Você precisa de permissão". **Prevenção:** o teste com outra pessoa antes do envio |

## Celular

Uma regra `@media (max-width:620px)`:

- empilha as colunas (`col`);
- coloca 3 números lado a lado, em terços (`third`), ou 4 em pares (`half`);
- na capa, o selo do mês desce para baixo do logo (`selo`) e a peça principal fica com 180 px, centralizada (`himg`); no rodapé, o logo e a assinatura passam para baixo da despedida, alinhados à esquerda (`al-m`);
- esconde a formiguinha da faixa dos números, que não cabe (`hide-m`); a do rodapé continua;
- troca a peça vertical do projeto em destaque por uma versão **horizontal**, na largura da tela, acima do texto (`show-m`);
- deixa etiquetas e textos longos quebrarem linha em vez de vazar (`wrap-m`);
- mostra o mês numa linha abaixo do nome, no lugar do selo (`show-m`/`hide-m`);
- deixa a formiguinha do rodapé ao lado do texto (`fw`, `fant`);
- aumenta os textos de leitura para 14 px e as legendas para 12 px (`tm`, `ts`);
- aumenta as miniaturas para a largura da tela (`fluid`). Elas são exportadas com até 700 px para ficarem nítidas;
- ajusta os tamanhos de títulos e números (`h1`, `h2`, `num`, `brand`).

## O que foi testado e o que não foi

| Verificação | Status |
|---|---|
| Renderização no Chromium em 1440, 1024, 768, 430, 390, 360 e 320 px | Testado, sem vazamento lateral; capturas conferidas |
| Ausência de recursos incompatíveis (script, flex, grid, position, fundo, rgba, base64, fonte externa, caminho local) | Testado automaticamente a cada geração |
| Estrutura do `.eml` (MIME, UTF-8, texto + HTML, `cid:`) | Testado com o leitor de e-mail do Python |
| Outlook clássico, novo Outlook, Outlook na Web, Outlook iOS/Android, Mac | **Não testado** (sem Outlook neste ambiente) |
| Modo escuro | **Não testado** |

Antes do primeiro envio, faça o teste piloto ([CORPORATE_SETUP.md](CORPORATE_SETUP.md)) e, a cada mês, o [checklist](TEST_CHECKLIST.md).
