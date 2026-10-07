# Primeiro uso no banco

Configuração feita **uma vez**, no ambiente corporativo, antes do primeiro envio real. Depois disso, o mês a mês segue o [guia de atualização](HOW_TO_EDIT.md).

Os itens marcados com **VALIDAR COM TI** dependem de políticas internas que este projeto não conhece. Não presuma a resposta: pergunte.

## 0. Levar o projeto para a máquina do trabalho

1. No GitHub, abra o repositório, escolha a branch do projeto e clique em **Code → Download ZIP**.
2. Leve o `.zip` para a máquina do trabalho **por um caminho permitido pela empresa**.
3. Na máquina do trabalho, clique com o botão direito no `.zip` → **Extrair tudo**. Use uma pasta fixa, por exemplo `Documentos\report-mensal`.
4. Abra a pasta e confira se existem `gerar-report.html`, `dados`, `config`, `assets`, `template` e `tools`.

**Atenção à política de segurança:**
- **E-mail de fora para dentro:** muitos bancos bloqueiam anexos `.zip` ou arquivos `.html` e `.js`, que fazem parte do projeto. Não tente contornar o bloqueio (renomear extensão, compactar com senha etc.). Pergunte à TI qual é o caminho aprovado: OneDrive corporativo, Teams, um repositório interno ou a própria TI copiar.
- **Dados internos:** os dados reais do banco (números, peças, vídeos) devem ficar **só** no ambiente corporativo: na máquina do trabalho e no SharePoint. Não leve esses dados para o computador pessoal, para o GitHub pessoal nem para ferramentas externas. O repositório guarda só o modelo e o exemplo de setembro.

**VALIDAR COM TI:** como trazer o projeto (código-fonte e ferramenta HTML local) para a máquina corporativa, e se é permitido abrir um arquivo `.html` local no Edge.

## 1. Fonte oficial

1. Pergunte a Marca/TI o **nome exato** da fonte oficial instalada nos computadores (o nome que aparece na lista de fontes do Word).
2. Abra `config/marca.txt` no Bloco de Notas e procure **EDITAR AQUI — FONTE OFICIAL DO BANCO**.
3. Coloque o nome no começo das listas, entre aspas simples, mantendo as fontes de reserva:
   ```text
   titulos: 'Nome Exato da Fonte', Georgia, 'Times New Roman', serif
   texto: 'Nome Exato da Fonte', Arial, Helvetica, sans-serif
   ```
4. **Outlook para Windows:** ele usa só uma fonte e troca por Times New Roman se ela não existir no computador. Só coloque a fonte oficial em `titulos_outlook_windows` e `texto_outlook_windows` se a TI confirmar que ela está instalada em **todos** os computadores que recebem o report.
5. Gere o e-mail e confira se os **números da abertura** continuam numa linha só. Se uma fonte mais larga empurrar o layout, encurte os valores (ex.: `R$ 100 mil` em vez de `~R$ 100 mil`).

Como funciona: e-mail não carrega arquivo de fonte. O Outlook não aceita fontes baixadas (`@font-face`), então cada pessoa vê a fonte instalada no próprio aparelho. Quem não tem a oficial (celular pessoal, por exemplo) vê a fonte de reserva. O layout foi feito para aguentar essa troca.

**VALIDAR COM TI / MARCA:** nome da fonte, se está instalada em todos os computadores e se o uso em e-mail é permitido.

## 2. Onde colocar os assets

| O quê | Onde | Por quê |
|---|---|---|
| Imagens que aparecem **dentro** do e-mail (miniaturas, peça principal) | `assets/AAAA-MM/` dentro da pasta do projeto, na máquina do trabalho | A página lê daqui e embute no `.eml` |
| Formiguinha e ícones | `assets/formiguinha/` e `assets/icones/` (já prontos) | Embutidos no `.eml` |
| Peça em tamanho grande e vídeos (o que abre **ao clicar**) | Biblioteca do SharePoint do time, uma pasta por mês | Abre com login e permissões da empresa |

Pode colocar em `assets/AAAA-MM/` a imagem original, em alta: a página reduz e recorta sozinha. A original não é alterada.

## 3. Método das imagens

Em `config/marca.txt`, bloco `[IMAGENS]`:

- **`modo: embutidas`** (padrão, recomendado): as imagens vão dentro do `.eml`. Aparecem para todos, sem internet e sem "Baixar imagens".
- `modo: hospedadas`: só se a TI indicar um servidor **interno** de onde o Outlook carrega imagens sem login, e que todos os destinatários alcancem. Preencha `endereco_base`. A página gera um `.zip` com as imagens otimizadas para copiar para lá.

**VALIDAR COM TI:** se o tamanho do e-mail (~200 a 400 KB com imagens embutidas) está dentro do limite e se há restrição a imagens embutidas.

## 4. SharePoint e Stream

1. Crie (ou peça) uma pasta **Report mensal** na biblioteca do site do time, com uma subpasta por mês.
2. Defina, com a TI, a opção de compartilhamento: de preferência "Pessoas em [empresa]".
3. Em `config/marca.txt`, bloco `[LINKS]`, preencha `dominios_permitidos` com o domínio do SharePoint da empresa. Ele aparece no navegador quando você abre um arquivo do SharePoint, por exemplo `empresa.sharepoint.com` e `empresa-my.sharepoint.com`. Com isso, a página avisa se alguém colar um link de fora.

Detalhes, tipos de link e problemas comuns: [LINKS_SHAREPOINT_STREAM.md](LINKS_SHAREPOINT_STREAM.md).

## 5. Testar permissões

Para cada peça e vídeo:
1. No SharePoint: **⋯ → Gerenciar acesso**. O link deve ser para "Pessoas em [empresa]" (ou o público precisa ter acesso ao site).
2. Peça a um colega de outra equipe para abrir o link. Se ele abrir, o público da empresa abre.

## 6. Gerar o .eml

1. Dois cliques em `gerar-report.html` (abre no Edge).
2. **Selecionar a pasta do projeto** → escolha a pasta principal.
3. Leia a conferência. Para o primeiro teste, marque **Gerar um RASCUNHO**.
4. Clique em **Baixar**. O arquivo vai para Downloads.

## 7. Abrir no Outlook

- **Outlook clássico (Windows):** dois cliques no `.eml`. Abre uma mensagem nova, pronta para enviar.
- **Novo Outlook / Mac:** pode abrir como mensagem recebida. Use **Encaminhar** e apague o cabeçalho que o Outlook insere.
- **Outlook na Web:** não abre `.eml` como rascunho. Use o Outlook do computador.

Mais detalhes: [HOW_TO_EXPORT_EML.md](HOW_TO_EXPORT_EML.md).

## 8. Teste piloto com outro usuário (obrigatório antes do 1º envio)

Testar só na sua conta não basta: você é dono dos arquivos e tem todos os acessos.

**Usuário A (você):** gera o `.eml` e envia para o usuário B.
**Usuário B (colega de outra equipe):** abre no computador e no celular e confere:

| ✓ | Item | Computador (Outlook) | Outlook na Web (se usado) | Celular |
|---|---|---|---|---|
| [ ] | Layout inteiro, sem cortes e sem rolagem para o lado | | | |
| [ ] | Fontes legíveis (sem Times New Roman inesperada) | | | |
| [ ] | Formiguinha aparece (3 vezes) | | | |
| [ ] | Imagens e miniaturas aparecem sem clicar em "Baixar imagens" | | | |
| [ ] | "Ver peça →" abre a peça grande | | | |
| [ ] | Miniatura da peça também abre | | | |
| [ ] | "▶ Assistir" abre o vídeo | | | |
| [ ] | O vídeo toca **com som** e os controles funcionam | | | |
| [ ] | Não pediu permissão (ou pediu login e depois abriu) | | | |
| [ ] | Assunto e texto da pré-visualização corretos na caixa de entrada | | | |

Anote o que falhou e em qual cliente. Um problema de permissão se resolve no SharePoint, sem gerar o e-mail de novo. Um problema de layout: envie a captura de tela para quem mantém o projeto.

## 9. Testar a imagem ampliada

Clique na miniatura e no "Ver peça →" de cada peça. A peça precisa abrir **grande** e **nítida**. Se abrir pequena ou borrada, o arquivo no SharePoint está em baixa resolução: suba o original.

## 10. Testar vídeo e áudio

No computador **e** no celular: abra o "▶ Assistir", dê play, confira o som, avance o vídeo e ative as legendas (se houver). Teste também com fone, no celular.

---

Depois do piloto aprovado, o fluxo mensal é o do [HOW_TO_EDIT.md](HOW_TO_EDIT.md), com o [checklist antes de enviar](TEST_CHECKLIST.md).
