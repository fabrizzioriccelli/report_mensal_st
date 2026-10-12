# Marca: chama e paleta

Referência: **Brand Guide Santander Brasil (maio/2026)**, seções 3.1 Logotipo, 3.2 Cores e 3.8 Iconografia. O guia é interno e não fica no repositório.

## Chama (símbolo)

| Arquivo | O que é | Onde aparece |
|---|---|---|
| `chama-santander-branca.png` | **Usada no e-mail**: chama em branco (versão negativa), PNG transparente | Capa e rodapé, sobre o vermelho, 32 px |
| `chama-santander.png` | Chama em Vermelho Santander (versão positiva), para fundo claro | Não usada hoje |
| `svg/chama-santander.svg`, `svg/chama-santander-branca.svg` | As mesmas chamas em vetor | Fonte dos PNGs |
| `svg/logo-santander-original.svg` | Arquivo vetorial original (chama + nome), recebido da área | Origem do traçado da chama |

- A chama é o **mesmo traçado** do arquivo original, sem redesenho: só o nome escrito foi retirado e a cor ajustada para o Vermelho Santander (#EC0000) e para o branco.
- **Símbolo** em vez do logotipo completo: o guia permite o símbolo como assinatura em **ambientes proprietários** do banco, como canais internos (p. 29). O report é interno.
- **Sobre vermelho, sempre branca** (p. 31). Nunca mude a cor da chama.
- Tamanho: 32 px, acima do mínimo do guia para o símbolo. Assinatura no **canto inferior direito** do rodapé, como pede a seção 3.10.
- Para trocar o arquivo ou a largura: `config/marca.txt`, bloco `[LOGO]`.

**VALIDAR COM MARCA:** uso do símbolo (sem o nome) no cabeçalho de um e-mail interno e o espaço de respiro em e-mail.

## Paleta

### Paleta principal (p. 37)

| Cor | HEX | Pode ser fundo? | Uso no report |
|---|---|---|---|
| Branco | `#FFFFFF` | Sim | Cartão do e-mail; textos, chama e selo sobre vermelho |
| Lisboa | `#FBF1EA` | Sim | Fundo atrás do e-mail; superfície do Creative Transformation; espaços de imagem do modelo |
| Rio | `#F5DECF` | Sim | Faixa dos números; divisórias do Transformation |
| Cidade do México | `#F0B998` | Não | Divisórias da faixa dos números; borda dos espaços de imagem |
| Madri | `#EA6F5D` | Não | Não usada |
| **Vermelho Santander** | `#EC0000` | Sim | Capa, Foco, rodapé, títulos sobre branco, número principal, links |
| Boston | `#CC0000` | Não | Não usada |
| Londres | `#990000` | Não | Não usada (era o rodapé na versão 2; o guia não permite como fundo) |
| Preto | `#000000` | — | Números e textos de apoio sobre branco |

Regras aplicadas (p. 37 e 38):
- **Só Branco, Lisboa, Rio e Vermelho Santander como fundo.**
- O vermelho é a cor predominante.
- Sobre branco: **títulos em vermelho, textos de apoio em preto**.
- Sobre vermelho: textos, chama e ícones em **branco**.

### Paleta de apoio (p. 39): só em dados

O guia pede uso **pontual**, preferencialmente em gráficos e visualizações de dados. No report, aparecem só em indicadores:

| Cor | HEX | Uso no report |
|---|---|---|
| Verde claro / verde escuro | `#A3E0CE` / `#21634F` | Etiqueta de resultado positivo (▲ +X%) |
| Âmbar claro / âmbar escuro | `#FFE1B9` / `#945400` | Etiqueta de atenção ou previsto ("Resultado em XX/XX") |
| Cinza claro | `#E2E2E2` | Trilho da barra do Creative X e divisórias finas |
| Cinza médio | `#767676` | Legendas pequenas, score anterior, botão sem link no rascunho |

Contraste conferido (texto pequeno precisa de 4,5:1): branco sobre `#EC0000` = 4,6 · `#21634F` sobre `#A3E0CE` = 4,8 · `#945400` sobre `#FFE1B9` = 4,7 · `#767676` sobre branco = 4,5.

Todas as cores ficam em `config/marca.txt`, em um lugar só. Não use cores fora destas tabelas.

## Ícones

`assets/icones/` tem dois ícones (prancheta e lupa) com traço em **Vermelho Santander**, como pede a seção 3.8 sobre fundo claro. Ícones novos: baixe no **Portal da Marca** (biblioteca oficial, p. 102), não desenhe.
