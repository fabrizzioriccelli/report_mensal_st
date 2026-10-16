# Histórico de versões

A versão atual aparece na página `gerar-report.html`, no topo de `report_backup.html` e em `tools/motor.js` (`VERSAO`).

## 4.3 · 2026-10-16 · Emulador como centro da operação: edição na própria página, e-mail-resumo curto, kit do time

- **Edição persistente no emulador** (`converter-html-eml.html`; versão avulsa em `kit/emulador-report.html`): abre o **modelo em branco** (embutido) ou um **report salvo**, e edita na própria página, no Chrome ou no Edge: textos e números (clique e escreva; o exemplo [entre colchetes] fica selecionado), cor das etiquetas (verde/âmbar), **Trocar imagem** (recorte e redução no navegador, com aviso de imagem pequena), **Descrição**, **Colocar / Trocar / Tirar vídeo**, **Tirar imagem** (selo, logo, prints), **Colocar / Trocar / Tirar link** (só `https://`), **Anexar PDF**, **Texto do link**, **Ocultar item**, mostrar/ocultar **seções** (numeração se ajusta) e **Desfazer**.
- **Salvar** grava o report do mês (`report-AAAA-MM.html`, nome sugerido pelo período) por cima do mesmo arquivo (janela "Salvar como" do Chrome/Edge; sem ela, Downloads). O arquivo salvo é a versão interativa, sem nenhum controle de edição, e continua editável no emulador. Título e texto da caixa de entrada acompanham período e frase.
- **Proteções:** cópia da edição no navegador até salvar ("Recuperar a edição"); aviso ao fechar com alterações; ao mudar o período de um report antigo, lista os números que ninguém mexeu antes de salvar; o emulador não cria nem calcula número (indicador sem dado: ocultar).
- **Importar conteúdo (Copilot):** cola a resposta do Copilot no formato de blocos e preenche os campos da página (`Motor.importarDados`); o que não existe na página é listado.
- **Biblioteca de 12 prompts do Copilot** (`docs/PROMPTS_COPILOT.md`), cada um com objetivo, quando usar, entradas, formato de saída, validação e onde entra no report; os prompts 5 a 11 respondem no formato que o emulador importa (um teste garante que todo bloco da biblioteca é aceito).
- **E-mail-resumo curto:** período, frase do mês, **até 3 indicadores** (escolhidos na tela; padrão: os números do projeto principal) e um único botão, **"Acessar report completo"**. Sem o link do report completo, o `.eml` do resumo não é liberado.
- **Template:** rodapé inteiro em vermelho Santander, com o encerramento "Até [próximo mês]." (saiu a coluna "Próxima edição", redundante); marcas `data-img` (imagens trocáveis), `data-item` (itens ocultáveis) e `data-campo` também no título de "O que lançamos", no resultado do Transformation Hub e na frase do mês separada da segunda parte.
- **Documento em PDF no Transformation Hub:** `links: Texto | arquivo.pdf` (na pasta do mês) leva o PDF para dentro da página do mês, que abre em nova aba no clique; no e-mail vira texto. Nenhum endereço inventado.
- **Modelo em branco ("coringa"):** `dados/CORINGA.txt` + imagens neutras em `assets/coringa/` → `tools/coringa.js`, com o máximo de cada seção.
- **Kit do time (`kit/`):** emulador avulso, modelo em branco, report de exemplo (fictício), **guia operacional** (61 páginas, telas reais do emulador, Explorador de Arquivos, padrão de nomes, imagens em 11 passos, Outlook, problemas comuns, 12 prompts em texto selecionável, checklist, sumário com links) e **apresentação executiva** (10 slides; chamadas "Acessar emulador", "Baixar guia operacional" e "Explorar report completo" com links relativos aos arquivos do kit). Saiu `apresentacoes/`.
- **Documentação para o time sem PyCharm, GitHub ou terminal:** `COMO_ATUALIZAR_O_MES.md` e `EMULADOR.md` (antigo `CONVERTER_HTML_EML.md`) reescritos; `GUIA_PYCHARM.md` removido.
- Saíram do emulador o "Acompanhar o arquivo" e o bloco de prints pelo Inspecionar (a edição é feita no próprio emulador).
- Testes: 66 no motor (resumo curto, indicadores, importação, PDF anexo, marcas); `tests/emulador.e2e.js` (antigo `conversor.e2e.js`) faz o fluxo completo de quem está começando, com conteúdo fictício, também na versão avulsa.

## 4.2 · 2026-10-16 · E-mail-resumo como porta de entrada, Transformation Hub da área, campos editáveis identificados

- **E-mail-resumo novo, com diagramação própria** (não é mais um corte do report): abertura com o período e a frase do mês, visão geral (projeto principal e números), resultados e evolução (Creative X, foi bem / a melhorar), campanhas em destaque, aprendizados, em andamento (Transformation Hub), próximos passos e o encerramento com **um único link**, o botão **"Ver report completo"** (arredondado também no Outlook para Windows, em VML). Estático: sem vídeo, ▶, ampliação ou imagem clicável.
- **Uma fonte só:** o resumo lê os textos e números da própria página, pelos atributos `data-campo` do template. Editou o arquivo de dados ou a página? O resumo acompanha. Item apagado some; bloco sem conteúdo não aparece.
- **Regras de seleção fixas e documentadas** (`RESUMO_REGRAS` em `tools/motor.js`): até 4 números, Creative X, 2 "foi bem" e 2 "a melhorar", destaque com até 3 resultados, 3 lançamentos, 3 aprendizados, 3 projetos do Transformation Hub, foco e 3 itens da agenda, sempre na ordem do arquivo de dados. Nada é resumido por máquina nem inventado.
- **Conversor:** caixas por bloco do resumo (bloco sem conteúdo fica desligado), as regras na própria tela, o status lista o que entrou em cada bloco e o que ainda é modelo; o e-mail-resumo vira o download principal (`-resumo.eml`) e o completo fica opcional. Páginas de antes da 4.2 ainda geram o resumo no formato antigo, com aviso.
- **Link do report completo no arquivo de dados:** `[EDICAO] link_report_completo` vira a meta `report-completo` da página e preenche sozinho o campo do conversor. Caminho local (`C:\…`, `\\servidor\…`) não é aceito.
- **Transformation Hub:** campos novos `logo:` (PNG original do logo do projeto, 56 px, no lugar dos ícones), `descricao_logo:` e `links:` (vários links por projeto, "Texto | endereço", separados por `;`). Link ainda não preenchido aparece sem clique e conta como pendência.
- **Campos editáveis identificados na página gerada:** os comentários `EDITAR AQUI: PERÍODO`, `RESULTADO PRINCIPAL`, `IMAGEM DO PROJETO PRINCIPAL`, `CAMPANHAS`, `APRENDIZADO`… agora ficam também na página do mês (`reports/AAAA-MM.html`), para quem abrir no PyCharm. Os e-mails não os levam.
- **Exemplo de treinamento:** `dados/EXEMPLO-treinamento.txt` com conteúdo 100% fictício (Janeiro 2099) e imagens neutras em `assets/exemplo/` (peças, vídeo curto, print e ícone). Base das capturas do guia operacional.
- **Apresentações:** `apresentacoes/` com a apresentação executiva e o guia operacional (PowerPoint editável e PDF), feitos com capturas reais do projeto em execução e conteúdo fictício.
- Testes: 62 no motor (resumo, regras de seleção, edição refletida, logo e links, meta do link); o teste do conversor cobre o e-mail-resumo (um único destino, blocos, estático, bloco desmarcado).

## 4.1 · 2026-10-15 · Movimento na versão interativa

Só na página do navegador (versão interativa e página do mês); o e-mail não muda (nenhum cliente de e-mail roda script).

- **Barra de leitura:** linha vermelha fina no topo, que cresce conforme a rolagem.
- **Seções aparecem ao entrar na tela:** sobem 28 px e ganham opacidade (0,7 a 0,9 s, curva suave).
- **Números grandes contam do zero até o valor** quando aparecem (1,2 s): capa, resultados do destaque e Creative X. No fim, o texto volta a ser exatamente o original (mesmo formato: `R$ 1.234`, `12,5%`, `+40%`, `2,5x`).
- **Barra do Creative X cresce** da esquerda até o valor.
- Desligado com **"reduzir movimento"** no sistema (tudo aparece parado, números no valor final), durante a **edição no navegador** (designMode) e na impressão.
- Salvou a página no meio de uma animação? O conversor tira todas as marcas do movimento do e-mail, e a versão interativa sai com o script desta versão (páginas antigas ganham o movimento ao passar pelo conversor).
- Teste novo: `tests/movimento.e2e.js`.

## 4.0 · 2026-10-15 · Dois e-mails de uma vez, Transformation Hub com prints, vídeo sem ▶ no resumo

- **O conversor gera os dois e-mails de uma vez:** você edita o `.html` (inclusive pelo Inspecionar do Chrome), escolhe o arquivo e saem o **e-mail completo**, o **e-mail resumido** (com o botão "Ver o report completo") e a **versão interativa** para o SharePoint. Sem o link, o completo já sai e o resumido espera o link; a prévia mostra os dois.
- **Resumido sem promessa de vídeo:** a miniatura do vídeo aparece **sem ▶ e sem link** (versão guardada na página em `data-thumb`), e o texto alternativo perde o "Vídeo:". O vídeo só toca na versão interativa.
- **Versão interativa:** abaixo de cada miniatura de vídeo, o botão **"▶ Assistir ao vídeo"** (pulsando de leve), que abre o vídeo por cima do report.
- **Creative Transformation → Transformation Hub.** Cada projeto aceita **até 3 prints** (`prints:` e `descricao_prints:`), na largura do cartão (1 × 504, 2 × 240 ou 3 × 152 px; no celular, empilhados), com borda leve e cantos de 12 px. Na página do mês, abrem maiores no clique.
- **Prints colados pelo Inspecionar:** o conversor traz o passo a passo e o bloco pronto para copiar (1, 2 ou 3 prints). Com a pasta das imagens escolhida, os prints entram como anexo nos e-mails, embutidos na versão interativa e reduzidos sozinhos a 1200 px de largura. Cada projeto tem a marca `transformation-1..3` para achar no Inspecionar.
- Motor: `miniaturasSemPlay`; imagens só da página (`soPagina`) fora do `.eml`; `data-ampliar=""` usa a própria imagem; testes novos (56 no motor; o teste do conversor cobre os dois e-mails, o print colado e o vídeo).

## 3.9 · 2026-10-15 · E-mail resumido + versão interativa

- **E-mail resumido** no `converter-html-eml.html`: o e-mail leva só as seções escolhidas (padrão: capa e números, resumo das campanhas, foco do próximo mês e encerramento) e um bloco **"Ver o report completo (interativo)"**, com botão que funciona no Outlook, antes do encerramento. As seções que ficaram de fora são listadas no bloco, e as etiquetas são renumeradas (01, 02…). No report de exemplo, o e-mail cai para menos da metade do tamanho.
- **Versão interativa (.html)** para subir no SharePoint: a página do mês com vídeos e peças ampliáveis, limpa do que o navegador acrescenta ao salvar. É o destino do botão.
- Miniaturas de vídeo sem link passam a abrir a versão interativa, onde o vídeo toca.
- O e-mail completo também pode ganhar o botão: é só preencher o link.
- Mudou o tipo de e-mail, as seções, o link ou o texto do botão? A conversão se refaz sozinha, com o status em tempo real.
- **Marcas de seção no template** (comentários `secao:nome`, mantidos no HTML gerado): é por elas que o resumido sabe onde cortar. Páginas geradas antes da 3.9 precisam ser geradas de novo para usar o resumido.
- Motor: `secoesDoHtml`, `emailResumido`, `ligarVideos`, `paginaInterativa` (com testes).

## 3.8 · 2026-10-15 · Converter HTML editado em e-mail, com status em tempo real

- **Nova página `converter-html-eml.html`:** escolha (ou arraste) a página do mês editada no Chrome ou no Edge e baixe o `.eml`. Ela tira o que o e-mail não aceita (script, janela de ampliação, vídeo, marcas do clique e da edição), coloca as imagens dentro do e-mail como anexos embutidos e confere o HTML para o Outlook.
- **Status em tempo real:** barra de progresso, relógio, cada etapa com ✓ / ! / ✕, o tempo gasto e o detalhe (ex.: "Imagem 3 de 11 · 120 KB"), e um registro com horário.
- **Acompanhar o arquivo:** no Chrome e no Edge, a página relê o arquivo a cada 1,5 s e converte de novo sozinha quando você salva.
- Imagens salvas pelo Chrome numa pasta ao lado (`_files`) entram pelo botão "Escolher a pasta das imagens"; formatos que o Outlook não mostra (webp, svg) viram PNG.
- Prévia do e-mail convertido (computador e celular) e assunto tirado do título da página.
- Motor: `limparHtmlEditado`, `imagensDoHtml`, `origemImagem`, `deBase64`, `imagemDeDataUri`, `trocarSrc`, `assuntoDoHtml`, `textoDoHtml`, `origemDoHtml` (com testes). Teste de ponta a ponta em `tests/conversor.e2e.js`.
- Passo a passo em `docs/CONVERTER_HTML_EML.md`.

## 3.7.1 · 2026-10-15 · ▶ que não cobre o rosto

- Em peças grandes (capa e destaque), o botão ▶ desenhado sobre a miniatura do vídeo fica menor e no canto inferior esquerdo, para não cobrir o rosto de quem aparece. Nas miniaturas de "Também neste mês", continua no centro.

## 3.7 · 2026-10-15 · Vídeo no clique, até 6 lançamentos e "Resumo das campanhas"

- **Vídeo que toca no clique** (campo `video:` com um `.mp4` ou `.webm` na pasta do mês): na página do mês (.html) e na prévia, o clique na miniatura abre o vídeo por cima do report e ele começa a tocar (mouse, toque e teclado; Esc ou × fecham). O vídeo vai dentro da página baixada. No e-mail, nada muda: a miniatura com ▶ abre o `link`, sem script e sem vídeo anexado.
- **"Resumo das campanhas"** (antes "Resumo da campanha"): agora fica depois do Creative X e antes do Creative Transformation, fechando os resultados. Até 4 frases em cada lado.
- **"Também neste mês" com até 6 lançamentos**, em linhas de 3 na grade (184 px cada). Com 1 a 3, nada muda.
- Fotos do banco de imagens não abrem ampliadas (são ilustrativas).

## 3.6.1 · 2026-10-15 · "Resumo da campanha"

- O bloco "Resumo do mês" passou a se chamar **"Resumo da campanha"**.

## 3.6 · 2026-10-15 · Resumo do mês: o que foi bem e o que melhorar

- **Resumo do mês** logo abaixo da capa (blocos `[FOI BEM 1..3]` e `[A MELHORAR 1..3]`): duas colunas na grade (288 + 24 + 288), com o filete no topo em verde do guia (positivo) e em âmbar (atenção). No celular, uma embaixo da outra. Quem lê entende o mês em 10 segundos.
- Etiqueta de variação que começa com "-" e texto (ex.: "-Menos da metade") mostra a seta para baixo sem o sinal de menos.

## 3.5 · 2026-10-15 · Foto da capa maior, peças clicáveis e selo no Foco

- **Foto da capa 20% maior:** 184 → 220 px (quadrada, cantos de 20 px); o texto ao lado fica com 356 px. No celular, 180 → 216 px.
- **Clique nas peças:** com `link:`, a peça e o "Ver peça →" abrem o link (e-mail e navegador), com realce ao passar o mouse onde o cliente aceita. Sem link, a peça não clica no e-mail (nenhum link inventado). Na página do mês (.html) e na prévia, um clique abre a peça **inteira e maior** por cima do report: funciona com mouse, toque e teclado (Tab, Enter, Esc), com o foco voltando para a peça ao fechar.
- A versão ampliada (até 1400 px, sem recorte) só vai na página do navegador: o `.eml` continua sem script e sem essas imagens extras.
- **Selo de campanha no Foco** (`selo:` e `descricao_selo:` em `[FOCO]`): o PNG original, ao lado do título no computador (184 px) e acima dele no celular (160 px). Sem sobreposição de camadas, então funciona no Outlook.
- "Também no ar" virou **"Também neste mês"**: serve para peças finalizadas, no ar ou ainda sem resultado.
- Aviso na Conferência quando um número do destaque (com 3 resultados) passa de 7 caracteres: no celular ele invadiria a coluna ao lado. Prefira formatos curtos (`2x`, `R$ 99`, `1.200`).

## 3.4 · 2026-10-13 · Celular mais confortável

- Topo: no celular, o mês aparece numa linha discreta abaixo de "Creative Strategy PF" (antes o selo branco caía para uma linha própria).
- Números da capa e resultados do destaque: 3 lado a lado, em terços (antes 2 + 1, com o terceiro sozinho). Com 4, ficam 2 por linha.
- Rodapé: a formiguinha fica ao lado do texto, sem ocupar uma linha inteira.
- Textos de leitura com 14 px e legendas com 12 px no celular; mais respiro entre blocos empilhados. O computador não muda.

## 3.3 · 2026-10-13 · Abertura direto na capa

- Saiu a faixa "Olá! Chegou o report mensal" com a formiguinha, acima da capa: abria espaço sem necessidade. O e-mail começa direto na capa vermelha.
- A formiguinha fica só no encerramento, no rodapé, sobre fundo claro.

## 3.2 · 2026-10-13 · Cantos do Brand Guide e formiguinha integrada

- **Cantos conforme o guia (3.6):** raio de 5% do lado menor do **formato** (e-mail de 680 px = 34 px; no celular, 20 px) em todos os retângulos: cartão do e-mail, capa, faixa de números, Creative Transformation, Foco e rodapé. Antes o raio era calculado pela caixa (8 a 20 px) e o e-mail parecia quadrado.
- **Abertura e encerramento simétricos:** a capa vermelha virou um retângulo arredondado apoiado num painel Rio; a formiguinha cumprimenta ("Olá!") em pé sobre a capa, dentro do cartão. No rodapé, ela se despede em pé sobre a faixa vermelha. As duas ficam no eixo direito da grade (selo, peça da capa e chama).
- **Faixa de números sem divisórias verticais:** cada número tem o seu filete no topo da coluna (vermelho no principal), como na agenda; a coluna 3 alinha com a peça da capa.

## 3.1 · 2026-10-12 · Grade da abertura, rodapé e cores de apoio

- **Abertura em grade:** os números da capa ficam um em cada coluna da grade (184 px), alinhados com as seções de baixo, todos alinhados pelo topo. O modelo passa a ter 3 números (com 4, viram 4 colunas iguais).
- **Formiguinha menor e com contraste:** na abertura, 44 px, em pé sobre o filete da faixa de números; no rodapé, 64 px, sobre fundo claro (antes ficava sobre o vermelho, sem contraste).
- **Rodapé novo**, em duas faixas: clara (Rio), com a despedida, "Dúvidas e sugestões", "Próxima edição" e a formiguinha; e vermelha, com a assinatura da área e a chama no canto inferior direito.
- **Cores de apoio do guia organizando a leitura:** cada momento da história tem uma cor nas etiquetas de seção e nos detalhes: resultados (turquesa), qualidade e transformação (roxo), aprendizado e próximos passos (rosa). Títulos continuam vermelhos.

## 3.0 · 2026-10-12 · Modelo reutilizável no Brand Guide

**Identidade visual (Brand Guide Santander Brasil, maio/2026)**
- Paleta do guia: fundos só em Branco, Lisboa, Rio e Vermelho Santander; títulos em vermelho e textos em preto sobre branco; cores de apoio só em indicadores. Rodapé passou de vermelho-escuro para Vermelho Santander.
- Tipografia: Santander Headline Bold (títulos e números), Santander Micro Text (textos), Santander Condensed (frase da capa). Alternativa: Arial. Sem itálicos (o guia não tem).
- `assets/fonts/fontes-santander.css`: `@font-face` das 4 famílias, com os pesos do guia, pronto para receber os `.otf`.
- Chama do Santander (só o símbolo), do vetor oficial, em branco sobre vermelho.
- Formiguinha: arquivo original, só na abertura e no rodapé. Variações antigas retiradas.
- Cantos: imagens com metade da margem (20 px); retângulos com 5% do lado menor.
- Selo do mês em pílula branca com texto vermelho; ícones com traço vermelho.

**Template e motor**
- Parte 2 (destaque) no celular: a peça aparece na horizontal, na largura da tela (antes sumia).
- Novo enquadramento: `esquerda` e `direita`.
- Modelo em branco com Lorem Ipsum curto e `X%` / `R$ X` / `X p.p.`; tudo isso conta como pendência e bloqueia a versão final.
- Estados vazios: nada de `NaN`, cálculo com dado ausente ou link falso; botão sem link aparece em cinza e não clica.
- Cabeçalhos do `.eml` com no máximo 78 caracteres por linha; nomes de imagem curtos.
- Comentários `EDITAR AQUI` no template apontando o campo de cada texto.

**Segurança e organização**
- Todos os dados reais removidos (setembro de 2026, peças, apresentação, exemplos e capturas).
- Fotos do banco de imagens fora do GitHub (licença); `.gitignore` revisado.
- `report_backup.html`, guias novos (PyCharm, tipografia, FAQ, prompts do Copilot, backup) e guia mensal revisado.

## 2.x · até 2026-10-07

Ferramenta `gerar-report.html`, motor, `.eml` com imagens embutidas, links para SharePoint/Stream, grade de 3 colunas, capa vermelha e rodapé assinado como Customer Interactions. Continha o report de setembro de 2026 com dados reais (removido na 3.0; veja [docs/BACKUP.md](docs/BACKUP.md#histórico-do-git-e-dados-antigos)).

## 1.x

Primeira versão do layout em HTML de e-mail.
