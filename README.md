# 🚗 Pare e Lave - Sistema de Gerenciamento de Lava-Jato

Um sistema web moderno e intuitivo para gerenciar serviços de lavagem de veículos, despesas e gerar relatórios.

## ✨ Características

- **Dashboard Intuitivo**: Visualize todos os serviços do dia em um só lugar
- **Gestão de Serviços**: Registre lavagens com tipo de veículo, cliente e valor
- **Controle de Despesas**: Acompanhe gastos por categoria (produtos, aluguel, funcionários, etc.)
- **Relatórios Detalhados**: Gere relatórios de período para análise financeira
- **Estatísticas**: Visualize gráficos e tendências de faturamento
- **Autenticação Segura**: Login via OAuth
- **Interface Responsiva**: Funciona perfeitamente em desktop e mobile
- **Design Moderno**: Interface limpa com gradientes e animações suaves

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Vercel)                │
│  React + TypeScript + TailwindCSS + Wouter         │
└────────────────────┬────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────┐
│                    Backend (Vercel)                 │
│  Express + tRPC + TypeScript                        │
└────────────────────┬────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────┐
│            Database (Supabase PostgreSQL)           │
│  Drizzle ORM + PostgreSQL                           │
└─────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- pnpm (ou npm/yarn)
- Conta no Supabase
- Conta no Vercel (para deploy)

### Instalação Local

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/pare-e-lave.git
cd pare-e-lave
```

2. **Instale as dependências**
```bash
pnpm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite .env com suas credenciais
```

4. **Configure o banco de dados**
```bash
pnpm db:push
```

5. **Inicie o servidor de desenvolvimento**
```bash
pnpm dev
```

A aplicação estará disponível em `http://localhost:5173`

## 📦 Scripts Disponíveis

- `pnpm dev` - Inicia servidor de desenvolvimento
- `pnpm build` - Build para produção
- `pnpm start` - Inicia servidor de produção
- `pnpm db:push` - Executa migrações do banco de dados
- `pnpm format` - Formata código com Prettier
- `pnpm check` - Verifica tipos TypeScript
- `pnpm test` - Executa testes

## 🗄️ Banco de Dados

### Tabelas

#### users
- `id` - ID do usuário
- `openId` - ID OAuth único
- `name` - Nome do usuário
- `email` - Email
- `role` - Papel (user/admin)
- `createdAt` - Data de criação
- `updatedAt` - Data de atualização

#### services
- `id` - ID do serviço
- `userId` - ID do usuário
- `vehicleType` - Tipo de veículo (car, motorcycle, suv, truck, other)
- `clientName` - Nome do cliente
- `description` - Descrição do serviço
- `value` - Valor do serviço
- `paymentMethod` - Método de pagamento (pix, cash, card, other)
- `createdAt` - Data de criação

#### expenses
- `id` - ID da despesa
- `userId` - ID do usuário
- `category` - Categoria (Produtos, Aluguel, Funcionário, etc.)
- `description` - Descrição
- `amount` - Valor
- `createdAt` - Data de criação

#### ownerProfile
- `id` - ID do perfil
- `userId` - ID do usuário
- `businessName` - Nome do negócio
- `ownerFirstName` - Primeiro nome do proprietário
- `ownerLastName` - Sobrenome do proprietário
- `phone` - Telefone
- `createdAt` - Data de criação

## 🎨 Design

O projeto utiliza:
- **TailwindCSS** para estilização
- **Radix UI** para componentes acessíveis
- **Framer Motion** para animações
- **Lucide React** para ícones
- **Recharts** para gráficos

## 🔐 Segurança

- Autenticação OAuth
- JWT para sessões
- Validação com Zod
- Proteção CSRF
- Cookies seguros

## 📱 Responsividade

A aplicação é totalmente responsiva e otimizada para:
- 📱 Smartphones (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)

## 🌐 Deploy

Veja o [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) para instruções completas de deploy gratuito com Supabase + Vercel.

## 📊 Funcionalidades Principais

### Dashboard
- Resumo do dia
- Últimos serviços
- Total de faturamento
- Acesso rápido a funções

### Serviços
- Criar novo serviço
- Listar serviços por data
- Buscar serviços
- Editar/deletar serviços
- Filtrar por período

### Despesas
- Registrar despesas
- Categorizar gastos
- Visualizar por período
- Relatórios de despesas

### Relatórios
- Faturamento por período
- Despesas por categoria
- Lucro líquido
- Exportar dados

### Estatísticas
- Gráficos de faturamento
- Tendências mensais
- Comparativos
- Análise de dados

## 🛠️ Tecnologias

### Frontend
- React 19
- TypeScript
- TailwindCSS 4
- Vite
- Wouter (routing)
- React Hook Form
- Zod (validação)
- Framer Motion

### Backend
- Express
- tRPC
- TypeScript
- Drizzle ORM

### Database
- PostgreSQL (Supabase)
- Drizzle Kit (migrações)

### DevTools
- Prettier
- Vitest
- ESBuild

## 📝 Licença

MIT

## 👨‍💼 Autor

Sistema desenvolvido para gerenciamento de lava-jatos.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se livre para abrir issues e pull requests.

## 📞 Suporte

Para dúvidas ou problemas, consulte o [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) ou abra uma issue.

---

**Pronto para começar?** Veja o [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) para instruções de deploy! 🚀
