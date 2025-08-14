# 🔧 Configuração da Integração Azure

## Pré-requisitos

1. **Azure CLI instalado**
   ```bash
   # Instalar Azure CLI
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   # ou no Windows: Download do site oficial
   ```

2. **Node.js 18+ instalado**
3. **Permissões Azure adequadas**

## 🔑 Autenticação Azure

### Opção 1: Azure CLI (Desenvolvimento)
```bash
# Login no Azure
az login

# Verificar subscriptions disponíveis  
az account list --output table

# Definir subscription padrão (se necessário)
az account set --subscription "subscription-id"
```

### Opção 2: Service Principal (Produção)
```bash
# Criar Service Principal
az ad sp create-for-rbac --name "finops-dashboard-sp" \
  --role "Reader" \
  --scopes "/subscriptions/YOUR-SUBSCRIPTION-ID"

# Output exemplo:
{
  "appId": "12345678-1234-1234-1234-123456789012",
  "displayName": "finops-dashboard-sp", 
  "password": "your-client-secret",
  "tenant": "87654321-4321-4321-4321-210987654321"
}
```

## 📝 Configuração de Variáveis de Ambiente

1. **Copiar arquivo de exemplo:**
   ```bash
   cp .env.example .env
   ```

2. **Editar .env com suas configurações:**
   ```env
   # Para Service Principal
   AZURE_CLIENT_ID=12345678-1234-1234-1234-123456789012
   AZURE_CLIENT_SECRET=your-client-secret  
   AZURE_TENANT_ID=87654321-4321-4321-4321-210987654321

   # Subscriptions (separadas por vírgula)
   AZURE_SUBSCRIPTIONS=subscription-id-1,subscription-id-2

   # Sincronização automática
   ENABLE_AUTO_SYNC=true
   AZURE_SYNC_INTERVAL_MINUTES=15
   ```

## 🚀 Instalação e Teste

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Testar conexão Azure:**
   ```bash
   # Iniciar servidor
   npm start
   
   # Em outro terminal, testar endpoint
   curl http://localhost:3000/api/azure/test
   ```

3. **Sincronizar dados:**
   - Abrir http://localhost:3000
   - Clicar em "Sync Azure"
   - Aguardar sincronização completar

## 🔍 Verificação de Permissões

### Permissões Mínimas Necessárias:
- **Reader** nas subscriptions Azure
- **Virtual Machine Contributor** (para ações Start/Stop futuras)

### Verificar permissões:
```bash
# Listar role assignments
az role assignment list --assignee "service-principal-object-id" --output table

# Testar acesso às VMs
az vm list --subscription "subscription-id" --output table
```

## 📊 Dados Extraídos das VMs

### Informações Coletadas:
- ✅ Nome da VM (computer_name)
- ✅ Estado atual (running, stopped, deallocated)
- ✅ Tamanho da VM (Standard_B2ms, etc.)
- ✅ Localização (North Europe, West Europe)
- ✅ Resource Group
- ✅ Subscription
- ✅ Tags (para App Name, Owner, Environment)
- ✅ OS Type (Windows/Linux)
- ✅ Provisioning State

### Mapeamento de Estados:
```javascript
'running' → 'Activo'
'stopped' → 'Inactivo'
'deallocated' → 'Inactivo'  
'starting' → 'Agendamento em progresso'
'stopping' → 'Agendamento em progresso'
```

## 🏷️ Tags Recomendadas nas VMs

Para melhor organização, adicione estas tags às suas VMs:

```json
{
  "Environment": "DV|DR|PR",
  "Application": "Nome da aplicação",
  "Owner": "Responsável pela VM",
  "Schedule": "Horário Start/Stop",
  "CostCenter": "Centro de custos",
  "Department": "Departamento"
}
```

## 🔧 Troubleshooting

### Erro: "Failed to fetch Azure VMs"
```bash
# Verificar login
az account show

# Re-login se necessário
az login

# Verificar subscriptions
az account list
```

### Erro: "Insufficient permissions"
```bash
# Verificar permissões
az role assignment list --assignee $(az account show --query user.name -o tsv)

# Solicitar permissões ao admin Azure
```

### Erro: "No VMs found"
```bash
# Verificar se há VMs na subscription
az vm list --subscription "subscription-id" 

# Verificar se subscription está correta no .env
```

### Erro de dependências Node.js
```bash
# Limpar cache e reinstalar
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📈 Monitorização

### Logs de Sincronização:
```bash
# Ver logs do servidor
tail -f server.log

# Ver logs no browser
F12 → Console → Ver mensagens de Azure sync
```

### Endpoints de Monitorização:
- `GET /api/azure/test` - Testa conexão
- `GET /api/azure/vms` - Lista VMs directo do Azure  
- `GET /api/azure/sync` - Sincroniza com CSV
- `GET /api/health` - Status geral da aplicação

## 🔒 Segurança

### Boas Práticas:
1. **Nunca commitar .env** no Git
2. **Usar Service Principal** em produção
3. **Princípio do menor privilégio** - apenas Reader
4. **Rotação de secrets** regulares
5. **Logs de auditoria** habilitados

### Arquivo .gitignore:
```gitignore
.env
.env.local
.env.production
*.log
node_modules/
```

## 📞 Suporte

Em caso de problemas:
1. Verificar logs da aplicação
2. Testar endpoints de diagnóstico  
3. Verificar permissões Azure
4. Contactar administrador Azure
5. Consultar documentação Azure SDK

---
**Nota:** Esta integração lê dados das VMs existentes. Para funcionalidades Start/Stop automático, são necessárias permissões adicionais.