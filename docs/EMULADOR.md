# O emulador do report

O emulador é o centro da operação mensal. Um arquivo só (`kit/emulador-report.html`), que abre no **Chrome** ou no **Edge**, sem instalar nada, e faz tudo na mesma página:

| Passo | O que faz |
|---|---|
| **1 · Abrir** | "Começar do modelo em branco" (o modelo embutido, com todas as seções) ou "Abrir um report salvo (.html)" (também arrastando o arquivo) |
| **2 · Editar e salvar** | Textos, indicadores, imagens, vídeos, links e PDF na própria página; ocultar itens e seções; importar conteúdo do Copilot; salvar o report do mês (`report-AAAA-MM.html`) |
| **3 · Link** | O destino do botão do e-mail: **qualquer link** (4.7). Para a área, o link do report publicado no ambiente corporativo autorizado (`https://…`); para testar, o caminho do arquivo (`C:\…`, `\\servidor\…`, `file:///…`); também endereço sem `https://`, `mailto:`, `msteams:` ou relativo |
| **4 · E-mail-resumo** | Até 3 indicadores e o texto do botão |
| **5 · Status** | Cada etapa da conversão, em tempo real (✓ · ! · ✕) e o registro |
| **6 · Baixar** | O e-mail-resumo (`.eml`) e, opcional, o e-mail completo |
| **Prévia** | O e-mail como vai no `.eml`, no computador e no celular |

Nada é enviado para a internet: a página só lê e grava os arquivos que você escolhe. Passo a passo para o time: [COMO_ATUALIZAR_O_MES.md](COMO_ATUALIZAR_O_MES.md) e o guia ilustrado, [kit/guia-operacional.pdf](../kit/guia-operacional.pdf).

## Edição

O report abre num quadro, já como página final. As ferramentas de edição existem só dentro do emulador e **não vão para o arquivo salvo** (quem recebe não vê contorno, barra nem botão de edição).

| Onde | Ferramenta |
|---|---|
| Texto ou número (contorno tracejado) | Clique e escreva. O texto de exemplo [entre colchetes] fica selecionado ao clicar. Enter confirma; Shift+Enter quebra a linha; colar entra sem formatação; negrito e itálico não mudam (layout fixo). O período muda em todos os lugares |
| Etiqueta de variação ou status | Ao clicar: "Cor: verde" e "Cor: âmbar" |
| Imagem | Passe o mouse: **Trocar imagem** (recorta e reduz para o espaço, em dobro para telas de alta resolução; avisa se for pequena), **Descrição** (texto alternativo). Projeto principal, destaque e lançamentos: **Colocar vídeo** / **Trocar vídeo** / **Tirar o vídeo**. Selo, logo, prints do Transformation Hub e imagens adicionadas: **Tirar imagem** (as outras sobem e se reorganizam) |
| Link | **Colocar link** / **Trocar link** (qualquer link: `https://`, endereço sem `https://` (ganha o `https://`), caminho do arquivo (vira `file:///…`, com aviso), `mailto:`, `msteams:`, endereço relativo (com aviso); espaço vira `%20`; só `javascript:`/`data:`/`vbscript:` são recusados; links iguais mudam juntos), **Anexar PDF** (vai dentro do report e abre em nova aba no clique; no e-mail vira texto), **Tirar link** (a quebra de linha sai junto; a linha vazia também); nos links de lista (Transformation Hub, novo tópico, links adicionados), **Texto do link** |
| Mais links e mais imagens (4.6) | Passe o mouse no item ou bloco: **+ Link** (texto do link e endereço; sem endereço, o link fica cinza, pendente, e se completa com **Colocar link** ou **Anexar PDF**) e **+ Imagem** (escolha o arquivo e escreva a descrição). Vale para todos os itens e para o destaque, o projeto principal (capa) e o foco. Os links entram no fim do texto, **um embaixo do outro** (no projeto do Transformation Hub, junto dos que já existem; em "foi bem"/"a melhorar", na linha de baixo da frase). Reports de antes, com links separados por " · ", passam a um por linha ao abrir no emulador. As imagens: **até 3 por item**, lado a lado na largura da coluna (coluna de 184 px: uma embaixo da outra; novo tópico: 1 × 600, 2 × 288 ou 3 × 184 px), juntas dos prints que o item já tem; no celular, empilhadas; no report, abrem maiores no clique. Fundo vermelho (capa, foco): link em branco |
| Item (número, resultado, lançamento, projeto, aprendizado, agenda, "foi bem"/"a melhorar") | **+ Adicionar …** (embaixo de cada grupo, sempre visível) e **+ Adicionar depois** / **Tirar item** (passando o mouse; o último item de um grupo não sai, para a seção não ficar vazia: para tirar tudo, oculte a seção). Regra dos nomes: "+ Adicionar …" põe, "Tirar …" tira (item, link, imagem, vídeo), "Ocultar" é só para seção, que volta quando quiser. O item novo vem do modelo em branco, com textos [entre colchetes]; a grade é refeita com as regras do motor (linhas de 3, larguras, espaços e classes do celular) e as chaves seguem em sequência. Máximo: 4 indicadores, 3 resultados, 6 lançamentos, 4 "foi bem", 4 "a melhorar", 3 projetos, 3 aprendizados, 6 itens na agenda; nos tópicos novos, o do layout (lista 6, colunas 3, cartões 6, números 4) |
| Seção | "Seções do report": desmarcar tira a seção do report e do e-mail; a numeração (01, 02…) se ajusta na hora |
| Novo tópico (ex.: Testes) (4.7) | Para um assunto que ainda não tem seção. **+ Novo tópico** (na barra de ferramentas ou em "Seções do report"): escreva o nome (vai em MAIÚSCULAS, ex.: TESTES) e escolha o layout pela miniatura: **Lista** (um item embaixo do outro, largura inteira, com status, links e imagens, como o Transformation Hub; até 6), **Colunas** (numeradas, lado a lado, como "O que aprendemos"; até 3), **Cartões** (imagem em cima, 3 por linha, como "Também neste mês"; até 6) ou **Números** (números grandes com o que medem, como os da capa; até 4). O tópico entra antes do "Foco do próximo mês" (depois dos tópicos que já existem), com textos [entre colchetes], e a numeração se refaz. Até **4 tópicos novos** por report, no modelo em branco ou em qualquer report aberto (inclusive de antes da 4.6). Itens: **+ Adicionar …** e **Tirar item** (a grade se refaz); **+ Link** e **+ Imagem** (menos em Números). Cada tópico aparece em "Seções do report" com o nome dele: desmarcar oculta; **Desfazer** tira. Vai na página, no e-mail completo e no **e-mail-resumo** (rótulo, título e até 4 itens; em Números, cada número também pode ser escolhido como indicador) |
| Barra de ferramentas | **Salvar report (.html)**, **Importar conteúdo (Copilot)**, **Desfazer** (imagem, vídeo, link, cor, item, seção, importação; texto: Ctrl+Z), **Computador / Celular** |

### Salvar

- No Chrome e no Edge, **Salvar report (.html)** abre a janela "Salvar como", com o nome sugerido pelo período (`report-2026-11.html`); salvar de novo grava por cima. Sem esse recurso, o arquivo vai para Downloads.
- O arquivo salvo é a **versão interativa** (movimento, vídeos, peças e PDF no clique), com tudo dentro, e continua editável no emulador.
- O título da página (assunto do e-mail) acompanha o período; o texto da caixa de entrada acompanha a frase do mês.
- Depois de salvar, o estado diz quantos textos de exemplo [entre colchetes] e links sem endereço sobraram.

### Proteções

- **Não inventa número:** o emulador não calcula nem preenche indicador. Sem dado, o item é ocultado.
- **Mês anterior:** se o período mudou num report aberto do arquivo, ao salvar aparece "Confira os números antes de salvar", com a lista dos números que ninguém mexeu (pelo nome do campo, ex.: "Número 1 da capa (valor)"). "Voltar e conferir" não salva.
- **Edição não salva:** uma cópia fica no navegador (IndexedDB, só neste computador) até salvar. Ao abrir o emulador de novo: "Recuperar a edição" ou "Descartar". Fechar a aba com alterações pede confirmação.
- **Página parada durante a edição:** o report é mostrado sem script (o movimento só existe no arquivo salvo).

### Importar conteúdo (Copilot)

Cole a resposta do Copilot no formato de blocos do report (`[NUMERO 1]`, `valor: 12,5%`…) e **Aplicar na página**. Os campos que existem na página são preenchidos (variação ganha a seta; `variacao_cor`/`status_cor` dão a cor); o resto é listado como "ficou de fora". Não traz imagens, links nem PDF e não cria item nem seção nova (para o novo tópico, ligue a seção antes de importar `[TOPICO]`). Formato e prompts: [PROMPTS_COPILOT.md](PROMPTS_COPILOT.md).

## Status: o que é amarelo e como resolver (4.8.1)

| No status | O que fazer |
|---|---|
| "Ainda é texto do modelo: …" | **Ir até lá**: o emulador rola até o texto e põe o cursor nele. Troque e aperte Enter: o item sai em menos de um segundo |
| "Repete a frase do mês" | **Ir até lá** leva aos indicadores: troque o indicador ou a frase. Ou **Ok, ciente** se quiser assim |
| "Link: …" (link de arquivo, relativo, sem https) | **Ir até lá** leva ao passo 3. Se o link é esse mesmo, **Ok, ciente**: a etapa fica verde |
| Notas do Outlook, imagem da internet, report não reconhecido | Leia e, se estiver tudo certo, **Ok, ciente** |
| Vermelho (✕) | Erro: o e-mail não é montado até resolver (ex.: imagem em arquivo que falta) |

O "ciente" vale enquanto o aviso for o mesmo e até abrir outro report. O "X" só conta como texto do modelo no lugar de um número (X%, +X p.p., R$ X); "Creative X 79%" é texto real.

## Arquivos leves (4.8)

O emulador otimiza sozinho o que entra, para o report, os e-mails e o próprio emulador não ficarem pesados:

| Arquivo | O que acontece |
|---|---|
| Imagem (Trocar imagem, + Imagem) | Entra no tamanho de uso (o dobro da coluna), em JPEG quando não tem transparência; PNG só com transparência (logo, selo) e quando fica menor. A versão ampliada (clique) vai até 1200 px e não é guardada quando não é maior que a imagem da página |
| Vídeo acima de 4 MB | Pergunta se otimiza: o vídeo é refeito no navegador (até 960 px, com som), com barra de andamento; leva o tempo do vídeo. "Usar o original" para e mantém o arquivo como veio |
| Report pesado aberto | Imagens acima de 160 KB são refeitas no tamanho de uso; o status diz quanto ficou mais leve. Salve para gravar |
| PDF anexado | Vai como está (o navegador não reduz PDF): prefira o PDF exportado "para web" ou com tamanho mínimo |

A edição e a prévia do e-mail crescem até o tamanho do conteúdo: rolando a página, o report (ou o e-mail) aparece inteiro, também no modo **Celular**, sem rolagem dentro do quadro.

**Ícones da aba:** o report (`.html`) leva a chama do Santander; o emulador e o `gerar-report.html`, a chama com o selo PF. Os e-mails não levam ícone.

## E-mail-resumo

Curto de propósito, na identidade do report (vermelho Santander, Lisboa, chama):

| Bloco | O que mostra |
|---|---|
| Abertura (vermelha) | Chama, "Creative Strategy PF", REPORT MENSAL · período, a frase do mês e uma linha de contexto |
| Principais resultados | **Até 3 indicadores**, cada um com valor, título, base e variação. Quando todos vêm do mesmo projeto, uma linha diz o nome dele (ex.: Milheiros). Sem repetição (4.8): o detalhe que só repete o número sai, e o nome do projeto não aparece de novo se a frase ou o título já o dizem |
| Tópicos novos (4.7) | Cada tópico novo do report (ex.: TESTES): rótulo, título e até 4 itens (nome e status; em Números, o número antes). Mais itens: "E mais N no report completo". Sem link: o link do e-mail continua sendo só o botão. A chamada cita os tópicos ("Campanhas, …, testes e os próximos passos") |
| Chamada | "Acesse o report completo." e o botão **Acessar report completo**, o **único link** do e-mail: célula vermelha com link de texto, que continua clicável depois que o Outlook envia |
| Assinatura | CUSTOMER INTERACTIONS · RESUMO DO REPORT MENSAL |

Sem vídeo, carrossel, botões secundários nem script. **Cantos retos de propósito** (4.5): ao enviar, o Outlook para Windows tira os cantos arredondados para todos que recebem, então a prévia já mostra o e-mail como ele chega.

**Indicadores:** cada um aparece com o nome do projeto, ex.: "28 · Contas abertas (Milheiros)" (4.8). O número que a frase do mês já diz não vem marcado e mostra "já está na frase do mês"; marcado mesmo assim, o status avisa "Repete a frase do mês". Os candidatos são os números da página (projeto principal, resultados do destaque, Creative X e os números dos tópicos novos no layout Números); vêm marcados os do projeto principal. A pessoa escolhe até 3 (o 4º fica bloqueado). Nenhum número é criado: sem indicador na página, o e-mail sai só com a frase e a chamada.

**Link:** vem do report, se já estiver gravado nele; senão, cole no passo 3. **Vale qualquer link** (4.7): `https://…` (ambiente autorizado), endereço sem `https://` (ex.: `empresa.sharepoint.com/…`, ganha o `https://`, com aviso), o caminho do arquivo, que vira `file:///…` (abre só onde o arquivo está; o status avisa), `mailto:`, `msteams:` ou um endereço relativo (ex.: `report-2026-10.html`, com aviso). Espaço vira `%20`. Só endereço que executa código (`javascript:`, `data:`, `vbscript:`) é recusado. Sem link válido, a prévia mostra "FALTA O LINK DO REPORT COMPLETO" no lugar do botão e o `.eml` do resumo não é liberado.

## Status (tempo real)

| Etapa | O que acontece |
|---|---|
| Ler o report | Nome e tamanho |
| Reconhecer o report | Período e versão da ferramenta |
| Tirar o que o e-mail não aceita | Script, ampliação, vídeo, marcas do movimento e da edição |
| Montar o e-mail-resumo | Os indicadores escolhidos, o que ainda é texto do modelo e o destino do botão |
| Colocar as imagens dentro dos e-mails | Cada imagem vira anexo embutido (`cid:`), com contador |
| Montar o e-mail completo / o e-mail-resumo | Conferência do Outlook e tamanho final |

O `.eml` é MIME padrão, com as imagens dentro e o cabeçalho `X-Unsent: 1` (o Outlook clássico abre como mensagem nova). Detalhes: [HOW_TO_EXPORT_EML.md](HOW_TO_EXPORT_EML.md).

## Avançado

- **Imagens em arquivo ao lado do .html:** só para páginas salvas pelo Chrome como "Página da Web, completa" (pasta `_files`). Os reports salvos pelo emulador já trazem tudo dentro.
- **Páginas antigas (antes da 4.2):** sem as marcas da página, o resumo não é montado; gere a página de novo.

## Problemas comuns

| Status | O que fazer |
|---|---|
| "Falta o link do report completo" | Publique o report e cole o link (passo 3) |
| "Link não aceito" / "esse tipo de endereço não é permitido" | O endereço começa com `javascript:`, `data:` ou `vbscript:` (pode executar código). Cole o link do ambiente autorizado ou o caminho do arquivo |
| "é um arquivo: abre só onde esse caminho existe" | Normal para testar; para enviar à área, use o link do ambiente autorizado |
| "Ainda é texto do modelo" | Sobrou texto [entre colchetes] ou X: corrija na página e salve |
| "Nenhum indicador na página" | Confira se os números foram preenchidos |
| "Faltam N imagens em arquivo ao lado do .html" | "Avançado: imagens em arquivo" › escolha a pasta |
| "Acima de 10 MB" (e-mail completo) | Alguma imagem grande entrou no e-mail completo; o e-mail-resumo é o recomendado |
