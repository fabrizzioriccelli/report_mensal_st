# Guia do PyCharm para o report mensal

Para quem nunca usou um editor de código. O PyCharm é o programa disponível na máquina do trabalho para editar os arquivos do projeto. Aqui ele é usado como um **Bloco de Notas mais seguro**: mostra o número das linhas, salva em UTF-8, desfaz qualquer coisa e conversa com o Git.

> Você não vai programar. No dia a dia, só edita `dados/AAAA-MM.txt`.

---

## 1. Edições do PyCharm

| Edição | Serve para este projeto? |
|---|---|
| **Community** (gratuita) | **Sim.** Tem tudo o que este projeto usa |
| **Professional** (paga) | Sim. Os recursos extras não são necessários aqui |
| **PyCharm** unificado (versões mais novas, com parte gratuita e parte paga) | Sim, usando só a parte gratuita |

Os nomes dos menus podem mudar um pouco entre versões. Este guia usa os nomes em inglês, que são o padrão do PyCharm.

## 2. Baixar e instalar

**Na máquina do banco:** não baixe da internet. Peça à TI ou use o catálogo de software da empresa (o PyCharm já pode estar instalado: procure "PyCharm" no menu Iniciar).

**Num computador pessoal:**
1. Acesse o site oficial da JetBrains: `jetbrains.com/pycharm/download`.
2. Baixe a versão gratuita para o seu sistema (Windows ou Mac).
3. Abra o instalador e clique em **Next** até o fim. Pode deixar as opções como estão.
4. Abra o PyCharm. Na primeira vez ele pergunta sobre tema e configurações: pode aceitar o padrão.

## 3. Abrir o projeto (a pasta)

1. Abra o PyCharm.
2. Na tela inicial, clique em **Open** (ou, com outro projeto aberto, **File → Open**).
3. Escolha a pasta **`report_mensal_st`** (a pasta principal, que tem `dados`, `config`, `template`) e clique em **OK**.
4. Se perguntar **"Trust project?"**, clique em **Trust Project**. O projeto não executa nada sozinho.
5. Se perguntar sobre **"interpreter"** ou **Python**, pode fechar ou ignorar: o projeto não usa Python.

Na próxima vez, o projeto aparece na lista da tela inicial.

## 4. Conhecer a tela

```text
┌───────────────────────────────────────────────────────────────┐
│ Menu (File, Edit, View, …)                       [Git] [▶]    │
├───────────────┬───────────────────────────────────────────────┤
│ Project       │  Arquivo aberto                               │
│ (as pastas)   │   1  [EDICAO]                                  │
│ ▸ assets      │   2  mes: Outubro                              │
│ ▸ config      │   3  ano: 2026                                 │
│ ▾ dados       │   ↑ número da linha                            │
│   MODELO.txt  │                                               │
├───────────────┴───────────────────────────────────────────────┤
│ Barra de status: linha:coluna · UTF-8 · branch do Git         │
└───────────────────────────────────────────────────────────────┘
```

- **Painel Project** (à esquerda): as pastas e arquivos. Não apareceu? **Alt+1** (ou *View → Tool Windows → Project*).
- **Ver um arquivo:** dois cliques nele. Ele abre numa aba.
- **Linhas compridas:** *View → Active Editor → Soft-Wrap* quebra o texto na tela, sem mudar o arquivo.
- **Ir para uma linha** (a ferramenta diz "linha 74"): **Ctrl+G** → digite `74` → Enter.

## 5. Configurar uma vez: UTF-8

Os acentos só funcionam se os arquivos forem salvos em UTF-8. O PyCharm já salva assim, mas confira:

1. **File → Settings** (no Mac: *PyCharm → Settings*).
2. **Editor → File Encodings**.
3. *Global Encoding*, *Project Encoding* e *Default encoding for properties files*: **UTF-8**.
4. **OK**.

Na barra de status, embaixo à direita, aparece `UTF-8` para o arquivo aberto.

## 6. Editar e salvar

### Textos e números do mês (o dia a dia)

1. Abra `dados/AAAA-MM.txt` (dois cliques).
2. **Ctrl+F** procura dentro do arquivo. Ex.: procure `[NUMERO 2]`, `EDITAR AQUI`, `Lorem` ou `X%`.
3. Troque só o que vem **depois dos dois-pontos**:
   ```text
   valor: X%     →     valor: (o número real do mês)
   ```
4. Salve com **Ctrl+S**. O PyCharm também salva sozinho quando você troca de janela.

Regras do arquivo e o que cada bloco faz: [COMO_ATUALIZAR_O_MES.md](COMO_ATUALIZAR_O_MES.md).

### Trocar imagens

1. Arraste a imagem do Explorador de Arquivos para a pasta `assets/AAAA-MM` no painel Project (ou cole com **Ctrl+V** em cima da pasta).
2. No `.txt`, escreva o nome do arquivo em `imagem:`.
3. Para trocar uma imagem por outra com o mesmo nome: apague a antiga (botão direito → **Delete**) e coloque a nova.

### Alterar números, textos e links

Tudo no `.txt` do mês. Ex.: link → procure (Ctrl+F) o bloco e cole depois de `link: `, numa linha só.

### Retirar e duplicar componentes

- **Retirar** um lançamento, número ou aprendizado: selecione o bloco inteiro (do `[NOME DO BLOCO]` até antes do próximo) e apague.
- **Duplicar:** selecione o bloco → **Ctrl+C** → clique onde quer colar → **Ctrl+V** → troque o número no nome (`[LANCAMENTO 3]`).
- **Ctrl+D** duplica a linha onde está o cursor.

### Alterar fontes e cores

Em `config/marca.txt`, blocos `[FONTES]` e `[CORES]`. Leia os comentários (`#`) do próprio arquivo e o [GUIA_TIPOGRAFIA.md](GUIA_TIPOGRAFIA.md) antes de mudar. Cores só da paleta do Brand Guide ([assets/marca/README.md](../assets/marca/README.md)).

### Colocar os arquivos .otf das fontes Santander

1. Arraste os `.otf` para a pasta `assets/fonts/` no painel Project.
2. Abra `assets/fonts/fontes-santander.css` e procure (Ctrl+F) `INSERIR ARQUIVO .OTF AQUI`.
3. Em cada bloco, confira se o nome dentro de `url("…")` é igual ao do arquivo. Se não for, troque **só** o nome.
4. Salve, abra `gerar-report.html` e selecione a pasta de novo. A Conferência mostra quantos arquivos foram encontrados.

Passo a passo: [assets/fonts/README.md](../assets/fonts/README.md).

### HTML, CSS e JavaScript (só para manutenção do layout)

| Arquivo | Linguagem | Quando mexer |
|---|---|---|
| `template/report.html` | HTML de e-mail + CSS (dentro de `<style>` e nos atributos `style=""`) | Só para mudar o layout. Regras: [ARQUITETURA.md](ARQUITETURA.md) |
| `tools/motor.js` | JavaScript | Só para mudar regras da geração |
| `gerar-report.html` | HTML + CSS + JavaScript | Só para mudar a página de geração |

Se precisar mexer:
- O PyCharm colore o código e sublinha em vermelho o que parece errado (tag não fechada, aspas faltando). Passe o mouse sobre o sublinhado para ler o aviso.
- **Ctrl+/** transforma a linha em comentário (e desfaz).
- `{{campo}}` no template é preenchido pela ferramenta. Não apague: ela avisa "campo inexistente" se algo não bater.
- Depois de qualquer mudança no template, gere o e-mail, confira a Prévia no **Computador** e no **Celular** e compare com `report_backup.html`.

## 7. Ver o resultado no navegador

| Para ver… | Faça… |
|---|---|
| A página de geração | Botão direito em `gerar-report.html` → **Open In → Browser → Edge** (ou Chrome). Ou pelos ícones de navegador que aparecem no canto superior direito ao abrir um `.html` |
| O backup do layout | Mesmo caminho, com `report_backup.html` |
| A pasta no Windows | Botão direito em qualquer arquivo → **Open In → Explorer** |

Se o PyCharm abrir um endereço como `localhost:63342/...` em vez de `file:///...`, tudo bem: as duas formas funcionam. Se a opção **Open In → Browser** não existir na sua versão, abra a pasta no Explorador e dê dois cliques no arquivo.

Editou o `.txt` com a página aberta? Salve e clique em **Selecionar a pasta do projeto** de novo.

## 8. Localizar erros

1. **Na página `gerar-report.html`:** a seção **Conferência** diz o arquivo e a **linha**. No PyCharm, **Ctrl+G** → número da linha.
2. **No PyCharm:** sublinhado vermelho = erro de digitação no código; amarelo = aviso. A lista completa fica em *View → Tool Windows → Problems*. Em arquivos `.txt` não há sublinhado: a conferência da página é quem avisa.
3. **No navegador** (para quem mantém o código): **F12 → Console** mostra erros de JavaScript da página. Num uso normal, o console fica vazio.
4. **Procurar em todos os arquivos:** **Ctrl+Shift+F** (ex.: procurar `INSERIR` em `dados/`).

## 9. Desfazer mudanças

| Situação | Como desfazer |
|---|---|
| Acabei de digitar errado | **Ctrl+Z** (quantas vezes precisar). **Ctrl+Shift+Z** refaz |
| Quero ver como o arquivo estava ontem | Botão direito no arquivo → **Local History → Show History** → escolha o horário → **Revert** |
| Apaguei um arquivo | Botão direito na **pasta** onde ele estava → **Local History → Show History** → encontre a exclusão → **Revert** |
| Quero voltar para a última versão salva no Git | Botão direito no arquivo → **Git → Rollback** (desfaz tudo o que não foi para o *commit*) |

O **Local History** é do próprio PyCharm: funciona mesmo sem Git, mas só no computador onde as mudanças foram feitas e por alguns dias.

## 10. Trabalhar com Git

O Git guarda cada versão do projeto. No banco, o projeto deve ficar no **repositório corporativo** indicado pela TI.

**Uma vez, na máquina:**
1. O Git precisa estar instalado no computador. **VALIDAR COM TI.**
2. *File → Settings → Version Control → Git* → em *Path to Git executable*, clique em **Test**. Se aparecer a versão do Git, está pronto.
3. Para baixar o projeto do repositório corporativo: tela inicial → **Get from VCS** (ou *File → New → Project from Version Control*) → cole o endereço do repositório → **Clone**. Se pedir login, use o método indicado pela TI.

**Todo mês:**

| Ação | Atalho | Para quê |
|---|---|---|
| **Update Project** | Ctrl+T | Trazer as mudanças de outras pessoas antes de começar |
| **Commit** | Ctrl+K | Registrar a versão. Marque os arquivos, escreva a mensagem (ex.: `report: outubro 2026`) e clique em **Commit** |
| **Push** | Ctrl+Shift+K | Enviar os *commits* para o repositório. Sem *push*, a versão fica só no seu computador |
| **Show History** | botão direito → Git → Show History | Ver as versões de um arquivo |

Arquivos em **vermelho** no painel Project são novos (o Git ainda não conhece); em **azul**, alterados; em **verde**, novos já adicionados. Para incluir um arquivo novo no Git: botão direito → **Git → Add**.

Antes do *commit*, confira se **não** está enviando nada que não deve (fotos licenciadas fora do repositório corporativo, arquivos pessoais). As fotos de `assets/fotos/` são ignoradas automaticamente pelo `.gitignore`.

## 11. Recuperar versões anteriores

- **Um arquivo:** botão direito → **Git → Show History** → clique na versão → botão direito → **Get** (traz aquela versão de volta para o arquivo). Depois, *commit*.
- **O projeto inteiro numa data:** *Git → Show Git Log* (Alt+9) → encontre o *commit* → botão direito → **Checkout Revision** para só olhar. Para voltar ao normal: *Git → Branches → main → Checkout*.
- Na dúvida, não force nada: peça ajuda antes. Veja também [BACKUP.md](BACKUP.md).

## 12. Plugins

**Nenhum plugin é necessário.** O que o projeto usa já vem no PyCharm (inclusive na Community):

| Recurso | Já vem no PyCharm? | Uso no projeto |
|---|---|---|
| Editor de texto com UTF-8 | Sim | Arquivos `.txt` de dados e configuração |
| HTML, CSS e JavaScript (cores, avisos) | Sim | Template e página de geração (manutenção) |
| Markdown (ver os guias formatados) | Sim | Abrir os arquivos `.md` de `docs/` |
| Git | Sim (precisa do Git instalado no computador) | Versões e backup |
| Local History | Sim | Desfazer mudanças sem Git |
| Abrir no navegador | Sim | Ver o resultado |

Não instale plugins de fontes externas, de IA ou de "deploy": não são usados e podem não ser permitidos pela política da empresa.

**Dependências do projeto:** nenhuma biblioteca precisa ser instalada ou atualizada. O motor (`tools/motor.js`) é JavaScript puro e roda no próprio navegador. Os testes automáticos (`tests/`) são opcionais e exigem o Node.js (e o Playwright para o teste de ponta a ponta), que normalmente não estão na máquina do banco. Não são necessários para gerar o report.

## Atalhos mais usados

| Atalho (Windows) | Faz |
|---|---|
| Ctrl+S | Salva |
| Ctrl+Z / Ctrl+Shift+Z | Desfaz / refaz |
| Ctrl+F / Ctrl+R | Procura / procura e substitui no arquivo |
| Ctrl+Shift+F | Procura em todos os arquivos |
| Ctrl+G | Vai para a linha |
| Ctrl+D | Duplica a linha |
| Ctrl+/ | Comenta a linha (só em código) |
| Alt+1 | Mostra/esconde o painel Project |
| Ctrl+T / Ctrl+K / Ctrl+Shift+K | Git: atualizar / commit / push |

No Mac, troque **Ctrl** por **Cmd**.
