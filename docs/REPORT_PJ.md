# Report PJ (Santander Empresas)

O report PJ usa o **mesmo sistema** do report PF: o mesmo motor (`tools/motor.js`), o mesmo emulador (`converter-html-eml.html`), as mesmas funções e, a partir da 5.1, **o mesmo template** (`template/report.html`): PF e PJ têm o mesmo esqueleto de página. São dois emuladores independentes, cada um com o seu arquivo:

| | PF | PJ |
|---|---|---|
| Emulador (kit) | `kit/emulador-report.html` · aba **Emulador Report PF** | `kit/emulador-report-pj.html` · aba **Emulador Report PJ** |
| Ícone da aba | Santander + PF | Santander + PJ (a mesma chama; selo "PJ" com contorno Rio) |
| Modelo em branco | `kit/report-coringa.html` (`dados/CORINGA.txt`) | `kit/report-coringa-pj.html` (`dados/CORINGA-PJ.txt`) |
| Exemplo de treino (fictício) | `kit/report-exemplo.html` | `kit/report-exemplo-pj.html` (`dados/EXEMPLO-PJ-treinamento.txt`) |
| Template | `template/report.html` (o mesmo nos dois) | `template/report.html` (o mesmo nos dois) |
| Marca (cores, logo, formiguinha) | `config/marca.txt` | `config/marca-pj.txt` |
| Rascunho no navegador | `emulador-report` | `emulador-report-pj` (não se misturam) |

## PF e PJ não se misturam

- Cada página leva o segmento: `<meta name="report-segmento" content="pj">` no PJ e, a partir da 5.1, `content="pf"` no PF. Report sem a marca (PF salvo antes da 5.1) é PF.
- O **Emulador Report PJ só abre reports PJ** e o **PF só abre reports PF**. Ao escolher o arquivo do outro segmento, aparece "Este é um report PF/PJ", com o nome do emulador certo; o report que estava aberto continua como estava.
- O rascunho guardado no navegador (edição não salva) é separado: um emulador nunca oferece a edição do outro.
- As imagens do PJ são próprias (`assets/coringa-pj/`, `assets/exemplo-pj/`). Nenhuma peça, campanha ou resultado do PF entra no PJ. A formiguinha (personagem do Creative Strategy PF) não aparece no PJ.

## O mesmo esqueleto no PF e no PJ (5.1)

A estrutura da página é uma só: abertura, visão geral com a peça vertical, principais resultados num bloco claro, campanhas, indicadores num bloco claro, análises num cartão com borda, aprendizados, tópicos, foco ou próximas iniciativas, agenda e encerramento. A grade, os cantos, os balões, as pílulas numeradas e a marcação de cada item são os mesmos. O que muda vem da marca e do perfil do segmento:

| | PF | PJ |
|---|---|---|
| Fundo do HTML (em volta do report) | Lisboa | **Branco** (a base) |
| Fundo do conteúdo (o report) | Branco | **Rio** (a cor principal do Empresas) |
| Abertura, foco e encerramento | Vermelho Santander, texto branco, chama branca, encostados na borda do report | Painéis **Brancos** recuados dentro do report (20 px de Rio em volta; 8 px no celular), texto Preto, chama vermelha |
| Principais resultados e indicadores | Rio | Painéis Brancos recuados, como a abertura |
| 1º número e títulos | Vermelho Santander | Preto |
| Pílulas e rótulos das seções | Cores de apoio do PF (turquesa, roxo, rosa) | Sobre o Rio: balão Branco com texto Vermelho Santander. Nos painéis Brancos: balão Rio com texto Boston |
| Nomes das seções | O que lançamos, Creative X, Transformation Hub, O que aprendemos, Foco de…, Também vem aí | Campanhas, Indicadores, Análises, Aprendizados, Próximas iniciativas, Agenda |
| Formiguinha | No encerramento | Não usa |

As cores ficam em `config/marca.txt` e `config/marca-pj.txt` (`abertura_fundo`, `abertura_texto`, `bloco_fundo`, `foco_fundo`, `rodape_fundo`…); os nomes, em `PERFIS.*.rotulos` (`tools/motor.js`). Um report PF salvo antes da 5.1 continua abrindo e funcionando no Emulador Report PF, no layout em que foi salvo; para o mês ficar no esqueleto novo, comece do modelo em branco (veja [COMO_ATUALIZAR_O_MES.md](COMO_ATUALIZAR_O_MES.md)).

## Seções do report PJ

| Seção | De onde vem (mesmos blocos do PF) |
|---|---|
| Abertura | `[ABERTURA]` frase e segunda parte, período (`[EDICAO]`) |
| 01 · Visão geral | `[PROJETO PRINCIPAL]` rótulo (balão), nome, resumo, peça vertical |
| 02 · Principais resultados | `[NUMERO 1..4]` e o "O que aprendemos" da campanha |
| 03 · Campanhas | `[LANCAMOS]`, `[DESTAQUE]` + `[RESULTADO 1..3]`, `[LANCAMENTO 1..6]` (outras campanhas) |
| 04 · Indicadores | `[CREATIVE X]` (indicador do mês) e `[CREATIVE X TRIMESTRE]` |
| 05 · Análises | `[TRANSFORMATION]` e `[TRANSFORMATION 1..3]` (status, texto, resultado, prints, links) |
| 06 · Aprendizados | `[APRENDIZADO 1..3]` |
| Novos tópicos | `[TOPICO]`… (iguais ao PF) |
| 07 · Próximas iniciativas | `[FOCO]` e a agenda (`[AGENDA 1..6]`, "próximas datas") |
| Encerramento | `[EDICAO]` próximo mês e contato; assinatura com a chama |

Os nomes dos blocos são os mesmos do PF (a biblioteca de prompts e a importação do Copilot funcionam igual); só o nome que aparece na página muda.

## Identidade: Brand Guide Santander Brasil (maio/2026), capítulo 6 · Santander Empresas

| Regra do guia | No report PJ |
|---|---|
| Paleta e proporção: Rio, Branco, Vermelho Santander, Boston e Preto, "com destaque para o tom Rio" (6.2 Cores). Rio e Branco são as cores de fundo e de balão; Vermelho Santander, de logotipo, Botão de Início e texto do balão Branco; Boston, de texto do balão Rio; Preto, de títulos e textos de apoio | Hierarquia (5.3): **Rio** é a cor principal e é o fundo do conteúdo (o report e o e-mail-resumo); **Branco** é a base: o fundo do HTML em volta e os painéis e cartões, sempre recuados dentro do Rio, para o fundo do conteúdo nunca se confundir com o fundo do HTML; **Vermelho Santander** é o acento (chama, links, botão, texto do balão Branco); **Boston** e **Preto**, os textos. Nenhum fundo vermelho na página (o vermelho aparece só como peça, como o selo de uma campanha feito para fundo vermelho) |
| Títulos e textos de apoio em Preto (6.2 Cores) | Todos os títulos, números e textos em Preto (o 1º número também; no PF ele é vermelho) |
| Vermelho: Botão de Início, texto do balão, logotipo | Vermelho só na chama, nos links, no texto dos balões sobre o Rio, no 1º número de um tópico de números e no botão do e-mail-resumo |
| Balões de fala: só duas variações, Branco com texto Vermelho Santander (sobre Rio) e Rio com texto Boston (sobre Branco); Santander Micro Text SemiBold (6.2 Balões) | Sobre o Rio da página (número da seção, rótulo da campanha): balão Branco com texto Vermelho Santander. Nos painéis Brancos (período da abertura, número da seção, contato): balão Rio com texto Boston. Textos pequenos sobre o Rio (datas da agenda, rótulos) em Boston, para o contraste de 4,5:1 |
| Santander Condensed: títulos e mensagens de impacto, voz do banco; Headline: títulos de peso médio, ambientes digitais; Micro Text: apoio (6.2 Tipografia) | Frase do mês e títulos das seções em Condensed; números e nomes em Headline; textos em Micro Text (`config/marca-pj.txt`) |
| Retângulos verticais ou horizontais, nunca quadrados; raio de 5% do menor lado (6.2 Retângulos) | Peça da visão geral em retângulo vertical (184 x 230 px); destaque vertical (184 x 300); cards horizontais (184 x 72). Cantos: 34 px nos blocos (5% de 680), 20 px nas imagens |
| Logotipo na versão positiva, sobre Rio ou Branco; cor não muda (6.2 Logotipo) | A chama oficial em Vermelho Santander (`assets/marca/chama-santander.png`, o mesmo arquivo do PF), no topo e no canto inferior direito do encerramento |
| Composição: logotipo alinhado à margem inferior direita (6.2 Composição) | Assinatura do encerramento com a chama no canto inferior direito |

### E-mail-resumo PJ

Mesmo funcionamento do PF (até 4 destaques, imagem, link, um único botão, modo escuro protegido), na mesma hierarquia do report (5.3): o fundo do e-mail é Branco; o conteúdo (cabeçalho, corpo e assinatura) é Rio; os cartões dos destaques e a chamada final são Brancos, recuados no Rio; o botão é Vermelho Santander com texto branco. Cantos retos, pelo mesmo motivo do PF (o Outlook para Windows tira os cantos ao enviar).

### Ícone Santander + PJ

`assets/marca/svg/santander-pj.svg` (e os PNG de 16, 32 e 180 px): **a mesma chama** do arquivo oficial, sem redesenho nem mudança de proporção, e o selo "PJ" no mesmo lugar e tamanho do selo "PF", com o contorno em **Rio** (o pequeno acento da cor de destaque do Empresas). Embutido no emulador PJ e em todo report PJ salvo: funciona em qualquer computador, sem a pasta do projeto.

## O que validar com Marca (VALIDAR COM MARCA)

- Nome da área no report PJ: hoje **"Creative Strategy PJ"** e a linha "SANTANDER EMPRESAS · REPORT MENSAL" na assinatura (`tools/motor.js` › `PERFIS.pj`). Troque se a área usar outro nome.
- Uso do símbolo (sem o logotipo completo "Santander Empresas") no topo e na assinatura: o guia permite o símbolo em ambientes proprietários; o logotipo completo fica no Portal da Marca e não foi recriado.
- Etiquetas de variação em verde e âmbar: paleta de apoio institucional, só em dados (como no PF). A paleta do capítulo Empresas não lista cores de apoio.
- Fontes: as famílias Santander só aparecem com os arquivos `.otf` em `assets/fonts/` ou com a fonte instalada; sem elas, Arial (alternativa, não é a oficial).

## Para quem mantém a ferramenta

```
node tools/atualizar-coringa.js pj           # kit/report-coringa-pj.html e tools/coringa-pj.js
node tools/atualizar-coringa.js exemplo-pj   # kit/report-exemplo-pj.html
node tools/montar-avulso.js pj               # kit/emulador-report-pj.html
node tests/pj.e2e.js                         # teste de ponta a ponta do PJ
```

O PF continua com os mesmos comandos, sem argumento. `gerar-report.html` escolhe o template e a marca pelo `segmento:` do arquivo de dados.
