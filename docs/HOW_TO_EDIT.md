# Atualizando o report em 10 minutos

Guia para o dia a dia. Você só precisa de um editor de texto (o Bloco de Notas funciona; o VS Code ajuda porque colore o código) e do Edge ou Chrome.

> **Regra de ouro:** troque só o texto que fica entre `>` e `<`. Não apague `<`, `>`, aspas `"` nem o que está dentro de `style="..."`.
>
> ```html
> <p style="margin:0;font-size:28px;...">+89%</p>
>                                        ^^^^  ← só isto muda
> ```

## Mapa do report

| Ordem | Bloco | O que mostra | Marcadores |
|---|---|---|---|
| — | Cabeçalho | Nome da área, mês e a formiguinha base | `01 MÊS`, `11 FORMIGUINHA` |
| — | Visão geral | Manchete, síntese, visual central e **os 4 números do mês** | `02`, `03`, `04`, `07` |
| 01 | Resultados do mês | Um cartão por case: 1 frase, antes → depois e etiqueta verde | `04 MÉTRICAS`, `11` |
| 02 | Creative X | Anterior → atual, variação, referências e o que significa | `05`, `06`, `11` |
| 03 | Destaques do mês | Lista: formiguinha do projeto, status, 1 frase e miniatura | `07`, `10`, `11` |
| 04 | Peças e vídeos | 1 conteúdo principal + 2 secundários | `07`, `08`, `10` |
| 05 | O que aprendemos | 3 cartões: título curto, 1 frase e o que levamos | `09` |
| 06 | Próximos passos | Foco do mês, projetos do próximo mês e agenda | `09`, `11` |

Regra de conteúdo: **cada número aparece uma vez**. Os 4 números principais ficam na visão geral; as seções seguintes trazem só o contexto (antes → depois, evolução, referências).

---

## PASSO 1 · Duplique o report do mês anterior

Na pasta `reports/`, copie o arquivo do último mês e renomeie com o novo mês:

```
reports/2026-09.html  →  reports/2026-10.html
```

Copie também a pasta de imagens: `assets/2026-09/` → `assets/2026-10/`. Depois, no arquivo novo, use **Ctrl+H** para substituir `2026-09` por `2026-10` (o texto só aparece nos caminhos das imagens).

> Quer começar limpo? Copie `template/report-template.html` para `reports/AAAA-MM.html`. Ele vem com todos os campos como placeholder.

## PASSO 2 · Altere o mês

Pesquise (Ctrl+F) **`01 MÊS`**. São 6 pontos: assunto (`<title>`), cabeçalho (`REPORT MENSAL | OUTUBRO 2026`), rótulo da visão geral, "Foco de…" e "Até…" (o mês seguinte) e rodapé.

Depois, a manchete (`02 TÍTULO`, até ~8 palavras; a 2ª linha fica em vermelho) e o resumo (`03 RESUMO`, dois lugares: a síntese visível e o texto de pré-visualização da caixa de entrada).

## PASSO 3 · Atualize os números

Pesquise **`04 MÉTRICAS`**.

**Visão geral:** 4 números ao redor do visual. O primeiro (canto superior esquerdo) é o principal do mês. Valor curto (até ~11 caracteres) + rótulo + contexto.

**Cartões dos cases:** cada linha tem rótulo, antes → depois e uma etiqueta:

```html
<p ...>CTR</p>
<p ...>2,61% &#8594; <span ...>4,93%</span></p>
...
<span style="...background:#E5F4EB;color:#157A47;...">&#9650; +89%</span>
```

| Situação | Etiqueta | Código da seta |
|---|---|---|
| Resultado bom, número subiu | verde, `▲ +89%` | `&#9650;` |
| Resultado bom, número caiu (custo, CPC) | verde, `▼ −12%` | `&#9660;` e `&minus;` |
| Resultado ruim ou em atenção | troque as cores por âmbar: `background:#FCEFD8;color:#8A5300;` | — |

Padrão de escrita: `3,6x`, `+89%`, `R$ 0,68`, `&minus;12%`.

Mais uma linha num case? Copie um `<tr>...</tr>` inteiro da tabela.

## PASSO 4 · Troque as imagens

Pesquise **`07 IMAGENS`**. O jeito mais simples: **salve a imagem nova com o mesmo nome do arquivo antigo** em `assets/AAAA-MM/` (ex.: `visual-principal.jpg`). O HTML não muda.

Tamanhos (exporte no dobro, em JPG, até ~200 KB):

| Espaço | Arquivo | Exportar em |
|---|---|---|
| Visual central | `visual-principal.jpg` | 440 x 440 px |
| Miniaturas dos destaques | `destaque-2-1.jpg` … | 248 px de largura |
| Vídeo principal (16:9) | `video-1.jpg` | 640 x 360 px |
| Vídeo / peça secundários | `video-2.jpg`, `peca-1.jpg` | 200 x 112 px |

**Espaço ainda com placeholder (caixa tracejada):** apague a tabela que vem depois de `<!-- PLACEHOLDER · ... -->` e ative a linha `<img>` comentada logo acima dela (apague o `<!--` do começo e o `-->` do fim).

## PASSO 5 · Atualize os vídeos e links

Pesquise **`08 VÍDEOS`** e **`10 LINKS`**.

- **Conteúdo principal** (o mais visto): categoria, título, `12.450 acessos · 1:32` e botão ASSISTIR.
- **Também em destaque:** dois itens menores (vídeo e peça).
- Troque todo `#COLE-O-LINK-DO-STREAM` pelo **link de compartilhamento** do Stream. No conteúdo principal e no destaque 2.2, o link aparece duas vezes (imagem e texto): troque nos dois.

Confira se o vídeo está compartilhado com **o mesmo público do e-mail**.

## PASSO 6 · Atualize o Creative X

Pesquise **`06 SCORES`** e **`05 CREATIVE X`**.

| Campo | Onde | Exemplo |
|---|---|---|
| Anterior → Atual | linha grande | `78% → 91%` |
| Barra "Anterior" | 2 células | `width="78%"` e `width="22%"` |
| Barra "Atual" | 2 células | `width="91%"` e `width="9%"` |
| Variação (verde) | coluna do meio | `+13 p.p.` (atual − anterior) |
| Períodos | abaixo da variação | `ago/set vs. jun/jul` |
| Referências | coluna da direita | `2x a média global`, `72% média 2026` |
| O que significa | linha de baixo | uma frase com o principal ganho |

As duas células de cada barra **sempre somam 100%**.

## PASSO 7 · Aprendizados e próximos passos

Pesquise **`09 APRENDIZADOS`**.

**O que aprendemos:** 3 cartões, cada um com:

- **Título curto** (até 5 palavras). *Ex.: "Contexto aumenta relevância"*
- **1 frase:** o que aconteceu e o que isso ensina. *Ex.: "Criativos com contexto de Copa tiveram CTR 89% maior: o cliente responde ao que já está vivendo."*
- **Levamos:** a ação. *Ex.: "priorizar gatilhos de contexto nos testes de outubro"*

**Próximos passos:**

- **Foco de [mês]:** uma frase com a principal ação que sai dos aprendizados.
- **Projetos em destaque:** 2 cartões com a formiguinha do projeto, mês/data, nome e 1 frase.
- **Também vem aí:** agenda em 2 colunas; troque data e título.

## PASSO 8 · Escolha a formiguinha de cada projeto

Pesquise **`11 FORMIGUINHA`**. Cada projeto usa uma versão temática da mesma personagem. Troque só o nome do arquivo:

```html
<img src="../assets/formiguinha/formiga-viagem.png" ...>
```

| Arquivo | Use para |
|---|---|
| `formiga-base.png` | Cabeçalho e qualquer projeto sem versão própria |
| `formiga-viagem.png` | Viagem, milhas, turismo (ex.: Milheiros) |
| `formiga-musica.png` | Música, áudio, entretenimento (ex.: S Music) |
| `formiga-protecao.png` | Seguros, segurança, proteção |
| `formiga-futebol.png` | Esporte, futebol, eventos esportivos |
| `formiga-conversa.png` | Mídia conversacional, chat, IA |
| `formiga-creator.png` | Creators, vídeo, redes sociais |
| `formiga-cartao.png` | Cartões, pagamentos, compras |
| `formiga-prancheta.png` | Processos, briefing, ferramentas internas |
| `formiga-lupa.png` | Creative X (fixa) e análises |

Projeto novo sem versão adequada? Use `formiga-base.png` e veja em `assets/formiguinha/README.md` como pedir uma variação nova.

## PASSO 9 · Revise no navegador

Dê dois cliques em `reports/AAAA-MM.html` e confira textos, números, meses e imagens (quadro vazio = nome de arquivo errado). Para o celular: F12 e depois Ctrl+Shift+M.

## PASSO 10 · Teste e envie

1. Abra `tools/gerar-eml.html`, selecione a pasta do projeto e zere as **pendências**.
2. Gere o `.eml`, abra no Outlook e **envie só para você**. Confira no computador, na web e no celular.
3. Gere de novo (se mudou algo), abra no Outlook, preencha os destinatários e envie.

Checklist completo: [TEST_CHECKLIST.md](TEST_CHECKLIST.md). Detalhes do .eml: [HOW_TO_EXPORT_EML.md](HOW_TO_EXPORT_EML.md).

---

## Referência rápida

### Como duplicar ou remover um bloco

Blocos repetíveis começam em `<!-- INÍCIO BLOCO · ... -->` e terminam em `<!-- FIM BLOCO · ... -->`. Para duplicar, copie do início ao fim (inclusive) e cole logo depois do `FIM BLOCO`. Para remover, apague do início ao fim.

| Bloco | Observação |
|---|---|
| **CASE** | 2 por linha. Com 1 case só, apague o segundo bloco e mude `width="50%"` do primeiro para `100%` |
| **DESTAQUE** | Uma linha cada; adicione ou remova à vontade |
| **CONTEÚDO SECUNDÁRIO** | Vídeo ou peça; até 3 ficam bem ao lado do principal |
| **PROJETO EM DESTAQUE** | 2 por linha |

Os 3 cartões de aprendizado e os 6 itens da agenda têm posição fixa: troque o texto. Sobrou um? Deixe o texto vazio.

### Sistema visual (para manter a consistência)

| Elemento | Regra |
|---|---|
| Cantos | 6 px miniaturas · 12 px cartões e imagens · 16 px blocos grandes · 999 px etiquetas e botão |
| Vermelho `#9E1218` | Marca, números principais, numeração das seções |
| Verde `#157A47` em `#E5F4EB` | Resultado positivo (só nas etiquetas e no Creative X) |
| Âmbar `#8A5300` em `#FCEFD8` | Previsto, pendente ou atenção |
| Grafite `#1E1A19` | Fundo exclusivo do Creative X |

No Outlook para Windows os cantos aparecem retos. É esperado: o layout continua o mesmo.

### O que NÃO alterar

| Onde | Por quê |
|---|---|
| Linhas marcadas `ESTRUTURA` | Moldura de 680 px, fundo e barra vermelha |
| O bloco `<style>` no topo | Adaptação para celular |
| Comentários `<!--[if mso]>` | Correções específicas do Outlook para Windows |
| Atributos `width="..."`, `cellpadding`, `cellspacing`, `border` | O Outlook usa esses atributos para montar o layout |
| `font-family:Arial,...` | Sem isso o Outlook troca a fonte por Times New Roman |

### Erros comuns

| Sintoma | Causa | Correção |
|---|---|---|
| Parte da página sumiu | Um `-->` apagado ao ativar uma imagem | Confira se cada `<!--` tem o seu `-->` |
| Coluna desalinhada | Um `</td>` ou `</table>` apagado | Desfaça (Ctrl+Z) e refaça só a troca de texto |
| Barra do Creative X estranha | As duas larguras não somam 100% | Ajuste a segunda célula |
| Formiguinha não aparece | Nome do arquivo digitado errado | Copie o nome exato da tabela do passo 8 |
| Acento estranho (Ã©) | Arquivo salvo em outra codificação | Salve como **UTF-8** (Bloco de Notas: Salvar como → Codificação UTF-8) |
