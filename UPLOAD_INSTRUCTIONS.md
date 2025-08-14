# 📤 Instruções de Upload para GitHub

## 🎯 Esta pasta contém TODOS os ficheiros necessários para GitHub

### 📁 Conteúdo da pasta `github-upload`:

#### 🌐 **Ficheiros Core (Essenciais)**
- `index.html` - Interface principal do dashboard
- `styles.css` - Estilos e design responsivo  
- `script.js` - Funcionalidades JavaScript
- `data.csv` - Dados das Virtual Machines
- `README.md` - Documentação principal do projeto

#### 🖥️ **Backend Files**
- `server.js` - Servidor Express.js completo
- `simple-server.js` - Servidor estático simples
- `azure-service.js` - Integração com Azure
- `package.json` - Dependências Node.js

#### 🔧 **Configuração**
- `.gitignore` - Ficheiros a ignorar no Git
- `.env.example` - Exemplo de configuração Azure
- `vercel.json` - Configuração para Vercel
- `netlify.toml` - Configuração para Netlify
- `deploy-azure.sh` - Script deployment Azure

#### 📚 **Documentação**
- `documentation.html` - Documentação técnica completa
- `GITHUB_SETUP.md` - Guia setup GitHub
- `AZURE_SETUP.md` - Guia configuração Azure  
- `DEPLOY_GUIDE.md` - Guia deployment rápido
- `FINAL_CHECKLIST.md` - Checklist completo

#### 🤖 **GitHub Actions (Pasta .github/workflows/)**
- `deploy-pages.yml` - Deploy automático GitHub Pages
- `azure-deploy.yml` - Deploy automático Azure
- `ci.yml` - Pipeline CI/CD

#### 🗄️ **Database (Opcional)**
- `setup-database.js` - Script configuração BD
- `import-csv.js` - Script importação dados

---

## 🚀 Como fazer Upload para GitHub

### **Opção 1: Interface Web (Recomendado para iniciantes)**

1. **Criar conta GitHub:**
   - Ir para https://github.com
   - Sign up com email corporativo
   - Verificar email

2. **Criar repositório:**
   - New Repository
   - Nome: `finops-dashboard`
   - Descrição: `FinOps Start/Stop Status Dashboard with Azure Integration`
   - ✅ Public
   - ✅ Add README file
   - Create repository

3. **Upload ficheiros:**
   - No repositório: clicar "uploading an existing file"
   - **ARRASTAR TODOS os ficheiros desta pasta**
   - Commit message: `Initial FinOps Dashboard upload with Azure integration`
   - Commit changes

4. **Ativar GitHub Pages:**
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: main → /root
   - Save

5. **Aguardar e aceder:**
   - Aguardar 5-10 minutos
   - URL: `https://seu-username.github.io/finops-dashboard`

### **Opção 2: Git Command Line**

```bash
# Navegar para esta pasta
cd github-upload

# Inicializar Git
git init
git remote add origin https://github.com/seu-username/finops-dashboard.git

# Upload todos os ficheiros
git add .
git commit -m "Initial commit: FinOps Dashboard with Azure integration"
git branch -M main
git push -u origin main
```

---

## ✅ Checklist de Upload

### Antes do upload:
- [ ] Conta GitHub criada e verificada
- [ ] Repositório `finops-dashboard` criado  
- [ ] Todos os ficheiros desta pasta selecionados

### Após upload:
- [ ] Verificar se todos os ficheiros apareceram no GitHub
- [ ] Ativar GitHub Pages (Settings → Pages)
- [ ] Aguardar 5-10 minutos
- [ ] Testar URL: `https://seu-username.github.io/finops-dashboard`

### Funcionalidades a testar:
- [ ] Dashboard carrega corretamente
- [ ] Tabela mostra dados do CSV
- [ ] Filtros funcionam
- [ ] Export CSV funciona
- [ ] Design responsivo (testar mobile)

---

## 🎯 Opções de Deployment

### **GitHub Pages** (Gratuito - Ativação automática)
- ✅ **Custo:** Gratuito
- ✅ **Tempo:** 5 minutos
- ⚠️ **Limitação:** Apenas frontend
- 🌐 **URL:** `https://seu-username.github.io/finops-dashboard`

### **Vercel** (Deploy em 1 clique)
- ✅ **Custo:** Gratuito
- ✅ **Backend:** Suportado
- ✅ **Tempo:** 2 minutos
- 🌐 **Como:** https://vercel.com → Import Git Repository

### **Netlify** (Alternativa Vercel)
- ✅ **Custo:** Gratuito  
- ✅ **Funcional:** Bom suporte
- ✅ **Tempo:** 3 minutos
- 🌐 **Como:** https://netlify.com → New site from Git

### **GitHub Codespaces** (Desenvolvimento)
- ✅ **Custo:** 60h grátis/mês
- ✅ **Full Stack:** Todas as funcionalidades
- ✅ **Azure:** Integração completa
- 🌐 **Como:** No repo → Code → Codespaces → Create

---

## 🆘 Problemas Comuns

### **Site não aparece após 10 minutos:**
- Verificar Settings → Pages está ativado
- Verificar Actions → Pages build (deve estar verde)
- Tentar aceder em browser privado

### **Ficheiros em falta:**
- Verificar se TODOS os ficheiros desta pasta foram uploaded
- Especialmente: `.github/workflows/` com os 3 ficheiros

### **Dados não carregam:**
- Verificar se `data.csv` foi uploaded
- Abrir DevTools (F12) → Console para ver erros

### **Azure integration não funciona:**
- Normal sem configuração
- Precisa configurar secrets no GitHub
- Ver `AZURE_SETUP.md` para detalhes

---

## 📞 Suporte

1. **Primeiro:** Consultar `FINAL_CHECKLIST.md`
2. **Problemas técnicos:** Ver `GITHUB_SETUP.md`  
3. **Azure:** Ver `AZURE_SETUP.md`
4. **Issues:** Abrir issue no GitHub após upload

---

**🎉 Em 5 minutos terá o dashboard FinOps online e acessível a toda a equipa!**

**📍 Localização dos ficheiros:** `C:\Users\m89500079\apptio-project\New folder\New folder\github-upload\`