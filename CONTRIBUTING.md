# Contribuindo

Antes de abrir uma alteração, rode a mesma bateria do CI localmente:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Convenções de código

- **TypeScript estrito.** Não use `any`, `@ts-ignore` ou `@ts-expect-error` para contornar erros.
- **Import absoluto** via alias `@/` (ex.: `@/lib/crypto`), nunca `../../`.
- **Componentes** em PascalCase (`vault-dashboard.tsx`), funções e variáveis em camelCase.
- **Interface em português (pt-BR)** — textos, mensagens de erro e `metadata` do app.
- **Nomes de código em inglês**, seguindo o padrão já existente em `src/lib` e `src/components`.
- **Tailwind + classes utilitárias próprias** em `src/app/globals.css`; evite estilos inline.
- Componentes que usam estado, hooks ou APIs do navegador levam `"use client"` no topo.
- Erros exibidos ao usuário precisam de `role="alert"` e texto curto e acionável.

## Regras de segurança

Estas regras não são negociáveis — elas sustentam o modelo de confiança do cofre:

1. **Nunca** logue, serialize ou envie para o servidor senha-mestra, segredo decifrado ou chave derivada.
2. **Nunca** adicione `SUPABASE_SERVICE_ROLE_KEY`, tokens ou chaves de API ao repositório.
3. Não adicione dependências que executem código de terceiros sobre dados do cofre.
4. Toda tabela nova precisa de RLS habilitado, `revoke` para `anon` e política vinculada a
   `vault_authorized_users`.
5. Não afrouxe a CSP em `next.config.ts` sem justificar no PR.
6. Mantenha o formato `{ ciphertext, iv, version }`. Mudanças de criptografia exigem nova `version`.

## Testes

- Todo comportamento em `src/lib` precisa de teste unitário.
- Componentes devem ser testados pelo que o usuário vê (Testing Library), não por detalhes internos.
- Testes ficam ao lado do arquivo testado: `crypto.ts` → `crypto.test.ts`.

## Commits e pull requests

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona gerador de senha no modal
fix: corrige bloqueio automático após expirar sessão
docs: detalha configuração do Supabase
chore: atualiza dependências de teste
```

- Um assunto por commit, no imperativo e em português.
- Descreva no PR **o problema** e **como você validou** a correção.
- Alterações que tocam criptografia ou RLS devem explicar o impacto no modelo de segurança.
