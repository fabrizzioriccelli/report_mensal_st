# Biblioteca de prompts do Microsoft Copilot

**Do dado à informação, com mais clareza.** São 12 prompts prontos para o **Microsoft Copilot corporativo** transformar os documentos e resultados do mês em conteúdo estruturado para o report:

**Documentos e resultados → Microsoft Copilot → Conteúdo estruturado → Report**

Os prompts 5 a 11 devolvem o conteúdo no **formato de blocos** do report (`[NUMERO 1]`, `valor: 12,5%`…). Esse formato pode ser colado no emulador, em **Importar conteúdo (Copilot)**, que preenche os campos correspondentes da página. O Copilot ajuda a organizar e a escrever. **Quem responde pelos números é a área: confira cada um com a fonte antes de salvar.**

## Como usar

1. Use **só o Copilot corporativo**, com a sua conta do banco. Dados internos não vão para ferramentas externas nem para IAs públicas.
2. Abra uma conversa nova por mês. Envie primeiro o **Prompt 0 (regras)**, uma vez só.
3. Anexe ou cole a base do mês (planilha, painel exportado, relatórios das campanhas, mensagens do time).
4. Copie o prompt, troque o que está `[ENTRE COLCHETES]` e envie.
5. Confira a resposta (veja **Validação** em cada prompt) e só então leve para o report.

| Momento do mês | Prompts |
|---|---|
| Recebi os dados | 1 → 2 → 3 → 4 |
| Vou escrever o report | 5 → 6 → 7 → 8 → 9 → 10 |
| Vou preencher a página no emulador | 11 |
| Antes de salvar e enviar | 12 |

### Como importar no emulador

1. No emulador, com o report aberto, clique em **Importar conteúdo (Copilot)**.
2. Cole a resposta do Copilot (só os blocos, de `[` até o último campo) e clique em **Aplicar na página**.
3. O emulador preenche os campos que existem na página e lista o que ficou de fora (bloco que não existe no layout, por exemplo).
4. Confira campo a campo na página. Para desfazer, use **Desfazer**.

O que a importação **não** faz: não traz imagens, links nem PDFs (esses são trocados na página: passe o mouse e use "Trocar imagem" ou "Trocar link"); não cria item novo (se a página tem 3 lançamentos, o bloco `[LANCAMENTO 4]` fica de fora); não confere se o número está certo.

### Formato de blocos (referência)

```text
[EDICAO]            mes · ano · proximo_mes
[ABERTURA]          frase · frase_final
[PROJETO PRINCIPAL] nome · resumo
[NUMERO 1] a [3]    valor · titulo · detalhe · variacao · variacao_cor
[LANCAMOS]          titulo
[DESTAQUE]          categoria · titulo · texto · nota
[RESULTADO 1] a [3] valor · titulo · detalhe · variacao · variacao_cor
[LANCAMENTO 1] a [6] status · status_cor · nome · texto
[CREATIVE X]        subtitulo · anterior · atual · variacao · periodo · referencia · significado
[TRANSFORMATION]    titulo
[TRANSFORMATION 1] a [3] status · status_cor · nome · texto · resultado
[APRENDIZADO 1] a [3] titulo · texto · levamos
[TOPICO]            rotulo · titulo · texto   ([TOPICO B], [TOPICO C], [TOPICO D]: outros tópicos novos)
[TOPICO 1] a [6]    status · status_cor · nome · texto · valor   ([TOPICO B 1]…)
[FOCO]              prioridade · texto
[AGENDA 1] a [6]    data · titulo · detalhe
```

- `variacao`: com sinal (`+25%`, `-20%`, `+3 p.p.`). O emulador põe a seta (▲ ou ▼).
- `variacao_cor` e `status_cor`: `verde` (resultado positivo; custo que caiu também é positivo) ou `ambar` (atenção, previsto, aguardando).
- Campo sem dado: **não escreva o campo**. Nunca complete com estimativa.
- `[TOPICO]`: o **novo tópico** (ex.: Testes), seção opcional para um assunto que ainda não tem lugar no report; `[TOPICO B]`, `[TOPICO C]` e `[TOPICO D]` são os seguintes, na ordem em que foram criados. No emulador, crie o tópico antes de importar (**+ Novo tópico**, com o nome e o layout). `valor` só no layout Números.

---

## Prompt 0 · Regras da conversa (enviar uma vez)

| | |
|---|---|
| **Objetivo** | Combinar as regras que valem para todos os prompts: só dados fornecidos, base de comparação, % × p.p., hipótese × causa |
| **Quando usar** | No início de cada conversa nova |
| **Entradas** | Nome da área, mês analisado e período de comparação |
| **Formato de saída** | O Copilot confirma que entendeu (não precisa de mais nada) |
| **Validação** | Se ele "resumir" as regras de outro jeito, reenvie o bloco |
| **Onde entra no report** | Em nenhum lugar: prepara a conversa |

```text
Você vai me ajudar a transformar os resultados mensais da área
[NOME DA ÁREA] em um report executivo.

Regras obrigatórias:
1. Use SOMENTE os dados e documentos que eu fornecer. Não invente, não estime
   e não complete números. Se faltar um dado, escreva "DADO AUSENTE: [o que
   falta]".
2. Sempre informe a base de comparação (período anterior, meta, média ou grupo
   de controle). Sem base, não chame um número de "melhora" ou "piora".
3. Respeite a unidade de cada indicador (%, R$, quantidade, pontos).
4. Diferencie variação percentual (relativa: de 40% para 52% = +30%) de pontos
   percentuais (de 40% para 52% = +12 p.p.). Nunca troque um pelo outro.
   Mostre a conta quando calcular.
5. Não atribua causa sem evidência. Explicação não comprovada pelos dados deve
   ser marcada como HIPÓTESE.
6. Não destaque variações pequenas ou sobre base pequena.
7. Para cada indicador, diga se SUBIR é bom ou ruim (custo e CPC: cair é bom).
8. Linguagem corporativa, clara e direta. Frases curtas. Sem exageros.
9. Período analisado: [MÊS/ANO]. Comparação: [MÊS/ANO ANTERIOR OU OUTRA BASE].
Responda apenas "Regras entendidas." agora.
```

## Prompt 1 · Organizar a base do mês

| | |
|---|---|
| **Objetivo** | Juntar todos os indicadores do mês numa tabela única, sem conclusões |
| **Quando usar** | Assim que os dados do mês chegarem (planilhas, painéis, e-mails) |
| **Entradas** | Arquivos ou textos com os resultados do mês e do período de comparação |
| **Formato de saída** | Tabela: projeto, indicador, unidade, valor atual, valor de comparação, base, fonte |
| **Validação** | Sorteie 3 linhas e confira com a fonte original. Quantidade de linhas = quantidade de indicadores enviados |
| **Onde entra no report** | Base de trabalho dos prompts 2 a 11 (não vai para a página) |

```text
Organize os dados de [MÊS/ANO] que anexei. Siga as regras combinadas.

Entregue uma tabela com TODOS os indicadores, nesta ordem de colunas:
Projeto/campanha | Indicador | Unidade | Valor atual | Valor de comparação |
Base de comparação | Subir é bom? | Fonte (arquivo e aba/página)

Não calcule variações e não escreva conclusões nesta etapa.
No fim, liste os indicadores com DADO AUSENTE.
```

## Prompt 2 · Conferir a base (consistência)

| | |
|---|---|
| **Objetivo** | Encontrar erros antes de escrever: períodos que não batem, unidades misturadas, totais que não fecham |
| **Quando usar** | Logo depois do Prompt 1 |
| **Entradas** | A tabela do Prompt 1 (já está na conversa) |
| **Formato de saída** | Lista de problemas, cada um com indicador, o que está errado e o que pedir à fonte |
| **Validação** | Resolva cada problema com quem enviou o dado. Não siga com número em dúvida |
| **Onde entra no report** | Em nenhum lugar: evita número errado no report |

```text
Revise a tabela anterior e liste somente problemas:
- período diferente do combinado;
- unidades misturadas no mesmo indicador (ex.: % e p.p.);
- totais que não fecham com as partes;
- valores duplicados ou fora do padrão dos meses anteriores;
- indicador sem base de comparação.
Para cada problema: indicador | o que está errado | pergunta para a fonte.
Se não houver problema, escreva "Base consistente".
```

## Prompt 3 · Calcular as variações (com a conta)

| | |
|---|---|
| **Objetivo** | Calcular cada variação do jeito certo (relativa ou p.p.), mostrando a conta |
| **Quando usar** | Depois que a base estiver consistente |
| **Entradas** | Tabela conferida; critério de relevância da área (se houver) |
| **Formato de saída** | Tabela: indicador, anterior, atual, variação, tipo (relativa ou p.p.), conta, classificação |
| **Validação** | Refaça 2 contas na calculadora. Confira se indicador em % usa p.p. |
| **Onde entra no report** | Etiquetas de variação dos números (`variacao`) e Creative X |

```text
Para cada indicador da tabela, calcule a variação de [MÊS/ANO] contra
[BASE DE COMPARAÇÃO]:
- valores absolutos (R$, quantidade): variação relativa em %;
- indicadores que já são percentuais (CTR, taxa, score): diferença em p.p.
Mostre a conta de cada linha.

Classifique cada um como "evolução relevante", "estável" ou "piora relevante",
com o critério: [CRITÉRIO DA ÁREA, EX.: VARIAÇÃO ACIMA DE 10% OU 2 P.P.].
Se não houver critério, diga qual usou. Não explique causas.
```

## Prompt 4 · Escolher os destaques do mês

| | |
|---|---|
| **Objetivo** | Escolher o projeto principal, os 3 números da capa e o que fica de fora |
| **Quando usar** | Depois das variações calculadas |
| **Entradas** | Tabelas dos prompts 1 e 3 |
| **Formato de saída** | Projeto principal + número 1 a 3; destaque de "O que lançamos"; lista do que foi descartado e por quê |
| **Validação** | A área aprova a escolha antes de escrever os textos |
| **Onde entra no report** | Capa (projeto principal e números), "O que lançamos" e e-mail-resumo (até 3 indicadores) |

```text
Com base nas tabelas anteriores, proponha:
1. PROJETO PRINCIPAL do mês (o resultado mais importante) e os 3 números que
   o representam, do mais para o menos relevante;
2. PROJETO EM DESTAQUE de "O que lançamos" e até 3 resultados dele;
3. até 6 lançamentos do mês, do mais para o menos relevante.
Ordem de prioridade: resultados relevantes; evoluções expressivas; resultados
positivos; mudanças importantes frente ao período anterior.
Liste também o que você DESCARTOU (pequeno, sem base, base pequena) e o motivo.
```

## Prompt 5 · Frase do mês e projeto principal

| | |
|---|---|
| **Objetivo** | Escrever a capa: frase do mês, projeto principal e os 3 números |
| **Quando usar** | Depois que a área aprovar os destaques (Prompt 4) |
| **Entradas** | Destaques aprovados; mês e próximo mês |
| **Formato de saída** | Blocos `[EDICAO]`, `[ABERTURA]`, `[PROJETO PRINCIPAL]`, `[NUMERO 1]` a `[NUMERO 3]` |
| **Validação** | Cada `valor` igual ao da tabela; frase sem número; nenhum campo inventado |
| **Onde entra no report** | Capa vermelha e e-mail-resumo (frase e indicadores) |

```text
Escreva a capa do report de [MÊS/ANO] usando só os destaques aprovados.
Limites (o layout tem espaço fixo):
- frase + frase_final: juntas, até 8 palavras, sem número;
- nome do projeto: até 40 caracteres; resumo: 1 a 2 frases;
- valor: até 10 caracteres (ex.: 12,5% · R$ 1,20 · 2,5x);
- titulo: 1 a 3 palavras; detalhe: base de comparação, até 5 palavras;
- variacao: com sinal (+25%, -20%, +3 p.p.); variacao_cor: verde ou ambar.
Responda SOMENTE neste formato, sem comentários:
[EDICAO]
mes: [MÊS]
ano: [ANO]
proximo_mes: [PRÓXIMO MÊS]

[ABERTURA]
frase: ...
frase_final: ...

[PROJETO PRINCIPAL]
nome: ...
resumo: ...

[NUMERO 1]
valor: ...
titulo: ...
detalhe: ...
variacao: ...
variacao_cor: ...
(repita para NUMERO 2 e NUMERO 3; campo sem dado: não escreva a linha)
```

## Prompt 6 · O que lançamos

| | |
|---|---|
| **Objetivo** | Escrever o projeto em destaque, os resultados dele e os lançamentos |
| **Quando usar** | Depois do Prompt 5 |
| **Entradas** | Destaque e lançamentos aprovados; status de cada lançamento |
| **Formato de saída** | Blocos `[LANCAMOS]`, `[DESTAQUE]`, `[RESULTADO 1]` a `[3]`, `[LANCAMENTO 1]` a `[6]` |
| **Validação** | Números iguais à tabela; status verdadeiro (no ar, em teste, resultado em data X) |
| **Onde entra no report** | Seção "O que lançamos" |

```text
Escreva a seção "O que lançamos" de [MÊS/ANO] com os itens aprovados.
Limites: titulo da seção até 60 caracteres; destaque: titulo até 60 caracteres
e texto de 2 linhas; lançamento: nome até 30 caracteres e texto de 1 frase;
status: até 25 caracteres; status_cor: verde (no ar, implementado) ou ambar
(previsto, em teste, aguardando resultado).
Responda SOMENTE neste formato, sem comentários:
[LANCAMOS]
titulo: ...

[DESTAQUE]
categoria: ...
titulo: ...
texto: ...

[RESULTADO 1]
valor: ...
titulo: ...
detalhe: ...
variacao: ...

[LANCAMENTO 1]
status: ...
status_cor: ...
nome: ...
texto: ...
(repita os blocos numerados conforme os itens aprovados)
```

## Prompt 7 · Creative X

| | |
|---|---|
| **Objetivo** | Escrever o Creative X (score), com a causa da variação e o que fazer |
| **Quando usar** | Com o score do mês e do mês anterior em mãos |
| **Entradas** | Score anterior e atual; tabela de variações |
| **Formato de saída** | Bloco `[CREATIVE X]` |
| **Validação** | Variação do score em p.p. (não em %); causa e ação com o dado que as sustenta |
| **Onde entra no report** | Seção "Creative X" |

```text
Creative X: anterior [SCORE ANTERIOR], atual [SCORE ATUAL], período
[EX.: SET VS. OUT]. Calcule a diferença em p.p., escreva a causa da variação
em 1 frase (referencia) e o que fazer com ela em 1 frase (significado).
Responda SOMENTE neste formato, sem comentários:
[CREATIVE X]
subtitulo: Score criativo · ...
anterior: ...
atual: ...
variacao: ...
periodo: ...
referencia: Causa: ...
significado: Ação: ...
```

## Prompt 8 · Transformation Hub

| | |
|---|---|
| **Objetivo** | Transformar mensagens e documentos do time do Transformation Hub em texto curto e padronizado |
| **Quando usar** | Quando o time enviar as novidades dos projetos (agentes, ferramentas) |
| **Entradas** | Mensagens, apresentações ou documentos do time; previsões de lançamento confirmadas |
| **Formato de saída** | Blocos `[TRANSFORMATION]` e `[TRANSFORMATION 1]` a `[3]` |
| **Validação** | Data de lançamento só se confirmada pelo time; nome do projeto exatamente como o time escreve |
| **Onde entra no report** | Seção "Transformation Hub" (logo, links e PDF são colocados na página, no emulador) |

```text
Com base nas mensagens e documentos que anexei, escreva até 3 projetos do
Transformation Hub. Use o nome do projeto exatamente como está no material.
Para cada um: o que o projeto faz (1 frase, até 120 caracteres) e o status.
Previsão de lançamento: só se estiver escrita no material; senão, deixe o
status vazio. Não invente datas, resultados nem citações.
Responda SOMENTE neste formato, sem comentários:
[TRANSFORMATION]
titulo: Como estamos transformando<br>a forma de criar.

[TRANSFORMATION 1]
status: ...
status_cor: ...
nome: ...
texto: ...
(repita para 2 e 3; status_cor: verde se já implementado, ambar se previsto)
```

## Prompt 9 · Aprendizados

| | |
|---|---|
| **Objetivo** | Escrever até 3 aprendizados, separando o comprovado da hipótese |
| **Quando usar** | Depois dos resultados escritos (prompts 5 a 7) |
| **Entradas** | Tabelas de resultados e variações |
| **Formato de saída** | Blocos `[APRENDIZADO 1]` a `[3]`; antes deles, a classificação de cada um |
| **Validação** | Nenhuma causa afirmada sem dado; hipótese escrita como "pode indicar", "sugere" |
| **Onde entra no report** | Seção "O que aprendemos" |

```text
Proponha até 3 aprendizados de [MÊS/ANO]. Para cada um, diga antes se é
COMPROVADO PELOS DADOS ou HIPÓTESE. Hipótese deve ser escrita com "pode
indicar" ou "sugere". Não transforme correlação em causa.
Limites: titulo até 5 palavras; texto: 1 frase com o dado que sustenta;
levamos: 1 ação curta para os próximos meses (começando com minúscula).
Depois da classificação, responda neste formato:
[APRENDIZADO 1]
titulo: ...
texto: ...
levamos: ...
(repita para 2 e 3)
```

## Prompt 10 · Foco e agenda do próximo mês

| | |
|---|---|
| **Objetivo** | Escrever a prioridade do próximo mês e a agenda ("Também vem aí") |
| **Quando usar** | Com o calendário do próximo mês em mãos |
| **Entradas** | Planejamento e calendário do próximo mês; pontos de atenção |
| **Formato de saída** | Blocos `[FOCO]` e `[AGENDA 1]` a `[6]` |
| **Validação** | Datas iguais ao calendário; data incerta como "A DEFINIR" |
| **Onde entra no report** | Seções "Foco do próximo mês" e "Também vem aí" |

```text
Com base no planejamento de [PRÓXIMO MÊS] que anexei, escreva:
- o foco do próximo mês: prioridade (até 60 caracteres) e texto (1 frase);
- até 6 itens de agenda, na ordem das datas: data no formato "12 NOV" (ou
  "A DEFINIR"), titulo (até 30 caracteres) e detalhe (até 40 caracteres).
Não invente datas: use só as do material.
Responda SOMENTE neste formato, sem comentários:
[FOCO]
prioridade: ...
texto: ...

[AGENDA 1]
data: ...
titulo: ...
detalhe: ...
(repita os blocos numerados)
```

## Prompt 11 · Conteúdo completo para importar no emulador

| | |
|---|---|
| **Objetivo** | Juntar tudo o que foi aprovado num único bloco de texto, pronto para **Importar conteúdo (Copilot)** |
| **Quando usar** | Quando todos os textos estiverem aprovados pela área |
| **Entradas** | As respostas aprovadas dos prompts 5 a 10 (já estão na conversa) |
| **Formato de saída** | Blocos `[EDICAO]` a `[AGENDA n]`, na ordem do report, sem comentários |
| **Validação** | Depois de aplicar no emulador: a mensagem "N campo(s) preenchido(s)" e a conferência na página, campo a campo |
| **Onde entra no report** | Em toda a página, pelo emulador (passo 2 → Importar conteúdo) |

```text
Junte as versões APROVADAS dos blocos desta conversa num único texto, na
ordem: EDICAO, ABERTURA, PROJETO PRINCIPAL, NUMERO 1 a 3, LANCAMOS, DESTAQUE,
RESULTADO 1 a 3, LANCAMENTO 1 a 6, CREATIVE X,
TRANSFORMATION, TRANSFORMATION 1 a 3, APRENDIZADO 1 a 3, FOCO, AGENDA 1 a 6.
Regras:
- copie os textos exatamente como aprovados (não reescreva);
- um campo por linha, no formato "campo: valor";
- campo sem dado: não escreva a linha;
- não acrescente comentários, títulos, marcadores nem explicações.
```

## Prompt 12 · Revisão final antes de enviar

| | |
|---|---|
| **Objetivo** | Revisar o report como um analista crítico antes do envio |
| **Quando usar** | Depois de salvar o report no emulador, antes de gerar o e-mail |
| **Entradas** | Os textos finais (copie da página ou do Prompt 11) e a base original |
| **Formato de saída** | Lista numerada: 1 a 7, cada item "OK" ou o problema com a correção sugerida |
| **Validação** | Corrija no emulador o que for problema real; não aceite correção que mude número sem conferir a fonte |
| **Onde entra no report** | Revisão de todas as seções |

```text
Revise o conteúdo final do report de [MÊS/ANO] abaixo, comparando com a base
original que está nesta conversa:
[COLE O CONTEÚDO FINAL]
Verifique e responda item a item (OK ou o problema e a correção):
1. Algum número não bate com a base (indicador, valor, período)?
2. Algum destaque é menos relevante do que um resultado que ficou de fora?
3. Há troca entre variação percentual e pontos percentuais?
4. Há causa afirmada sem evidência (deveria ser hipótese)?
5. Alguma variação destacada é pequena ou tem base fraca?
6. A leitura conta a história: o que aconteceu, o principal resultado, o que
   evoluiu, o que aprendemos, o que vem a seguir?
7. Algum texto passou do limite de tamanho ou está ambíguo?
```

---

## Cuidados

- **Não cole dados no Copilot pessoal** nem em outras IAs públicas. Use só o ambiente aprovado pela empresa.
- O Copilot pode errar contas e trocar % por p.p. Confira toda variação calculada.
- Indicador sem dado no mês: oculte o item no emulador ("Tirar item"). Não deixe o número do mês anterior nem ponha zero no lugar.
- Guarde a versão final no report salvo (`.html`), não na conversa.
