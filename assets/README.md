# Assets

| Pasta | Conteúdo | Vai para o GitHub? | Muda todo mês? |
|---|---|---|---|
| `AAAA-MM/` | Imagens do mês (peças, capas de vídeo) | **Não** no GitHub pessoal (material interno). Sim no repositório corporativo | Sim |
| `fotos/` | Fotos do banco de imagens aprovado. [README](fotos/README.md) | **Não** (licença do banco) | Não |
| `fonts/` | Arquivos `.otf` das fontes Santander e o CSS que os declara. [README](fonts/README.md) | Só o CSS e o README. Os `.otf`, só no corporativo | Não |
| `marca/` | Chama do Santander e paleta. [README](marca/README.md) | Sim | Não |
| `formiguinha/` | A personagem (arquivo original). [README](formiguinha/README.md) | Sim | Não |
| `icones/` | Ícones do Creative Transformation (traço vermelho) | Sim | Não |

## Imagens do mês

- Coloque a imagem **original** (JPG ou PNG) em `assets/AAAA-MM/`. A página `gerar-report.html` reduz para o tamanho do e-mail, recorta no formato do espaço e desenha o ▶ nos vídeos. O original não é alterado.
- Nomes simples, sem espaço nem acento: `campanha-x.jpg`.
- No arquivo de dados: `imagem: campanha-x.jpg`.
- Capa de vídeo: uma imagem do vídeo **sem** ▶ desenhado.

| Espaço no e-mail | Formato (o recorte é automático) |
|---|---|
| Peça do projeto principal | Quadrado (184 × 184 na tela; 180 px no celular) |
| Peça do projeto em destaque | Vertical 184 × 300 no computador; horizontal na largura da tela no celular |
| Miniatura de lançamento | Faixa horizontal (~2,5 : 1) |
| Print de Creative Transformation | Horizontal (~4 : 3) |

Se a parte importante for cortada: `enquadramento: topo`, `baixo`, `esquerda`, `direita` ou `centro`.

## O que não fica aqui

- **Peças em alta e vídeos** que abrem ao clicar: ficam no SharePoint/Stream do time ([docs/LINKS_SHAREPOINT_STREAM.md](../docs/LINKS_SHAREPOINT_STREAM.md)).
