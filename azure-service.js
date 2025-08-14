const { ComputeManagementClient } = require('@azure/arm-compute');
const { DefaultAzureCredential, ClientSecretCredential } = require('@azure/identity');
require('dotenv').config();

class AzureVMService {
    constructor() {
        this.subscriptions = process.env.AZURE_SUBSCRIPTIONS ? 
            process.env.AZURE_SUBSCRIPTIONS.split(',') : 
            ['DDD-DV', 'DSP-Infra-PR', 'CAS-CALAB-DV']; // Baseado no CSV
        
        this.credential = this.createCredential();
        this.clients = new Map();
        
        // Inicializar clients para cada subscription
        this.subscriptions.forEach(subscriptionId => {
            this.clients.set(subscriptionId, new ComputeManagementClient(this.credential, subscriptionId));
        });
    }
    
    createCredential() {
        // Tentar autenticação por Service Principal primeiro
        if (process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET && process.env.AZURE_TENANT_ID) {
            console.log('Using Service Principal authentication');
            return new ClientSecretCredential(
                process.env.AZURE_TENANT_ID,
                process.env.AZURE_CLIENT_ID,
                process.env.AZURE_CLIENT_SECRET
            );
        }
        
        // Fallback para DefaultAzureCredential (Azure CLI, Managed Identity, etc.)
        console.log('Using Default Azure Credential');
        return new DefaultAzureCredential();
    }
    
    async getAllVMs() {
        console.log('Fetching VMs from Azure subscriptions:', this.subscriptions);
        const allVMs = [];
        
        for (const subscriptionId of this.subscriptions) {
            try {
                const client = this.clients.get(subscriptionId);
                const vms = await this.getVMsFromSubscription(client, subscriptionId);
                allVMs.push(...vms);
                console.log(`Found ${vms.length} VMs in subscription ${subscriptionId}`);
            } catch (error) {
                console.error(`Error fetching VMs from subscription ${subscriptionId}:`, error.message);
                // Continuar com outras subscriptions mesmo se uma falhar
            }
        }
        
        console.log(`Total VMs found: ${allVMs.length}`);
        return allVMs;
    }
    
    async getVMsFromSubscription(client, subscriptionId) {
        const vms = [];
        
        try {
            // Listar todos os Resource Groups
            const resourceGroups = [];
            for await (const rg of client.resourceGroups.list()) {
                resourceGroups.push(rg.name);
            }
            
            console.log(`Found ${resourceGroups.length} resource groups in ${subscriptionId}`);
            
            // Para cada Resource Group, listar VMs
            for (const rgName of resourceGroups) {
                try {
                    for await (const vm of client.virtualMachines.list(rgName)) {
                        // Buscar detalhes adicionais da VM
                        const vmDetails = await this.getVMDetails(client, rgName, vm.name);
                        const processedVM = this.processVMData(vmDetails, subscriptionId);
                        vms.push(processedVM);
                    }
                } catch (error) {
                    console.warn(`Error listing VMs in RG ${rgName}:`, error.message);
                }
            }
        } catch (error) {
            console.error(`Error accessing subscription ${subscriptionId}:`, error.message);
            throw error;
        }
        
        return vms;
    }
    
    async getVMDetails(client, resourceGroupName, vmName) {
        try {
            // Buscar detalhes da VM incluindo status de power
            const [vmDetails, instanceView] = await Promise.all([
                client.virtualMachines.get(resourceGroupName, vmName),
                client.virtualMachines.instanceView(resourceGroupName, vmName).catch(() => null)
            ]);
            
            return {
                ...vmDetails,
                instanceView: instanceView
            };
        } catch (error) {
            console.warn(`Error getting VM details for ${vmName}:`, error.message);
            return null;
        }
    }
    
    processVMData(vm, subscriptionId) {
        if (!vm) return null;
        
        // Determinar estado da VM
        const powerState = this.getPowerState(vm.instanceView);
        const startStopStatus = this.mapPowerStateToStatus(powerState);
        
        // Determinar ambiente baseado no nome ou tags
        const ambiente = this.determineEnvironment(vm.name, vm.tags, subscriptionId);
        
        // Extrair informações de tags se disponíveis
        const tags = vm.tags || {};
        
        return {
            computer_name: vm.name,
            estado_start_stop: startStopStatus,
            ambiente: ambiente,
            app_name: tags.Application || tags['app-name'] || tags.AppName || '',
            owner: tags.Owner || tags.owner || tags.CreatedBy || '',
            resource_group: vm.id.split('/')[4], // Extrair RG do resource ID
            subscription: subscriptionId,
            location: vm.location,
            size: vm.hardwareProfile?.vmSize || 'Unknown',
            schedule: tags.Schedule || tags['auto-shutdown-schedule'] || '',
            // Campos adicionais do Azure
            vm_id: vm.vmId,
            provisioning_state: vm.provisioningState,
            power_state: powerState,
            os_type: vm.storageProfile?.osDisk?.osType || 'Unknown',
            created_time: vm.timeCreated,
            zones: vm.zones ? vm.zones.join(',') : '',
            // Tags completas para referência
            all_tags: JSON.stringify(tags)
        };
    }
    
    getPowerState(instanceView) {
        if (!instanceView || !instanceView.statuses) {
            return 'Unknown';
        }
        
        const powerStatus = instanceView.statuses.find(
            status => status.code && status.code.startsWith('PowerState/')
        );
        
        if (powerStatus) {
            return powerStatus.code.replace('PowerState/', '');
        }
        
        return 'Unknown';
    }
    
    mapPowerStateToStatus(powerState) {
        const stateMapping = {
            'running': 'Activo',
            'stopped': 'Inactivo',
            'deallocated': 'Inactivo',
            'starting': 'Agendamento em progresso',
            'stopping': 'Agendamento em progresso',
            'deallocating': 'Agendamento em progresso'
        };
        
        return stateMapping[powerState.toLowerCase()] || 'Desconhecido';
    }
    
    determineEnvironment(vmName, tags, subscriptionId) {
        // Primeiro tentar por tags
        if (tags.Environment) return tags.Environment.toUpperCase();
        if (tags.Env) return tags.Env.toUpperCase();
        
        // Depois por subscription ID/nome
        if (subscriptionId.includes('DV') || subscriptionId.includes('Dev')) return 'DV';
        if (subscriptionId.includes('PR') || subscriptionId.includes('Prod')) return 'PR';
        if (subscriptionId.includes('DR')) return 'DR';
        
        // Por último pelo nome da VM
        const vmLower = vmName.toLowerCase();
        if (vmLower.includes('-dv-') || vmLower.includes('dev')) return 'DV';
        if (vmLower.includes('-pr-') || vmLower.includes('prod')) return 'PR';
        if (vmLower.includes('-dr-') || vmLower.includes('disaster')) return 'DR';
        
        return 'Unknown';
    }
    
    async syncWithCSV(csvData) {
        console.log('Starting Azure VM sync with CSV data...');
        
        try {
            const azureVMs = await this.getAllVMs();
            const csvVMNames = csvData.map(row => row.computer_name?.toLowerCase()).filter(Boolean);
            
            // Combinar dados: Azure VMs com dados do CSV
            const combinedData = [];
            
            // Processar VMs do Azure
            for (const azureVM of azureVMs) {
                if (!azureVM) continue;
                
                const csvMatch = csvData.find(
                    csvRow => csvRow.computer_name?.toLowerCase() === azureVM.computer_name.toLowerCase()
                );
                
                if (csvMatch) {
                    // Combinar dados do Azure com CSV (Azure tem prioridade para dados técnicos)
                    combinedData.push({
                        ...csvMatch,
                        // Sobrescrever com dados do Azure
                        computer_name: azureVM.computer_name,
                        estado_start_stop: azureVM.estado_start_stop,
                        resource_group: azureVM.resource_group,
                        subscription: azureVM.subscription,
                        location: azureVM.location,
                        size: azureVM.size,
                        // Manter dados do CSV se Azure não tiver
                        ambiente: azureVM.ambiente !== 'Unknown' ? azureVM.ambiente : (csvMatch.ambiente || azureVM.ambiente),
                        app_name: azureVM.app_name || csvMatch.app_name || '',
                        owner: azureVM.owner || csvMatch.owner || '',
                        schedule: azureVM.schedule || csvMatch.schedule || '',
                        // Adicionar campos extras do Azure
                        vm_id: azureVM.vm_id,
                        power_state: azureVM.power_state,
                        os_type: azureVM.os_type,
                        provisioning_state: azureVM.provisioning_state,
                        last_updated: new Date().toISOString()
                    });
                } else {
                    // VM existe no Azure mas não no CSV
                    combinedData.push({
                        ...azureVM,
                        last_updated: new Date().toISOString(),
                        source: 'azure_only'
                    });
                }
            }
            
            // Adicionar VMs do CSV que não existem no Azure
            for (const csvRow of csvData) {
                if (!csvRow.computer_name) continue;
                
                const azureMatch = azureVMs.find(
                    azureVM => azureVM && azureVM.computer_name.toLowerCase() === csvRow.computer_name.toLowerCase()
                );
                
                if (!azureMatch) {
                    combinedData.push({
                        ...csvRow,
                        estado_start_stop: 'Não encontrado no Azure',
                        power_state: 'not_found',
                        last_updated: new Date().toISOString(),
                        source: 'csv_only'
                    });
                }
            }
            
            console.log(`Sync complete. Combined data: ${combinedData.length} VMs`);
            return combinedData;
            
        } catch (error) {
            console.error('Error during Azure sync:', error);
            throw error;
        }
    }
}

module.exports = AzureVMService;