# Brief do produto — CAS Markdown Studio (extensão VS Code)

> Versão 0.1 · 2026-10-26 · Autor: Alex Canário
> Status: rascunho para validação. Pontos marcados **[validar]** são hipóteses, não decisões.

## 1. Em uma frase

Uma extensão **gratuita, open source e local** para VS Code, Cursor e Windsurf que trata o preview de Markdown como um espaço de trabalho: o preview é interativo (marcar checkboxes grava no arquivo, copiar código com um clique, buscar), rápido em documentos grandes e mantido de forma ativa. É um fork do Markdown Preview Enhanced, com identidade e ritmo próprios.

## 2. Contexto: o que existe hoje

### 2.1 Ponto de partida

A base é o [Markdown Preview Enhanced](https://github.com/shd101wyy/vscode-markdown-preview-enhanced) (MPE, extensão `0.8.40`) e a biblioteca de renderização [crossnote](https://github.com/shd101wyy/crossnote) (`0.9.42`). As duas usam a licença **NCSA** (University of Illinois/NCSA), que permite fork, mudança de nome e distribuição, com três condições: manter o aviso de copyright e o texto da licença, não usar o nome do autor para promover o produto e reproduzir o aviso na documentação do binário.

O MPE já entrega: preview ao vivo com sincronização de rolagem, KaTeX/MathJax, Mermaid, PlantUML e outros diagramas, code chunks executáveis, importação de arquivos (`@import`), wikilinks e backlinks, callouts, exportação (HTML, PDF, ePub, Pandoc), apresentações (reveal.js) e editor customizado só-preview.

### 2.2 O que já fizemos no fork (verificado)

| #   | Entrega                                                                                                                           | Estado                                                                   |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| R1  | Clicar num checkbox (`- [ ]`) no preview grava no `.md` mesmo sem o texto aberto no editor (`WorkspaceEdit`, desfaz com `Ctrl+Z`) | feito, commit `95a151d`                                                  |
| R2  | Botão **Copy** em cada code block, com configuração `enableCodeCopyButton`                                                        | feito, commit `027f4ed`                                                  |
| R3  | Busca (`Ctrl+F`) no preview                                                                                                       | já resolvida no upstream 0.8.40 (issue #2412)                            |
| R4  | Build e testes em Node 18, `.vsix` empacotado                                                                                     | funcionando; `pnpm check:all` ainda reclama de formatação (fim de linha) |

### 2.3 Requisitos não funcionais herdados

- **Compatibilidade:** `engines.vscode ^1.82.0`; a extensão roda em Node 18 no host do VS Code. `cheerio` fixado em `1.0.0`. Desenvolvimento e CI em Node 18.
- **Distribuição:** VS Code Marketplace + Open VSX (Cursor, Windsurf).
- **Web:** existe entrada para VS Code na web (`extension-web.ts`); o suporte precisa ser mantido ou removido por decisão explícita.

## 3. Dores dos usuários

Legenda: **[F]** = relatada em issue do upstream (`shd101wyy/vscode-markdown-preview-enhanced`) · **[I]** = inferida, validar com usuários.

| #   | Dor                                                                                                                                                                | Evidência                                                                                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| D1  | **O preview é só leitura.** Checkbox de tarefa, copiar código e outras ações simples exigem voltar ao texto.                                                       | [F] #2177 (Copy, 15 reações) · checkboxes: o handler antigo só funcionava com o texto aberto |
| D2  | **Lentidão em documentos grandes ou com muita matemática.** Relatos de 30 segundos para abrir qualquer arquivo.                                                    | [F] #2266, #1870                                                                             |
| D3  | **Preview que não abre, trava ou quebra ao trocar de aba.**                                                                                                        | [F] #2188, #2240, #1999                                                                      |
| D4  | **Configuração que não persiste ou comandos que falham após atualização.**                                                                                         | [F] #2194, #2111                                                                             |
| D5  | **Erros de execução de LaTeX (`ENOENT`) e exportação de PDF.**                                                                                                     | [F] #1878, #2195, #2021, #2025                                                               |
| D6  | **Diagramas faltando:** renderizador `elk` do Mermaid, SVG exportável do Mermaid.                                                                                  | [F] #2061, #1963                                                                             |
| D7  | **Fila de issues grande.** Cerca de 300 issues abertas; várias já resolvidas continuam abertas (callouts, imagens claro/escuro, busca), o que esconde o que falta. | [F] levantamento de 2026-10-26                                                               |
| D8  | **Tema e estilo pouco cuidados.** Pedidos de temas mais bonitos.                                                                                                   | [F] #2030 · [I]                                                                              |
| D9  | **Ritmo de manutenção depende de uma pessoa.**                                                                                                                     | [I] validar                                                                                  |

## 4. Proposta de valor

> "O preview de Markdown em que você trabalha, não só lê."

Três pilares:

1. **Preview interativo** — marcar tarefas, copiar código, buscar e navegar sem sair do preview.
2. **Rápido e estável** — abrir e atualizar documentos grandes sem travar; não perder o preview ao trocar de aba.
3. **Mantido e aberto** — correções entram rápido, com changelog claro e licença respeitada.

## 5. Público-alvo

| Persona                            | Quem é                                      | Trabalho a fazer                                    |
| ---------------------------------- | ------------------------------------------- | --------------------------------------------------- |
| P1 — Dev que escreve documentação  | README, ADR, runbooks no repositório        | Escrever com preview fiel; copiar trechos de código |
| P2 — Quem gere tarefas em Markdown | Listas de tarefas, notas de reunião, planos | Marcar `- [ ]` direto no preview                    |
| P3 — Autor técnico/acadêmico       | Matemática, diagramas, exportação PDF/HTML  | Documento longo que renderiza rápido e exporta bem  |
| P4 — Dev com agente de IA          | Lê planos e documentos que o agente escreve | Preview confiável e interativo ao lado do agente    |

**[validar]** com 5 a 10 usuários do MPE antes de fechar o escopo.

## 6. Melhorias propostas

| Dor | Melhoria                                                                                                                                          | Prioridade                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| D1  | **Preview interativo:** checkboxes que gravam (feito), botão Copy (feito); depois ações no preview como alternar listas e abrir o bloco no editor | MVP                             |
| D1  | **Checkbox com verificação de versão do documento** (hoje o webview não envia a versão; exige mudança na `crossnote`)                             | v1                              |
| D2  | **Desempenho:** medir primeiro (documento de referência com matemática e diagramas), depois renderização incremental e cache                      | MVP (medição) · v1 (otimização) |
| D3  | **Estabilidade do preview:** reproduzir e corrigir travamentos e perda de preview ao trocar de aba                                                | MVP                             |
| D4  | **Configurações e comandos:** verificar persistência do editor padrão e falha de comandos pós-atualização                                         | MVP                             |
| D5  | **LaTeX e PDF:** mensagens de erro claras e verificação de dependências externas                                                                  | v1                              |
| D6  | **Mermaid:** renderizador `elk` e exportação de SVG                                                                                               | v1                              |
| D7  | **Triagem do backlog:** fechar o que já está resolvido, etiquetar o resto, publicar o que entra no roteiro                                        | MVP                             |
| D8  | **Temas e estilo próprios**                                                                                                                       | v2                              |
| —   | **Identidade própria:** nome, publisher, ícones, aviso de licença NCSA e documentação de "baseado em MPE"                                         | MVP (obrigatório)               |
| —   | **Traduções do botão Copy** (hoje só em inglês) e do que mais for novo                                                                            | v1                              |

## 7. Escopo do MVP

**Entra:**

- Rebranding completo: id `cas-markdown-studio`, nome de exibição "CAS Markdown Studio", publisher próprio, ícones novos, `LICENSE` com o aviso original + o nosso, página do Marketplace.
- Checkbox interativo e botão Copy (já feitos), com testes e documentação.
- Medição de desempenho em documento de referência e correção das causas óbvias.
- Correção dos travamentos e das configurações que não persistem (D3, D4).
- Instalação lado a lado com o MPE original sem conflito (id e comandos próprios).
- Publicação no Marketplace e no Open VSX.

**Não entra (não objetivos do MVP):**

- Reescrever o renderizador (`crossnote`) ou trocar de motor.
- Novos tipos de diagrama além de Mermaid `elk`.
- Contas, nuvem e telemetria.
- Editor WYSIWYG.

## 8. Métricas de sucesso

| Métrica                                                  | Meta em 6 meses após lançamento             |
| -------------------------------------------------------- | ------------------------------------------- |
| Instalações (Marketplace + Open VSX)                     | **[validar]** 2.000                         |
| Nota média no Marketplace                                | ≥ 4,5                                       |
| Tempo para abrir o preview do documento de referência    | a definir após a medição; hoje desconhecido |
| Bugs de travamento do preview abertos há mais de 14 dias | 0                                           |
| Contribuidores externos com PR aceito                    | ≥ 3                                         |

## 9. Riscos

| Risco                                                                                                 | Mitigação                                                                                                                |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Divergência do upstream: fork difícil de atualizar                                                    | Mudanças pequenas e isoladas; registrar cada uma; rebase por release do upstream; contribuir de volta o que for genérico |
| Parte do valor está na `crossnote`, fora do nosso repositório (checkbox com versão, Copy, desempenho) | Decidir cedo se mantemos um fork da `crossnote` ou só mudanças nesta extensão                                            |
| Licença NCSA mal cumprida                                                                             | Checklist no empacotamento: aviso de copyright, texto da licença e ícones substituídos                                   |
| Marca: nome parecido com outras extensões                                                             | Usar `cas-markdown-studio`; o id exibido não colide nos registros verificados em 2026-10-26                              |
| O mantenedor do MPE entrega o mesmo e o diferencial some                                              | Foco em estabilidade e desempenho, não só em recursos                                                                    |
| Sem reprodução, não dá para corrigir D2 e D3                                                          | Primeiro item é criar documento e ambiente de reprodução                                                                 |

## 10. Perguntas em aberto

1. Publisher: reutilizar `control-alt-sistemas` (usado no DBML Support) ou criar outro? **[validar]**
2. Manter a `crossnote` como dependência do npm ou manter um fork dela?
3. O suporte web (`extension-web.ts`) continua no escopo?
4. Ícone e paleta: identidade visual a definir (`/agile:identity`).
5. Licença do nosso código: manter NCSA (mais simples) ou outra compatível?
6. Validar as dores marcadas **[I]** com usuários antes de fechar o MVP.

## 11. Fontes

- [Repositório do MPE](https://github.com/shd101wyy/vscode-markdown-preview-enhanced) e [issues abertas](https://github.com/shd101wyy/vscode-markdown-preview-enhanced/issues)
- [Repositório da crossnote](https://github.com/shd101wyy/crossnote)
- `LICENSE.md` do repositório (University of Illinois/NCSA Open Source License)
- Levantamento de issues e verificações feitos em 2026-10-26 nesta conversa
