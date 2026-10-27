# Como atualizar o report todo mês

Passo a passo para o time, no **emulador** (`kit/emulador-report.html`). É o mesmo conteúdo do guia ilustrado, [kit/guia-operacional.pdf](../kit/guia-operacional.pdf), em texto. Depois dos dados aprovados, leva de 30 a 45 minutos.

Você precisa de: **Chrome ou Edge**, o arquivo `emulador-report.html`, as imagens do mês, os resultados aprovados pela área, acesso ao ambiente corporativo autorizado (para publicar o report) e o **Outlook**. Não precisa instalar nada.

```text
imagens do mês ─┐
resultados ─────┼─► emulador (Chrome/Edge) ─► report-AAAA-MM.html ─► ambiente autorizado ─► link
Copilot ────────┘        │                                                                   │
                         └──────────── e-mail-resumo (.eml) ◄── até 3 indicadores + link ◄───┘
                                              │
                                              ▼
                                  Outlook ─► área (botão "Acessar report completo")
```

---

## 1. Arquivos e pastas (Explorador de Arquivos)

| Arquivo | O que é | O que fazer |
|---|---|---|
| `emulador-report.html` | A ferramenta | Abrir no Chrome ou no Edge |
| `report-AAAA-MM.html` | O report do mês, salvo pelo emulador | Publicar; abrir no emulador para editar de novo |
| `report-AAAA-MM-resumo.eml` | O e-mail-resumo | Dois cliques: abre no Outlook |
| Pasta de imagens do mês | Peças, logos, prints | Escolher em "Trocar imagem" |

**Explorador de Arquivos**

1. Abrir: tecla **Windows + E**.
2. **Downloads** fica no painel da esquerda. É para lá que vai o que o navegador baixa (o `.eml`, por exemplo).
3. **Mostrar as extensões** (`.html`, `.eml`): Windows 11, menu **Exibir › Mostrar › Extensões de nomes de arquivos**; Windows 10, aba **Exibir** › marque **Extensões de nomes de arquivos**.
4. **Pasta do mês:** em Documentos › Report mensal, botão direito › **Novo › Pasta** (ou Ctrl+Shift+N) › `2026-11`. Dentro dela, a pasta `imagens`.
5. **Renomear:** clique no arquivo e aperte **F2**. Mantenha a extensão.
6. **Mais recente primeiro:** **Classificar › Data de modificação**. **Procurar:** caixa de pesquisa, `report-2026`.
7. Arquivo com **(1)** no nome (`report-2026-11 (1).html`) é download repetido: fique com o mais recente.

**Abrir o emulador:** dois cliques em `emulador-report.html`. Abriu em outro programa? Botão direito › **Abrir com** › **Google Chrome** ou **Microsoft Edge** (não aparece? "Escolher outro aplicativo"). Ou arraste o arquivo para uma janela do navegador.

### Padrão de nomes das imagens

| Regra | Certo | Evite |
|---|---|---|
| Minúsculas, sem acento, sem espaço | `campanha_natal_principal.jpg` | `Campanha Natal (final).JPG` |
| Palavras separadas por `_` | `black_friday_selo.png` | `black-friday selo.png` |
| Campanha ou projeto + o que é a imagem | `one_brief_icone.png` | `imagem1.png` |
| O que é: `principal`, `destaque`, `peca_1`, `icone`, `logo`, `print`, `selo` | `copy_agent_icone.jpg` | `logo novo novo.jpg` |
| `.png` (logos, selos, prints) ou `.jpg` (fotos e peças) | `agente_x_print.png` | `.heic`, `.webp` |

Tamanho recomendado (a ferramenta recorta e reduz): projeto principal 440 × 440 px ou mais; destaque 368 × 600; lançamentos 736 × 288; logo do Transformation Hub 112 × 112; print 1008 px de largura; selo: o PNG original, sem redesenhar.

## 2. Editar no emulador

**Abrir:** "Começar do modelo em branco" (todas as seções, com textos de exemplo [entre colchetes]) ou "Abrir um report salvo (.html)" (por exemplo, o do mês anterior). O report aparece logo abaixo, pronto para editar.

**Barra de ferramentas:** Salvar report (.html) · Importar conteúdo (Copilot) · Desfazer · Computador / Celular. A linha ao lado diz o que aconteceu.

| Quero… | Faço… |
|---|---|
| Mudar um texto | Clico no texto (contorno tracejado) e escrevo. O exemplo [entre colchetes] fica selecionado: o que eu digito entra no lugar. **Enter** confirma; **Shift+Enter** quebra a linha |
| Mudar um indicador | Clico no valor, no título e na base de comparação e escrevo. Na variação: `▲ +25%` ou `▼ −20%`. Ao clicar na etiqueta aparecem **Cor: verde** (positivo; custo que caiu também é positivo) e **Cor: âmbar** (atenção) |
| Mudar o período | Clico no período (ex.: `NOVEMBRO 2026`): ele muda em todos os lugares |
| Pôr mais um item | Embaixo do grupo (indicadores, resultados, lançamentos, projetos, aprendizados, agenda), clico em **+ Adicionar …**; ou passo o mouse num item › **+ Adicionar depois**. O item novo vem com textos [entre colchetes] (e imagem neutra) para trocar. A grade se ajusta sozinha, no computador e no celular |
| Tirar um item sem dado | Passo o mouse no item › **Tirar item** (canto de cima, à direita). A grade se ajusta. Nunca deixo o número do mês anterior nem escrevo 0 |
| Tirar uma seção inteira | **Seções do report** › desmarco a seção. A numeração se ajusta |
| Voltar atrás | **Desfazer** (imagem, link, cor, item); **Ctrl+Z** (texto) |

`%` é variação relativa (+30%); `p.p.` é diferença entre duas porcentagens (de 40% para 52% = +12 p.p.). Não troque um pelo outro.

### Trocar uma imagem: os 11 passos

1. Prepare a imagem: `.png` ou `.jpg`, nome no padrão, na pasta `imagens` do mês.
2. Abra o emulador e o report.
3. Encontre a imagem na página (role dentro do quadro).
4. Passe o mouse sobre ela: aparece a barra vermelha.
5. Clique em **Trocar imagem**.
6. Na janela **Abrir** do Windows, vá até a pasta `imagens` do mês.
7. Clique no arquivo e em **Abrir**.
8. Confira a imagem no lugar e a linha de estado ("Imagem trocada: nome-do-arquivo"). Se aparecer "pode ficar borrada", a imagem é menor que o espaço: peça a versão em alta.
9. Clique em **Descrição** e escreva o que a imagem mostra.
10. Clique em **Salvar report (.html)**.
11. Reabra o arquivo salvo e confira se a imagem continua lá.

**Imagens opcionais:** selo, logo e prints do Transformation Hub têm **Tirar imagem** (o espaço sai junto). **Vídeo:** no projeto principal, no destaque e nos lançamentos, **Colocar vídeo** (`.mp4`); depois, **Trocar vídeo** ou **Tirar o vídeo**. No report completo o vídeo toca; no e-mail vai só a capa.

**Links:** passe o mouse no link › **Colocar link** / **Trocar link** (vale qualquer link: `https://`, o caminho do arquivo, `C:\…`, `\\servidor\…` ou `file:///…`, que abre só onde o arquivo está, `mailto:`, `msteams:`, endereço relativo…), **Anexar PDF** (o documento vai dentro do report e abre em nova aba) ou **Tirar link**. No Transformation Hub, **Texto do link** muda o nome do link.

**Mais um link ou mais imagens num item:** passe o mouse no item (projeto, lançamento, destaque, aprendizado…) › **+ Link** (escreva o texto e cole o endereço) ou **+ Imagem** (escolha o arquivo e escreva a descrição). Até 3 imagens por item. Para tirar: passe o mouse no link ou na imagem › **Tirar link** / **Tirar imagem**.

**Assunto novo (ex.: Testes):** clique em **+ Novo tópico** (barra de ferramentas), escreva o nome e escolha o layout olhando as miniaturas: **Lista** (um item embaixo do outro, com links e imagens), **Colunas** (até 3, numeradas), **Cartões** (imagem em cima, 3 por linha) ou **Números** (até 4 números grandes). O tópico aparece antes do "Foco do próximo mês": troque o título e os itens [entre colchetes]; use **+ Adicionar …**, **+ Link** e **+ Imagem**. Cabem até 4 tópicos novos, no modelo em branco ou em qualquer report. Eles vão no report, no e-mail completo e no e-mail-resumo. Para tirar: **Desfazer** ou desmarque o tópico em "Seções do report".

### Campanhas (O que lançamos)

Destaque do mês (categoria, título, texto, imagem e até 3 resultados) e até 6 lançamentos (status, nome, texto, imagem). Status em verde (no ar) ou âmbar (em teste, previsto). Mais lançamentos: **+ Adicionar lançamento** (o 4º abre uma linha nova). Menos: **Tirar item** nos que sobrarem.

### Importar conteúdo do Copilot

1. Organize os textos e números no Copilot corporativo com a [biblioteca de prompts](PROMPTS_COPILOT.md) (prompts 1 a 10).
2. Com tudo aprovado, use o **Prompt 11** e copie a resposta.
3. No emulador, **Importar conteúdo (Copilot)** › cole › **Aplicar na página**.
4. O emulador diz quantos campos preencheu e o que ficou de fora. Confira campo a campo.

Imagens, links e PDF não vêm pelo Copilot: troque na página.

### Salvar, reabrir e recuperar

- **Salvar report (.html):** o Chrome ou o Edge abre a janela **Salvar como**, com o nome sugerido (`report-2026-11.html`). Escolha a pasta do mês. Sem a janela, o arquivo vai para Downloads. Salvar de novo grava por cima.
- Depois de salvar, o estado diz se ainda sobraram textos [entre colchetes] ou links sem endereço.
- **Reabrir:** "Abrir um report salvo (.html)". Textos, números e imagens voltam como ficaram.
- **Fechou sem salvar?** Ao abrir o emulador de novo: "Há uma edição não salva…" › **Recuperar a edição**. A cópia fica só neste navegador, neste computador.
- **Mês novo a partir do anterior:** abra o report do mês anterior e troque o período. Ao salvar, o emulador lista os números que ninguém mexeu: confira antes de "Salvar mesmo assim".

## 3. Conferir e publicar

**No navegador:** dois cliques no `report-AAAA-MM.html`. Textos sem [colchetes]; números iguais à fonte, com base e cor certas; imagens nítidas; links e PDF abrindo em nova aba; vídeo tocando; ao rolar, os números contam até o valor.

**No celular:** no emulador, botão **Celular**; depois de publicado, abra o link no celular.

**Publicar:**

1. Publique o `report-AAAA-MM.html` no **ambiente corporativo autorizado** da área, com acesso para quem vai receber o e-mail.
2. Copie o link de compartilhamento (começa com `https://`).
3. No emulador, passo 3, cole em **Link do report completo**.
4. Teste numa janela anônima (Chrome) ou InPrivate (Edge): **Ctrl+Shift+N**, cole e aperte Enter. O report precisa abrir.

**Para testar no seu computador** (antes de publicar): no passo 3 vale o caminho do arquivo. Abra o report salvo no Chrome ou no Edge e copie o endereço da barra (`file:///…`), ou, no Explorador, botão direito no arquivo › **Copiar como caminho** (`C:\…`). O emulador avisa: esse link abre só onde o arquivo está (no seu computador ou numa pasta de rede, para quem tem acesso). Para enviar à área, troque pelo link do ambiente autorizado.

## 4. E-mail-resumo e envio

1. **Sem o link**, o botão "Baixar e-mail-resumo" fica bloqueado e a prévia mostra "FALTA O LINK DO REPORT COMPLETO".
2. **Indicadores:** vêm marcados os números do projeto principal (até 3). Troque se quiser (resultados do destaque ou Creative X). Só aparecem indicadores que estão no report.
3. **Botão:** "Acessar report completo", o único link do e-mail.
4. **Status:** ✓ pronto · ! olhar · ✕ problema. **Prévia:** Computador e Celular.
5. **Baixar e-mail-resumo (.eml):** vai para Downloads (`report-AAAA-MM-resumo.eml`).
6. **Outlook:** dois cliques no `.eml`. O Outlook clássico abre uma mensagem nova com assunto e imagens. Abriu como mensagem recebida (novo Outlook)? **Encaminhar** e apague o cabeçalho do topo.
7. Envie primeiro **só para você**: confira no computador e no celular e clique no botão.
8. Tudo certo: abra o `.eml` de novo, coloque os destinatários autorizados e envie.

## 5. Problemas comuns

| O que aconteceu | O que fazer |
|---|---|
| O emulador abriu em outro programa | Botão direito › Abrir com › Chrome ou Edge |
| Não consigo escrever no texto | Clique dentro do contorno tracejado. Rótulos fixos (ex.: "O QUE LANÇAMOS") não mudam |
| "A imagem não abriu" | Use `.png` ou `.jpg` |
| "pode ficar borrada" | A imagem é menor que o espaço: peça a versão em alta |
| "Link não aceito" | O endereço começa com `javascript:`, `data:` ou `vbscript:` (pode executar código). Qualquer outro link vale: `https://`, caminho do arquivo, `mailto:`… |
| "é um arquivo: abre só onde esse caminho existe" | Normal para testar no seu computador. Para enviar à área, use o link do ambiente autorizado |
| Fechei sem salvar | Abra o emulador: **Recuperar a edição** |
| Não acho o arquivo salvo | Downloads ou a pasta escolhida; pesquise `report-` no Explorador |
| "Confira os números antes de salvar" | O período mudou e há números iguais ao mês anterior: atualize ou oculte |
| "Falta o link do report completo" | Publique o report e cole o link no passo 3 |
| "Ainda é texto do modelo" | Sobrou texto [entre colchetes] ou X: corrija e salve |
| O botão do e-mail não abre o report | Teste o link em janela anônima; peça acesso para o público |

## 6. Checklist mensal

**Preparar**
- [ ] Resultados aprovados pela área
- [ ] Imagens do mês na pasta, com nomes no padrão (logos e selos: PNG original)
- [ ] Textos organizados (Copilot, prompts 1 a 10)

**Editar e salvar**
- [ ] Período certo
- [ ] Frase do mês e projeto principal
- [ ] Indicadores: valor, base, variação e cor (sem dado: item oculto)
- [ ] Imagens trocadas e descrições escritas
- [ ] Links com `https://` (ou PDF anexado)
- [ ] Nenhum texto [entre colchetes]
- [ ] Salvo como `report-AAAA-MM.html`, reaberto e conferido (computador e celular)

**Publicar e enviar**
- [ ] Report publicado no ambiente autorizado; link testado em janela anônima
- [ ] Link colado no emulador; até 3 indicadores; status verde; prévia conferida
- [ ] `.eml` aberto no Outlook, enviado primeiro para você, botão testado
- [ ] Enviado aos destinatários autorizados
