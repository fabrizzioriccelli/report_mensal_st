# Primeiro uso no banco

Configuração feita **uma vez**, no ambiente corporativo, antes do primeiro envio real. Depois disso, o mês a mês segue o [guia de atualização](COMO_ATUALIZAR_O_MES.md).

Os itens marcados com **VALIDAR COM TI** dependem de políticas internas que este projeto não conhece. Não presuma a resposta: pergunte.

## 0. Levar o projeto para a máquina do trabalho

1. No GitHub, abra o repositório, escolha a branch do projeto e clique em **Code → Download ZIP**.
2. Leve o `.zip` para a máquina do trabalho **por um caminho permitido pela empresa**.
3. Na máquina do trabalho, clique com o botão direito no `.zip` → **Extrair tudo**. Use uma pasta fixa, por exemplo `Documentos\report-mensal`.
4. Abra a pasta e confira se existem `gerar-report.html`, `dados`, `config`, `assets`, `template` e `tools`.

**Atenção à política de segurança:**
- **E-mail de fora para dentro:** muitos bancos bloqueiam anexos `.zip` ou arquivos `.html` e `.js`, que fazem parte do projeto. Não tente contornar o bloqueio (renomear extensão, compactar com senha etc.). Pergunte à TI qual é o caminho aprovado: OneDrive corporativo, Teams, um repositório interno ou a própria TI copiar.
- **Dados internos:** os dados reais do banco (números, peças, vídeos) devem ficar **só** no ambiente corporativo: na máquina do trabalho e no SharePoint. Não leve esses dados para o computador pessoal, para o GitHub pessoal nem para ferramentas externas. O repositório guarda só o modelo em branco.

**Caminho indicado pela TI:** criar o repositório no ambiente corporativo e levar para lá **só os arquivos atuais** (sem o histórico do repositório pessoal). Depois, a manutenção da ferramenta acontece por lá. O time não precisa do repositório: usa só o kit (`kit/`), com o emulador.

**VALIDAR COM TI:** o passo a passo do repositório corporativo e se é permitido abrir um arquivo `.html` local no Edge.

## 1. Chama do Santander

A chama (só o símbolo) já está no projeto: `assets/marca/chama-santander-branca.png`, tirada do arquivo vetorial oficial. Ela aparece em branco na capa e no rodapé, sobre o vermelho. Regras e paleta: [assets/marca/README.md](../assets/marca/README.md).

- Para trocar, salve o novo PNG (versão branca, fundo transparente) em `assets/marca/` com o mesmo nome, ou ajuste o nome e a largura em `config/marca.txt`, bloco `[LOGO]`.
- **VALIDAR COM MARCA:** uso do símbolo no cabeçalho de um e-mail interno, tamanho (32 px) e espaço ao redor.

## 2. Fontes Santander

O report já pede as famílias do Brand Guide (Headline, Micro Text, Condensed). Falta:

1. **Arquivos `.otf`** (para a prévia e a página do mês): copie para `assets/fonts/` e confira os nomes em `assets/fonts/fontes-santander.css` ([assets/fonts/README.md](../assets/fonts/README.md)).
2. **Fonte instalada** (para o e-mail): pergunte à TI se as fontes Santander estão instaladas nos computadores e com qual nome exato (o nome da lista de fontes do Word). Se o nome for diferente, ajuste `config/marca.txt`, bloco `[FONTES]`.
3. **Outlook para Windows:** ele usa uma fonte só e troca por Times New Roman se ela faltar. Só troque Arial pela fonte Santander em `titulos_outlook_windows` e `texto_outlook_windows` se a TI confirmar que ela está instalada em **todos** os computadores que recebem o report.

Detalhes e alternativa (Arial, que não é a fonte oficial): [GUIA_TIPOGRAFIA.md](GUIA_TIPOGRAFIA.md).

**VALIDAR COM TI / MARCA:** licença dos `.otf` para documentos internos, nome das fontes instaladas e se estão em todos os computadores.

## 3. Onde colocar os assets

| O quê | Onde | Por quê |
|---|---|---|
| Imagens que aparecem **dentro** do e-mail (miniaturas, peça principal) | `assets/AAAA-MM/` dentro da pasta do projeto, na máquina do trabalho | A página lê daqui e embute no `.eml` |
| Formiguinha e ícones | `assets/formiguinha/` e `assets/icones/` (já prontos) | Embutidos no `.eml` |
| Fotos do banco de imagens | `assets/fotos/` ([README](../assets/fotos/README.md)) | Licença do banco: só no ambiente corporativo |
| Fontes `.otf` | `assets/fonts/` | Só na prévia e na página do mês |
| Peça em tamanho grande e vídeos (o que abre **ao clicar**) | Biblioteca do SharePoint do time, uma pasta por mês | Abre com login e permissões da empresa |

Pode colocar em `assets/AAAA-MM/` a imagem original, em alta: a página reduz e recorta sozinha. A original não é alterada.

## 4. Método das imagens

Em `config/marca.txt`, bloco `[IMAGENS]`:

- **`modo: embutidas`** (padrão, recomendado): as imagens vão dentro do `.eml`. Aparecem para todos, sem internet e sem "Baixar imagens".
- `modo: hospedadas`: só se a TI indicar um servidor **interno** de onde o Outlook carrega imagens sem login, e que todos os destinatários alcancem. Preencha `endereco_base`. A página gera um `.zip` com as imagens otimizadas para copiar para lá.

**VALIDAR COM TI:** se o tamanho do e-mail (~200 a 400 KB com imagens embutidas) está dentro do limite e se há restrição a imagens embutidas.

## 5. SharePoint e Stream

1. Crie (ou peça) uma pasta **Report mensal** na biblioteca do site do time, com uma subpasta por mês.
2. Defina, com a TI, a opção de compartilhamento: de preferência "Pessoas em [empresa]".
3. Em `config/marca.txt`, bloco `[LINKS]`, preencha `dominios_permitidos` com o domínio do SharePoint da empresa. Ele aparece no navegador quando você abre um arquivo do SharePoint, por exemplo `empresa.sharepoint.com` e `empresa-my.sharepoint.com`. Com isso, a página avisa se alguém colar um link de fora.

Detalhes, tipos de link e problemas comuns: [LINKS_SHAREPOINT_STREAM.md](LINKS_SHAREPOINT_STREAM.md).

## 6. Testar permissões

Para cada peça e vídeo:
1. No SharePoint: **⋯ → Gerenciar acesso**. O link deve ser para "Pessoas em [empresa]" (ou o público precisa ter acesso ao site).
2. Peça a um colega de outra equipe para abrir o link. Se ele abrir, o público da empresa abre.

## 7. Gerar o .eml

1. Dois cliques em `gerar-report.html` (abre no Edge).
2. **Selecionar a pasta do projeto** → escolha a pasta principal.
3. Leia a conferência. Para o primeiro teste, marque **Gerar um RASCUNHO**.
4. Clique em **Baixar**. O arquivo vai para Downloads.

## 8. Abrir no Outlook

- **Outlook clássico (Windows):** dois cliques no `.eml`. Abre uma mensagem nova, pronta para enviar.
- **Novo Outlook / Mac:** pode abrir como mensagem recebida. Use **Encaminhar** e apague o cabeçalho que o Outlook insere.
- **Outlook na Web:** não abre `.eml` como rascunho. Use o Outlook do computador.

Mais detalhes: [HOW_TO_EXPORT_EML.md](HOW_TO_EXPORT_EML.md).

## 9. Teste piloto com outro usuário (obrigatório antes do 1º envio)

Testar só na sua conta não basta: você é dono dos arquivos e tem todos os acessos.

**Usuário A (você):** gera o `.eml` e envia para o usuário B.
**Usuário B (colega de outra equipe):** abre no computador e no celular e confere:

| ✓ | Item | Computador (Outlook) | Outlook na Web (se usado) | Celular |
|---|---|---|---|---|
| [ ] | Layout inteiro, sem cortes e sem rolagem para o lado | | | |
| [ ] | Fontes legíveis: fonte Santander ou Arial, sem Times New Roman | | | |
| [ ] | Chama do Santander aparece no topo e no rodapé, nítida | | | |
| [ ] | Formiguinha aparece no rodapé, nítida | | | |
| [ ] | Imagens e miniaturas aparecem sem clicar em "Baixar imagens" | | | |
| [ ] | "Ver peça →" abre a peça grande | | | |
| [ ] | Miniatura da peça também abre | | | |
| [ ] | "▶ Assistir" abre o vídeo | | | |
| [ ] | O vídeo toca **com som** e os controles funcionam | | | |
| [ ] | Não pediu permissão (ou pediu login e depois abriu) | | | |
| [ ] | Assunto e texto da pré-visualização corretos na caixa de entrada | | | |

Anote o que falhou e em qual cliente. Um problema de permissão se resolve no SharePoint, sem gerar o e-mail de novo. Um problema de layout: envie a captura de tela para quem mantém o projeto.

## 10. Testar a imagem ampliada

Clique na miniatura e no "Ver peça →" de cada peça. A peça precisa abrir **grande** e **nítida**. Se abrir pequena ou borrada, o arquivo no SharePoint está em baixa resolução: suba o original.

## 11. Testar vídeo e áudio

No computador **e** no celular: abra o "▶ Assistir", dê play, confira o som, avance o vídeo e ative as legendas (se houver). Teste também com fone, no celular.

---

Depois do piloto aprovado, o fluxo mensal é o do [COMO_ATUALIZAR_O_MES.md](COMO_ATUALIZAR_O_MES.md), com o [checklist antes de enviar](TEST_CHECKLIST.md).
