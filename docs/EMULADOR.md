# O emulador do report

O emulador é o centro da operação mensal. Um arquivo só (`kit/emulador-report.html`), que abre no **Chrome** ou no **Edge**, sem instalar nada, e faz tudo na mesma página:

| Passo | O que faz |
|---|---|
| **1 · Abrir** | "Começar do modelo em branco" (o modelo embutido, com todas as seções) ou "Abrir um report salvo (.html)" (também arrastando o arquivo) |
| **2 · Editar e salvar** | Textos, indicadores, imagens, vídeos, links e PDF na própria página; ocultar itens e seções; importar conteúdo do Copilot; salvar o report do mês (`report-AAAA-MM.html`) |
| **3 · Link** | O destino do botão do e-mail: o link do report publicado no ambiente corporativo autorizado (`https://…`) ou, para testar, o caminho do arquivo (`C:\…`, `\\servidor\…`, `file:///…`) |
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
| Imagem | Passe o mouse: **Trocar imagem** (recorta e reduz para o espaço, em dobro para telas de alta resolução; avisa se for pequena), **Descrição** (texto alternativo). Projeto principal, destaque e lançamentos: **Colocar vídeo** / **Trocar vídeo** / **Tirar o vídeo**. Selo, logo e prints do Transformation Hub: **Tirar imagem** |
| Link | **Colocar link** / **Trocar link** (`https://` ou caminho do arquivo, que vira `file:///…` e ganha um aviso; links iguais mudam juntos), **Anexar PDF** (vai dentro do report e abre em nova aba no clique; no e-mail vira texto), **Tirar link**; no Transformation Hub, **Texto do link** |
| Item (número, resultado, lançamento, projeto, aprendizado, agenda, "foi bem"/"a melhorar") | **+ Adicionar …** (embaixo de cada grupo, sempre visível) e **+ Adicionar depois** / **Ocultar item** (passando o mouse). O item novo vem do modelo em branco, com textos [entre colchetes]; a grade é refeita com as regras do motor (linhas de 3, larguras, espaços e classes do celular) e as chaves seguem em sequência. Máximo: 4 indicadores, 3 resultados, 6 lançamentos, 4 "foi bem", 4 "a melhorar", 3 projetos, 3 aprendizados, 6 itens na agenda |
| Seção | "Seções do report": desmarcar tira a seção do report e do e-mail; a numeração se ajusta |
| Barra de ferramentas | **Salvar report (.html)**, **Importar conteúdo (Copilot)**, **Desfazer** (imagem, vídeo, link, cor, item, importação; texto: Ctrl+Z), **Computador / Celular** |

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

Cole a resposta do Copilot no formato de blocos do report (`[NUMERO 1]`, `valor: 12,5%`…) e **Aplicar na página**. Os campos que existem na página são preenchidos (variação ganha a seta; `variacao_cor`/`status_cor` dão a cor); o resto é listado como "ficou de fora". Não traz imagens, links nem PDF e não cria item novo. Formato e prompts: [PROMPTS_COPILOT.md](PROMPTS_COPILOT.md).

## E-mail-resumo

Curto de propósito, na identidade do report (vermelho Santander, Lisboa, chama):

| Bloco | O que mostra |
|---|---|
| Abertura (vermelha) | Chama, "Creative Strategy PF", REPORT MENSAL · período, a frase do mês e uma linha de contexto |
| Principais resultados | **Até 3 indicadores**, cada um com valor, título, base e variação. Quando todos vêm do mesmo projeto, uma linha diz qual |
| Chamada | "Acesse o report completo." e o botão **Acessar report completo**, o **único link** do e-mail (também no Outlook para Windows, em VML) |
| Assinatura | CUSTOMER INTERACTIONS · RESUMO DO REPORT MENSAL |

Sem vídeo, carrossel, botões secundários nem script.

**Indicadores:** os candidatos são os números da página (projeto principal, resultados do destaque e Creative X); vêm marcados os do projeto principal. A pessoa escolhe até 3 (o 4º fica bloqueado). Nenhum número é criado: sem indicador na página, o e-mail sai só com a frase e a chamada.

**Link:** vem do report, se já estiver gravado nele; senão, cole no passo 3: `https://…` (ambiente autorizado) ou o caminho do arquivo, que vira `file:///…` (abre só onde o arquivo está; o status avisa). Sem link válido, a prévia mostra "FALTA O LINK DO REPORT COMPLETO" no lugar do botão e o `.eml` do resumo não é liberado.

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
| "O link do report completo não é um endereço" | Cole `https://…` ou o caminho do arquivo (`C:\…`, `\\servidor\…`, `file:///…`) |
| "é um arquivo: abre só onde esse caminho existe" | Normal para testar; para enviar à área, use o link do ambiente autorizado |
| "Ainda é texto do modelo" | Sobrou texto [entre colchetes] ou X: corrija na página e salve |
| "Nenhum indicador na página" | Confira se os números foram preenchidos |
| "Faltam N imagens em arquivo ao lado do .html" | "Avançado: imagens em arquivo" › escolha a pasta |
| "Acima de 10 MB" (e-mail completo) | Alguma imagem grande entrou no e-mail completo; o e-mail-resumo é o recomendado |
