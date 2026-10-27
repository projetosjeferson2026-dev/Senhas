# Nexus Vault

Cofre pessoal em Next.js com autenticação Supabase e criptografia AES-256-GCM no navegador. O banco recebe apenas conteúdo cifrado, IV e metadados técnicos.

## Configuração

1. No Supabase, execute `supabase/migrations/001_nexus_vault.sql` no SQL Editor.
2. Crie manualmente seu usuário em Authentication e desative novos cadastros.
3. Autorize somente esse usuário no SQL Editor, substituindo o e-mail:

```sql
insert into public.vault_authorized_users (user_id)
select id from auth.users where email = 'SEU_EMAIL';
```

Essa lista é aplicada pelas políticas RLS no banco; a variável de e-mail da interface não é a barreira de segurança.

4. Configure na Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ALLOWED_EMAIL`
5. Conecte este repositório ao projeto Vercel. O push para `main` dispara o deploy.

Nunca configure `SUPABASE_SERVICE_ROLE_KEY` no navegador ou no repositório.

## Desenvolvimento

```bash
npm install
npm test
npm run lint
npm run build
```
