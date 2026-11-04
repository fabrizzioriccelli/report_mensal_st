# Report PJ (Santander Empresas)

O report PJ usa o **mesmo sistema** do report PF: o mesmo motor (`tools/motor.js`), o mesmo emulador (`converter-html-eml.html`) e as mesmas funções. São dois emuladores independentes, cada um com o seu arquivo:

| | PF | PJ |
|---|---|---|
| Emulador (kit) | `kit/emulador-report.html` · aba **Emulador Report PF** | `kit/emulador-report-pj.html` · aba **Emulador Report PJ** |
| Ícone da aba | Santander + PF | Santander + PJ (a mesma chama; selo "PJ" com contorno Rio) |
| Modelo em branco | `kit/report-coringa.html` (`dados/CORINGA.txt`) | `kit/report-coringa-pj.html` (`dados/CORINGA-PJ.txt`) |
| Exemplo de treino (fictício) | `kit/report-exemplo.html` | `kit/report-exemplo-pj.html` (`dados/EXEMPLO-PJ-treinamento.txt`) |
| Template e marca | `template/report.html` · `config/marca.txt` | `template/report-pj.html` · `config/marca-pj.txt` |
| Rascunho no navegador | `emulador-report` | `emulador-report-pj` (não se misturam) |

## PF e PJ não se misturam

- Cada página salva leva o segmento: o report PJ tem `<meta name="report-segmento" content="pj">`; o PF, nenhum (como sempre).
- O **Emulador Report PJ só abre reports PJ** e o **PF só abre reports PF**. Ao escolher o arquivo do outro segmento, aparece "Este é um report PF/PJ", com o nome do emulador certo; o report que estava aberto continua como estava.
- O rascunho guardado no navegador (edição não salva) é separado: um emulador nunca oferece a edição do outro.
- As imagens do PJ são próprias (`assets/coringa-pj/`, `assets/exemplo-pj/`). Nenhuma peça, campanha ou resultado do PF entra no PJ. A formiguinha (personagem do Creative Strategy PF) não aparece no PJ.

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
| Paleta: Rio, Branco, Vermelho Santander, Boston e Preto, "com destaque para o tom Rio" (6.2 Cores) | Fundos só **Rio** e **Branco**: página branca e blocos Rio (abertura, principais resultados, indicadores, próximas iniciativas, encerramento). Nenhum fundo vermelho |
| Títulos e textos de apoio em Preto (6.2 Cores) | Todos os títulos, números e textos em Preto (o 1º número também; no PF ele é vermelho) |
| Vermelho: Botão de Início, texto do balão, logotipo | Vermelho só na chama, nos links, nos balões sobre Rio e no botão do e-mail-resumo |
| Balões de fala: só duas variações, Branco com texto Vermelho Santander (sobre Rio) e Rio com texto Boston (sobre Branco); Santander Micro Text SemiBold (6.2 Balões) | Período da abertura e números das seções nos blocos Rio: balão Branco/Vermelho. Rótulo da campanha e números das seções sobre Branco: balão Rio/Boston |
| Santander Condensed: títulos e mensagens de impacto, voz do banco; Headline: títulos de peso médio, ambientes digitais; Micro Text: apoio (6.2 Tipografia) | Frase do mês e títulos das seções em Condensed; números e nomes em Headline; textos em Micro Text (`config/marca-pj.txt`) |
| Retângulos verticais ou horizontais, nunca quadrados; raio de 5% do menor lado (6.2 Retângulos) | Peça da visão geral em retângulo vertical (184 x 230 px); destaque vertical (184 x 300); cards horizontais (184 x 72). Cantos: 34 px nos blocos (5% de 680), 20 px nas imagens |
| Logotipo na versão positiva, sobre Rio ou Branco; cor não muda (6.2 Logotipo) | A chama oficial em Vermelho Santander (`assets/marca/chama-santander.png`, o mesmo arquivo do PF), no topo e no canto inferior direito do encerramento |
| Composição: logotipo alinhado à margem inferior direita (6.2 Composição) | Assinatura do encerramento com a chama no canto inferior direito |

### E-mail-resumo PJ

Mesmo funcionamento do PF (até 4 destaques, imagem, link, um único botão, modo escuro protegido), no tema Empresas: cabeçalho Rio com texto Preto, cartões Rio, etiquetas em Boston, chamada final em Branco e o botão em Vermelho Santander com texto branco. Cantos retos, pelo mesmo motivo do PF (o Outlook para Windows tira os cantos ao enviar).

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
