# Changelog - Pare e Lave

## [2.0.0] - 2026-06-16

### 🔄 Migração de Banco de Dados
- **Migrado de MySQL para PostgreSQL** com Supabase
- Atualizado `drizzle.config.ts` para usar dialect PostgreSQL
- Reescrito `drizzle/schema.ts` com tipos PostgreSQL (`pgTable`, `pgEnum`, `integer` com `generatedAlwaysAsIdentity`)
- Atualizado `server/db.ts` para usar driver `postgres-js`
- Alterado método de upsert de `onDuplicateKeyUpdate` para `onConflictDoUpdate` (sintaxe PostgreSQL)
- Substituído `mysql2` por `postgres` no `package.json`

### ✨ Melhorias Visuais
- **Novo design com gradientes**: Background gradiente emerald → teal → cyan em toda a aplicação
- **Header melhorado**: Gradiente verde com ícone e melhor contraste
- **Navegação inferior**: Estilo aprimorado com bordas coloridas e transições suaves
- **Elementos decorativos**: Adicionados elementos animados no background da tela de login
- **Botões interativos**: Efeitos hover melhorados com scale e shadow
- **Tela de carregamento**: Animação visual mais atraente com blur effect

### 📚 Documentação
- Adicionado `DEPLOY_GUIDE.md` com instruções completas de deploy gratuito
- Atualizado `README.md` com informações do projeto
- Criado `.env.example` com variáveis necessárias
- Adicionado `vercel.json` para configuração de deploy

### 🔧 Configuração
- Criado `.gitignore` completo
- Adicionado `vercel.json` para deploy automático
- Configurado suporte a variáveis de ambiente

### 🎯 Benefícios da Migração

#### Antes (MySQL)
- ❌ Requer servidor MySQL pago
- ❌ Hospedagem cara
- ❌ Complexo de configurar
- ❌ Limite de conexões

#### Depois (PostgreSQL + Supabase)
- ✅ Supabase gratuito (500MB de armazenamento)
- ✅ Deploy gratuito no Vercel
- ✅ Configuração simples em minutos
- ✅ Sem limite de requisições
- ✅ Backups automáticos
- ✅ SSL/HTTPS automático
- ✅ Escalável conforme necessário

### 📦 Dependências Atualizadas
- Removido: `mysql2@^3.15.0`
- Adicionado: `postgres@^3.4.4`

### 🚀 Como Usar
1. Siga o guia em `DEPLOY_GUIDE.md`
2. Configure Supabase para o banco de dados
3. Deploy no Vercel
4. Pronto! Sistema 100% online e gratuito

---

## [1.0.0] - Data anterior

### Funcionalidades Iniciais
- Dashboard com resumo do dia
- Gestão de serviços de lavagem
- Controle de despesas
- Relatórios e estatísticas
- Autenticação OAuth
- Interface responsiva
