# Atualizando o report em 10 passos

Guia para o dia a dia. Você só precisa de um editor de texto (o Bloco de Notas funciona) e do Edge ou Chrome.

> **Regra de ouro:** troque só o texto que fica entre `>` e `<`. Não apague `<`, `>`, aspas `"` nem o que está dentro de `style="..."`.
>
> ```html
> <p class="num" style="margin:0;font-family:Georgia,...;">4,93%</p>
>                                                        ^^^^^  ← só isto muda
> ```

## Mapa do report

O report conta uma história curta, de cima para baixo. **Cada projeto aparece uma vez só**, com o seu contexto, os seus números e a sua peça juntos.

| Ordem | Seção | O que mostra | Marcadores |
|---|---|---|---|
| — | Cabeçalho | "Creative Strategy PF", report mensal e mês | `01` |
| 01 | O mês em uma frase | A frase do mês + o **projeto principal**: nome, resumo, peça e até 4 números | `02`, `03`, `07`, `12` |
| 02 | O que lançamos | Título da seção, **1 projeto em destaque** (peça, contexto e resultados) e até 3 **projetos compactos** | `04`, `07`, `08` |
| 03 | Creative X | Score anterior → atual, variação, barra e 1 frase | `05` |
| 04 | Creative Transformation | Projetos de IA e inovação: status, o que é, evidência e resultado | `06`, `07`, `12` |
| 05 | O que aprendemos | 3 aprendizados: título curto, 1 frase e "→ Levamos" | `09` |
| 06 | Foco do próximo mês | A prioridade que sai dos aprendizados (bloco vermelho) | `01`, `10`, `12` |
| 07 | Também vem aí | Agenda: 6 itens com data, título e detalhe | `11` |
| — | Rodapé | Despedida e contato | `01`, `08` |

### Os marcadores

Pesquise (Ctrl+F) `EDITAR AQUI` para passar por todos, ou o número para ir direto:

```text
01 MÊS               assunto, cabeçalho, foco, despedida
02 FRASE DO MÊS      a frase da abertura e a pré-visualização
03 PROJETO PRINCIPAL nome, resumo e números da abertura
04 O QUE LANÇAMOS    título, projeto em destaque e compactos
05 CREATIVE X        scores, variação, barra e frase
06 TRANSFORMATION    projetos de IA, status e resultado
07 IMAGENS           peças e miniaturas
08 VÍDEOS E LINKS    links do Stream e contato
09 APRENDIZADOS      os 3 aprendizados
10 FOCO              a prioridade do próximo mês
11 AGENDA            datas e títulos do "Também vem aí"
12 FORMIGUINHA       qual versão da personagem aparece
```

---

## PASSO 1 · Duplique o report do mês anterior

Na pasta `reports/`, copie o arquivo do último mês e renomeie com o novo mês:

```
reports/2026-09.html  →  reports/2026-10.html
```

Crie a pasta de imagens do mês: `assets/2026-10/`. No arquivo novo, use **Ctrl+H** para substituir `2026-09` por `2026-10` (o texto só aparece nos caminhos das imagens).

> Quer começar limpo? Copie `template/report-template.html` para `reports/AAAA-MM.html`. Ele vem com todos os campos como placeholder e caixas tracejadas no lugar das imagens.

## PASSO 2 · Mês e frase do mês

Pesquise **`01 MÊS`**. São 4 pontos: assunto (`<title>`), edição no cabeçalho (`OUTUBRO 2026`), "Foco de…" e "Até…" (esses dois com o mês **seguinte**). A frase do foco ("Com base no que aprendemos em…") também cita os meses: ela é editada no passo 9.

Depois, **`02 FRASE DO MÊS`** (2 lugares):

- **A frase da abertura**: até ~8 palavras, a síntese do mês. O trecho final fica em itálico vermelho:

  ```html
  Escala e eficiência <i style="color:#9E1218;">no mesmo mês.</i>
  ```

- **A pré-visualização** (perto do topo): o texto que aparece ao lado do assunto na caixa de entrada. A frase + o principal número, até ~110 caracteres.

## PASSO 3 · Projeto principal

Pesquise **`03 PROJETO PRINCIPAL`**. É o projeto mais importante do mês. Ele aparece **só aqui**, não se repete em "O que lançamos".

- **Nome** e **resumo** (1 a 2 linhas).
- **Até 4 números.** O primeiro, em vermelho, é o resultado principal. Cada número tem valor curto (até ~11 caracteres), rótulo em negrito e contexto:

  ```html
  <p class="num" ...>R$ 29</p>
  <p ...><b ...>Ticket médio</b><br>era R$ 16</p>
  <p ...><span style="...background:#E4F2EA;color:#1D7A4C;...">&#9650; +81%</span></p>
  ```

- A linha da **etiqueta** é opcional: apague o `<p>...</p>` inteiro dela se o número não tiver comparação.

**Variações calculadas.** Quando a etiqueta mostra uma variação que não veio pronta da fonte, faça a conta a partir dos números do próprio report e confira duas vezes. Em setembro, `▲ 2,5x` (651,9 ÷ 262) e `▲ +81%` (29 ÷ 16 − 1) foram calculados assim.

## PASSO 4 · O que lançamos

Pesquise **`04 O QUE LANÇAMOS`**.

1. **Título da seção:** uma frase que resume os lançamentos (ex.: "Contexto certo, mídia mais eficiente.").
2. **Projeto em destaque** (o lançamento com o resultado mais claro):
   - categoria (`ÁREA · CAMPANHA`), título em forma de pergunta ou afirmação e 2 linhas sobre o que foi feito;
   - **3 resultados**: número grande, rótulo, "era…" e etiqueta;
   - nota de rodapé com a base de comparação.
3. **Projetos compactos** ("Também no ar", 3 por linha): miniatura, status, nome e 1 frase.

### Etiquetas (pílulas)

| Situação | Etiqueta | Código |
|---|---|---|
| Resultado bom, número subiu | verde `▲ +89%` | `background:#E4F2EA;color:#1D7A4C;` + `&#9650;` |
| Resultado bom, número caiu (custo, CPC) | verde `▼ −12%` | mesmas cores + `&#9660; &minus;12%` |
| Previsto, pendente ou em atenção | âmbar `○ Resultado em 28/09` | `background:#FBF0DC;color:#9A5B00;` + `&#9675;` |
| Implementado / no ar | verde `● Implementado` | cores verdes + `&#9679;` |

Padrão de escrita: `3,6x`, `+89%`, `R$ 0,68`, `&minus;12%`.

**Resultado de um projeto compacto saiu?** Ele pode subir para **projeto em destaque** no mês seguinte: copie o bloco `PROJETO EM DESTAQUE` e preencha. Um projeto continua aparecendo uma vez só por edição.

## PASSO 5 · Imagens

Pesquise **`07 IMAGENS`**. O jeito mais simples: **salve a imagem nova com o mesmo nome do arquivo antigo** em `assets/AAAA-MM/`. O HTML não muda.

Exporte no dobro do tamanho exibido, em JPG, até ~200 KB:

| Espaço | Arquivo | Exportar em |
|---|---|---|
| Peça do projeto principal | `visual-principal.jpg` | 460 x 460 px |
| Peça do projeto em destaque (vertical) | `projeto-copa.jpg` (ou outro nome) | 280 px de largura |
| Miniaturas dos projetos compactos | `destaque-2-1.jpg`, `destaque-2-2.jpg`, `destaque-2-3.jpg` | 368 x 144 px |
| Print de ferramenta (Transformation) | livre | 136 px de largura |

Trocou o nome do arquivo? Troque também no `src="../assets/AAAA-MM/..."` e atualize o `alt` (a descrição que aparece com imagens bloqueadas).

**Espaço com placeholder (caixa tracejada):** apague a `<table>` que vem logo depois de `<!-- PLACEHOLDER · ... -->` e cole no lugar uma imagem:

```html
<img src="../assets/2026-10/print-ferramenta.jpg" width="68" alt="Tela da ferramenta" style="display:block;border:0;width:68px;height:auto;border-radius:8px;">
```

## PASSO 6 · Vídeos e links

Pesquise **`08 VÍDEOS E LINKS`**. Vídeo não toca dentro do e-mail; o report usa uma miniatura clicável e o link **▶ Assistir**.

- Troque todo `#COLE-O-LINK-DO-STREAM` pelo **link de compartilhamento** do Stream. No bloco com vídeo, o link aparece **duas vezes** (miniatura e texto).
- Confira se o vídeo está compartilhado com **o mesmo público do e-mail**.
- No rodapé, preencha o contato do time.

## PASSO 7 · Creative X

Pesquise **`05 CREATIVE X`**. É um bloco curto: o leitor precisa entender em 3 segundos.

| Campo | Exemplo |
|---|---|
| Anterior → atual | `78% → 91%` (o atual fica grande) |
| Variação (etiqueta verde) | `+13 p.p.` (atual − anterior) |
| Períodos | `ago/set vs. jun/jul` |
| Barra | 1ª célula `width="91%"`, 2ª `width="9%"` (**sempre somam 100%**) |
| Referência (cinza) | `2x a média global · média 2026: 72%` |
| O que significa | 1 frase curta com o principal ganho |

Se o score caiu, troque a etiqueta verde pela âmbar (veja a tabela do passo 4).

## PASSO 8 · Creative Transformation

Pesquise **`06 TRANSFORMATION`**. Um bloco por projeto de IA, automação ou inovação:

- **status** em etiqueta (`● Implementado · 15/10` verde, ou `○ Em teste` âmbar);
- **nome** e **o que faz**, em 1 frase;
- **evidência** (opcional): uma citação de quem usou, em itálico;
- **resultado**: adoção, tempo ganho ou outro indicador. Sem indicador ainda, escreva o próximo passo.

Para outro projeto, copie de `INÍCIO BLOCO · PROJETO DE TRANSFORMATION` até `FIM BLOCO`. No último bloco da lista, apague o `border-bottom:1px solid #DCE8E9;` para não sobrar linha no fim.

## PASSO 9 · Aprendizados, foco e agenda

**`09 APRENDIZADOS`**: no máximo 3, cada um com:

- **título curto** (até 5 palavras). *Ex.: "Contexto aumenta relevância"*;
- **1 frase:** o que aconteceu e o que isso ensina. *Ex.: "Anúncios com contexto de Copa tiveram CTR 89% maior: o cliente responde ao que já está vivendo."*;
- **→ Levamos:** a ação. *Ex.: "priorizar gatilhos de contexto nos testes de outubro"*.

Escreva só o que o time realmente aprendeu. Se tiver só 2, deixe o 3º texto vazio.

**`10 FOCO`**: a conclusão do report. Uma prioridade (até ~10 palavras) e uma frase com o porquê, ligada aos aprendizados.

**`11 AGENDA`**: 6 itens (2 linhas de 3). Data com dia + mês (`12 OUT`) ou `A DEFINIR`, título e detalhe. Item sobrando? Deixe os textos vazios.

## PASSO 10 · Formiguinha, revisão e envio

**`12 FORMIGUINHA`**: a personagem aparece em 3 lugares. Só o primeiro muda de mês para mês:

| Lugar | Arquivo | Muda? |
|---|---|---|
| 01 · Projeto principal | a versão do tema do projeto (tabela abaixo) | Sim |
| 04 · Creative Transformation | `formiga-transformacao.png` | Não |
| 06 · Foco do próximo mês | `formiga-foco.png` | Não |

| Arquivo | Use quando o projeto principal for… |
|---|---|
| `formiga-base.png` | qualquer tema sem versão própria |
| `formiga-protecao.png` | seguros, proteção |
| `formiga-viagem.png` | viagem, milhas (ex.: **Milheiros**) |
| `formiga-musica.png` | música, entretenimento (ex.: **S Music**) |
| `formiga-transformacao.png` | IA, tecnologia |
| `formiga-foco.png` | metas, prioridade |

Troque o nome do arquivo e o `alt`:

```html
<img src="../assets/formiguinha/formiga-viagem.png" width="86" alt="Formiguinha com uma mala de viagem" ...>
```

Regras e como criar uma versão nova: [assets/formiguinha/README.md](../assets/formiguinha/README.md).

**Revisão:** dê dois cliques em `reports/AAAA-MM.html` e confira textos, números, meses e imagens (quadro vazio = nome de arquivo errado). Para ver como no celular: F12 e depois Ctrl+Shift+M.

**Envio:**

1. Abra `tools/gerar-eml.html`, selecione a pasta do projeto e zere as **pendências**.
2. Gere o `.eml`, abra no Outlook e **envie só para você**. Confira no computador, na web e no celular.
3. Abra de novo o `.eml` (ou gere outro, se mudou algo), preencha os destinatários e envie.

Checklist completo: [TEST_CHECKLIST.md](TEST_CHECKLIST.md). Detalhes do .eml: [HOW_TO_EXPORT_EML.md](HOW_TO_EXPORT_EML.md).

---

## Referência rápida

### Blocos que se repetem

Começam em `<!-- INÍCIO BLOCO · ... -->` e terminam em `<!-- FIM BLOCO · ... -->`. Para duplicar, copie do início ao fim (inclusive) e cole logo depois do `FIM BLOCO`. Para remover, apague do início ao fim.

| Bloco | Observação |
|---|---|
| **PROJETO EM DESTAQUE** | 1 por mês é o ideal; no máximo 2 |
| **PROJETO COMPACTO** | 3 por linha. Com 2, apague um e mude as larguras para `50%`. Para uma 2ª linha, copie a `<tr>` inteira |
| **PROJETO DE TRANSFORMATION** | Um abaixo do outro; até 3 |

Os 3 aprendizados e os 6 itens da agenda têm posição fixa: troque o texto.

### Sistema visual (para manter a consistência)

| Elemento | Regra |
|---|---|
| Fontes | Georgia para títulos, frase do mês e números; Arial para rótulos e texto |
| Cantos | 8 px miniaturas · 14 px imagens e cartões · 20 px blocos grandes · pílula nas etiquetas |
| Vermelho `#9E1218` | Marca, numeração das seções, número principal e o bloco do Foco |
| Verde `#1D7A4C` em `#E4F2EA` | Resultado positivo e "implementado" |
| Âmbar `#9A5B00` em `#FBF0DC` | Previsto, pendente ou atenção |
| Grafite `#2B2422` | Assinatura do Creative X |
| Petróleo `#1D6470` em `#E8F1F1` | Assinatura do Creative Transformation |
| Creme `#F7F2EC` | Superfície da abertura |

No Outlook para Windows os cantos aparecem retos. É esperado: o layout continua o mesmo.

### O que NÃO alterar

| Onde | Por quê |
|---|---|
| Linhas marcadas `ESTRUTURA` | Moldura de 680 px e fundo |
| O bloco `<style>` no topo | Adaptação para celular |
| Comentários `<!--[if mso]>` | Correções específicas do Outlook para Windows |
| Atributos `width="..."`, `cellpadding`, `cellspacing`, `border`, `class="..."` | O Outlook e o celular usam esses atributos para montar o layout |
| `font-family:...` | Sem isso o Outlook troca a fonte por Times New Roman |

### Erros comuns

| Sintoma | Causa | Correção |
|---|---|---|
| Parte da página sumiu | Um `-->` apagado | Confira se cada `<!--` tem o seu `-->` |
| Coluna desalinhada | Um `</td>` ou `</table>` apagado | Desfaça (Ctrl+Z) e refaça só a troca de texto |
| Barra do Creative X estranha | As duas larguras não somam 100% | Ajuste a segunda célula |
| Número quebrou em duas linhas | Valor longo demais | Abrevie (`R$ 100 mil`, `3,6x`) |
| Formiguinha não aparece | Nome do arquivo digitado errado | Copie o nome exato da tabela do passo 10 |
| Acento estranho (Ã©) | Arquivo salvo em outra codificação | Salve como **UTF-8** (Bloco de Notas: Salvar como → Codificação UTF-8) |
