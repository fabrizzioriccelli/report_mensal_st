# Perguntas frequentes

Respostas curtas, para quem não programa. Arquivo do mês = `dados/AAAA-MM.txt`. Página = `gerar-report.html`. Como usar o PyCharm: [GUIA_PYCHARM.md](GUIA_PYCHARM.md).

**Índice:** [Conteúdo](#conteúdo) · [Imagens](#imagens) · [Links](#links) · [Seções e blocos](#seções-e-blocos) · [Marca e fontes](#marca-e-fontes) · [Testar e conferir](#testar-e-conferir) · [Erros](#erros) · [Versões e backup](#versões-e-backup) · [Segurança](#segurança)

---

## Conteúdo

### Como criar o report do próximo mês?
Copie o arquivo do mês anterior em `dados/` e renomeie (ex.: `2026-10.txt` → `2026-11.txt`). Troque o período no bloco `[EDICAO]`, crie a pasta `assets/2026-11/` e atualize bloco por bloco. Passo a passo: [COMO_ATUALIZAR_O_MES.md](COMO_ATUALIZAR_O_MES.md).

### Como alterar o período?
No topo do arquivo do mês, bloco `[EDICAO]`: `mes`, `ano`, `proximo_mes` e `pasta_imagens`. O selo da capa, o assunto, o "Foco de…" e o "Até…" do rodapé mudam sozinhos.

### Como alterar um número?
Procure (Ctrl+F) o bloco, por exemplo `[NUMERO 2]`, e troque o que vem depois de `valor:`. A base de comparação fica em `detalhe:` e a etiqueta verde em `variacao:`.

### O que significa "X%", "R$ X" e "Lorem ipsum" no modelo?
São **conteúdos de exemplo**. Mostram onde e em que formato vai cada informação, sem usar dado real. A página trata todos como **ainda não preenchidos**: enquanto houver algum, só sai um RASCUNHO.

### Posso deixar um número com "X" e enviar assim mesmo?
Não. A versão final só libera quando não sobra nenhum `X`, `Lorem ipsum`, `Mês`, `AAAA` ou `[…]`. Se o dado ainda não chegou, espere ou tire aquele item (apague o bloco).

### Como modificar um texto?
No arquivo do mês, troque o que vem depois de `campo:`. Para quebrar a linha num título, escreva `<br>`. Frases curtas: o Brand Guide pede até 80 caracteres por frase.

### Como mudar a cor de um número (verde ou âmbar)?
`variacao_cor: verde` (resultado positivo, padrão) ou `variacao_cor: ambar` (atenção). Para seta para baixo, comece a variação com `-` (ex.: `-12%`): use quando cair é bom, como em custo.

### Qual a diferença entre % e p.p.?
De 40% para 52%: subiu **12 p.p.** (pontos percentuais, a diferença) ou **30%** (variação relativa). No Creative X, a página calcula em p.p. sozinha quando `anterior` e `atual` estão preenchidos.

### Como verificar se os dados foram preenchidos corretamente?
1. Na página, a **Conferência** deve ficar verde: "Tudo certo".
2. Compare cada número com a fonte (planilha ou painel).
3. Use o [Prompt 8 do Copilot](PROMPTS_COPILOT.md#prompt-8--auditoria-da-análise) para uma segunda leitura.

## Imagens

### Como substituir uma imagem?
Coloque a nova em `assets/AAAA-MM/` e troque o nome em `imagem:` no bloco. Ou apague a antiga e salve a nova com o mesmo nome.

### Como adicionar uma imagem nova?
Salve em `assets/AAAA-MM/`, escreva `imagem: nome.jpg` e `descricao_imagem: o que a imagem mostra` no bloco da peça. Pode ser a imagem original, em alta.

### A imagem não aparece. E agora?
- A Conferência diz "imagem não encontrada"? Confira o nome: maiúsculas, acentos e extensão (`.jpg`, `.png`). Use nomes sem espaço.
- A pasta em `pasta_imagens` está certa?
- Salvou e clicou em **Selecionar a pasta** de novo?
- No e-mail recebido aparece um "x"? Gere o `.eml` de novo e confira a lista "Imagens preparadas".

### A parte importante da imagem foi cortada.
Acrescente `enquadramento:` no bloco: `topo`, `baixo`, `esquerda`, `direita` ou `centro`.

### Posso usar as fotos do banco de imagens?
Sim, no ambiente do banco. Veja quais fotos funcionam em cada espaço em [assets/fotos/README.md](../assets/fotos/README.md). Elas **não** vão para o GitHub pessoal (licença).

## Links

### Como alterar um link?
Procure o bloco e cole o link depois de `link: `, numa linha só. Qual link copiar: [LINKS_SHAREPOINT_STREAM.md](LINKS_SHAREPOINT_STREAM.md).

### Por que o "Ver peça →" aparece cinza no rascunho?
Porque o link ainda não foi preenchido. Ele aparece cinza e **não clica**, para ninguém achar que funciona. Com o link, fica vermelho e clicável.

### A imagem da peça é clicável?
Com `link:` preenchido, sim: a imagem e o "Ver peça →" abrem o link, no e-mail e no navegador. Sem link, no e-mail ela não clica (de propósito: nada de link falso). Na página do mês (.html), um clique na peça sem link abre a imagem inteira, maior; **Esc** ou **×** fecham.

### Como tirar o botão de uma peça?
Deixe `link:` vazio. A peça continua aparecendo, sem botão.

## Seções e blocos

### Como retirar um card (um número, um lançamento, um aprendizado)?
Apague o bloco inteiro: do `[NOME DO BLOCO]` até a linha antes do próximo bloco. As colunas se reorganizam.

### Como retirar uma campanha?
Apague o bloco dela (`[LANCAMENTO 2]`, por exemplo). Se ela era o destaque, apague `[DESTAQUE]` e os `[RESULTADO …]`.

### Como esconder uma seção inteira?
Apague todos os blocos dela. A seção some e a numeração das seções se ajusta (03 vira 02 e assim por diante).

### Como duplicar um bloco?
Copie o bloco, cole embaixo e troque o número (`[LANCAMENTO 3]`). Limites: 4 números, 3 resultados, 3 lançamentos, 3 Transformation, 3 aprendizados, 6 agenda.

### Posso criar uma seção nova?
Não pelo arquivo do mês: uma seção nova exige mudar o template (`template/report.html`) e o motor (`tools/motor.js`), com testes no computador e no celular. Peça a quem mantém o projeto. Antes, veja se o conteúdo cabe numa seção existente.

## Marca e fontes

### Como trocar uma fonte?
`config/marca.txt`, bloco `[FONTES]`. Leia antes o [GUIA_TIPOGRAFIA.md](GUIA_TIPOGRAFIA.md).

### Recebi os arquivos .otf das fontes Santander. O que faço?
Copie para `assets/fonts/` e confira os nomes em `assets/fonts/fontes-santander.css`. Passo a passo: [assets/fonts/README.md](../assets/fonts/README.md).

### Por que o e-mail aparece em Arial?
O e-mail usa a fonte **instalada** no computador de quem lê. Sem a fonte Santander instalada, aparece a Arial (alternativa). Isso é esperado: veja [GUIA_TIPOGRAFIA.md](GUIA_TIPOGRAFIA.md#2-onde-cada-fonte-funciona).

### Posso usar outra cor?
Só as da paleta do Brand Guide, conforme [assets/marca/README.md](../assets/marca/README.md). Fundo, só Branco, Lisboa, Rio ou Vermelho Santander.

### Por que a formiguinha só aparece no rodapé?
É um elemento de identidade, não decoração: ela fecha o report, sobre fundo claro (no vermelho, ela perde contraste). Na abertura, a capa já cumpre esse papel. Sempre o arquivo original.

## Testar e conferir

### Como testar o mobile?
Na página, **Prévia → Celular**. Depois, envie o `.eml` para você e abra no celular. Nada pode sair para o lado da tela.

### Como identificar um erro de CSS?
Sintoma: algo desalinhado, vazando para o lado ou com cor errada **depois de mexer no template**. Compare com `report_backup.html`. Para desfazer, use **Local History** ou **Git → Rollback** no PyCharm ([GUIA_PYCHARM.md](GUIA_PYCHARM.md#9-desfazer-mudanças)). No dia a dia (só o `.txt`), não há como gerar erro de CSS.

### A prévia ficou estranha só no Outlook.
O Outlook para Windows mostra cantos retos e sempre o layout de computador. Compare com [OUTLOOK_COMPATIBILITY.md](OUTLOOK_COMPATIBILITY.md). Confira sempre o e-mail **recebido**.

## Erros

### A página diz "Linha sem ':'"
Na linha indicada falta o `:` depois do nome do campo, ou é um comentário sem `#` no começo.

### "Bloco [...] desconhecido"
O nome entre colchetes foi alterado. Use os nomes do modelo (`[NUMERO 1]`, `[LANCAMENTO 2]`…).

### Os acentos viraram `Ã©`.
O arquivo foi salvo fora do UTF-8. No PyCharm já é UTF-8; no Bloco de Notas: *Salvar como → Codificação: UTF-8*.

### O botão "Baixar e-mail completo" está cinza.
Ainda há itens em **falta**. Preencha ou, para testar, marque **Gerar um RASCUNHO**.

### Editei, mas a página não mudou.
Salve o arquivo e clique em **Selecionar a pasta do projeto** de novo.

## Versões e backup

### Como voltar para a versão anterior?
No PyCharm: botão direito no arquivo → **Git → Show History** → escolha a versão → **Get**. Sem Git: **Local History → Show History**. Detalhes: [BACKUP.md](BACKUP.md#restaurar).

### Apaguei um arquivo. Como recupero?
Botão direito na pasta onde ele estava → **Local History → Show History** → **Revert**. Com Git: **Git → Rollback**.

### Como utilizar o backup?
`report_backup.html` mostra o layout aprovado: abra com dois cliques. Para restaurar arquivos do projeto, use o Git ([BACKUP.md](BACKUP.md)).

### Onde fica o report de um mês que já foi enviado?
Em `reports/AAAA-MM.html` (no ambiente do banco). Abre em qualquer navegador, com as imagens dentro.

## Segurança

### Posso colocar os dados do mês no GitHub pessoal?
**Não.** Dados, peças, vídeos e fotos licenciadas ficam só no ambiente do banco.

### O e-mail do trabalho bloqueou o .zip do projeto.
É a política de segurança. Não renomeie, não compacte com senha, não divida o arquivo. Use o caminho aprovado pela TI ([CORPORATE_SETUP.md](CORPORATE_SETUP.md)).

### Posso usar o ChatGPT ou outra IA para analisar os dados?
Use só o **Microsoft Copilot** corporativo, com a conta do banco. Prompts prontos: [PROMPTS_COPILOT.md](PROMPTS_COPILOT.md).
