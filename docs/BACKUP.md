# Backup, versões e recuperação

## O que é backup de quê

| O que proteger | Backup | Onde |
|---|---|---|
| **O mês enviado** | `reports/AAAA-MM.html` (página com imagens dentro) + `dados/AAAA-MM.txt` | Ambiente do banco (repositório corporativo ou pasta da área) |
| **O projeto** (template, motor, guias) | Histórico do **Git** | Repositório corporativo |
| **O layout aprovado** | `report_backup.html` | Raiz do projeto |
| **Uma edição de hoje** | **Local History** do PyCharm | Só no computador onde foi feita |

## report_backup.html

**O que é:** o layout aprovado, num arquivo só, com as imagens dentro. Conteúdo: o modelo em branco (Lorem Ipsum, `X%`, espaços de imagem). Sem dados reais. **Versão:** escrita no comentário do topo do arquivo (hoje, 3.9 de 2026-10-15) e no [CHANGELOG.md](../CHANGELOG.md).

**Como abrir:** dois cliques (abre no navegador). Não precisa da pasta do projeto nem de internet.

**Quando usar:**
- alguém mexeu no template e o report ficou diferente: compare com o backup;
- dúvida sobre como uma seção deve ficar no computador ou no celular (reduza a janela do navegador).

**Limites:** é uma página para ver, não para editar nem enviar. As fontes Santander só aparecem nele se os `.otf` estavam em `assets/fonts/` quando ele foi gerado; senão, aparece a fonte instalada ou Arial.

**Como gerar um backup novo** (depois de uma mudança aprovada no layout):
1. Abra `gerar-report.html` → **Selecionar a pasta do projeto**.
2. Em **Mês**, escolha `MODELO.txt (modelo em branco)`.
3. **Baixar página do mês (.html)** → o arquivo `MODELO.html` vai para Downloads.
4. Renomeie para `report_backup.html` e salve por cima do antigo.
5. Atualize a versão no [CHANGELOG.md](../CHANGELOG.md) e faça *commit*.

## Backup mensal

1. Depois de enviar, **Baixar página do mês (.html)** → salve em `reports/` como `AAAA-MM.html`.
2. Com Git: *Commit* (`report: outubro 2026`) → *Push*.
3. Sem Git: copie a pasta inteira do projeto para o local de backup combinado com a área (ex.: biblioteca do SharePoint do time), com a data no nome: `report_mensal_st_2026-10-30`.

Nunca altere um mês já enviado: `reports/` e `dados/` são o histórico.

## Restaurar

| Situação | Como |
|---|---|
| Digitei errado agora | **Ctrl+Z** no PyCharm |
| Quero o arquivo como estava hoje cedo | Botão direito no arquivo → **Local History → Show History** → escolha o horário → **Revert** |
| Apaguei um arquivo | Botão direito na pasta → **Local History → Show History** → **Revert** |
| Quero desfazer tudo o que não foi para o *commit* | Botão direito no arquivo → **Git → Rollback** |
| Quero a versão de um mês atrás | Botão direito no arquivo → **Git → Show History** → clique na versão → **Get** → *commit* |
| Quero ver o projeto inteiro numa data | **Git → Show Git Log** → botão direito no *commit* → **Checkout Revision** (só para olhar; para voltar: **Git → Branches → main → Checkout**) |
| O template quebrou e não sei o que mudou | Compare a prévia com `report_backup.html`; depois **Git → Show History** em `template/report.html` |

Na dúvida, não force nada (*reset*, *force push*): peça ajuda.

## Histórico do Git e dados antigos

**Situação verificada nas versões 3.0 a 3.9:**

- Os arquivos atuais **não têm dados reais**: só o modelo (Lorem Ipsum e `X`), a chama, a formiguinha e os ícones.
- Busca por credenciais (senhas, tokens, chaves) em **todo** o histórico: **nada encontrado**.
- **Mas o histórico antigo deste repositório pessoal tem dados reais.** As versões 1 e 2 (23 *commits* e os *pull requests* 1 a 5) guardam o conteúdo do report de setembro de 2026: nomes de campanhas, resultados, imagens das peças, uma apresentação e e-mails gerados. Apagar os arquivos agora **não** apaga essas versões: elas continuam acessíveis no histórico e nas páginas dos *pull requests*.

**Tratamento recomendado (nada disso foi feito sem autorização):**

1. **Levar para o repositório corporativo só os arquivos atuais, sem o histórico** (como a TI orientou: copiar os arquivos limpos e criar o repositório novo). O repositório corporativo nasce sem nenhum dado antigo.
2. **Depois da migração, apagar o repositório pessoal** (GitHub → *Settings* → *Danger Zone* → *Delete this repository*). É a forma mais simples de remover o histórico **e** os *pull requests*. É irreversível: faça só depois de conferir que o corporativo está completo.
3. Alternativa, se o repositório pessoal precisar continuar existindo: reescrever o histórico (ferramenta `git filter-repo`) e forçar o envio. Isso é **destrutivo**, quebra cópias antigas e **não** limpa as páginas dos *pull requests* nem caches do GitHub (para isso, é preciso pedir ao suporte do GitHub). Só com autorização e com ajuda técnica.

Enquanto isso, mantenha o repositório **privado**.
