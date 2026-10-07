# Formiguinha · biblioteca da personagem

A formiguinha é a personagem da Creative Strategy PF: um boneco de madeira articulado, com luvas, botas e pontas das antenas em vermelho. No report ela aparece **poucas vezes e em pontos estratégicos**, integrada à composição. Ela não decora a página.

<img src="../../docs/formiguinha-catalogo.png" width="720" alt="As 6 versões da formiguinha">

## As versões

| Arquivo | Elemento | Use para | Onde aparece hoje |
|---|---|---|---|
| `formiga-base.png` | joinha + mão na cintura (pose da referência) | uso geral; projeto sem versão própria | modelo em branco |
| `formiga-protecao.png` | escudo com check | seguros, proteção | 01 · projeto principal de setembro (Seguro) |
| `formiga-viagem.png` | mala de rodinhas | viagem, milhas (**Milheiros**) | pronta para outubro |
| `formiga-musica.png` | fones de ouvido + nota | música (**S Music**) | pronta para outubro |
| `formiga-transformacao.png` | tablet com brilho | IA, tecnologia, inovação | 04 · Creative Transformation (fixa) |
| `formiga-foco.png` | alvo | prioridade, meta | 06 · Foco do próximo mês (fixa) |

**Regra de uso no report:** no máximo 3 aparições por edição.

1. Projeto principal (abertura): a versão do tema do projeto.
2. Creative Transformation: sempre `formiga-transformacao`.
3. Foco do próximo mês: sempre `formiga-foco`.

Os projetos de "O que lançamos" **não** levam formiguinha. Cada projeto já tem a sua peça, e a personagem repetida em todos os cartões vira ruído.

## O que nunca muda

Todas as versões saem do mesmo desenho e mantêm:

- corpo de madeira dourada articulado, com volume, luz no alto à esquerda e sombra no chão;
- cabeça grande, olhos castanhos grandes com cílios, sobrancelhas, nariz pequeno e sorriso aberto;
- antenas com pontas vermelhas, luvas e botas vermelhas;
- mão do joinha desenhada como **punho fechado com o polegar para cima**: nunca dedo esticado isolado, para não ser lida como gesto ofensivo.

## O que muda em cada versão

Só **uma** coisa: a pose de um braço e **um** elemento ligado ao tema. Nada de cenário, roupa ou texto.

## Arquivos

- `*.png`: usados no e-mail. Fundo transparente, 240 x 336 px, ~15 KB cada. Nítidos até ~120 px na tela; no report aparecem entre 74 e 86 px.
- `svg/*.svg`: fonte vetorial de cada versão, para um designer ajustar ou criar variações novas. Não use SVG no e-mail: o Outlook para Windows não mostra.

## Como trocar a versão no report

No arquivo do mês (`dados/AAAA-MM.txt`), bloco `[PROJETO PRINCIPAL]`:

```text
formiguinha: viagem
```

Use o nome da tabela acima, sem `formiga-` e sem `.png`. A descrição para quem não vê a imagem é preenchida sozinha. As versões do Transformation e do Foco são fixas e ficam em `config/marca.txt`.

## Como criar uma variação nova

1. Parta de `svg/formiga-base.svg`.
2. Mude a pose de **um** braço e acrescente **um** elemento do tema, em vermelho, grafite, branco ou petróleo.
3. Confira a mão em tamanho real (80 px): o gesto precisa ser lido sem ambiguidade.
4. Exporte em PNG transparente, 240 px de largura, e salve como `formiga-<tema>.png`. Use o tema, não o nome da campanha (`formiga-viagem`, não `formiga-milheiros`), para reaproveitar em outros meses.
5. Acrescente a versão na tabela acima e na tabela "Formiguinha do projeto principal" de [docs/HOW_TO_EDIT.md](../../docs/HOW_TO_EDIT.md). Para uma versão nova aparecer com descrição própria, acrescente o nome em `FORMIGA_ALT` em `tools/motor.js` (sem isso, a descrição fica "Formiguinha").

## Origem

As versões foram desenhadas em vetor a partir da imagem de referência da formiguinha (boneco 3D de madeira). São uma releitura em ilustração, com gradientes e sombras para dar volume, e não o arquivo original de marca. Se a área tiver o arquivo original, as variações podem ser refeitas a partir dele mantendo os mesmos nomes de arquivo; o report não precisa mudar.
