# O emulador do report

O emulador é o centro da operação mensal. Um arquivo só (`kit/emulador-report.html`), que abre no **Chrome** ou no **Edge**, sem instalar nada, e faz tudo na mesma página:

| Passo | O que faz |
|---|---|
| **1 · Abrir** | "Começar do modelo em branco" (o modelo embutido, com todas as seções) ou "Abrir um report salvo (.html)" (também arrastando o arquivo) |
| **2 · Editar e salvar** | Textos, indicadores, imagens, vídeos, links e PDF na própria página; ocultar itens e seções; importar conteúdo do Copilot; salvar o report do mês (`report-AAAA-MM.html`) |
| **3 · Link** | O destino do botão do e-mail: **qualquer link**. O caminho do arquivo do report (`C:\…`, como a pasta do OneDrive no computador, `\\servidor\…`, `file:///…`) ou o link de compartilhamento (`https://…`); também endereço sem `https://`, `mailto:`, `msteams:` ou relativo. Caminho com espaço e acento vai no formato que o Outlook abre (4.12) |
| **4 · E-mail-resumo** | Até 4 destaques (escolher, ordenar, ajustar, imagem, link, informação nova) e o texto do botão |
| **5 · Status** | Cada etapa da conversão, em tempo real (✓ · ! · ✕) e o registro |
| **6 · Baixar** | O e-mail-resumo (`.eml`), a imagem do resumo (`.png`, 4.13) e, opcional, o e-mail completo |
| **Prévia** | O e-mail como vai no `.eml`, no computador e no celular |

Nada é enviado para a internet: a página só lê e grava os arquivos que você escolhe. Passo a passo para o time: [COMO_ATUALIZAR_O_MES.md](COMO_ATUALIZAR_O_MES.md) e o guia ilustrado, [kit/guia-operacional.pdf](../kit/guia-operacional.pdf).

## Edição

O report abre num quadro, já como página final. As ferramentas de edição existem só dentro do emulador e **não vão para o arquivo salvo** (quem recebe não vê contorno, barra nem botão de edição).

| Onde | Ferramenta |
|---|---|
| Texto ou número (contorno tracejado) | Clique e escreva. O texto de exemplo [entre colchetes] fica selecionado ao clicar. Enter confirma; Shift+Enter quebra a linha; colar entra sem formatação; negrito e itálico não mudam (layout fixo). O período muda em todos os lugares |
| Etiqueta de variação ou status | Ao clicar: "Cor: verde" e "Cor: âmbar" |
| Imagem | Passe o mouse: **Trocar imagem** (recorta e reduz para o espaço, em dobro para telas de alta resolução; avisa se for pequena), **Descrição** (texto alternativo). Projeto principal, destaque e lançamentos: **Colocar vídeo** / **Trocar vídeo** / **Tirar o vídeo**. Selo, logo, prints do Transformation Hub e imagens adicionadas: **Tirar imagem** (as outras sobem e se reorganizam) |
| Link | **Colocar link** / **Trocar link** (qualquer link, sem aviso: `https://`, endereço sem `https://` (ganha o `https://`), caminho do arquivo (vira `file:///…`), `mailto:`, `msteams:`, endereço relativo (com aviso); espaço vira `%20`; só `javascript:`/`data:`/`vbscript:` são recusados; links iguais mudam juntos), **Anexar PDF** (vai dentro do report e abre em nova aba no clique; no e-mail vira texto), **Tirar link** (a quebra de linha sai junto; a linha vazia também); nos links de lista (Transformation Hub, novo tópico, links adicionados), **Texto do link** |
| Mais links e mais imagens (4.6) | Passe o mouse no item ou bloco: **+ Link** (texto do link e endereço; sem endereço, o link fica cinza, pendente, e se completa com **Colocar link** ou **Anexar PDF**) e **+ Imagem** (escolha o arquivo e escreva a descrição). Vale para todos os itens e para o destaque, o projeto principal (capa) e o foco. Os links entram no fim do texto, **um embaixo do outro** (no projeto do Transformation Hub, junto dos que já existem). Reports de antes, com links separados por " · ", passam a um por linha ao abrir no emulador. As imagens: **até 3 por item**, lado a lado na largura da coluna (coluna de 184 px: uma embaixo da outra; novo tópico: 1 × 600, 2 × 288 ou 3 × 184 px), juntas dos prints que o item já tem; no celular, empilhadas; no report, abrem maiores no clique. Fundo vermelho (capa, foco): link em branco |
| **+ Adicionar item** (4.12) | Na barra de ferramentas. Um assistente em 4 passos: **1. Tipo** (Indicador, Card, Texto, Destaque, Imagem, Vídeo ou Conteúdo complementar; só aparece o que o report já tem, e o tipo sem lugar livre fica apagado com o motivo), **2. Onde** (o grupo e a posição: "Antes de: …" ou "No fim"; grupo cheio ou seção oculta aparece bloqueado com o motivo), **3. Conteúdo** (os campos do próprio componente: valor, título, detalhe, variação e a cor, status, nome, texto, data…; imagem com descrição; link `https://`), **4. Prévia** (o item entra na página, destacado, com a grade refeita; **Confirmar**, **Voltar e ajustar** (a prévia sai e os campos continuam preenchidos) ou **Cancelar** (a página volta como estava)). Cada tipo vira um componente que já existe: Indicador → números da capa, resultados do destaque, indicadores do Creative X trimestral ou tópico em Números; Card → "Também neste mês" ou tópico em Cartões; Texto → "O que aprendemos", agenda ou tópico em Colunas/Lista; Destaque → projeto do Transformation Hub ou tópico em Lista; Imagem e Conteúdo complementar (link ou PDF) → um item que já existe; Vídeo → a peça do projeto principal, do destaque ou de um lançamento. Campo principal vazio (ex.: o valor do indicador) não deixa seguir. Tudo vira **um passo só no Desfazer** |
| Mudar um item de lugar (4.12) | Passe o mouse no item: **← Antes** / **Depois →** (nos grupos em coluna, **↑ Subir** / **↓ Descer**). A grade é refeita (o 1º número da capa continua em vermelho; lançamentos mudam de linha de 3 em 3) e as chaves seguem em sequência |
| Ordem das seções (4.12) | Entre a capa e o encerramento, que ficam fixos. Na página: passe o mouse numa seção e use a alça **⠿ Mover seção** (arraste; uma linha vermelha mostra, entre as seções, onde ela vai entrar, e a janela rola sozinha perto da borda; cinza = fica onde está; **Esc** cancela), ou **↑** / **↓** / **Posição…** na mesma alça. Em "Seções do report": arraste pela alça ⠿ da linha, ou **↑** / **↓** / **Posição…** (teclado e celular; o foco segue no botão). A numeração (01, 02…) se refaz, a seção movida pisca na página e **Desfazer** volta. A ordem vai no arquivo salvo, no e-mail completo e continua ao reabrir. Enquanto arrasta, só a linha se move (nada da página é refeito) |
| Item (número, resultado, lançamento, projeto, aprendizado, agenda) | **+ Adicionar …** (embaixo de cada grupo, sempre visível) e **+ Adicionar depois** / **Tirar item** (passando o mouse; o último item de um grupo não sai, para a seção não ficar vazia: para tirar tudo, oculte a seção). Regra dos nomes: "+ Adicionar …" põe, "Tirar …" tira (item, link, imagem, vídeo), "Ocultar" é só para seção, que volta quando quiser. O item novo vem do modelo em branco, com textos [entre colchetes]; a grade é refeita com as regras do motor (linhas de 3, larguras, espaços e classes do celular) e as chaves seguem em sequência. Máximo: 4 indicadores, 3 resultados, 6 lançamentos, 3 projetos, 3 aprendizados, 6 itens na agenda; nos tópicos novos, o do layout (lista 6, colunas 3, cartões 6, números 4) |
| Barras de botões (passando o mouse) | A barra fica no lugar enquanto o mouse vai até ela, mesmo passando por cima do cartão, da imagem ou de outro item no caminho (reto, em curva ou devagar). Se o mouse parar em outro lugar (0,4 s) ou se afastar dela, aparece a barra do que está embaixo dele (4.10.1) |
| Seção | **Tirar seção** na alça da seção (passe o mouse na seção, ao lado de **⠿ Mover seção**, 4.13) ou "Seções do report": desmarcar tira a seção do report e do e-mail; a numeração (01, 02…) se ajusta na hora; **Desfazer** traz de volta. Pela importação do Copilot: `[SECOES]` com `tirar:` e `mostrar:` (nomes como em Seções do report, separados por vírgula; nome que não existe é avisado). O "Resumo das campanhas" (foi bem / a melhorar) saiu do report na 4.11: um report de antes que ainda tem a seção a perde ao abrir, sem deixar vão (salve para gravar) |
| Novo tópico (ex.: Testes) (4.7) | Para um assunto que ainda não tem seção. **+ Novo tópico** (na barra de ferramentas ou em "Seções do report"): escreva o nome (vai em MAIÚSCULAS, ex.: TESTES), escolha **onde entra** (4.12; padrão: antes do "Foco do próximo mês") e o layout pela miniatura: **Lista** (um item embaixo do outro, largura inteira, com status, links e imagens, como o Transformation Hub; até 6), **Colunas** (numeradas, lado a lado, como "O que aprendemos"; até 3), **Cartões** (imagem em cima, 3 por linha, como "Também neste mês"; até 6) ou **Números** (números grandes com o que medem, como os da capa; até 4). O tópico entra antes do "Foco do próximo mês" (depois dos tópicos que já existem), com textos [entre colchetes], e a numeração se refaz. Até **4 tópicos novos** por report, no modelo em branco ou em qualquer report aberto (inclusive de antes da 4.6). Itens: **+ Adicionar …** e **Tirar item** (a grade se refaz); **+ Link** e **+ Imagem** (menos em Números). Cada tópico aparece em "Seções do report" com o nome dele: desmarcar oculta; **Desfazer** tira. Vai na página, no e-mail completo e no **e-mail-resumo** (rótulo, título e até 4 itens; em Números, cada número também pode ser escolhido como indicador) |
| Creative X trimestral (4.12) | No mês que fecha o trimestre, abaixo do resultado do mês: rótulo, título, até 3 indicadores, leitura curta e a estimativa (sempre com a etiqueta "Estimativa", para não se misturar ao que foi alcançado); o mês ganha o rótulo "MENSAL · MÊS ANO". Nos outros meses, passe o mouse no bloco e use **Tirar trimestral** (sai junto o rótulo MENSAL). Para trazer de volta: **+ Adicionar item › Indicador › Creative X: indicadores do trimestre**. A nota das siglas (CQR, QSR…) fica numa linha pequena no fim da seção |
| "O que aprendemos" da campanha (4.13) | Um bloco curto (uma ou duas frases) dentro da campanha: abaixo dos números do projeto principal, abaixo dos resultados do destaque (antes da nota) ou no fim do card do lançamento. Passe o mouse nos números, nos resultados ou no card: **+ O que aprendemos** cria o bloco com o texto do modelo para digitar por cima. No próprio bloco: **Tirar aprendizado** (o Desfazer devolve). Pela importação do Copilot, o campo `aprendizado` cria o bloco que falta. Sem texto, não aparece. Com os aprendizados nas campanhas, a seção geral "O que aprendemos" pode ficar repetida: oculte em **Seções do report** |
| Barra de ferramentas | **Salvar report (.html)**, **Importar conteúdo (Copilot)**, **+ Adicionar item**, **+ Novo tópico**, **Desfazer** (imagem, vídeo, link, cor, item, seção, importação; texto: Ctrl+Z), **Computador / Celular** |

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

## Status: o que é amarelo e como resolver (4.9)

Amarelo só aparece quando há algo a resolver no report. Link válido, imagem da internet ou report feito fora da ferramenta não deixam o status amarelo (são detalhes da etapa, quando ajudam).

| No status | O que fazer |
|---|---|
| "Ainda é texto do modelo: …" | **Ir até lá**: o emulador rola até o texto e põe o cursor nele. Troque e aperte Enter: o item sai em menos de um segundo. Item que não vale: **Tirar item** |
| "Falta o link do report completo" | Cole o link no passo 3 |
| "Repete a frase do mês" | **Ir até lá** leva aos destaques: troque o destaque ou a frase. Ou **Ok, ciente** se quiser assim |
| "Informação nova para revisar" | Confira a informação nova com os resultados e marque **Revisei** no cartão (ou tire o destaque). Até lá, o `.eml` não sai |
| Nota do Outlook no e-mail-resumo | Leia e, se estiver tudo certo, **Ok, ciente** |
| Vermelho (✕) | Erro: o e-mail não é montado até resolver (ex.: imagem em arquivo que falta) |

O "ciente" vale enquanto o aviso for o mesmo e até abrir outro report. O "X" só conta como texto do modelo no lugar de um número (X%, +X p.p., R$ X); "Creative X 64%" é texto real.

## Arquivos leves (4.8)

O emulador otimiza sozinho o que entra, para o report, os e-mails e o próprio emulador não ficarem pesados:

| Arquivo | O que acontece |
|---|---|
| Imagem (Trocar imagem, + Imagem) | Entra no tamanho de uso (o dobro da coluna), em JPEG quando não tem transparência; PNG só com transparência (logo, selo) e quando fica menor. A versão ampliada (clique) vai até 1200 px e não é guardada quando não é maior que a imagem da página |
| Vídeo acima de 4 MB | Pergunta se otimiza: o vídeo é refeito no navegador (até 960 px, com som), com barra de andamento; leva o tempo do vídeo. "Usar o original" para e mantém o arquivo como veio |
| Report pesado aberto | Imagens acima de 160 KB são refeitas no tamanho de uso; o status diz quanto ficou mais leve. Salve para gravar |
| PDF anexado | Vai como está (o navegador não reduz PDF): prefira o PDF exportado "para web" ou com tamanho mínimo |

A edição e a prévia do e-mail crescem até o tamanho do conteúdo: rolando a página, o report (ou o e-mail) aparece inteiro, sem rolagem dentro do quadro. **Celular** (4.9) é uma visualização só, de 390 px, para a edição e a prévia juntas, nunca mais larga que a tela: aberto num celular, o emulador já começa nela, sem rolagem para o lado.

**Desempenho (4.9):** fotos, vídeos e PDFs ficam como arquivos na memória do navegador enquanto você edita; o report em edição guarda só uma referência curta a cada um. Por isso editar, conferir e montar o resumo não passam mais pela mídia a cada mudança, e a página não trava, mesmo com reports de dezenas de MB e em notebooks modestos. A mídia volta para dentro do arquivo ao salvar, e o `.eml` é montado ao baixar. O rascunho guarda cada mídia uma vez só.

**Arquivos grandes (4.10):** abrir e salvar um report pesado é feito por um *Web Worker* (um processo do navegador ao lado da página), em blocos de 16 MB: a tela não trava e não há limite de texto do navegador (antes, um `.html` acima de ~500 MB dava "não parece um report"). Durante o trabalho pesado (abrir, salvar, otimizar imagens, recuperar a edição), um aviso discreto no canto da tela mostra o que está acontecendo e quanto falta.

| Report | Abrir | Salvar |
|---|---|---|
| 27 MB (notebook modesto, CPU 6× mais lenta) | 0,7 s, sem travar | 0,3 s, sem travar |
| 441 MB (vídeo de 330 MB) | 3,6 s | 2,3 s |
| 801 MB (vídeo de 600 MB) | 5,6 s | 4,1 s |

Se uma mídia passar da memória que o navegador consegue usar para arquivos (na prática, vídeo acima de ~1 GB), o emulador avisa ao abrir, deixa editar os textos e, ao salvar, diz qual mídia trocar: **nada é gravado pela metade**. Troque por um vídeo mais leve (passe o mouse › **Trocar vídeo**; o emulador otimiza ao colocar).

**Memória:** imagem trocada e desfeita sai da memória (a original volta); o **Desfazer** guarda os últimos 100 passos; as imagens originais pesadas, trocadas pelas otimizadas ao abrir, também saem. A prévia só recarrega quando muda.

**Identidade:** a aba do emulador se chama **Emulador Report PF**, e o símbolo **Santander + PF** fica no cabeçalho, numa placa branca (a chama vermelha não vai sobre o vermelho). O mesmo símbolo é o ícone da aba do emulador, do `gerar-report.html` e do report (`.html`): no report, só na aba, sem mudar o conteúdo. Os e-mails não levam ícone. Arquivos: `assets/marca/svg/santander-pf.svg` e `assets/marca/santander-pf-16.png`, `-32.png`, `-180.png`.

## E-mail-resumo

Curto de propósito, na identidade do report (vermelho Santander, Lisboa, chama):

| Bloco | O que mostra |
|---|---|
| Abertura (vermelha) | Chama, "Creative Strategy PF", REPORT MENSAL · período, a frase do mês e uma linha de contexto |
| Destaques do mês (4.13) | **Até 4 destaques**, escolhidos no passo 4, em cartões de dois por linha (com número ímpar, o primeiro ocupa a largura toda). Cada um: etiqueta com o nome curto da campanha, número (se tiver), título, descrição curta, etiqueta de variação ou status, imagem opcional (acima ou ao lado) e link opcional como texto ("Saiba mais"). O "O que aprendemos" de uma campanha sai com a etiqueta O QUE APRENDEMOS · NOME |
| Chamada | Num painel Rio: "Acesse o report completo." e o botão **Acessar report completo**, o **único botão** do e-mail (os links dos destaques, quando houver, são texto): célula vermelha com link de texto, que continua clicável depois que o Outlook envia. A frase cita os tópicos do report |
| Assinatura | CUSTOMER INTERACTIONS · RESUMO DO REPORT MENSAL |

Sem vídeo (a capa com ▶ leva ao report), carrossel, botões secundários nem script. **Cantos retos de propósito** (4.5): ao enviar, o Outlook para Windows tira os cantos arredondados para todos que recebem, então a prévia já mostra o e-mail como ele chega.

**Selecionar destaques do e-mail (4.13):** no passo 4, em duas partes.

- **No report (clique para incluir):** tudo o que a página oferece, por seção, com o nome da campanha: números do projeto principal e do destaque, Creative X (mês e trimestre), as campanhas (resumo), cada "O que aprendemos", lançamentos, Transformation Hub, a seção geral de aprendizados, o foco, a agenda e os itens dos tópicos novos. O que já está no e-mail aparece com ✓; com 4 escolhidos, o resto fica bloqueado.
- **No e-mail (na ordem):** os escolhidos, em cartões editáveis. **↑ ↓** mudam a ordem; **Tirar** tira. **Título** e **Descrição curta** podem ser ajustados só para o e-mail (o report não muda; o cartão mostra "texto ajustado para o e-mail"). O **número vem sempre da página**: mudou no report, muda no e-mail. **Link do destaque** (opcional) sai como texto ("Saiba mais" ou o que você escrever), sem competir com o botão principal; link que roda código não entra.
- **Imagem:** **+ Imagem do computador** (guardada reduzida no report) ou **+ Imagem do report** (as peças da página; um texto de campanha já entra com a peça dela). **Posição:** acima do texto ou ao lado (no destaque de largura toda). **Recorte:** centro, topo ou base, ou **Inteira (sem cortar)**. **Capa de vídeo (▶):** desenha o ▶ na imagem (o vídeo fica no report; a capa de vídeo do report já vem com ele).
- **+ Informação nova:** para algo que não está no report (número opcional, etiqueta, título, descrição). Entra com o selo "precisa de revisão" e o `.eml` fica travado até marcar **"Revisei: confere com os resultados"**. Não entra no report.
- **Sugestão:** sem mexer, o e-mail usa a sugestão (os números do projeto principal que a frase do mês ainda não diz, até 3; o contador mostra "· sugestão"). A primeira mudança transforma a sugestão na sua lista; **Voltar para a sugestão** desfaz.
- **Onde fica a escolha:** no report salvo, num bloco de dados à parte (`<script type="application/json" id="resumo-email">`), que não muda a página e não vai em nenhum dos dois e-mails. Ao reabrir, a escolha volta. Um destaque cujo item saiu do report fica marcado "não vai no e-mail", com aviso no status.

O número que a frase do mês já diz mostra "já está na frase do mês"; escolhido mesmo assim, o status avisa "Repete a frase do mês". Nenhum número é criado: sem destaque, o e-mail sai só com a frase e a chamada.

**Imagem do resumo (.png, 4.13):** no passo 6, **Baixar imagem do resumo (.png)** tira uma foto do e-mail-resumo como está na prévia, no dobro da largura (1360 px), com as imagens dentro. Serve de prévia ou para usar junto; quem envia continua sendo o `.eml`. A foto usa as fontes instaladas no computador.

**Link:** vem do report, se já estiver gravado nele; senão, cole no passo 3. **Vale qualquer link** (4.9; 4.12 para caminhos com espaço e acento): o **caminho do arquivo** (`C:\Users\…\OneDrive - …\…\report-AAAA-MM.html`, como sai em Explorador › botão direito › **Copiar como caminho**; `\\servidor\…`; `file:///…`), o link de compartilhamento (`https://…`, `http://`, ou `empresa.sharepoint.com/…`, que ganha o `https://`), texto com o link dentro (vale o link), `mailto:`, `msteams:` ou um endereço relativo. O caminho de arquivo vira `file:///…` **no formato que o Outlook (Word) grava num link para arquivo**: espaço e símbolos viram `%20`, `%23`…, e os acentos ficam como estão (`Produção`, e não `Produ%C3%A7%C3%A3o`, que o Outlook para Windows pode ler na página de código do Windows e não achar o arquivo); endereço copiado da barra do navegador com `%C3%A7…` também é convertido. Caminho de arquivo é aceito, mas **não serve para enviar** (4.12.1): no e-mail recebido, o Outlook para Windows bloqueia o link ("O Outlook bloqueou o acesso a links para os arquivos de zona da Internet", proteção do próprio Outlook), um caminho `C:\…` só existe no computador de quem fez, e o Outlook na Web, o novo Outlook e o celular não abrem link de arquivo. A nota do campo e um aviso no passo 4 ("Ok, ciente") dizem isso e indicam o **link do OneDrive**: botão direito no arquivo › Compartilhar › Copiar link (`https://…`). Endereço relativo (só o nome do arquivo) é aceito, mas o status avisa que no e-mail ele não abre. Só endereço que executa código (`javascript:`, `data:`, `vbscript:`) é recusado. O link é aplicado ao botão do e-mail-resumo na hora e **gravado no report ao salvar**: ao reabrir, o campo já vem preenchido; no mês seguinte, é só trocar. Sem link, a prévia mostra "FALTA O LINK DO REPORT COMPLETO" no lugar do botão e o `.eml` do resumo não é liberado (nunca um botão vazio). O emulador não publica o report: o arquivo fica onde foi salvo ou publicado.

**Modo escuro (4.12):** o e-mail-resumo mantém as cores aprovadas (fundo, cartão branco, cabeçalho, botão e assinatura em vermelho com texto branco, indicadores, etiquetas e bordas) no modo escuro do Apple Mail, do Outlook para Mac, iOS e Android (que respeitam o pedido "só modo claro" ou leem as cores reafirmadas) e no **Outlook.com / novo Outlook para Windows** (que trocam as cores e marcam o que trocaram: o e-mail desfaz a troca). Conferido no Chromium, inclusive numa simulação da troca de cores do Outlook.com (`tests/escuro.e2e.js`); o Outlook de verdade só dá para conferir abrindo o `.eml` nele. O **Outlook clássico para Windows** não aceita nenhum desses recursos: no modo escuro, ele escolhe as cores sozinho, na tela de quem lê (o vermelho fica mais claro, o texto do cabeçalho fica escuro e o do botão, rosado). Isso não muda o que é enviado: quem lê no modo claro recebe as cores aprovadas. Truques de código para segurar as cores lá (desenho VML atrás do vermelho, preenchimento de texto do Word) não servem a este fluxo, porque o Outlook regrava a mensagem ao enviar o `.eml` e transforma o desenho em imagem (sem link, com largura fixa no celular). Quem lê pode ver as cores originais no botão do próprio Outlook que troca o fundo da mensagem (ícone de sol/lua, na faixa da mensagem), ou marcar, em Arquivo › Opções › Geral, a opção de nunca mudar a cor de fundo da mensagem ("Never change the message background color" no Outlook em inglês). Desde a 4.12.1, os espaços entre os indicadores são células vazias: antes, o Outlook clássico pintava o caractere invisível que havia neles e apareciam quadrados no modo escuro.

## Status (tempo real)

| Etapa | O que acontece |
|---|---|
| Ler o report | Nome e tamanho |
| Reconhecer o report | Período e versão da ferramenta |
| Tirar o que o e-mail não aceita | Script, ampliação, vídeo, marcas do movimento e da edição |
| Montar o e-mail-resumo | Os destaques escolhidos (com imagem, link, informação nova), o que ainda é texto do modelo, informação nova sem revisão (trava o `.eml`) e o destino do botão |
| Colocar as imagens dentro dos e-mails | Cada imagem vira anexo embutido (`cid:`), com contador |
| Montar o e-mail completo / o e-mail-resumo | Conferência do Outlook e tamanho final |

O `.eml` é MIME padrão, com as imagens dentro e o cabeçalho `X-Unsent: 1` (o Outlook clássico abre como mensagem nova). Detalhes: [HOW_TO_EXPORT_EML.md](HOW_TO_EXPORT_EML.md).

## Avançado

- **Imagens em arquivo ao lado do .html:** só para páginas salvas pelo Chrome como "Página da Web, completa" (pasta `_files`). Os reports salvos pelo emulador já trazem tudo dentro.
- **Páginas antigas (antes da 4.2):** sem as marcas da página, o resumo não é montado; gere a página de novo.

## Problemas comuns

| Status | O que fazer |
|---|---|
| "Falta o link do report completo" | Cole no passo 3 o caminho do arquivo salvo (Copiar como caminho) ou o link de compartilhamento |
| No Outlook: "Não conseguimos localizar 'C:\Users\…\report-AAAA-MM.html'" | Confira se o report está mesmo nessa pasta, com esse nome (no Explorador, botão direito no arquivo › Copiar como caminho, e cole de novo no passo 3). E-mail gerado antes da 4.12 com acento no caminho (ex.: Produção): gere o `.eml` de novo (o botão agora vai no formato que o Outlook abre). No Outlook na Web, no novo Outlook e no celular, link de arquivo não abre: use o link de compartilhamento |
| "Link não aceito" / "esse tipo de endereço não é permitido" | O endereço começa com `javascript:`, `data:` ou `vbscript:` (pode executar código). Cole o caminho do arquivo ou o link de compartilhamento |
| "Ainda é texto do modelo" | Sobrou texto [entre colchetes] ou X: corrija na página e salve |
| "Nenhum indicador na página" | Confira se os números foram preenchidos |
| "Faltam N imagens em arquivo ao lado do .html" | "Avançado: imagens em arquivo" › escolha a pasta |
| "Acima de 10 MB" (e-mail completo) | Alguma imagem grande entrou no e-mail completo; o e-mail-resumo é o recomendado |
