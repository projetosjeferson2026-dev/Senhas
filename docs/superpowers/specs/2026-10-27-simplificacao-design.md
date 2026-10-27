# Simplificação do Nexus Vault

Direção aprovada: manter o tema escuro e melhorar a organização, a legibilidade e o uso em celular. Preservar Next.js, Supabase e a criptografia existente.

O painel terá busca em destaque, acesso aos favoritos, opção de limpar filtros e cartões mais legíveis. Categorias serão definidas em um único arquivo; estilos serão separados por responsabilidade. Textos de acesso e configuração serão mais diretos.

Alternativas: reconstruir o aplicativo aumentaria o risco sem necessidade; apenas trocar cores manteria as dificuldades de organização. A escolha é uma melhoria incremental da interface e da estrutura atual.

O arquivo iniciar-servidor.bat verificará Node e npm, instalará dependências quando ausentes, orientará a configuração local e iniciará o servidor somente em localhost:3000. Erros ficarão visíveis no terminal.

Validação: testes existentes e testes de interação dos novos filtros, ESLint, TypeScript, build e resposta HTTP local. Login real depende da conta autorizada do usuário.
