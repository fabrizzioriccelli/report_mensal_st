# Análise do esboço e decisões de design

Este documento explica como o esboço do report (formato de slide, setembro 2026) virou um template de e-mail de uma página, e por quê.

Ele registra as rodadas em ordem. **A estrutura atual é a da seção 8** (reestruturação editorial); as seções 3, 4 e 7 descrevem versões anteriores e ficam como histórico das decisões.

## 1. O que o esboço tem de bom

| Elemento | Por que funciona | O que foi mantido |
|---|---|---|
| Vermelho `#9E1218` + preto + branco | Identidade forte, poucas cores | Mesma paleta, sem cores novas |
| Título grande "Creative Strategy PF" + "REPORT \| SETEMBRO 2026" | Diz em 1 segundo o que é e de quando | Mesmo cabeçalho |
| A formiguinha no canto | Personalidade da área | Mantida no cabeçalho e usada em mais dois momentos |
| Seções numeradas (01, 02, 03) com linha preta | Ritmo e orientação | Mesmo sistema, agora com 6 seções |
| Faixa vermelha de KPIs | Bloco mais memorável do esboço | Mantida como "resultado principal" |
| Números grandes em vermelho, "antes → depois" | Leitura rápida de evolução | Mantido nos cases |
| Status com ● implementado / ○ previsto | Mostra o andamento sem texto longo | Mantido nos destaques |

## 2. O que não funciona (para e-mail)

| Problema | Impacto | Solução |
|---|---|---|
| Formato paisagem/A4 com 4 colunas | Fica minúsculo num e-mail e quebra no celular | Coluna única de 680 px, no máximo 2 a 3 colunas por bloco |
| Não há uma "síntese do mês" | O leitor precisa ler tudo para entender o mês | Visão geral no topo: manchete, síntese e 4 números |
| Resultado principal e secundários com o mesmo peso | Tudo parece igualmente importante | Hierarquia: principal grande à esquerda, secundários menores à direita, detalhe nos cases |
| Excelência criativa espremida numa faixa | Os scores não contam a história da evolução | Seção própria **Creative X**: anterior → atual → variação + barras + referências |
| Não há aprendizados nem próximos passos | O report mostra números, mas não diz o que fazer com eles | Seções **O que aprendemos** e **O que levamos para frente** |
| Peças e vídeos como imagens soltas | Vídeo não toca em e-mail; leitor não sabe que pode clicar | Seção **Peças e vídeos em destaque** com miniatura, acessos e botão ASSISTIR |
| Linha do tempo horizontal com 6 colunas | Ilegível no celular | Lista vertical "Vem aí", uma linha por item |

## 3. Arquitetura da informação (1ª versão)

A ordem responde às perguntas que o leitor faz, nesta sequência:

| Pergunta | Onde responde |
|---|---|
| Que report é esse? De quando? | Cabeçalho |
| Como foi o mês? | Visão geral (manchete + síntese + 4 números) |
| Quais os principais resultados? | 01 Principais resultados |
| Como está a qualidade criativa? | 02 Creative X |
| Quais os destaques? | 03 Destaques do mês |
| Quais peças e conteúdos performaram? | 04 Peças e vídeos em destaque |
| O que aprendemos? | 05 O que aprendemos |
| O que levamos para frente? | 06 O que levamos para frente + Vem aí |

Quem lê só a visão geral já sabe como foi o mês. Quem lê até 02 sabe os números. Quem lê tudo sabe o que fazer depois.

## 4. Decisões de UX/UI

1. **Visão geral no princípio "produto no centro".** Um visual central com 4 números ao redor, poucas palavras e uma manchete. No celular, as métricas viram pares acima e abaixo do visual. A primeira métrica (canto superior esquerdo) é a principal: é onde o olho começa.
2. **Hierarquia por tamanho, não por cor.** O vermelho já é a cor da marca; a importância vem do tamanho (manchete 32 px → resultado principal 34 px → secundários 24 px → detalhes 20 px).
3. **Creative X em três tempos.** *Anterior → Atual → Variação*, depois as barras com a mesma comparação e, por fim, as referências (média do ano, média global). O leitor entende a evolução sem gráfico complexo.
4. **Aprendizado como frase, não como número.** As três caixas (aconteceu → aprendemos → levamos) forçam a escrita de conclusão. A última caixa é vermelha porque é a que gera ação.
5. **Formiguinha com função.** Ela abre o report (identidade), apresenta "O que aprendemos" (o momento mais "humano" do report) e se despede ("Até outubro."). Três aparições, sempre pequenas, para não infantilizar.
6. **Placeholders honestos.** Caixas tracejadas com o tamanho certo da imagem, e textos `[EM COLCHETES]`. Ninguém confunde placeholder com conteúdo real, e a ferramenta lista todos antes do envio.
7. **Nada que dependa de clique para entender.** Sem abas, acordeões ou "ver mais". Tudo visível na rolagem.
8. **Sem efeitos.** Nenhuma animação nem GIF. A sofisticação está no espaçamento, no alinhamento e na hierarquia.

## 5. Decisões de engenharia

| Decisão | Alternativa descartada | Motivo |
|---|---|---|
| Conteúdo direto no HTML, com comentários `EDITAR AQUI` | JSON + script que gera o HTML | Quem edita vê exatamente o que vai no e-mail. Sem build, sem Node, sem JavaScript |
| Um arquivo por mês em `reports/` | Um único arquivo sobrescrito | Histórico de cada mês e "duplique o anterior" como fluxo natural |
| Ferramenta de .eml no navegador | Script de terminal (PowerShell/Node) | Funciona com dois cliques no Edge, sem instalar nada |
| Imagens anexadas (CID) | Imagens hospedadas no SharePoint | O Outlook não mostra imagens do SharePoint num e-mail |
| Tabelas + estilo inline | CSS moderno | O Outlook para Windows usa o motor do Word |
| Placeholders em HTML | Imagens de placeholder | Nenhum arquivo extra; o tamanho do espaço fica escrito nele |

## 6. Conteúdo de setembro

O report de setembro usa **somente** os números, títulos, textos e imagens que estão no esboço. As imagens são recortes do esboço, em baixa resolução; a peça do projeto principal é o recorte da peça de Seguro, sobre fundo vermelho. Ficaram como placeholder, por não existirem no esboço:

- score Creative X do período anterior e a variação;
- o que o score significa;
- resultado (indicador) do Briefing Agent e Creative Checker e o segundo projeto de Transformation;
- aprendizados e foco do próximo mês;
- link do vídeo Creator em Reneg e contato do time;
- datas marcadas como `[dd/mm]` e o detalhe da Black Friday.

Milheiros e S Music (projetos de outubro informados pela área) saíram do report de setembro: sem data, peça nem resultado, viravam cartões soltos no fim. As versões da formiguinha para eles (viagem e música) estão prontas para o report de outubro.

As etiquetas **2,5x** (produção) e **+81%** (ticket médio) não estão escritas no esboço: foram calculadas a partir dos números dele (262 → 651,9 e R$ 16 → R$ 29). As demais variações (+89%, −12%, −29%, 3,6x, 3,0x) são do esboço.

A frase do mês ("Escala e eficiência no mesmo mês.") e o título de "O que lançamos" ("Contexto certo, mídia mais eficiente.") resumem textos do próprio esboço ("ampliação de volume e valor", "ganhos de eficiência"). Valide com a área antes do envio.

## 7. Rodada de refinamento (versão aprovada → versão executiva)

Feedback da gerência: o report estava **longo**, com informação repetida, e o **Creative X ocupava espaço demais**. A rodada manteve a estrutura e a identidade, e trabalhou redução, consolidação e acabamento.

### Auditoria da versão anterior

| Elemento | Problema | Decisão |
|---|---|---|
| Faixa vermelha de KPIs (01) | Repetia ~R$ 100 mil, 3,6x e +89% que já estavam na visão geral | **Removida.** Os números ficam na visão geral; os cases trazem só o contexto |
| Manchete com "~R$ 100 mil" | Mesmo número da métrica 1 | Já tinha virado "Escala e eficiência"; mantida |
| Métrica "3,6x impressões" na visão geral | Repetida no case 1.1 | **Trocada** por "2,5x produção" (262 → 651,9), mais forte e sem repetir |
| Cases em linhas inteiras com imagem de 130 px | Ocupavam 2 telas; as peças já estavam no visual central | **Unificados** em 2 cartões lado a lado, sem imagem, com etiquetas de variação |
| Creative X: selo + 3 blocos + barras + referências em linhas | 429 px de altura | **Uma composição** em grafite: evolução e barras, variação e referências em 3 colunas, e uma frase de insight |
| Foto do Creative X e imagens da agenda | Pouco valor para o espaço | **Removidas** |
| Destaques em grade 2x2 com imagem grande | 683 px | **Lista compacta**: formiguinha do projeto, status, 1 frase e miniatura |
| Peças e vídeos, um por linha | 576 px | **Composição editorial**: 1 principal grande + 2 secundários |
| Aprendizados em 3 caixas por linha, 2 linhas | Repetiam o rótulo em cada caixa | **3 cartões**: título curto, 1 frase e "Levamos" |
| "O que levamos para frente" + agenda de 6 linhas | 764 px, com descrições longas | **Próximos passos**: foco do mês, 2 projetos com formiguinha e agenda em 2 colunas |
| Encerramento com formiguinha recortada | Repetia o asset do cabeçalho | Faixa curta, sem repetir a personagem |

### Resultado

| Medida (desktop, 760 px) | Antes | Depois |
|---|---|---|
| Altura total | 4.541 px | 2.997 px (**−34%**) |
| Principais resultados | 966 px | 401 px |
| Creative X | 429 px | 363 px, com mais informação (barras e insight juntos) |
| Destaques | 683 px | 488 px |
| Peças e vídeos | 576 px | 377 px |
| Aprendizados + próximos passos | 1.176 px | 757 px |

Nenhuma informação do esboço saiu do report: o que foi removido era repetição ou imagem decorativa.

### Sistema visual

- **Cantos:** 6 px (miniaturas), 12 px (cartões e imagens), 16 px (blocos grandes), pílula (etiquetas e botão).
- **Cor com significado:** vermelho = marca e destaque; verde = resultado positivo (inclusive custo que caiu, com ▼); âmbar = previsto/atenção; grafite = assinatura do Creative X. O resto é neutro.
- **Tipografia:** rótulo 10 px em caixa alta espaçada → título de seção 12 px → manchete 28 px → número principal 28 a 46 px → número secundário 18 a 20 px → texto 12 a 13 px → legenda 10 a 11 px. Negrito só em títulos e números.
- **Ritmo:** blocos densos (cases, destaques) alternam com blocos de respiro (visão geral, Creative X em fundo escuro).

### Formiguinha como sistema

A personagem foi redesenhada em vetor a partir da imagem de referência (boneco de madeira articulado, luvas, botas e pontas das antenas em vermelho). Existe uma versão base e variações que mudam só pose e um acessório, uma por universo de projeto. Ela aparece onde identifica um projeto: no cabeçalho (base), em cada case, no Creative X, em cada destaque e nos projetos do próximo mês, sempre dentro de um componente existente, sem criar seção nova. Regras e catálogo em `assets/formiguinha/README.md`.

## 8. Reestruturação editorial (versão executiva → newsletter editorial)

Feedback: mesmo mais curto, o report ainda parecia **template cru**, com projetos repetidos em várias seções (o mesmo case aparecia nos números, nos resultados e nos destaques), Creative X pesado, uma seção de "peças e vídeos" desconectada dos projetos, cartões soltos de Milheiros e S Music no fim e uma formiguinha fina, sem volume, com um joinha que podia ser lido como gesto ofensivo.

A rodada repensou a arquitetura e a narrativa, não só o acabamento.

### Auditoria da versão anterior

| Elemento | Problema | Decisão |
|---|---|---|
| Visão geral + Resultados do mês | O mesmo projeto aparecia nos 4 números e de novo no cartão do case | **01 O mês em uma frase**: a frase do mês + o projeto principal com a peça e os números dele. Ele não volta depois |
| Resultados + Destaques do mês | Projetos divididos entre "resultado" e "destaque" sem critério claro | **02 O que lançamos**: 1 projeto em destaque (peça + contexto + 3 resultados) e projetos compactos. Cada projeto aparece uma vez |
| Peças e vídeos (seção isolada) | Peças sem o contexto do projeto | **Removida.** Cada peça e cada vídeo vão para o projeto a que pertencem |
| Creative X em caixa grafite | Bloco escuro e pesado para uma informação secundária | Faixa entre dois filetes, sem caixa: anterior → **atual** grande → variação, uma barra e uma frase (−42% de altura) |
| Briefing Agent e Creative Checker | Perdidos entre os destaques | **04 Creative Transformation**, frente própria com superfície petróleo, status, evidência e resultado |
| Aprendizados em cartões | Caixas iguais, peso visual alto | 3 colunas sem caixa, numeral grande em Georgia, "→ Levamos" |
| Foco do mês dentro de "Próximos passos" | A conclusão do report não tinha destaque | **06 Foco do próximo mês**: bloco vermelho, a única área de cor cheia do report, com a formiguinha em pé sobre ele |
| Milheiros e S Music no fim | Cartões sem data, peça nem resultado | Removidos de setembro; entram em outubro com a sua formiguinha |
| Formiguinha em 10+ lugares | Virou decoração | 3 aparições fixas (projeto principal, Transformation, Foco) |

### Narrativa

| | Seção | Pergunta |
|---|---|---|
| 01 | O mês em uma frase | Qual foi o mês? |
| 02 | O que lançamos | O que mais foi para o ar e como foi? |
| 03 | Creative X | Como está a qualidade criativa? |
| 04 | Creative Transformation | O que estamos mudando na forma de criar? |
| 05 | O que aprendemos | O que levamos do mês? |
| 06 | Foco do próximo mês | O que vem agora? |
| 07 | Também vem aí | O que está na agenda? |

Quem lê só a abertura sabe o mês. Quem lê até 02 sabe o que foi entregue. Quem chega ao 06 sabe a prioridade.

### Resultado

| Medida (desktop, 760 px) | 1ª versão | Versão executiva | Editorial (atual) |
|---|---|---|---|
| Altura total | 4.541 px | 2.997 px | **2.813 px** |
| Abertura (frase + projeto principal) | — | — | ~440 px |
| O que lançamos | — | — | ~670 px (absorve resultados, destaques e peças) |
| Creative X | 429 px | 363 px | **~210 px** |
| Creative Transformation | — | — | ~510 px |
| Aprendizados | — | — | ~310 px |
| Foco + agenda | — | — | ~520 px |

Com mais conteúdo (uma frente nova, Creative Transformation), o report ficou ~6% mais curto que a versão executiva e 38% mais curto que a primeira.

### Sistema visual

- **Tipografia editorial:** Georgia para a frase do mês, títulos e números; Arial para rótulos e texto. Hierarquia: rótulo (10 px, caixa alta, espaçado) → título (Georgia 21 a 38 px) → número (Georgia 28 a 54 px) → etiqueta → texto (12 a 13 px) → legenda (10 a 11 px).
- **Cabeçalho de publicação:** nome em Georgia, edição em caixa alta e filete duplo, como uma newsletter.
- **Cor com função:** vermelho = marca e conclusão (Foco); verde = positivo; âmbar = previsto/atenção; grafite = Creative X; petróleo = Creative Transformation; creme = superfície da abertura. O resto é branco e neutro.
- **Superfícies em vez de cartões:** creme na abertura, petróleo claro no Transformation, vermelho no Foco. O resto usa filetes e espaço, não caixas.
- **Cantos:** 8 / 14 / 20 px e pílula. No Outlook para Windows aparecem retos, sem mudar o layout.

### Formiguinha

Redesenhada do zero a partir da imagem de referência:

- **volume:** gradientes em cada peça de madeira (luz no alto à esquerda), juntas esféricas, veios na cabeça, brilho nos olhos e sombra no chão;
- **mãos:** o joinha virou um punho fechado e largo, com o polegar curto e curvo para cima, conferido em tamanho real; a outra mão fica na cintura, como na referência;
- **sistema:** uma base e 5 variações, cada uma com **um** elemento (escudo, mala, fones, tablet, alvo). Biblioteca em `assets/formiguinha/`, com SVG de origem e regras de uso.
