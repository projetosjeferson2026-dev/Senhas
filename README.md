# Nexus Vault

[![CI](https://github.com/projetosjeferson2026-dev/Senhas/actions/workflows/ci.yml/badge.svg)](https://github.com/projetosjeferson2026-dev/Senhas/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)

Cofre pessoal de credenciais para um único usuário autorizado. Senhas, tokens e chaves são
cifrados **no navegador** e o Supabase recebe apenas texto cifrado, IV e metadados técnicos.

## Modelo de segurança

- **Derivação de chave:** PBKDF2-SHA256 com 600.000 iterações e salt aleatório de 32 bytes.
- **Criptografia:** AES-256-GCM, IV aleatório de 12 bytes por item, AAD fixo `nexus-vault:v1`.
- **Senha-mestra:** nunca sai do dispositivo e não é armazenada em lugar nenhum. O banco guarda
  somente um *verifier* cifrado, usado para detectar senha-mestra incorreta.
- **Banco:** o Supabase armazena `ciphertext`, `iv` e `crypto_version`. Nenhum campo legível existe.
- **Autorização:** RLS em todas as tabelas + tabela `vault_authorized_users`, que precisa conter o
  UID do usuário para qualquer leitura ou escrita. A lista é mantida apenas pelo SQL Editor.
- **Sessão:** token do Supabase no navegador (sessão persistida) e bloqueio automático do cofre
  após 5 minutos sem interação.
- **Superfície:** CSP restritiva, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, HSTS em
  produção e área restrita a um único e-mail.

> A variável `NEXT_PUBLIC_ALLOWED_EMAIL` é apenas uma checagem de conveniência na interface. A
> barreira real de segurança são as políticas RLS do banco.

## Stack

| Camada    | Escolha                                            |
| --------- | -------------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack, Cache Components) |
| UI        | React 19 + Tailwind CSS 4 + lucide-react           |
| Dados     | Supabase (Authentication + Postgres com RLS)       |
| Cripto    | Web Crypto API (PBKDF2 + AES-GCM)                  |
| Testes    | Vitest + Testing Library + jsdom                   |

## Estrutura

```
src/app/          App Router: layout, página única e estilos globais
src/components/   Telas e componentes de interface (testes ao lado de cada arquivo)
src/lib/          Criptografia, modelo, categorias e backend Supabase
src/styles/       CSS separado: base, acesso, painel, modal e responsividade
supabase/         Migration SQL com tabelas, grants e políticas RLS
.github/          Workflow de CI
```

## Como rodar

### Windows: iniciar com dois cliques

Execute **`iniciar-servidor.bat`** na pasta do projeto. Ele verifica o Node.js,
instala as dependências caso estejam ausentes e inicia em **http://localhost:3000**.
Abra esse endereço no navegador e mantenha o terminal aberto enquanto usar o app.
Para encerrar, pressione **Ctrl+C** no terminal.

Se `.env.local` ainda não existir, o script cria uma cópia de `.env.example` e
aguarda você preencher as três variáveis descritas abaixo. Depois, execute o BAT novamente.
Se a porta 3000 estiver ocupada, pare o servidor anterior antes de iniciar outro.

### Executar pelo terminal

Requisitos: Node.js 24 (veja `.nvmrc`) e um projeto Supabase.

```bash
npm ci
cp .env.example .env.local   # preencha as três variáveis
npm run dev
```

### 1. Banco de dados

Execute `supabase/migrations/001_nexus_vault.sql` no SQL Editor do Supabase. O script cria as
tabelas, habilita RLS, revoga acesso de `anon` e aplica as políticas.

### 2. Usuário

Crie manualmente seu usuário em **Authentication → Users** e desative novos cadastros
(*Authentication → Providers → Email → Allow new users to sign up: off*).

### 3. Allowlist

Autorize o UID desse usuário — sem isso o cofre fica inacessível mesmo com login válido:

```sql
insert into public.vault_authorized_users (user_id)
select id from auth.users where email = 'SEU_EMAIL';
```

### 4. Variáveis de ambiente

| Variável                        | Obrigatória | Descrição                              |
| ------------------------------- | ----------- | -------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | sim         | URL do projeto Supabase                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | sim         | Chave anônima (publishable)            |
| `NEXT_PUBLIC_ALLOWED_EMAIL`     | sim         | Único e-mail autorizado a abrir o cofre |

Sem as três variáveis o app mostra a tela de configuração em vez do login.

> Nunca coloque a `SUPABASE_SERVICE_ROLE_KEY` no repositório, em variáveis `NEXT_PUBLIC_*` ou no
> navegador — ela ignora RLS.

## Uso no dia a dia

1. Entre com a conta autorizada e desbloqueie usando a senha-mestra.
2. Clique em **Novo item** para salvar uma senha, token ou chave.
3. Use a pesquisa, as categorias ou **Favoritos** para encontrar suas credenciais.
4. Use **Copiar** para copiar a senha e **Editar** para alterar os dados.
5. Clique em **Limpar filtros** para voltar a todos os itens ou **Bloquear** para fechar o cofre.

## Scripts

| Comando             | O que faz                                             |
| ------------------- | ----------------------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento                           |
| `npm run build`     | Build de produção                                     |
| `npm run start`     | Servidor do build de produção                         |
| `npm run lint`      | ESLint (config do Next.js, core-web-vitals + TS)      |
| `npm run typecheck` | Gera os tipos de rota e roda `tsc --noEmit`           |
| `npm test`          | Testes em Vitest (execução única)                     |
| `npm run test:watch`| Testes em modo watch                                  |

## CI

Todo push e pull request para `main` roda lint, typecheck, testes e build em Node 24. O workflow
está em `.github/workflows/ci.yml` e não precisa de nenhum secret.

## Deploy

1. Crie o projeto na Vercel e conecte este repositório.
2. Configure as três variáveis em **Project → Settings → Environment Variables**.
3. Push para `main` dispara o deploy.

## Limitações conhecidas

- A senha-mestra **não é recuperável**. Esquecê-la significa perder o acesso ao conteúdo do cofre.
- O app atende um único e-mail; não há cadastro público, compartilhamento ou multiusuário.
- O bloqueio automático é do lado do cliente: recarregar a página exige desbloquear novamente.
- Recursos do navegador como `navigator.clipboard` exigem HTTPS (ou `localhost`).

## Licença

Projeto pessoal, sem licença de uso público.
