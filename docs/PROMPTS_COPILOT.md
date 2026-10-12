# Prompts para o Microsoft Copilot

Prompts prontos para analisar os resultados do mês no **Microsoft Copilot** (a IA aprovada no ambiente corporativo) e decidir o que entra no report.

## Como usar

1. Use **só o Copilot corporativo**, com a sua conta do banco. Dados internos não vão para ferramentas externas.
2. Anexe ou cole a base do mês (planilha, painel exportado, resumo das campanhas).
3. Copie o prompt, troque os campos `[ENTRE COLCHETES]` e envie.
4. **Confira cada número com a fonte original antes de colocar no report.** O Copilot ajuda a priorizar e a escrever; quem responde pelos dados é a área.
5. Os textos finais vão para `dados/AAAA-MM.txt` ([COMO_ATUALIZAR_O_MES.md](COMO_ATUALIZAR_O_MES.md)).

| Momento | Prompt |
|---|---|
| Recebi os dados do mês | 1 → 2 → 3 |
| Vou escrever a capa | 4 |
| Vou escrever aprendizados e foco | 5 → 6 |
| Vou preencher o arquivo do mês | 7 |
| Antes de enviar | 8 |

## Regras que todos os prompts seguem

Cole este bloco no início da conversa (uma vez). Os prompts abaixo assumem que ele foi enviado.

```text
Você vai me ajudar a analisar os resultados mensais de comunicação da área
[NOME DA ÁREA] para um report executivo de uma página.

Regras obrigatórias:
1. Use SOMENTE os dados que eu fornecer. Não invente, não estime e não complete
   números. Se faltar um dado, escreva "DADO AUSENTE: [o que falta]".
2. Sempre informe a base de comparação (período anterior, meta, média ou grupo
   de controle). Sem base, não chame um número de "melhora" ou "piora".
3. Respeite a unidade de cada indicador (%, R$, quantidade, pontos).
4. Diferencie:
   - variação percentual (relativa): de 40% para 52% = +30%;
   - pontos percentuais (p.p.): de 40% para 52% = +12 p.p.
   Nunca troque um pelo outro. Mostre a conta quando calcular.
5. Não atribua causa sem evidência. Explicação não comprovada pelos dados deve
   ser marcada como HIPÓTESE.
6. Não destaque variações pequenas ou sem relevância prática. Considere o volume
   da base: uma variação grande sobre poucos casos pode ser ruído.
7. Para cada indicador, diga se SUBIR é bom ou ruim (ex.: CPC e custo: cair é bom).
8. Ordem de prioridade dos destaques:
   1) principais resultados relevantes; 2) evoluções mais expressivas;
   3) resultados positivos; 4) mudanças importantes frente ao período anterior;
   5) indicadores que ajudam a explicar o desempenho; 6) aprendizados;
   7) pontos que exigem acompanhamento.
9. Linguagem corporativa, clara e direta. Frases curtas. Sem exageros
   ("incrível", "explosão") e sem jargão desnecessário.
10. Período analisado: [MÊS/ANO]. Período de comparação: [MÊS/ANO ANTERIOR
    OU OUTRA BASE].
```

---

## Prompt 1 · Análise geral dos resultados

```text
Analise os dados de [MÊS/ANO] em anexo. Siga as regras combinadas.

Entregue uma tabela com TODOS os indicadores, nesta ordem de colunas:
Projeto/campanha | Indicador | Unidade | Valor atual | Valor de comparação |
Base de comparação | Variação (relativa e/ou p.p., com a conta) |
Subir é bom? | Relevância (alta/média/baixa) e por quê | Volume da base

Depois da tabela:
- liste os indicadores com DADO AUSENTE ou base de comparação ausente;
- liste inconsistências que encontrou (unidades diferentes, períodos que não
  batem, totais que não fecham).
Não escreva conclusões ainda.
```

## Prompt 2 · Principais destaques positivos

```text
Com base na tabela anterior, escolha no MÁXIMO [3 A 5] destaques para o report,
na ordem de prioridade combinada.

Para cada destaque:
- projeto/campanha e indicador;
- número no formato do report (até 10 caracteres, ex.: "X,X%", "R$ X mi", "Xx");
- base de comparação em até 5 palavras (ex.: "era X,X%");
- por que ele é mais relevante do que os que ficaram de fora.

Indique qual deve ser o PROJETO PRINCIPAL do mês (o resultado mais importante)
e qual deve ser o NÚMERO 1 dele (o mais relevante, que aparece em destaque).

Liste também os resultados que você DESCARTOU por serem pequenos, sem base de
comparação ou com volume baixo, e o motivo.
```

## Prompt 3 · Evolução mensal

```text
Compare [MÊS/ANO] com [MÊS/ANO ANTERIOR] para os indicadores abaixo:
[LISTA DE INDICADORES OU "TODOS"]

Para cada um: valor anterior, valor atual, variação (relativa para valores
absolutos; p.p. para indicadores que já são percentuais), e classificação:
"evolução relevante", "estável" ou "piora relevante".

Critério de relevância: [EX.: VARIAÇÃO ACIMA DE X% OU X P.P., OU O CRITÉRIO DA
ÁREA]. Se não houver critério definido, explique qual usou.

Não explique causas nesta etapa. Aponte apenas o que mudou e quanto.
Para o Creative X: anterior [SCORE ANTERIOR], atual [SCORE ATUAL]. Informe a
diferença em p.p.
```

## Prompt 4 · Resumo executivo

```text
Escreva o resumo executivo de [MÊS/ANO] para a capa do report, usando só os
destaques aprovados: [COLE OS DESTAQUES APROVADOS].

Entregue:
1. "Frase do mês": até 8 palavras, dividida em duas partes (início + final),
   ex.: "[INÍCIO DA FRASE]" / "[FINAL DA FRASE]". Sem número na frase.
2. "Prévia" da caixa de entrada: até 110 caracteres, com a frase e o principal
   resultado.
3. "Resumo do projeto principal": 1 a 2 linhas: o que foi feito e o resultado.
Dê 3 opções para cada item. Não use dados que não estejam nos destaques.
```

## Prompt 5 · Aprendizados

```text
Com base nos resultados de [MÊS/ANO], proponha até 3 aprendizados.

Cada aprendizado precisa:
- título curto (até 5 palavras);
- 1 frase: o que aconteceu (com o dado que sustenta) e o que isso ensina;
- "levamos": 1 ação curta para os próximos meses;
- classificação: COMPROVADO PELOS DADOS ou HIPÓTESE (e o que seria preciso para
  comprovar).

Não transforme correlação em causa. Se dois fatos aconteceram juntos, diga que
"coincidiram" ou que "podem estar relacionados", não que um causou o outro.
```

## Prompt 6 · Pontos de atenção

```text
Identifique os indicadores de [MÊS/ANO] que merecem acompanhamento:
piora relevante, queda de tendência, meta não atingida, base pequena demais
para concluir, ou dado ausente.

Para cada ponto: indicador, valor atual e de comparação, por que merece atenção,
e o que acompanhar no próximo mês.
Diferencie "ponto de atenção" (precisa de ação) de "oscilação normal" (não
precisa). Não dramatize variações pequenas.

Por fim, sugira o FOCO do próximo mês em 1 frase, ligado a um aprendizado ou a
um ponto de atenção.
```

## Prompt 7 · Textos para o report

```text
Transforme os destaques aprovados em textos prontos para o arquivo do report.
Respeite os limites de tamanho, porque o layout tem espaço fixo:

[ABERTURA]      frase: até ~28 caracteres · frase_final: até ~28 caracteres
                previa: até 110 caracteres
[PROJETO PRINCIPAL] nome: até ~40 caracteres · resumo: 1 a 2 linhas
[NUMERO 1..4]   valor: até 10 caracteres · titulo: 1 a 3 palavras ·
                detalhe: base de comparação, até 5 palavras ·
                variacao: ex. "+58%" ou "-12%" (vazio se não houver)
[DESTAQUE]      titulo: até ~60 caracteres · texto: 2 linhas
[LANCAMENTO]    nome: até ~30 caracteres · texto: 1 frase
[APRENDIZADO]   titulo: até 5 palavras · texto: 1 frase · levamos: ação curta
[FOCO]          prioridade: até ~60 caracteres · texto: 1 frase

Entregue no formato "campo: valor", bloco por bloco, como no exemplo:
[NUMERO 1]
valor: [VALOR]
titulo: [INDICADOR]
detalhe: era [VALOR ANTERIOR]
variacao: [VARIAÇÃO]

Use somente os dados aprovados. Onde faltar dado, mantenha o conteúdo de
exemplo do modelo (X%, R$ X, Lorem ipsum) em vez de inventar.
```

## Prompt 8 · Auditoria da análise

```text
Revise o report de [MÊS/ANO] abaixo como um analista crítico:
[COLE O CONTEÚDO DO ARQUIVO dados/AAAA-MM.txt OU OS TEXTOS FINAIS]

Base de dados original: [ANEXO OU RESUMO DOS DADOS]

Verifique e liste:
1. Algum número do report não bate com a base? (indicador, valor, período)
2. Algum destaque é menos relevante do que um resultado que ficou de fora?
3. Há confusão entre variação percentual e pontos percentuais?
4. Há causa afirmada sem evidência (deveria ser hipótese)?
5. Alguma variação destacada é pequena ou tem base de comparação fraca?
6. A ordem de leitura conta a história: o que aconteceu → principal resultado
   → o que evoluiu → o que explica → o que aprendemos?
7. Algum texto passou do limite de tamanho ou está ambíguo?
Para cada problema: onde está, por que é um problema e a correção sugerida.
Se não houver problema num item, escreva "OK".
```

---

## Cuidados

- **Não cole dados no Copilot pessoal** nem em outras IAs públicas. Use só o ambiente aprovado pela empresa.
- O Copilot pode errar contas. Confira toda variação calculada.
- Guarde a versão final dos textos no arquivo do mês, não na conversa.
