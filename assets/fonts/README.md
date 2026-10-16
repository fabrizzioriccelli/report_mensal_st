# Fontes Santander (arquivos .otf)

Esta pasta recebe os arquivos **oficiais** das fontes Santander. **Hoje ela não tem nenhum arquivo de fonte**: o report funciona normalmente sem eles, com a fonte instalada no computador ou, sem ela, Arial (alternativa, não é a fonte oficial).

## Passo a passo (quando os arquivos chegarem)

1. Baixe os `.otf` no **Portal da Marca** (link no Brand Guide, seção 3.3) ou peça a Marca.
2. No Explorador de Arquivos, copie os arquivos para esta pasta (`assets/fonts/`).
3. Abra `fontes-santander.css` (nesta pasta). Procure (Ctrl+F) `INSERIR ARQUIVO .OTF AQUI`.
4. Em cada bloco, confira se o nome dentro de `url("…")` é igual ao nome do arquivo. Se não for, troque **só** o nome. Os nomes de hoje são **provisórios**.
5. Abra `gerar-report.html` → **Selecionar a pasta do projeto**. Na **Conferência**, em "Para saber", aparece "Fontes Santander: N de 13 arquivos encontrados".

## Arquivos esperados

| Família (não mudar) | Peso | `font-weight` | Nome provisório do arquivo | Usado no report? |
|---|---|---|---|---|
| Santander Headline | Light | 300 | `SantanderHeadline-Light.otf` | Não |
| Santander Headline | Regular | 400 | `SantanderHeadline-Regular.otf` | Não |
| Santander Headline | **Bold** | 700 | `SantanderHeadline-Bold.otf` | **Sim**: títulos e números |
| Santander Micro Text | Light | 300 | `SantanderMicroText-Light.otf` | Não |
| Santander Micro Text | **Regular** | 400 | `SantanderMicroText-Regular.otf` | **Sim**: textos |
| Santander Micro Text | SemiBold | 600 | `SantanderMicroText-SemiBold.otf` | Não |
| Santander Micro Text | **Bold** | 700 | `SantanderMicroText-Bold.otf` | **Sim**: rótulos e subtítulos |
| Santander Micro Text | ExtraBold | 800 | `SantanderMicroText-ExtraBold.otf` | Não |
| Santander Condensed | Regular | 400 | `SantanderCondensed-Regular.otf` | Não |
| Santander Condensed | **Bold** | 700 | `SantanderCondensed-Bold.otf` | **Sim**: frase do mês |
| Santander Condensed | Black | 900 | `SantanderCondensed-Black.otf` | Não |
| Santander Script | Regular | 400 | `SantanderScript-Regular.otf` | Não (voz do cliente) |
| Santander Script | Bold | 700 | `SantanderScript-Bold.otf` | Não (voz do cliente) |

Famílias e pesos: Brand Guide Santander Brasil (maio/2026), seção 3.3. O guia não lista itálicos.

## Onde as fontes aparecem

- ✓ Prévia da página `gerar-report.html`.
- ✓ Página do mês (`reports/AAAA-MM.html`) e `report_backup.html`: as fontes vão **dentro** da página.
- ✗ E-mail (`.eml`): o Outlook não carrega fontes de arquivo. No e-mail vale a fonte **instalada** no computador de quem lê (veja [docs/GUIA_TIPOGRAFIA.md](../../docs/GUIA_TIPOGRAFIA.md)).

Arquivo que não existe é ignorado, sem erro.

## Licença

As fontes Santander são **proprietárias**. Podem ficar no repositório **corporativo** se Marca autorizar. **Não** coloque os `.otf` no GitHub pessoal nem envie por e-mail ou chat. **VALIDAR COM MARCA.**
