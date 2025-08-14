# 🚀 GitHub Setup & Deployment Guide

## 📋 Passo a Passo: Criar Conta e Configurar GitHub

### 1. 🆕 Criar Conta GitHub

1. **Ir para GitHub:**
   - Aceder: https://github.com
   - Clicar em **"Sign up"**

2. **Preencher dados:**
   - **Username:** `seu-username` (ex: `finops-dashboard`)
   - **Email:** seu email corporativo
   - **Password:** password seguro
   - Verificar email

3. **Verificação:**
   - Verificar conta por email
   - Escolher plano **Free** (suficiente)

### 2. 📁 Criar Repositório

1. **Novo Repositório:**
   - Clicar em **"New repository"**
   - **Nome:** `finops-dashboard`
   - **Descrição:** `FinOps Start/Stop Status Dashboard with Azure Integration`
   - ✅ **Public** (para GitHub Pages gratuito)
   - ✅ **Add README file**
   - ✅ **Add .gitignore** → Node
   - **License:** MIT License

2. **Clonar repositório:**
   ```bash
   git clone https://github.com/seu-username/finops-dashboard.git
   cd finops-dashboard
   ```

### 3. 📤 Upload do Projeto

**Opção A: Via Interface Web (Recomendado para iniciantes)**

1. **No repositório GitHub:**
   - Clicar em **"uploading an existing file"**
   - Arrastar todos os ficheiros do projeto
   - **Commit message:** `Initial project upload with Azure integration`
   - Clicar **"Commit changes"**

**Opção B: Via Git Command Line**

```bash
# Navegar para pasta do projeto
cd "C:\Users\m89500079\apptio-project\New folder\New folder"

# Inicializar Git
git init
git remote add origin https://github.com/seu-username/finops-dashboard.git

# Adicionar arquivos
git add .
git commit -m "Initial commit: FinOps Dashboard with Azure integration"

# Push para GitHub
git branch -M main
git push -u origin main
```

### 4. 🌐 Configurar GitHub Pages (Frontend)

1. **No repositório GitHub:**
   - Ir para **Settings** → **Pages**
   - **Source:** Deploy from a branch
   - **Branch:** `main` → `/root`
   - Clicar **Save**

2. **URL do site:**
   - Após alguns minutos: `https://seu-username.github.io/finops-dashboard`

### 5. ☁️ Configurar Deployment Backend

**Opção A: GitHub Codespaces (Recomendado)**

1. **Ativar Codespaces:**
   - No repositório → **Code** → **Codespaces**
   - **Create codespace on main**
   - Aguardar ambiente carregar

2. **Executar no Codespace:**
   ```bash
   npm install
   npm start
   ```

3. **Aceder aplicação:**
   - Codespace fornece URL público automaticamente
   - Exemplo: `https://studded-space-computing-ab123.github.dev`

**Opção B: Deploy para Azure via GitHub Actions**

1. **Configurar Azure:**
   - Criar Azure App Service
   - Configurar deployment credentials

2. **GitHub Actions automático:**
   - Workflow já configurado (ver ficheiro `.github/workflows/azure.yml`)

**Opção C: Deploy para Vercel/Netlify**

1. **Conectar repositório:**
   - Vercel: https://vercel.com → Import Git Repository
   - Netlify: https://netlify.com → New site from Git

2. **Configuração automática:**
   - Build Command: `npm run build`
   - Output Directory: `dist` ou `public`

## 🔧 Arquivos de Configuração

### `.gitignore` (Para não commitar secrets)
```gitignore
# Dependencies
node_modules/
npm-debug.log*

# Environment variables
.env
.env.local
.env.production
.env.staging

# Logs
*.log
logs/

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# Build outputs
dist/
build/

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Azure
azure-credentials.json
```

### `package.json` (Scripts de deployment)
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "node simple-server.js",
    "build": "echo 'No build step needed for static site'",
    "deploy": "npm run build",
    "setup-db": "node setup-database.js",
    "import-csv": "node import-csv.js"
  }
}
```

## 🚀 Deployment Options

### 1. 🎯 GitHub Pages (Frontend Only)
- **URL:** `https://seu-username.github.io/finops-dashboard`
- **Custo:** Gratuito
- **Funciona:** Interface + CSV local
- **Limitações:** Sem backend Node.js

### 2. 💻 GitHub Codespaces (Full Stack)
- **URL:** Gerada automaticamente
- **Custo:** 60h gratuitas/mês
- **Funciona:** Frontend + Backend + Azure integration
- **Ideal para:** Desenvolvimento e testes

### 3. ☁️ Azure App Service (Produção)
- **URL:** Personalizada
- **Custo:** A partir de €10/mês
- **Funciona:** Tudo + Base de dados
- **Ideal para:** Produção empresarial

### 4. 🌐 Vercel/Netlify (Híbrido)
- **URL:** Personalizada gratuita
- **Custo:** Gratuito para uso básico
- **Funciona:** Frontend + Serverless functions
- **Ideal para:** MVP rápido

## 🔄 Workflow de Atualizações

### Fazer mudanças no código:

1. **Via GitHub Web:**
   - Editar ficheiros diretamente no GitHub
   - Commit changes
   - Deploy automático

2. **Via Git local:**
   ```bash
   # Fazer mudanças nos ficheiros
   git add .
   git commit -m "Descrição das mudanças"
   git push origin main
   ```

3. **Deploy automático:**
   - GitHub Pages: 2-5 minutos
   - Vercel/Netlify: 1-2 minutos
   - Azure: 5-10 minutos

## 🔒 Configurar Secrets (Azure Integration)

### No GitHub Repository:

1. **Settings** → **Secrets and variables** → **Actions**

2. **Adicionar secrets:**
   ```
   AZURE_CLIENT_ID=your-client-id
   AZURE_CLIENT_SECRET=your-client-secret
   AZURE_TENANT_ID=your-tenant-id
   AZURE_SUBSCRIPTIONS=sub1,sub2,sub3
   ```

3. **Uso nos workflows:**
   ```yaml
   env:
     AZURE_CLIENT_ID: ${{ secrets.AZURE_CLIENT_ID }}
     AZURE_CLIENT_SECRET: ${{ secrets.AZURE_CLIENT_SECRET }}
   ```

## 📊 Monitorização

### GitHub Insights:
- **Traffic:** Ver visitantes do site
- **Actions:** Logs de deployment
- **Issues:** Reportar bugs
- **Pull Requests:** Colaboração

### URLs de Teste:
```bash
# GitHub Pages
https://seu-username.github.io/finops-dashboard

# API Endpoints (se backend ativo)
https://your-app.azurewebsites.net/api/health
https://your-app.azurewebsites.net/api/azure/test
```

## 🎯 Próximos Passos

1. ✅ **Criar conta GitHub**
2. ✅ **Upload do projeto**
3. ✅ **Ativar GitHub Pages**
4. ✅ **Testar site**
5. ✅ **Configurar deployment backend**
6. ✅ **Configurar Azure secrets**
7. ✅ **Testar integração Azure**

## 🆘 Troubleshooting

### Site não aparece:
- Verificar Settings → Pages
- Aguardar 5-10 minutos
- Verificar Actions → Pages build

### Backend não funciona:
- GitHub Pages não suporta Node.js
- Usar Codespaces ou Azure
- Verificar logs nos Actions

### Azure integration erro:
- Verificar secrets configurados
- Testar az login localmente
- Verificar permissões Azure

---

**🎉 Com esta configuração, terá o site no GitHub e poderá fazer atualizações diretamente pela interface web!**