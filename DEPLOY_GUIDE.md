# 🚀 Guia de Deployment Rápido

## 🎯 Opções de Deployment

### 1. 🌟 GitHub Pages (Recomendado para início)
**✅ Gratuito | ✅ Fácil | ⚠️ Apenas Frontend**

1. **Criar conta GitHub:** https://github.com
2. **Criar repositório:** `finops-dashboard`
3. **Upload ficheiros:** Arrastar todos os ficheiros para o repositório
4. **Ativar GitHub Pages:**
   - Settings → Pages → Source: Deploy from branch → main → Save
5. **URL:** `https://seu-username.github.io/finops-dashboard`

### 2. ⚡ Vercel (Deploy em 1 clique)
**✅ Gratuito | ✅ Backend | ✅ Domínio personalizado**

1. **Ir para:** https://vercel.com
2. **Import Git Repository:** Conectar seu GitHub
3. **Deploy automático:** 1-2 minutos
4. **URL:** `https://finops-dashboard-xxx.vercel.app`

### 3. 🌐 Netlify (Alternativa Vercel)
**✅ Gratuito | ✅ Funcional | ✅ Forms**

1. **Ir para:** https://netlify.com
2. **New site from Git:** Conectar GitHub
3. **Deploy automático**
4. **URL:** `https://finops-dashboard-xxx.netlify.app`

### 4. 💻 GitHub Codespaces (Desenvolvimento)
**✅ 60h grátis/mês | ✅ Full Stack | ✅ Azure Integration**

1. **No repositório GitHub:** Code → Codespaces → Create
2. **Executar:** `npm install && npm start`
3. **URL gerada automaticamente**

### 5. ☁️ Azure App Service (Produção)
**💰 Pago | ✅ Empresarial | ✅ Todas funcionalidades**

1. **Usar script:** `./deploy-azure.sh`
2. **Ou GitHub Actions:** Automático após setup
3. **URL:** `https://finops-dashboard.azurewebsites.net`

## 🚀 Deploy em 5 Minutos (GitHub Pages)

### Passo 1: Criar conta GitHub
- Ir para https://github.com
- Sign up com email corporativo
- Verificar email

### Passo 2: Criar repositório
- New Repository
- Nome: `finops-dashboard`
- Public ✅
- Add README ✅

### Passo 3: Upload ficheiros
- No repositório: "uploading an existing file"
- Arrastar TODOS os ficheiros do projeto
- Commit message: `Initial FinOps Dashboard upload`
- Commit changes

### Passo 4: Ativar GitHub Pages
- Settings → Pages
- Source: Deploy from branch
- Branch: main / root
- Save

### Passo 5: Aceder site
- URL: `https://seu-username.github.io/finops-dashboard`
- Aguardar 2-5 minutos para ativar

## 🔧 Setup para Backend (Opcional)

### Para funcionalidades Azure:

1. **GitHub Secrets:**
   - Settings → Secrets → Actions
   - Adicionar: `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `AZURE_TENANT_ID`

2. **Azure CLI:**
   ```bash
   # Criar Service Principal
   az ad sp create-for-rbac --name "finops-dashboard"
   ```

3. **Deploy:**
   - Push para GitHub
   - Actions executam automaticamente

## 📊 Comparação de Opções

| Plataforma | Custo | Tempo Setup | Backend | Azure | URL Personalizada |
|------------|-------|-------------|---------|-------|-------------------|
| GitHub Pages | Gratuito | 5 min | ❌ | ❌ | ❌ |
| Vercel | Gratuito | 3 min | ✅ | ✅ | ✅ |
| Netlify | Gratuito | 3 min | Parcial | ❌ | ✅ |
| Codespaces | 60h grátis | 2 min | ✅ | ✅ | ❌ |
| Azure | €10+/mês | 15 min | ✅ | ✅ | ✅ |

## 🔄 Atualizações

### GitHub Pages:
1. Editar ficheiros no GitHub
2. Commit changes
3. Deploy automático (3-5 min)

### Vercel/Netlify:
1. Push para GitHub
2. Deploy automático (1-2 min)

### Azure:
1. Push para GitHub
2. GitHub Actions deploy (5-10 min)

## 🎯 Recomendação por Caso

### **Para demonstração rápida:**
→ **GitHub Pages** (5 minutos, gratuito)

### **Para desenvolvimento:**
→ **GitHub Codespaces** (full stack, Azure integration)

### **Para produção simples:**
→ **Vercel** (rápido, confiável, gratuito)

### **Para produção empresarial:**
→ **Azure App Service** (todas as funcionalidades)

## 🆘 Problemas Comuns

### Site não aparece:
- Aguardar 5-10 minutos
- Verificar Actions → Pages build
- Settings → Pages deve estar configurado

### Backend não funciona:
- GitHub Pages não suporta Node.js
- Usar Vercel ou Azure para backend

### Azure integration erro:
- Verificar secrets configurados
- Testar `az login` localmente

## 📞 Suporte

1. **GitHub Issues:** Para bugs e problemas
2. **Documentação:** GITHUB_SETUP.md para detalhes
3. **Azure Setup:** AZURE_SETUP.md para configuração

---

**🎉 Em poucos minutos terá o site online e acessível por qualquer pessoa!**