# 📊 FinOps Start&Stop Status Dashboard

> **Dashboard moderno para monitorização e gestão de Virtual Machines Azure com integração FinOps**

[![Deploy to GitHub Pages](https://github.com/seu-username/finops-dashboard/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/seu-username/finops-dashboard/actions/workflows/deploy-pages.yml)
[![CI/CD Pipeline](https://github.com/seu-username/finops-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/seu-username/finops-dashboard/actions/workflows/ci.yml)
[![Azure Deploy](https://github.com/seu-username/finops-dashboard/actions/workflows/azure-deploy.yml/badge.svg)](https://github.com/seu-username/finops-dashboard/actions/workflows/azure-deploy.yml)

## 🚀 Demo

**🌐 Site ao vivo:** [https://seu-username.github.io/finops-dashboard](https://seu-username.github.io/finops-dashboard)

## 📊 Sobre o Projeto

Dashboard web interativo para monitorização e gestão de Virtual Machines Azure com integração FinOps. Permite visualizar, filtrar e analisar dados de servidores em tempo real, com sincronização direta do Azure.

## 🗂️ Arquivos do Projeto

```
apptio-project/
├── index.html                        # Página principal do dashboard
├── styles.css                        # Estilos e design responsivo
├── script.js                         # Lógica JavaScript para funcionalidades
├── Status Start&Stop final.csv       # Dados principais dos servidores
├── servidores_ativos.csv             # Dados anteriores (backup)
├── excel/                           # Pasta com arquivos Excel originais
│   └── Status Start&Stop final.xlsx
└── README.md                        # Este arquivo
```

## 🚀 Como Executar

### Opção 1: Servidor Python (Recomendado)
```bash
# Navegar para o diretório do projeto
cd /mnt/c/Users/m89500079/apptio-project

# Iniciar servidor web local
python3 -m http.server 8080

# Abrir no navegador
http://localhost:8080
```

### Opção 2: Servidor Node.js
```bash
# Instalar http-server globalmente
npm install -g http-server

# Iniciar servidor
http-server -p 8080

# Abrir no navegador
http://localhost:8080
```

### Opção 3: Abrir Diretamente
Abra o arquivo `index.html` diretamente no navegador (algumas funcionalidades podem não funcionar devido a restrições CORS).

## ✨ Funcionalidades

### 📈 Dashboard Principal
- **Estatísticas em Tempo Real**: Total de servidores, servidores running e stopped
- **Gráficos Interativos**: Distribuição por ambiente, status e aplicações
- **Design Responsivo**: Funciona em desktop, tablet e mobile

### 🔍 Filtros e Pesquisa
- **Pesquisa Global**: Busca em todos os campos dos servidores
- **Filtros por Categoria**:
  - Ambiente (QL, PP, DR, DV)
  - Aplicação (DUIT, Flow Credit, Smart PBC, etc.)
  - Status (Running, Stopped)
  - Responsável
- **Limpeza de Filtros**: Botão para resetar todos os filtros

### 📋 Tabela de Dados
- **Ordenação**: Clique nos cabeçalhos para ordenar
- **Paginação**: Navegação por páginas (10 itens por página)
- **Detalhes**: Clique no ícone de informação para ver detalhes completos
- **Status Visual**: Badges coloridos para status e ambientes

### 💾 Funcionalidades Adicionais
- **Exportar CSV**: Download dos dados filtrados
- **Atualizar**: Recarregar dados do CSV
- **Modal de Detalhes**: Popup com informações completas do servidor

## 📊 Dados Exibidos

Cada servidor contém as seguintes informações completas:

| Campo | Descrição |
|-------|-----------|
| **Estado Start/Stop** | Estado atual (Agendamento em progresso, Inactivo) |
| **Ambiente** | Ambiente de deployment (DV, DR, PP, QL, PR) |
| **App Name** | Nome da aplicação hospedada |
| **Owner** | Pessoa responsável pelo servidor |
| **Computer Name** | Nome da máquina/servidor |
| **Resource Group** | Grupo de recursos Azure |
| **Subscription** | Assinatura Azure |
| **Location** | Região Azure (North Europe/West Europe) |
| **Size** | Tamanho da VM (Standard_B2ms, etc.) |
| **Schedule** | Agenda de Start/Stop definida |

## 🎨 Interface

### Cores e Temas
- **Cores Principais**: Gradiente azul/roxo (#667eea, #764ba2)
- **Status Running**: Verde (#28a745)
- **Status Stopped**: Vermelho (#dc3545)
- **Ambientes**:
  - QL: Azul claro
  - PP: Verde claro
  - DR: Amarelo
  - DV: Vermelho claro

### Responsividade
- **Desktop**: Layout completo com sidebar de filtros
- **Tablet**: Layout adaptado com filtros colapsáveis
- **Mobile**: Interface otimizada para touch

## 🔧 Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Flexbox, Grid, animações e responsividade
- **JavaScript ES6+**: Manipulação de DOM, fetch API, async/await
- **Chart.js**: Gráficos interativos (preparado para uso futuro)
- **Font Awesome**: Ícones
- **CSV Parsing**: Processamento de dados CSV nativo

## 📱 Compatibilidade

- **Navegadores**: Chrome, Firefox, Safari, Edge (últimas versões)
- **Dispositivos**: Desktop, tablet, smartphone
- **Acessibilidade**: Navegação por teclado, contraste adequado

## 🔄 Atualizações de Dados

Para atualizar os dados:

1. **Substitua o arquivo CSV**: Atualize `servidores_ativos.csv` com novos dados
2. **Clique em "Atualizar"**: Botão no interface para recarregar dados
3. **Reprocessamento**: O sistema reprocessa automaticamente filtros e estatísticas

## 🐛 Solução de Problemas

### Dados Não Carregam
- Verifique se o arquivo `servidores_ativos.csv` existe
- Confirme que o servidor web está rodando
- Verifique o console do navegador (F12) para erros

### Filtros Não Funcionam
- Limpe os filtros e tente novamente
- Recarregue a página (F5)
- Verifique se há dados suficientes para filtrar

### Layout Quebrado
- Desative extensões do navegador
- Limpe cache e cookies
- Teste em modo incógnito

## 🔮 Funcionalidades Futuras

- **Integração em Tempo Real**: Conexão direta com APIs Azure
- **Alertas**: Notificações para mudanças de status
- **Histórico**: Tracking de mudanças ao longo do tempo
- **Dashboard Executivo**: Métricas agregadas por departamento
- **Exportação Avançada**: PDF, Excel com formatação

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique este README
2. Consulte o console do navegador para erros
3. Entre em contato com o administrador do sistema

---

**Dashboard criado em:** Agosto 2025  
**Versão:** 1.0.0  
**Dados baseados em:** Status Start&Stop 18Jul v3.xlsx