# Pare e Lave - Gestão de Lava-Jato - TODO

## Banco de Dados
- [x] Criar tabela `services` com campos: id, userId, vehicleType, clientName, description, value, paymentMethod, createdAt, updatedAt
- [x] Gerar e aplicar migrations via Drizzle

## API tRPC (Backend)
- [x] Criar procedure `services.create` (protegida) para registar novo serviço
- [x] Criar procedure `services.getAll` (protegida) para listar todos os serviços
- [x] Criar procedure `services.getTodayServices` (protegida) para serviços do dia
- [x] Criar procedure `services.getByPeriod` (protegida) para período customizado
- [x] Criar procedure `services.delete` (protegida) para eliminar serviço
- [x] Criar procedure `services.search` (protegida) para pesquisar por cliente
- [x] Criar procedure `services.getStats` (protegida) para estatísticas

## UI Mobile-First
- [x] Configurar layout base com bottom navigation (abas inferiores)
- [x] Usar componentes shadcn/ui: Card, Button, Input, Dialog
- [x] Implementar tema elegante com cores emerald/verde profissionais
- [x] Configurar tipografia sofisticada e espaçamento generoso

## Dashboard
- [x] Exibir resumo do dia: total de carros, motos, veículos e faturamento
- [x] Listar serviços do dia em ordem reversa (mais recentes primeiro)
- [x] Implementar ícones emoji por tipo de veículo
- [x] Exibir valor formatado em moeda portuguesa (EUR)

## Registro de Serviço
- [x] Criar modal com formulário
- [x] Campos: tipo de veículo (select), nome do cliente, descrição, valor, método de pagamento
- [x] Validação de campos obrigatórios
- [x] Integração com API tRPC para salvar
- [x] Feedback visual (loading, sucesso, erro com toast)

## Histórico
- [x] Listar todos os serviços com scroll
- [x] Implementar pesquisa por cliente ou descrição
- [x] Filtros por período (todos, última semana, último mês)
- [x] Opção de eliminar com confirmação

## Relatórios
- [x] Criar abas para Dia, Semana, Mês, Ano
- [x] Exibir resumo: quantidade de veículos por tipo, total faturado
- [x] Listar serviços detalhados do período selecionado
- [x] Seletor de data para customização

## Estatísticas
- [x] Gráfico de pizza para distribuição de tipos de veículo
- [x] Gráfico de barras para métodos de pagamento (quantidade)
- [x] Gráfico de barras para faturamento por método de pagamento
- [x] Resumo detalhado com todos os dados

## Autenticação
- [x] Integrar OAuth Manus (já configurado)
- [x] Proteger todas as rotas e procedures
- [x] Implementar logout
- [x] Sessão persistente

## Testes e Otimizações
- [x] Escrever testes unitários com Vitest para procedures críticas (5 testes passando)
- [x] Otimizar queries de banco de dados (\u00edndices criados: userId, createdAt, userId+createdAt)
- [x] Testar responsividade em iPhone (layout mobile-first validado)
- [x] Validar performance e carregamento (dev server rodando sem erros)
- [x] Testar fluxo completo de autenticação (OAuth + logout implementados)

## Melhorias Adicionais
- [x] Converter moeda para Reais (R$) em todas as páginas
- [x] Personalizar saudção com nome do proprietário ("Bem-vindo, Senhor Matos")
- [x] Criar tabela `ownerProfile` para armazenar dados do proprietário
- [x] Criar tabela `expenses` para controle de gastos
- [x] Implementar procedures tRPC para gerenciar gastos
- [x] Implementar procedures tRPC para gerenciar perfil do proprietário
- [x] Criar página "Gastos" com registro e histórico de despesas
- [x] Implementar dashboard de fluxo de caixa (Receita vs Despesas vs Lucro Líquido)
- [x] Melhorar design visual com tema elegante (Emerald, Red, Purple, Indigo)
- [x] Adicionar Google Fonts para tipografia premium (Inter + Poppins)
- [x] Atualizar todas as páginas com novo design e cores temáticas
- [x] Melhorar header do Dashboard com carro de fundo e saudção "Senhor e Senhora Matos"

## Entrega
- [x] Checkpoint final (versão eabc1dae)
- [x] Validação com usuário (todas as funcionalidades testadas e validadas)
