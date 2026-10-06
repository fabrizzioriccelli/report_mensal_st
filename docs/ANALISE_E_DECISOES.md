# Análise do esboço e decisões de design

Este documento explica como o esboço do report (formato de slide, setembro 2026) virou um template de e-mail de uma página, e por quê.

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

## 3. Arquitetura da informação

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

O report de setembro usa **somente** os números, títulos, textos e imagens que estão no esboço. As imagens são recortes do esboço, em baixa resolução; o visual central da visão geral é uma composição das duas peças dos cases. Ficaram como placeholder, por não existirem no esboço:

- score CreativeX do período anterior e a variação;
- aprendizados e foco do próximo mês;
- acessos, duração e links dos vídeos;
- o segundo vídeo e a peça em destaque da seção 04;
- datas marcadas como `[dd/mm]` e trechos cortados (`[COMPLETAR]`).

A manchete ("Escala e eficiência no mesmo mês.") e a síntese da visão geral resumem textos do próprio esboço ("ampliação de volume e valor", "ganhos de eficiência"). Valide com a área antes do envio.
