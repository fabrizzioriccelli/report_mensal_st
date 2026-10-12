# Como atualizar o report todo mês

Guia para quem não programa. Leva de 30 a 60 minutos por mês, quase tudo para reunir os dados.

| O quê | Para quê | Onde editar |
|---|---|---|
| **`dados/AAAA-MM.txt`** | Textos, números, imagens e links do mês | PyCharm ou Bloco de Notas |
| **`assets/AAAA-MM/`** | As imagens do mês | Explorador de Arquivos |
| **`gerar-report.html`** | Conferir e gerar o e-mail (`.eml`) | Dois cliques (abre no Edge) |

Você **não** abre nem edita HTML. Como usar o PyCharm: [GUIA_PYCHARM.md](GUIA_PYCHARM.md).

---

## O mês em 15 passos

### Preparar (passos 1 a 2)

**1. Abra o projeto no PyCharm.** *File → Open* → pasta `report_mensal_st`. No ambiente do banco, se usar Git, primeiro **atualize** a pasta: *Git → Update Project* (Ctrl+T).

**2. Crie o arquivo do mês.** Na pasta `dados`, copie o arquivo do mês anterior (ou o `MODELO.txt`) e renomeie a cópia para o mês novo, por exemplo `2026-10.txt`.
- No PyCharm: clique no arquivo → **Ctrl+C** → clique na pasta `dados` → **Ctrl+V** → digite o nome novo → **OK**.
- Copiar o mês anterior aproveita o que se repete (títulos fixos, contato). Copiar o `MODELO.txt` começa do zero: textos em **Lorem Ipsum**, números em **X** (`X%`, `R$ X`, `X p.p.`) e imagens e links em `[INSERIR …]`. Tudo isso é conteúdo de exemplo: troque pelo do mês.

Crie também a pasta de imagens: botão direito em `assets` → *New → Directory* → `2026-10`.

### Preencher (passos 3 a 8)

Abra `dados/2026-10.txt`. Cada linha é `campo: valor`: troque só o que vem **depois dos dois-pontos**. Linhas com `#` são instruções e não vão para o e-mail. Cada seção começa com um título `EDITAR AQUI` (procure com Ctrl+F).

Textos: frases curtas e diretas, como pede o Brand Guide (até 80 caracteres por frase, sem jargão, foco no resultado).

**3. Atualize o período** (bloco `[EDICAO]`, no topo):
```text
[EDICAO]
mes: Outubro
ano: 2026
proximo_mes: Novembro
pasta_imagens: assets/2026-10
contato: [INSERIR E-MAIL OU CANAL DO TIME]
```

**4. Insira os resultados.** Antes de digitar, escolha **o que** destacar. Use o [Prompt 1 e o Prompt 2 do Copilot](PROMPTS_COPILOT.md) com a planilha do mês. Regras:
- O **projeto principal** é o resultado mais importante do mês. O **1º número** dele aparece em vermelho: use o indicador mais relevante.
- Não destaque variações pequenas só para preencher espaço. Menos números, mais claros.
- **Não invente número.** Se o dado ainda não chegou, deixe o `X`: a ferramenta não deixa enviar enquanto houver `X` ou Lorem Ipsum.

```text
[NUMERO 1]
valor: X,X%
titulo: CTR
detalhe: era X,X%
variacao: +X%
```

**5. Atualize os comparativos.** `detalhe:` é a base de comparação ("era X%", "vs. mês anterior"). `variacao:` vira a etiqueta verde com ▲.
- Começa com `-` (ex.: `-12%`) → seta ▼. Use quando cair é bom (custo, CPC).
- Resultado que pede atenção → acrescente `variacao_cor: ambar`.
- **% × p.p.:** de 40% para 52% é **+12 p.p.** (diferença de porcentagens) ou **+30%** (variação relativa). Não troque um pelo outro.
- No **Creative X**, preencha `anterior` e `atual` em %: a ferramenta calcula a variação em p.p. e a barra sozinha. Sem o anterior, nada é calculado.

**6. Insira as imagens.** Coloque as imagens em `assets/2026-10/` e escreva o nome no bloco:
```text
imagem: campanha-x.jpg
descricao_imagem: Peça da campanha X no app, com o cartão em destaque
enquadramento: centro
tipo: peca
link: https://empresa.sharepoint.com/:i:/s/creative/E...
```
- Pode ser a imagem original, em alta: a ferramenta reduz e recorta.
- `descricao_imagem` é o que aparece quando a imagem não carrega e o que leitores de tela leem.
- `enquadramento`: qual parte fica no recorte (`centro`, `topo`, `baixo`, `esquerda`, `direita`).
- Vídeo: use uma imagem do vídeo **sem** ▶ (a ferramenta desenha) e `tipo: video`.
- Que link colar: [LINKS_SHAREPOINT_STREAM.md](LINKS_SHAREPOINT_STREAM.md).

**7. Atualize os insights** (o que explica o desempenho): `resumo` do projeto principal, `texto` do destaque e `significado` do Creative X. Explicação que os dados não comprovam é **hipótese**: escreva "pode indicar", "sugere".

**8. Atualize os aprendizados e o foco** (`[APRENDIZADO 1]` a `[3]`, `[FOCO]`). O [Prompt 5](PROMPTS_COPILOT.md#prompt-5--aprendizados) ajuda a separar aprendizado de opinião.

Salve: **Ctrl+S** (o PyCharm também salva sozinho). No Bloco de Notas: *Arquivo → Salvar*, codificação **UTF-8**.

### Conferir (passos 9 a 12)

**9. Revise o layout.** Dois cliques em `gerar-report.html` → **Selecionar a pasta do projeto** → escolha a pasta principal. O mês mais recente é escolhido sozinho. Veja a **Prévia** no fim da página.

**10. Teste o desktop:** na Prévia, botão **Computador**. Os números da capa estão numa linha só? Algum título quebrou feio? Encurte o texto no `.txt`.

**11. Teste o mobile:** botão **Celular**. Nada pode sair da tela. A peça do destaque aparece na horizontal, acima do texto.

**12. Verifique erros.** Leia a **Conferência**:
- **erro**: impede gerar. Ao lado aparece o arquivo e a **linha**.
- **falta**: ainda tem Lorem Ipsum, `X`, "Mês", "AAAA", `[INSERIR …]` ou link vazio. Gera só RASCUNHO.
- **aviso** / **para saber**: confira, mas não impede.

Corrigiu algo? **Salve** e clique em **Selecionar a pasta** de novo. Depois, na seção **Teste os links**, clique em **Abrir** em cada link.

Use o [checklist](TEST_CHECKLIST.md) e, se quiser uma segunda leitura, o [Prompt 8](PROMPTS_COPILOT.md#prompt-8--auditoria-da-análise).

### Entregar (passos 13 a 15)

**13. Exporte a versão final.** **Baixar e-mail final (.eml)**. Abra o `.eml` (pasta Downloads), envie primeiro **só para você**, confira no computador e no celular, e então envie para a área. Detalhes: [HOW_TO_EXPORT_EML.md](HOW_TO_EXPORT_EML.md).

**14. Faça o backup.** **Baixar página do mês (.html)** → salve em `reports/` com o nome sugerido (`2026-10.html`). Ela abre em qualquer navegador, com as imagens dentro.

**15. Registre a atualização.** No ambiente do banco, com Git: *Commit* (Ctrl+K) com a mensagem `report: outubro 2026` → *Push* (Ctrl+Shift+K). Sem Git: copie a pasta do projeto para o local de backup combinado com a área ([BACKUP.md](BACKUP.md)).

---

## Mapa: cada bloco e onde ele aparece

| Bloco no arquivo | Onde aparece no e-mail |
|---|---|
| `[EDICAO]` | Selo do mês na capa, "Foco de…", assunto e o rodapé ("Até [próximo mês].", "Dúvidas e sugestões" = `contato`, "Próxima edição" = `proximo_mes`, assinatura com o mês) |
| `[ABERTURA]` | **01** · frase do mês na capa (`frase` + `frase_final` em itálico) e o texto da caixa de entrada (`previa`) |
| `[PROJETO PRINCIPAL]` | **01** · nome, resumo e peça na capa |
| `[NUMERO 1]` a `[NUMERO 3]` (até 4) | **01** · faixa "Projeto principal em números", um por coluna da grade (o 1º em vermelho). Use 3; com 4, as colunas ficam iguais e saem da grade |
| `[LANCAMOS]` | **02** · título da seção "O que lançamos" |
| `[DESTAQUE]` | **02** · projeto em destaque (peça vertical no computador, horizontal no celular) |
| `[RESULTADO 1]` a `[RESULTADO 3]` | **02** · números do destaque |
| `[LANCAMENTO 1]` a `[LANCAMENTO 3]` | **02** · "Também no ar", com miniatura |
| `[CREATIVE X]` | **03** · score anterior → atual, barra e frase |
| `[TRANSFORMATION]`, `[TRANSFORMATION 1]` a `[3]` | **04** · Creative Transformation |
| `[APRENDIZADO 1]` a `[3]` | **05** · O que aprendemos |
| `[FOCO]` | **06** · bloco vermelho do foco do próximo mês |
| `[AGENDA 1]` a `[AGENDA 6]` | **07** · Também vem aí (linhas de 3) |

A formiguinha aparece sozinha na abertura e no rodapé. Não há campo para ela no arquivo do mês.

**Regra do report:** cada projeto aparece **uma vez**. O projeto principal não se repete em "O que lançamos".

---

## Onde está cada texto no HTML?

Os textos **não** são editados no HTML: eles ficam no arquivo do mês, e a página monta o HTML a cada geração. Assim o layout nunca quebra. Para saber qual campo preenche qual trecho do e-mail, abra `template/report.html` e procure (Ctrl+F) `EDITAR AQUI`: cada comentário diz o bloco e o campo. Exemplo:

```html
<!-- EDITAR AQUI: INDICADORES → dados/AAAA-MM.txt › [NUMERO 1] a [NUMERO 4] valor, titulo, detalhe, variacao -->
```

## Receitas rápidas

| Quero… | Faço… |
|---|---|
| Tirar um item (número, lançamento, aprendizado) | Apago o bloco inteiro, do `[NOME]` até antes do próximo bloco |
| Tirar uma seção inteira | Apago todos os blocos dela. A numeração das seções se ajusta |
| Acrescentar um item | Copio um bloco igual, colo embaixo e troco o número. Limites: 4 números (recomendado 3), 3 resultados, 3 lançamentos, 3 Transformation, 3 aprendizados, 6 agenda |
| Trocar o texto do botão | `tipo: peca` (Ver peça →), `video` (▶ Assistir), `projeto` (Ver projeto →), `demo` (Ver demonstração →) |
| Tirar o botão | Deixo `link:` vazio |
| Status de um lançamento | `status: Resultado em 28/10` e `status_cor: ambar` (previsto) ou `verde` (no ar) |
| Data na agenda | `data: 12 OUT` aparece grande e vermelha; `data: A DEFINIR` aparece em cinza |
| Ícones no Transformation | `icones: icone-prancheta, icone-lupa` (arquivos de `assets/icones/`) |
| Quebrar a linha de um título | Escrevo `<br>` no ponto da quebra |

## Erros comuns

| A ferramenta diz | O que fazer |
|---|---|
| "Linha sem ':'" | Falta o `:` depois do nome do campo, ou é um comentário sem `#` no começo |
| "Bloco [...] desconhecido" | O nome entre colchetes foi alterado. Use os nomes do mapa acima |
| "imagem não encontrada" | Nome do arquivo diferente: confira maiúsculas, acentos e extensão (`.jpg` / `.png`) |
| "o campo ... é obrigatório" | Preencha o campo indicado |
| "Campo ... não existe ... ignorado" | Nome de campo digitado errado (ex.: `titlo`) |
| "é um caminho de rede" | Você colou `\\servidor\...` ou `C:\...`. Use o link do SharePoint |
| "não está salvo em UTF-8" | Salve o arquivo em UTF-8 (o PyCharm já salva assim) |
| A página não mudou | Salve e clique em **Selecionar a pasta** de novo |

Mais dúvidas: [FAQ.md](FAQ.md).

## O que mudar raramente

| Arquivo | Quando | Guia |
|---|---|---|
| `config/marca.txt` | Chama, fonte, cores, formiguinha, domínios de link | Comentários do próprio arquivo, [GUIA_TIPOGRAFIA.md](GUIA_TIPOGRAFIA.md), [assets/marca/README.md](../assets/marca/README.md) |
| `template/report.html` | Mudar o **layout** (exige alguém que conheça HTML de e-mail) | [ARQUITETURA.md](ARQUITETURA.md) |
| `tools/motor.js` | Nunca, no dia a dia | — |
