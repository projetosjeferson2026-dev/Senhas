# Plano: catálogo de APIs

**Objetivo:** facilitar obter e guardar chaves de provedores de IA.
**Design:** ../specs/2026-10-28-api-catalog-design.md
**Arquitetura:** dados de catálogo em lib/ai-providers.ts; componente de catálogo com CSS próprio; providerId opcional cifrado junto da credencial. Sem migração do banco.

- [x] Testar seleção de provedor, vínculo com chave salva, filtros e envio de providerId pelo formulário.
- [x] Criar catálogo com fontes oficiais e condições verificadas em 28/10/2026.
- [x] Integrar formulário pré-preenchido, edição e indicador neon acessível.
- [x] Executar testes, lint, tipos e build; revisar compatibilidade e diff.

Não modificar senhas, tokens ou dados reais. Preservar ações de copiar, editar e excluir existentes.

Validação: 26 testes aprovados, lint e typecheck sem erros, build de produção aprovado, cartões conferidos em prévia local com dados fictícios. Revisão independente sem achados acionáveis. Nenhum dado real do cofre foi alterado.
