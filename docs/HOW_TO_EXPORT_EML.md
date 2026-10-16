# Gerando e enviando o .eml

## O que é um .eml

Um `.eml` é **uma mensagem de e-mail inteira salva num único arquivo**, no formato padrão da internet (MIME). Ele contém o assunto, o corpo e as imagens. O Outlook, o Windows Mail e o Thunderbird abrem esse formato.

O `.eml` gerado aqui leva o cabeçalho `X-Unsent: 1`. Com ele, o Outlook clássico para Windows abre o arquivo **como mensagem nova, pronta para enviar**, e não como um e-mail recebido.

## Por que .eml (e não colar no Outlook)

| Caminho | Resultado |
|---|---|
| **Gerar .eml → abrir no Outlook → enviar** | O HTML entra exatamente como foi gerado, com as imagens dentro. **Usado** |
| Copiar a página do navegador e colar no e-mail | Perde larguras e espaçamentos; no novo Outlook e na Web, as imagens não vão junto |
| Anexar o .html | O destinatário recebe um anexo, não o report no corpo |
| Outlook na Web | Não tem como importar HTML nem abrir .eml como rascunho |
| Imagem do report (print) | Sem links, sem texto selecionável, ilegível no celular. É o que o HTML evita |

O `.eml` continua sendo a etapa final mais robusta para quem envia pelo Outlook do computador.

## Como o arquivo é montado

```text
X-Unsent: 1
Subject: Creative Strategy PF | Report de Outubro 2026
Content-Type: multipart/alternative
├─ text/plain              ← versão em texto, com os links por extenso
└─ multipart/related
   ├─ text/html            ← o report
   ├─ image/jpeg  (cid)    ← imagens embutidas, já reduzidas
   └─ image/png   (cid)
```

- O **assunto** vem do mês (`Creative Strategy PF | Report de [Mês] [Ano]`). No rascunho, começa com `[RASCUNHO]`.
- Cada imagem do report vira `cid:...`, apontando para a imagem anexada na própria mensagem. Por isso aparece sem internet e sem "Baixar imagens".
- A **versão em texto** existe para quem não vê HTML (alguns leitores de tela e pré-visualizações) e é a base mínima: o conteúdo e os links continuam acessíveis.

## Passo a passo

### 1. Gerar

1. Dois cliques em `gerar-report.html` (abre no Edge ou Chrome).
2. **Selecionar a pasta do projeto** → escolha a pasta principal. O navegador pergunta se quer "carregar" os arquivos: confirme. Nada sai do seu computador.
3. O mês mais recente de `dados/` é escolhido sozinho.
4. Leia a **Conferência** (erros, pendências, avisos), teste os links e veja a **Prévia**.
5. **Baixar e-mail completo (.eml)** (o e-mail que a área recebe é o e-mail-resumo, gerado no emulador: veja [EMULADOR.md](EMULADOR.md)). Com pendências, só dá para gerar o **RASCUNHO** (marque a opção).
6. **Baixar página do mês (.html)** e guarde em `reports/`: é o arquivo histórico, com as imagens dentro, que abre em qualquer navegador.

### 2. Abrir e enviar

**Outlook clássico para Windows** (o caminho principal):

1. Dois cliques no `.eml`.
2. Abre uma **mensagem nova** com o report e o assunto preenchidos.
3. Preencha **Para** (de preferência a lista de distribuição da área) e envie.

**Novo Outlook para Windows / Outlook para Mac:** dependendo da versão, o `.eml` abre como **mensagem recebida** (só leitura). Nesse caso:

1. Clique em **Encaminhar**.
2. Apague o cabeçalho "De / Enviado / Para / Assunto" que o Outlook insere no topo.
3. Ajuste o assunto (tire o "ENC:") e envie.

**Outlook na Web:** não abre `.eml` como rascunho. Gere e envie pelo Outlook do computador.

### 3. Testar antes do envio geral

1. Envie o primeiro só para você.
2. Abra o e-mail **recebido** no Outlook do computador, no Outlook na Web e no celular.
3. Clique em todos os links e vídeos. Na primeira vez, peça para alguém de outra equipe fazer o mesmo.
4. Siga o [checklist](TEST_CHECKLIST.md).

## O que você precisa saber sobre HTML → .eml → Outlook

| Ponto | Por que importa | O que fazer |
|---|---|---|
| **O Outlook reescreve o HTML ao enviar.** Ao clicar em Enviar, o Outlook para Windows passa o corpo pelo editor do Word | Pode simplificar parte do CSS (por exemplo, regras de celular e cantos arredondados) no e-mail que os outros recebem, e transforma botão desenhado (VML) em imagem sem link. Por isso o botão do e-mail-resumo é célula + link de texto e os cantos são retos (4.5) | **Sempre confira o e-mail recebido**, não só o rascunho. Por isso o teste é "enviar para você e abrir no celular" |
| Não edite o texto no Outlook | Qualquer edição passa pelo Word e pode desalinhar o layout | Corrija no arquivo de dados e gere de novo |
| **Safe Links** | O Microsoft 365 pode reescrever os links para verificação | Normal. O destino continua o mesmo |
| Tamanho | Mensagens grandes demoram e podem ser barradas | O report fica em ~200–600 KB. A página avisa acima de 3 MB. VALIDAR COM TI o limite interno |
| Imagens aparecem também como anexo | Alguns clientes listam imagens embutidas como anexos | O corpo continua certo |
| Encaminhamento | O destinatário pode encaminhar | Encaminhar mantém imagens e links. Quem receber precisa ter permissão no SharePoint |
| Destinatários externos | Links "Pessoas em [empresa]" não abrem para quem é de fora | O report é interno; não envie para fora |

## O que foi verificado

O repositório não guarda `.eml` (eles saem do ambiente do banco com dados reais). Na construção da versão 3.0, o `.eml` do modelo em branco e um `.eml` de teste com fotos e dados fictícios foram validados com um leitor de e-mail padrão (Python `email`):

- texto puro + HTML (UTF-8) + imagens embutidas (chama, formiguinha, ícones e fotos), de ~200 KB (modelo) a ~520 KB (11 imagens);
- todas as referências `cid:` do HTML têm a imagem correspondente;
- nenhum comentário interno, nenhum caminho local, nenhuma requisição externa, nenhum `@font-face`;
- nenhuma linha com mais de 78 caracteres, como pede o padrão.

Esses arquivos **não foram abertos num Outlook real** (este ambiente não tem Outlook). Faça o teste do passo 3 antes do primeiro envio.

## Possíveis problemas

| Problema | O que fazer |
|---|---|
| Dois cliques no `.eml` abrem outro programa | Botão direito → Abrir com → Outlook |
| O `.eml` abre como recebido, sem botão Enviar | Use **Encaminhar** (veja acima) |
| Imagem com um "x" vermelho | Gere o `.eml` de novo e confira a lista "Imagens preparadas" |
| Mensagem bloqueada por tamanho | Use imagens menores; confira o limite com a TI |
| Assunto com caracteres estranhos | Gere de novo; o assunto é codificado em UTF-8 |
| A página diz que não encontrou a pasta | Escolha a pasta principal (a que tem `dados`, `config`, `template`) |
| A página mostra uma mensagem sobre `tools/motor.js` | A página foi movida para fora da pasta do projeto. Abra-a de dentro da pasta |
