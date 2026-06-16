# Guia de Deploy - Pare e Lave (100% Gratuito)

Este projeto foi migrado de MySQL para **PostgreSQL com Supabase**, permitindo deploy totalmente gratuito na nuvem usando a Vercel.

## 📋 Arquitetura

- **Frontend**: React + TypeScript + TailwindCSS (hospedado no Vercel)
- **Backend**: Express + tRPC (hospedado no Vercel)
- **Banco de Dados**: PostgreSQL (Supabase - gratuito)
- **Autenticação**: Sistema Local Próprio (com suporte a "Permanecer Logado")

## 🚀 Passo 1: Preparar o Supabase (Banco de Dados Gratuito)

### 1.1 Criar conta no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub ou email
4. Crie uma nova organização

### 1.2 Criar um novo projeto
1. Clique em "New Project"
2. Escolha um nome (ex: "pare-e-lave")
3. Crie uma senha segura para o banco de dados (guarde esta senha!)
4. Selecione a região mais próxima (ex: South America / São Paulo)
5. Clique em "Create new project" e aguarde alguns minutos até finalizar.

### 1.3 Obter a URL de conexão
1. Após criar o projeto, vá para "Settings" (engrenagem) → "Database"
2. Role para baixo até "Connection string" e selecione a aba "URI"
3. Copie a URL de conexão PostgreSQL
4. Substitua `[YOUR-PASSWORD]` pela senha que você criou
5. Salve esta URL - você precisará dela no Vercel.

**Formato da URL:**
```
postgresql://postgres.[sua-ref]:[sua-senha]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

## 🌐 Passo 2: Deploy no Vercel (Hospedagem Gratuita)

### 2.1 Preparar o repositório
1. Extraia o arquivo `.zip` que você recebeu.
2. Crie um repositório no seu GitHub.
3. Faça o upload de todos os arquivos para este novo repositório.

### 2.2 Conectar ao Vercel
1. Acesse [vercel.com](https://vercel.com) e faça login com seu GitHub.
2. Clique em "Add New..." > "Project"
3. Importe o repositório `pare-e-lave` que você acabou de criar.

### 2.3 Configurar variáveis de ambiente
1. Na tela de "Configure Project" no Vercel, abra a seção "Environment Variables".
2. Adicione as seguintes variáveis:

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | Cole a URL do Supabase do passo 1.3 |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Crie uma senha forte e aleatória (ex: `super-senha-pare-lave-2024`) |

3. Clique em "Deploy" e aguarde o processo finalizar (cerca de 2 minutos).

## 🗄️ Passo 3: Executar as migrações do banco de dados

Agora que o projeto está no Vercel, você precisa criar as tabelas no Supabase. A forma mais fácil é rodar o script SQL diretamente no painel do Supabase:

1. Vá para o painel do [Supabase](https://supabase.com).
2. Acesse seu projeto e clique em "SQL Editor" no menu esquerdo.
3. Clique em "New query".
4. Abra o arquivo `drizzle/0000_init.sql` que está no código do projeto, copie todo o seu conteúdo e cole no SQL Editor do Supabase.
5. Clique em "Run" (ou pressione Cmd/Ctrl + Enter).
6. Você verá a mensagem "Success". As tabelas foram criadas!

### 3.1 (Opcional) Criar o primeiro usuário via SQL
Se quiser já criar o usuário `EDMATOS` diretamente pelo SQL, execute esta query no Supabase:
```sql
INSERT INTO "users" ("openId", "name", "role") VALUES ('EDMATOS', 'Ed Matos', 'admin');
```

## 💰 Limites do Plano Gratuito

### Supabase (Banco de Dados)
- ✅ 500 MB de armazenamento de dados
- ✅ Backups automáticos diários
- ✅ Limites muito além do que um lava-jato precisa

### Vercel (Hospedagem)
- ✅ 100 GB de transferência por mês
- ✅ Certificado SSL (HTTPS) automático
- ✅ Deploy automático a cada alteração no GitHub

## 🔐 Como gerenciar senhas e usuários

Como o sistema agora usa autenticação local baseada no `openId` (que funciona como nome de usuário) e valida uma senha fixa no código para demonstração (`deusefiel`), para alterar isso em produção:

1. Acesse o painel do Supabase
2. Vá em "Table Editor" > tabela "users"
3. Lá você pode adicionar novos usuários (colocando o nome de login deles no campo `openId`).

---
*Documentação gerada por Manus AI.*
