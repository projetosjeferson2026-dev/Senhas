# Simplificação do Nexus Vault — plano

**Objetivo:** aplicar a direção visual aprovada e facilitar a execução local.
**Arquitetura:** preservar autenticação e criptografia; centralizar metadados das categorias e separar CSS de base, acesso, painel e formulário.
**Stack:** Next.js 16, React 19, CSS, Supabase, Vitest.
**Design:** ../specs/2026-10-27-simplificacao-design.md

- [x] Adicionar testes de favoritos combinados com busca e limpeza de filtros; confirmar falha inicial.
- [x] Criar src/lib/vault-categories.ts e reutilizar no painel e formulário.
- [x] Melhorar painel, textos de acesso, estilos e comportamento responsivo.
- [x] Criar iniciar-servidor.bat e atualizar instruções no README.
- [x] Executar testes, lint, typecheck, build e conferir HTTP local; revisar diff.

Cuidados: favoritos e categoria combinam com a pesquisa; limpar restaura todos os itens; cartões longos não alargam a tela; falhas de clipboard têm mensagem; o BAT não sobrescreve .env.local nem encerra processos existentes.

Execução na pasta compartilhada solicitada pelo usuário, sem alterar banco de dados ou credenciais.

Resultado: 21 testes aprovados; lint, typecheck e build aprovados. BAT executado com sucesso, servidor pronto em localhost:3000; HTTP 200 e tela de login conferidos no navegador. Login real e leitura do cofre dependem da conta e senha-mestra do usuário. Nenhum dado real foi alterado.
