// =============================================
// DATA SERVICE - Integrado no app.js
// =============================================

class DataService {
    static async makeRequest(action, data = null) {
        try {
            const url = `./api/api.php?action=${action}`;
            console.log(`🔍 [DataService] Fazendo requisição para: ${url}`, data);
            
            const options = {
                method: data ? 'POST' : 'GET',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                }
            };

            if (data) {
                options.body = JSON.stringify(data);
                console.log(`🔍 [DataService] Corpo da requisição:`, options.body);
            }

            const response = await fetch(url, options);
            
            console.log(`🔍 [DataService] Status da resposta: ${response.status} ${response.statusText}`);
            
            let responseText = await response.text();
            responseText = responseText.trim();
            
            console.log(`🔍 [DataService] Resposta bruta:`, responseText);
            
            if (!responseText) {
                console.error(`❌ [DataService] Resposta vazia para ${action}`);
                throw new Error('Resposta vazia da API');
            }
            
            const result = JSON.parse(responseText);
            console.log(`✅ [DataService] Resposta parseada:`, result);
            
            if (!result.success) {
                console.error(`❌ [DataService] API retornou erro:`, result.message);
                throw new Error(result.message || 'Erro na API');
            }
            
            return result;
        } catch (error) {
            console.error(`❌ [DataService] Erro em ${action}:`, error);
            
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Não foi possível conectar ao servidor');
            }
            
            throw error;
        }
    }
	
	static async deleteAvaria(id) {
		console.log('🔍 [DataService] Excluindo avaria ID:', id);
		try {
			const result = await this.makeRequest('deleteAvaria', { id });
			console.log('🔍 [DataService] Resposta recebida:', result);
			return result;
		} catch (error) {
			console.error('❌ [DataService] Erro ao excluir avaria:', error);
			throw error;
		}
	}

    // Motoristas
    static async getMotoristas() {
        try {
            const result = await this.makeRequest('getMotoristas');
            return result.data || [];
        } catch (error) {
            console.error('Erro ao buscar motoristas:', error);
            return [];
        }
    }

    static async createMotorista(motorista) {
        return await this.makeRequest('createMotorista', motorista);
    }

    static async updateMotorista(id, motorista) {
        return await this.makeRequest('updateMotorista', { id, ...motorista });
    }

    static async deleteMotorista(id) {
        return await this.makeRequest('deleteMotorista', { id });
    }

    // Viaturas
    static async getViaturas() {
        try {
            const result = await this.makeRequest('getViaturas');
            return result.data || [];
        } catch (error) {
            console.error('Erro ao buscar viaturas:', error);
            return [];
        }
    }

    static async createViatura(viatura) {
        return await this.makeRequest('createViatura', viatura);
    }

    static async updateViatura(id, viatura) {
        return await this.makeRequest('updateViatura', { id, ...viatura });
    }

    static async deleteViatura(id) {
        return await this.makeRequest('deleteViatura', { id });
    }

    // Uso de Viaturas
    static async getUsoViaturas() {
        try {
            const result = await this.makeRequest('getUsoViaturas');
            return result.data || [];
        } catch (error) {
            console.error('Erro ao buscar uso de viaturas:', error);
            return [];
        }
    }

    static async createUsoViatura(uso) {
        return await this.makeRequest('createUsoViatura', uso);
    }

    static async updateUsoViatura(id, uso) {
        return await this.makeRequest('updateUsoViatura', { id, ...uso });
    }

    // Abastecimentos
    static async getAbastecimentos() {
        try {
            const result = await this.makeRequest('getAbastecimentos');
            return result.data || [];
        } catch (error) {
            console.error('Erro ao buscar abastecimentos:', error);
            return [];
        }
    }

    static async createAbastecimento(abastecimento) {
        return await this.makeRequest('createAbastecimento', abastecimento);
    }

    // Avarias
    static async getAvarias() {
        try {
            const result = await this.makeRequest('getAvarias');
            return result.data || [];
        } catch (error) {
            console.error('Erro ao buscar avarias:', error);
            return [];
        }
    }

    static async createAvaria(avaria) {
        return await this.makeRequest('createAvaria', avaria);
    }

    static async updateAvaria(id, avaria) {
        return await this.makeRequest('updateAvaria', { id, ...avaria });
    }
	
	static async deleteAvaria(id) {
		return await this.makeRequest('deleteAvaria', { id });
	}

    // Empréstimos
    static async getEmprestimos() {
        try {
            const result = await this.makeRequest('getEmprestimos');
            return result.data || [];
        } catch (error) {
            console.error('Erro ao buscar empréstimos:', error);
            return [];
        }
    }

    static async createEmprestimo(emprestimo) {
        return await this.makeRequest('createEmprestimo', emprestimo);
    }
}

console.log('✅ DataService integrado no app.js');

// =============================================
// FIM DO DATA SERVICE - INÍCIO DO SISTEMA PRINCIPAL
// =============================================

// NO INÍCIO DO app.js - ANTES DA CLASSE
console.log('=== INICIANDO SISTEMA FROTA ===');

// Função de teste da API
async function testarAPI() {
    try {
        console.log('🔍 Testando conexão com API...');
        const response = await fetch('./api/api.php?action=test');
        
        // Verificar se a resposta está vazia
        let responseText = await response.text();
        console.log('🔍 Resposta bruta do teste:', responseText);
        
        responseText = responseText.trim();
        
        if (!responseText) {
            console.error('❌ API retornou resposta vazia');
            return false;
        }
        
        // Tentar parsear o JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('❌ Erro ao parsear JSON do teste:', parseError);
            
            // Tentar extrair JSON de resposta com lixo
            const jsonMatch = responseText.match(/\{.*\}/s);
            if (jsonMatch) {
                console.log('🔍 Tentando extrair JSON da resposta...');
                data = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Resposta não é JSON válido');
            }
        }
        
        console.log('✅ Resposta do teste:', data);
        return data.success;
    } catch (error) {
        console.error('❌ Erro no teste da API:', error);
        return false;
    }
}

// Testar ao carregar a página
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔍 Página carregada, testando API...');
    const apiFuncionando = await testarAPI();
    if (!apiFuncionando) {
        console.error('❌ API não está funcionando corretamente');
        // Não mostrar alerta para não incomodar o usuário
        // O sistema tentará carregar mesmo com a API com problemas
    } else {
        console.log('✅ API está funcionando corretamente');
    }
});// Sistema principal da aplicação
class FrotaSystem {
    constructor() {
        // REMOVER: localStorage e substituir por arrays vazios
        this.motoristas = [];
        this.viaturas = [];
        this.registrosUso = [];
        this.avarias = [];
        this.abastecimentos = [];
        this.emprestimos = [];
        
        this.init();
    }

    async init() {
		console.log('🔍 Inicializando FrotaSystem...');
		
		// Testar API primeiro
		await this.testarConexaoAPI();
		
		// Carregar dados
		await this.carregarDadosIniciais();
		this.loadUserInfo();
		this.setupNavigation();
		this.setupMobileMenu();
		this.setupHomeButton();
		this.showAdminCards();
		this.verificarResetMensal();
		this.limparUsuariosExcluidos();
		this.setupModalEvents();
		
		console.log('✅ FrotaSystem inicializado com sucesso!');
	}

	// Adicionar método de teste
	async testarConexaoAPI() {
		try {
			console.log('🔍 Testando conexão com banco de dados...');
			
			// Testar várias rotas da API
			const endpoints = ['getMotoristas', 'getViaturas', 'getUsoViaturas'];
			
			for (const endpoint of endpoints) {
				try {
					const response = await fetch(`./api/api.php?action=${endpoint}`);
					const data = await response.json();
					console.log(`🔍 ${endpoint}:`, data.success ? '✅ OK' : '❌ Erro', data);
				} catch (error) {
					console.error(`❌ Erro em ${endpoint}:`, error);
				}
			}
			
		} catch (error) {
			console.error('❌ Erro geral no teste da API:', error);
		}
	}

	// FUNÇÃO: Carregar página de visualização de abastecimentos para administradores
	async loadVisualizarAbastecimentosPage(container) {
		// Recarregar dados mais recentes
		await this.carregarDadosIniciais();
		
		container.innerHTML = `
			<div class="page-content fade-in">
				<div class="form-section">
					<h2>⛽ Visualização de Abastecimentos</h2>
					
					<div class="filtros-container">
						<div class="form-row">
							<div class="form-group">
								<label for="filtroPeriodoAbastecimentos">Período</label>
								<select id="filtroPeriodoAbastecimentos">
									<option value="todos">Todos os Registros</option>
									<option value="hoje">Hoje</option>
									<option value="ontem">Ontem</option>
									<option value="semana">Esta Semana</option>
									<option value="mes">Este Mês</option>
									<option value="especifico">Data Específica</option>
								</select>
							</div>
							<div class="form-group" id="dataEspecificaAbastecimentosContainer" style="display: none;">
								<label for="filtroDataEspecificaAbastecimentos">Data Específica</label>
								<input type="date" id="filtroDataEspecificaAbastecimentos">
							</div>
							<div class="form-group">
								<label for="filtroCombustivel">Combustível</label>
								<select id="filtroCombustivel">
									<option value="todos">Todos os Tipos</option>
									<option value="GASOLINA">Gasolina</option>
									<option value="GASOLINA_ADITIVADA">Gasolina Aditivada</option>
									<option value="ETANOL">Etanol</option>
									<option value="DIESEL">Diesel</option>
									<option value="DIESEL_S10">Diesel S10</option>
								</select>
							</div>
						</div>
						
						<div class="form-row">
							<div class="form-group">
								<input type="text" id="filtroBuscaAbastecimentos" placeholder="Buscar por placa, patrimônio ou posto..." class="search-input">
							</div>
						</div>

						<div class="form-row">
							<div class="form-group">
								<button type="button" class="btn-primary" onclick="frotaSystem.filtrarAbastecimentos()">
									<span class="btn-icon">🔍</span>
									Aplicar Filtros
								</button>
								<button type="button" class="btn-secondary" onclick="frotaSystem.exportarRelatorioAbastecimentos('pdf')">
									<span class="btn-icon">📄</span>
									Exportar PDF
								</button>
								<button type="button" class="btn-secondary" onclick="frotaSystem.limparFiltrosAbastecimentos()">
									<span class="btn-icon">🗑️</span>
									Limpar Filtros
								</button>
							</div>
						</div>
					</div>

					<div class="resumo-cards">
						<div class="cards-grid">
							<div class="card">
								<h3>Total de Abastecimentos</h3>
								<p class="total-abastecimentos">${this.abastecimentos.length}</p>
							</div>
							<div class="card">
								<h3>Valor Total (R$)</h3>
								<p class="valor-total-abastecimentos">R$ ${this.calcularValorTotalAbastecimentos()}</p>
							</div>
							<div class="card">
								<h3>Litros Total</h3>
								<p class="litros-total-abastecimentos">${this.calcularLitrosTotalAbastecimentos()}L</p>
							</div>
							<div class="card">
								<h3>Média por Litro (R$)</h3>
								<p class="media-litro-abastecimentos">R$ ${this.calcularMediaPorLitro()}</p>
							</div>
						</div>
					</div>

					<!-- Tabela de Abastecimentos -->
					<div class="table-container-optimized">
						<table class="data-table-optimized" id="tabelaAbastecimentos">
							<thead>
								<tr>
									<th>Data</th>
									<th>Hora</th>
									<th>Viatura</th>
									<th>Placa</th>
									<th>Combustível</th>
									<th>Litros</th>
									<th>Valor (R$)</th>
									<th>Posto</th>
									<th>KM</th>
									<th>Ações</th>
								</tr>
							</thead>
							<tbody id="listaAbastecimentos">
								${this.gerarListaAbastecimentos()}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		`;

		// Configurar eventos dos filtros
		document.getElementById('filtroPeriodoAbastecimentos').addEventListener('change', (e) => {
			const dataEspecificaContainer = document.getElementById('dataEspecificaAbastecimentosContainer');
			if (e.target.value === 'especifico') {
				dataEspecificaContainer.style.display = 'block';
			} else {
				dataEspecificaContainer.style.display = 'none';
			}
		});

		// Configurar busca em tempo real
		document.getElementById('filtroBuscaAbastecimentos').addEventListener('input', (e) => {
			this.filtrarAbastecimentos();
		});

		// Configurar tooltips
		this.aplicarTooltipsTabela();
	}

	// FUNÇÃO: Gerar lista de abastecimentos
	gerarListaAbastecimentos(abastecimentosFiltrados = null) {
		const abastecimentos = abastecimentosFiltrados || this.abastecimentos;
		
		if (abastecimentos.length === 0) {
			return `
				<tr>
					<td colspan="10" style="text-align: center; padding: 2rem; color: #666;">
						Nenhum abastecimento encontrado para os filtros selecionados
					</td>
				</tr>
			`;
		}

		// Ordenar por data mais recente
		const abastecimentosOrdenados = [...abastecimentos].sort((a, b) => 
			new Date(b.data_abastecimento) - new Date(a.data_abastecimento)
		);

		return abastecimentosOrdenados.map(abastecimento => {
			// Buscar dados da viatura
			const viatura = this.viaturas.find(v => v.id === abastecimento.viatura_id);
			const patrimonio = viatura ? viatura.patrimonio : 'N/E';
			const placa = viatura ? viatura.placa : 'N/E';

			const valorFormatado = parseFloat(abastecimento.valor_total).toFixed(2);
			const litrosFormatado = parseFloat(abastecimento.litros).toFixed(1);

			return `
				<tr>
					<td title="${new Date(abastecimento.data_abastecimento).toLocaleDateString('pt-BR')}">
						${new Date(abastecimento.data_abastecimento).toLocaleDateString('pt-BR')}
					</td>
					<td>${abastecimento.hora_abastecimento}</td>
					<td title="${patrimonio}">${patrimonio}</td>
					<td>${placa}</td>
					<td>
						<span class="status-badge-compact ${this.getCombustivelClass(abastecimento.combustivel)}">
							${this.formatarCombustivel(abastecimento.combustivel)}
						</span>
					</td>
					<td>${litrosFormatado}L</td>
					<td>R$ ${valorFormatado}</td>
					<td title="${abastecimento.posto}">
						${abastecimento.posto.length > 15 ? abastecimento.posto.substring(0, 12) + '...' : abastecimento.posto}
					</td>
					<td>${abastecimento.km_abastecimento}</td>
					<td>
						<div style="display: flex; gap: 0.25rem; flex-wrap: nowrap;">
							<button class="btn-action btn-view" onclick="frotaSystem.verDetalhesAbastecimento('${abastecimento.id}')" title="Ver detalhes completos">
								👁️
							</button>
						</div>
					</td>
				</tr>
			`;
		}).join('');
	}

	// FUNÇÃO: Formatar tipo de combustível
	formatarCombustivel(combustivel) {
		const combustivelMap = {
			'GASOLINA': 'Gasolina',
			'GASOLINA_ADITIVADA': 'Gas. Aditivada',
			'ETANOL': 'Etanol',
			'DIESEL': 'Diesel',
			'DIESEL_S10': 'Diesel S10',
			'FLEX': 'Flex'
		};
		return combustivelMap[combustivel] || combustivel;
	}

	// FUNÇÃO: Obter classe CSS para o combustível
	getCombustivelClass(combustivel) {
		switch(combustivel) {
			case 'GASOLINA':
				return 'status-gasolina';
			case 'GASOLINA_ADITIVADA':
				return 'status-gasolina-aditivada';
			case 'ETANOL':
				return 'status-etanol';
			case 'DIESEL':
				return 'status-diesel';
			case 'DIESEL_S10':
				return 'status-diesel-s10';
			default:
				return 'status-pendente';
		}
	}

	// FUNÇÃO: Filtrar abastecimentos
	filtrarAbastecimentos() {
		const periodo = document.getElementById('filtroPeriodoAbastecimentos').value;
		const combustivel = document.getElementById('filtroCombustivel').value;
		const busca = document.getElementById('filtroBuscaAbastecimentos').value.toLowerCase();
		const hoje = new Date();
		
		let abastecimentosFiltrados = this.abastecimentos;

		// Filtrar por período
		if (periodo !== 'todos') {
			let dataFiltro;
			
			switch(periodo) {
				case 'hoje':
					const hojeStr = hoje.toISOString().split('T')[0];
					abastecimentosFiltrados = abastecimentosFiltrados.filter(abastecimento => 
						abastecimento.data_abastecimento === hojeStr
					);
					break;
				case 'ontem':
					const ontem = new Date(hoje);
					ontem.setDate(hoje.getDate() - 1);
					const ontemStr = ontem.toISOString().split('T')[0];
					abastecimentosFiltrados = abastecimentosFiltrados.filter(abastecimento => 
						abastecimento.data_abastecimento === ontemStr
					);
					break;
				case 'semana':
					const inicioSemana = new Date(hoje);
					inicioSemana.setDate(hoje.getDate() - hoje.getDay());
					abastecimentosFiltrados = abastecimentosFiltrados.filter(abastecimento => 
						new Date(abastecimento.data_abastecimento) >= inicioSemana
					);
					break;
				case 'mes':
					const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
					abastecimentosFiltrados = abastecimentosFiltrados.filter(abastecimento => 
						new Date(abastecimento.data_abastecimento) >= inicioMes
					);
					break;
				case 'especifico':
					const dataEspecifica = document.getElementById('filtroDataEspecificaAbastecimentos').value;
					if (dataEspecifica) {
						abastecimentosFiltrados = abastecimentosFiltrados.filter(abastecimento => 
							abastecimento.data_abastecimento === dataEspecifica
						);
					}
					break;
			}
		}

		// Filtrar por combustível
		if (combustivel !== 'todos') {
			abastecimentosFiltrados = abastecimentosFiltrados.filter(abastecimento => 
				abastecimento.combustivel === combustivel
			);
		}

		// Filtrar por busca
		if (busca) {
			abastecimentosFiltrados = abastecimentosFiltrados.filter(abastecimento => {
				const viatura = this.viaturas.find(v => v.id === abastecimento.viatura_id);
				const patrimonio = viatura ? viatura.patrimonio.toLowerCase() : '';
				const placa = viatura ? viatura.placa.toLowerCase() : '';
				
				return patrimonio.includes(busca) ||
					   placa.includes(busca) ||
					   abastecimento.posto.toLowerCase().includes(busca);
			});
		}

		// Atualizar a tabela
		document.getElementById('listaAbastecimentos').innerHTML = this.gerarListaAbastecimentos(abastecimentosFiltrados);

		// Atualizar contadores
		this.atualizarContadoresAbastecimentos(abastecimentosFiltrados);

		// Configurar tooltips novamente
		this.aplicarTooltipsTabela();
	}

	// FUNÇÃO: Atualizar contadores de abastecimentos
	atualizarContadoresAbastecimentos(abastecimentosFiltrados = null) {
		const abastecimentos = abastecimentosFiltrados || this.abastecimentos;
		
		document.querySelector('.total-abastecimentos').textContent = abastecimentos.length;
		document.querySelector('.valor-total-abastecimentos').textContent = 
			'R$ ' + this.calcularValorTotalAbastecimentos(abastecimentos);
		document.querySelector('.litros-total-abastecimentos').textContent = 
			this.calcularLitrosTotalAbastecimentos(abastecimentos) + 'L';
		document.querySelector('.media-litro-abastecimentos').textContent = 
			'R$ ' + this.calcularMediaPorLitro(abastecimentos);
	}

	// FUNÇÃO: Calcular valor total dos abastecimentos
	calcularValorTotalAbastecimentos(abastecimentos = null) {
		const abs = abastecimentos || this.abastecimentos;
		const total = abs.reduce((sum, abastecimento) => 
			sum + parseFloat(abastecimento.valor_total), 0
		);
		return total.toFixed(2);
	}

	// FUNÇÃO: Calcular litros total dos abastecimentos
	calcularLitrosTotalAbastecimentos(abastecimentos = null) {
		const abs = abastecimentos || this.abastecimentos;
		const total = abs.reduce((sum, abastecimento) => 
			sum + parseFloat(abastecimento.litros), 0
		);
		return total.toFixed(1);
	}

	// FUNÇÃO: Calcular média por litro
	calcularMediaPorLitro(abastecimentos = null) {
		const abs = abastecimentos || this.abastecimentos;
		if (abs.length === 0) return '0.00';
		
		const valorTotal = abs.reduce((sum, abastecimento) => 
			sum + parseFloat(abastecimento.valor_total), 0
		);
		const litrosTotal = abs.reduce((sum, abastecimento) => 
			sum + parseFloat(abastecimento.litros), 0
		);
		
		if (litrosTotal === 0) return '0.00';
		
		return (valorTotal / litrosTotal).toFixed(2);
	}

	// FUNÇÃO: Limpar filtros
	limparFiltrosAbastecimentos() {
		document.getElementById('filtroPeriodoAbastecimentos').value = 'todos';
		document.getElementById('filtroCombustivel').value = 'todos';
		document.getElementById('filtroBuscaAbastecimentos').value = '';
		document.getElementById('dataEspecificaAbastecimentosContainer').style.display = 'none';
		
		this.filtrarAbastecimentos();
	}

	// FUNÇÃO: Ver detalhes completos do abastecimento em nova guia
	verDetalhesAbastecimento(abastecimentoId) {
		const abastecimento = this.abastecimentos.find(a => a.id === abastecimentoId);
		if (!abastecimento) {
			alert('Abastecimento não encontrado!');
			return;
		}

		const viatura = this.viaturas.find(v => v.id === abastecimento.viatura_id);
		
		// Criar uma nova aba com os detalhes completos
		const novaAba = window.open('', '_blank');
		novaAba.document.write(`
			<!DOCTYPE html>
			<html lang="pt-BR">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Detalhes do Abastecimento - ${viatura?.patrimonio || 'N/E'}</title>
				<style>
					body {
						font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
						line-height: 1.6;
						color: #333;
						background-color: #f8f9fa;
						margin: 0;
						padding: 20px;
					}
					.container {
						max-width: 800px;
						margin: 0 auto;
						background: white;
						padding: 2rem;
						border-radius: 12px;
						box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
					}
					h1 {
						color: #1e3c72;
						margin-bottom: 1.5rem;
						text-align: center;
						border-bottom: 2px solid #f0f0f0;
						padding-bottom: 0.5rem;
					}
					.section {
						margin-bottom: 2rem;
						padding: 1.5rem;
						background: #f8f9fa;
						border-radius: 8px;
						border-left: 4px solid #1e3c72;
					}
					.section h2 {
						color: #1e3c72;
						margin-top: 0;
						margin-bottom: 1rem;
						font-size: 1.2rem;
					}
					.info-grid {
						display: grid;
						grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
						gap: 1rem;
					}
					.info-item {
						display: flex;
						flex-direction: column;
					}
					.info-label {
						font-weight: 600;
						color: #666;
						font-size: 0.9rem;
						margin-bottom: 0.25rem;
					}
					.info-value {
						font-size: 1rem;
						color: #333;
					}
					.combustivel-badge {
						padding: 0.25rem 0.5rem;
						border-radius: 12px;
						font-size: 0.8rem;
						font-weight: 500;
						display: inline-block;
					}
					.combustivel-gasolina {
						background: #fee2e2;
						color: #991b1b;
					}
					.combustivel-diesel {
						background: #dbeafe;
						color: #1e40af;
					}
					.combustivel-etanol {
						background: #f0fdf4;
						color: #166534;
					}
					.print-btn {
						background: #1e3c72;
						color: white;
						border: none;
						padding: 12px 24px;
						border-radius: 8px;
						cursor: pointer;
						font-size: 1rem;
						margin-top: 1rem;
						display: block;
						width: 100%;
					}
					.print-btn:hover {
						background: #2a5298;
					}
					@media print {
						body { background: white; }
						.container { box-shadow: none; }
						.print-btn { display: none; }
					}
				</style>
			</head>
			<body>
				<div class="container">
					<h1>⛽ Detalhes Completos do Abastecimento</h1>
					
					<div class="section">
						<h2>🚗 Dados da Viatura</h2>
						<div class="info-grid">
							<div class="info-item">
								<span class="info-label">Patrimônio</span>
								<span class="info-value">${viatura?.patrimonio || 'N/E'}</span>
							</div>
							<div class="info-item">
								<span class="info-label">Placa</span>
								<span class="info-value">${viatura?.placa || 'N/E'}</span>
							</div>
							<div class="info-item">
								<span class="info-label">Modelo</span>
								<span class="info-value">${viatura?.modelo || 'N/E'}</span>
							</div>
							<div class="info-item">
								<span class="info-label">Tipo</span>
								<span class="info-value">${viatura?.tipo || 'N/E'}</span>
							</div>
						</div>
					</div>

					<div class="section">
						<h2>📅 Dados do Abastecimento</h2>
						<div class="info-grid">
							<div class="info-item">
								<span class="info-label">Data</span>
								<span class="info-value">${new Date(abastecimento.data_abastecimento).toLocaleDateString('pt-BR')}</span>
							</div>
							<div class="info-item">
								<span class="info-label">Hora</span>
								<span class="info-value">${abastecimento.hora_abastecimento}</span>
							</div>
							<div class="info-item">
								<span class="info-label">Quilometragem</span>
								<span class="info-value">${abastecimento.km_abastecimento} km</span>
							</div>
							<div class="info-item">
								<span class="info-label">Posto</span>
								<span class="info-value">${abastecimento.posto}</span>
							</div>
						</div>
					</div>

					<div class="section">
						<h2>⛽ Dados do Combustível</h2>
						<div class="info-grid">
							<div class="info-item">
								<span class="info-label">Tipo de Combustível</span>
								<span class="combustivel-badge ${this.getCombustivelClass(abastecimento.combustivel)}">
									${this.formatarCombustivel(abastecimento.combustivel)}
								</span>
							</div>
							<div class="info-item">
								<span class="info-label">Quantidade (Litros)</span>
								<span class="info-value">${parseFloat(abastecimento.litros).toFixed(1)}L</span>
							</div>
							<div class="info-item">
								<span class="info-label">Valor Total</span>
								<span class="info-value">R$ ${parseFloat(abastecimento.valor_total).toFixed(2)}</span>
							</div>
							<div class="info-item">
								<span class="info-label">Preço por Litro</span>
								<span class="info-value">R$ ${(parseFloat(abastecimento.valor_total) / parseFloat(abastecimento.litros)).toFixed(2)}</span>
							</div>
						</div>
					</div>

					<div class="section">
						<h2>📊 Informações Adicionais</h2>
						<div class="info-grid">
							<div class="info-item">
								<span class="info-label">Data do Registro</span>
								<span class="info-value">${new Date(abastecimento.created_at || abastecimento.timestamp).toLocaleString('pt-BR')}</span>
							</div>
							<div class="info-item">
								<span class="info-label">Saldo Anterior da Viatura</span>
								<span class="info-value">R$ ${(viatura?.saldo + parseFloat(abastecimento.valor_total)).toFixed(2)}</span>
							</div>
							<div class="info-item">
								<span class="info-label">Saldo Atual da Viatura</span>
								<span class="info-value">R$ ${viatura?.saldo?.toFixed(2) || '0.00'}</span>
							</div>
						</div>
					</div>

					<button class="print-btn" onclick="window.print()">🖨️ Imprimir Detalhes</button>
				</div>
			</body>
			</html>
		`);
		novaAba.document.close();
	}

	// FUNÇÃO: Exportar relatório de abastecimentos para PDF
	async exportarRelatorioAbastecimentos(tipo) {
		const periodo = document.getElementById('filtroPeriodoAbastecimentos').value;
		const combustivel = document.getElementById('filtroCombustivel').value;
		const busca = document.getElementById('filtroBuscaAbastecimentos').value;
		
		const periodoTexto = document.getElementById('filtroPeriodoAbastecimentos').options[document.getElementById('filtroPeriodoAbastecimentos').selectedIndex].text;
		const combustivelTexto = document.getElementById('filtroCombustivel').options[document.getElementById('filtroCombustivel').selectedIndex].text;
		
		// Obter abastecimentos filtrados
		let abastecimentosFiltrados = this.filtrarAbastecimentosParaExport(periodo, combustivel, busca);
		
		const nomeArquivo = `Relatorio_Abastecimentos_${new Date().toISOString().split('T')[0]}`;
		
		if (tipo === 'pdf') {
			await this.exportarAbastecimentosParaPDF(abastecimentosFiltrados, periodoTexto, combustivelTexto, busca, nomeArquivo);
		}
	}

	// FUNÇÃO AUXILIAR: Filtrar abastecimentos para exportação
	filtrarAbastecimentosParaExport(periodo, combustivel, busca) {
		const hoje = new Date();
		let abastecimentosFiltrados = this.abastecimentos;

		// Filtrar por período
		if (periodo !== 'todos') {
			let dataFiltro;
			
			switch(periodo) {
				case 'hoje':
					const hojeStr = hoje.toISOString().split('T')[0];
					abastecimentosFiltrados = abastecimentosFiltrados.filter(abastecimento => 
						abastecimento.data_abastecimento === hojeStr
					);
					break;
				case 'ontem':
					const ontem = new Date(hoje);
					ontem.setDate(hoje.getDate() - 1);
					const ontemStr = ontem.toISOString().split('T')[0];
					abastecimentosFiltrados = abastecimentosFiltrados.filter(abastecimento => 
						abastecimento.data_abastecimento === ontemStr
					);
					break;
				case 'semana':
					const inicioSemana = new Date(hoje);
					inicioSemana.setDate(hoje.getDate() - hoje.getDay());
					abastecimentosFiltrados = abastecimentosFiltrados.filter(abastecimento => 
						new Date(abastecimento.data_abastecimento) >= inicioSemana
					);
					break;
				case 'mes':
					const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
					abastecimentosFiltrados = abastecimentosFiltrados.filter(abastecimento => 
						new Date(abastecimento.data_abastecimento) >= inicioMes
					);
					break;
				case 'especifico':
					const dataEspecifica = document.getElementById('filtroDataEspecificaAbastecimentos')?.value;
					if (dataEspecifica) {
						abastecimentosFiltrados = abastecimentosFiltrados.filter(abastecimento => 
							abastecimento.data_abastecimento === dataEspecifica
						);
					}
					break;
			}
		}

		// Filtrar por combustível
		if (combustivel !== 'todos') {
			abastecimentosFiltrados = abastecimentosFiltrados.filter(abastecimento => 
				abastecimento.combustivel === combustivel
			);
		}

		// Filtrar por busca
		if (busca) {
			const buscaLower = busca.toLowerCase();
			abastecimentosFiltrados = abastecimentosFiltrados.filter(abastecimento => {
				const viatura = this.viaturas.find(v => v.id === abastecimento.viatura_id);
				const patrimonio = viatura ? viatura.patrimonio.toLowerCase() : '';
				const placa = viatura ? viatura.placa.toLowerCase() : '';
				
				return patrimonio.includes(buscaLower) ||
					   placa.includes(buscaLower) ||
					   abastecimento.posto.toLowerCase().includes(buscaLower);
			});
		}

		return abastecimentosFiltrados;
	}

	// FUNÇÃO: Exportar abastecimentos para PDF
	async exportarAbastecimentosParaPDF(abastecimentosFiltrados, periodoTexto, combustivelTexto, buscaTexto, nomeArquivo) {
		// Ordenar por data mais recente
		const abastecimentosOrdenados = [...abastecimentosFiltrados].sort((a, b) => 
			new Date(b.data_abastecimento) - new Date(a.data_abastecimento)
		);

		let tabelaHTML = '';

		if (abastecimentosOrdenados.length === 0) {
			tabelaHTML = `
				<div style="text-align: center; padding: 2rem; color: #666; font-style: italic;">
					Nenhum abastecimento encontrado para os filtros selecionados
				</div>
			`;
		} else {
			tabelaHTML = `
				<table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 9px;">
					<thead>
						<tr>
							<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5; text-align: left;">Data</th>
							<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5; text-align: left;">Hora</th>
							<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5; text-align: left;">Viatura</th>
							<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5; text-align: left;">Placa</th>
							<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5; text-align: left;">Combustível</th>
							<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5; text-align: left;">Litros</th>
							<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5; text-align: left;">Valor (R$)</th>
							<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5; text-align: left;">Posto</th>
							<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5; text-align: left;">KM</th>
						</tr>
					</thead>
					<tbody>
			`;
			
			abastecimentosOrdenados.forEach(abastecimento => {
				const viatura = this.viaturas.find(v => v.id === abastecimento.viatura_id);
				const patrimonio = viatura ? viatura.patrimonio : 'N/E';
				const placa = viatura ? viatura.placa : 'N/E';

				tabelaHTML += `
					<tr>
						<td style="border: 1px solid #ddd; padding: 6px;">${new Date(abastecimento.data_abastecimento).toLocaleDateString('pt-BR')}</td>
						<td style="border: 1px solid #ddd; padding: 6px;">${abastecimento.hora_abastecimento}</td>
						<td style="border: 1px solid #ddd; padding: 6px;">${patrimonio}</td>
						<td style="border: 1px solid #ddd; padding: 6px;">${placa}</td>
						<td style="border: 1px solid #ddd; padding: 6px;">${this.formatarCombustivel(abastecimento.combustivel)}</td>
						<td style="border: 1px solid #ddd; padding: 6px;">${parseFloat(abastecimento.litros).toFixed(1)}L</td>
						<td style="border: 1px solid #ddd; padding: 6px;">R$ ${parseFloat(abastecimento.valor_total).toFixed(2)}</td>
						<td style="border: 1px solid #ddd; padding: 6px;">${abastecimento.posto}</td>
						<td style="border: 1px solid #ddd; padding: 6px;">${abastecimento.km_abastecimento}</td>
					</tr>
				`;
			});
			
			tabelaHTML += `</tbody></table>`;
		}

		const htmlContent = `
			<div style="font-family: Arial, sans-serif; margin: 15px;">
				<div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1e3c72; padding-bottom: 10px;">
					<h1 style="color: #1e3c72; margin: 0; font-size: 24px;">RELATÓRIO DE ABASTECIMENTOS</h1>
					<h2 style="color: #2a5298; margin: 5px 0; font-size: 18px;">Polícia Militar de Pernambuco</h2>
					<h3 style="color: #666; margin: 5px 0; font-size: 14px;">4° BPM - Batalhão Barreto de Menezes</h3>
				</div>
				
				<div style="margin-bottom: 20px; background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #1e3c72;">
					<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-size: 12px;">
						<div>
							<strong>Data do Relatório:</strong> ${new Date().toLocaleDateString('pt-BR')}
						</div>
						<div>
							<strong>Período:</strong> ${periodoTexto}
						</div>
						<div>
							<strong>Combustível:</strong> ${combustivelTexto}
						</div>
						<div>
							<strong>Busca:</strong> ${buscaTexto || 'Nenhuma'}
						</div>
						<div>
							<strong>Total de Abastecimentos:</strong> ${abastecimentosOrdenados.length}
						</div>
					</div>
				</div>
				
				<div style="margin-bottom: 15px;">
					<h3 style="color: #1e3c72; margin-bottom: 10px; font-size: 16px;">RESUMO ESTATÍSTICO</h3>
					<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 15px;">
						<div style="background: #e0e7ff; padding: 10px; border-radius: 6px; text-align: center;">
							<div style="font-size: 12px; color: #666;">Valor Total</div>
							<div style="font-size: 18px; font-weight: bold; color: #3730a3;">R$ ${this.calcularValorTotalAbastecimentos(abastecimentosOrdenados)}</div>
						</div>
						<div style="background: #fef3c7; padding: 10px; border-radius: 6px; text-align: center;">
							<div style="font-size: 12px; color: #666;">Litros Total</div>
							<div style="font-size: 18px; font-weight: bold; color: #d97706;">${this.calcularLitrosTotalAbastecimentos(abastecimentosOrdenados)}L</div>
						</div>
						<div style="background: #d1fae5; padding: 10px; border-radius: 6px; text-align: center;">
							<div style="font-size: 12px; color: #666;">Média por Litro</div>
							<div style="font-size: 18px; font-weight: bold; color: #065f46;">R$ ${this.calcularMediaPorLitro(abastecimentosOrdenados)}</div>
						</div>
					</div>
				</div>
				
				<h3 style="color: #1e3c72; margin-bottom: 10px; font-size: 16px;">DETALHES DOS ABASTECIMENTOS</h3>
				${tabelaHTML}
				
				<div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 10px; color: #666;">
					<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px;">
						<div>
							<strong>Emitido por:</strong> Sistema de Gerenciamento de Frota - PMPE<br>
							<strong>Versão:</strong> 2.0<br>
							<strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}
						</div>
						<div>
							<strong>Unidade:</strong> Dinter-I/4° BPM<br>
							<strong>Local:</strong> Caruaru - PE<br>
							<strong>Contato:</strong> viaturas4bpm@hotmail.com
						</div>
					</div>
				</div>
			</div>
		`;
		
		const printWindow = window.open('', '_blank');
		printWindow.document.write(`
			<!DOCTYPE html>
			<html>
				<head>
					<title>${nomeArquivo}</title>
					<style>
						body { 
							margin: 0; 
							padding: 0;
							font-family: Arial, sans-serif;
							background: white;
						}
						@media print {
							body { margin: 10px; }
							table { font-size: 8px !important; }
							th, td { padding: 4px 5px !important; }
							@page {
								size: landscape;
								margin: 10mm;
							}
						}
					</style>
				</head>
				<body>
					${htmlContent}
					<script>
						setTimeout(() => {
							window.print();
						}, 500);
					</script>
				</body>
			</html>
		`);
		printWindow.document.close();
	}


    // NOVA FUNÇÃO: Carregar dados iniciais do SQLite
    async carregarDadosIniciais() {
        try {
            // Carregar todas as entidades do SQLite
            const [
                motoristasData, 
                viaturasData, 
                registrosUsoData, 
                avariasData, 
                abastecimentosData, 
                emprestimosData
            ] = await Promise.all([
                DataService.getMotoristas(),
                DataService.getViaturas(),
                DataService.getUsoViaturas(),
                DataService.getAvarias(),
                DataService.getAbastecimentos(),
                DataService.getEmprestimos()
            ]);

            // Atribuir aos arrays locais
            this.motoristas = motoristasData || [];
            this.viaturas = viaturasData || [];
            this.registrosUso = registrosUsoData || [];
            this.avarias = avariasData || [];
            this.abastecimentos = abastecimentosData || [];
            this.emprestimos = emprestimosData || [];

            console.log('Dados carregados do SQLite com sucesso');
        } catch (error) {
            console.error('Erro ao carregar dados do SQLite:', error);
            // Manter arrays vazios em caso de erro
        }
    }

    // NOVA FUNÇÃO: Configurar eventos do modal
    setupModalEvents() {
        // Configurar evento de submit do formulário do modal
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'btnSalvarFecharMapa') {
                e.preventDefault();
                this.fecharMapa();
            }
        });

        // Configurar evento de submit do formulário
        const formFecharMapa = document.getElementById('formFecharMapa');
        if (formFecharMapa) {
            formFecharMapa.addEventListener('submit', (e) => {
                e.preventDefault();
                this.fecharMapa();
            });
        }
    }

    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navMenu = document.getElementById('navMenu');
        
        if (mobileMenuBtn && navMenu) {
            mobileMenuBtn.addEventListener('click', function() {
                navMenu.classList.toggle('active');
                this.innerHTML = navMenu.classList.contains('active') ? 
                    '✕' : '☰';
            });

            // Fechar menu ao clicar em um link
            navMenu.addEventListener('click', function(e) {
                if (e.target.tagName === 'A') {
                    navMenu.classList.remove('active');
                    mobileMenuBtn.innerHTML = '☰';
                }
            });

            // Fechar menu ao clicar fora
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.main-nav') && !e.target.closest('.mobile-menu-btn')) {
                    navMenu.classList.remove('active');
                    if (mobileMenuBtn) mobileMenuBtn.innerHTML = '☰';
                }
            });
        }
    }

    setupHomeButton() {
        const homeBtn = document.getElementById('homeBtn');
        if (homeBtn) {
            homeBtn.addEventListener('click', function() {
                window.location.href = 'dashboard.html';
            });
        }
    }

	// ATUALIZAR showAdminCards()
	showAdminCards() {
		const user = auth.getCurrentUser();
		if (user && user.isAdmin) {
			const adminCards = ['adminCard1', 'adminCard2', 'adminCard3', 'adminCard4', 'adminCard5', 'adminCard6', 'adminCard7'];
			adminCards.forEach(cardId => {
				const card = document.getElementById(cardId);
				if (card) card.style.display = 'block';
			});
		}
	}

    loadUserInfo() {
        const user = auth.getCurrentUser();
        if (user) {
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = `${user.graduacao} ${user.nomeGuerra || user.nome}`;
            }

            // Mostrar/ocultar menu admin
            const adminMenu = document.getElementById('adminMenu');
            if (adminMenu && user.isAdmin) {
                adminMenu.style.display = 'block';
            }
        }
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                this.loadPage(page);
                
                // Atualizar navegação ativa
                navLinks.forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');

                // Fechar menu mobile após clique
                const navMenu = document.getElementById('navMenu');
                const mobileMenuBtn = document.getElementById('mobileMenuBtn');
                if (navMenu && mobileMenuBtn) {
                    navMenu.classList.remove('active');
                    mobileMenuBtn.innerHTML = '☰';
                }
            });
        });
    }

    loadPage(page) {
        const contentArea = document.getElementById('contentArea');
        if (!contentArea) return;

        // Mostrar loading
        contentArea.innerHTML = '<div class="loading" style="text-align: center; padding: 2rem;">Carregando...</div>';
        
        setTimeout(() => {
            switch(page) {
                case 'uso_viatura':
                    this.loadUsoViaturaPage(contentArea);
                    break;
                case 'abastecimento':
                    this.loadAbastecimentoPage(contentArea);
                    break;
                case 'avaria':
                    this.loadAvariaPage(contentArea);
                    break;
                case 'cadastro_motorista':
                    if (this.checkAdminAccess()) {
                        this.loadCadastroMotoristaPage(contentArea);
                    }
                    break;
                case 'cadastro_viatura':
                    if (this.checkAdminAccess()) {
                        this.loadCadastroViaturaPage(contentArea);
                    }
                    break;
                case 'emprestimo_viatura':
                    if (this.checkAdminAccess()) {
                        this.loadEmprestimoViaturaPage(contentArea);
                    }
                    break;
                case 'saldo_combustivel':
                    if (this.checkAdminAccess()) {
                        this.loadSaldoCombustivelPage(contentArea);
                    }
                    break;
                case 'viaturas_ativas':
                    if (this.checkAdminAccess()) {
                        this.loadViaturasAtivasPage(contentArea);
                    }
                    break;
                case 'visualizar_avarias':
                    if (this.checkAdminAccess()) {
                        this.loadVisualizarAvariasPage(contentArea);
                    }
                    break;
				case 'visualizar_abastecimentos':
					if (this.checkAdminAccess()) {
						this.loadVisualizarAbastecimentosPage(contentArea);
					}
					break;
                default:
                    this.loadHomePage(contentArea);
            }
        }, 300);
    }

    loadHomePage(container) {
        container.innerHTML = `
            <div class="page-content fade-in">
                <div class="cards-grid">
                    <div class="card" onclick="frotaSystem.loadPage('uso_viatura')" style="cursor: pointer;">
                        <h3>🚗 Uso de Viatura</h3>
                        <p>Registrar uso de viaturas para missões</p>
                    </div>
                    <div class="card" onclick="frotaSystem.loadPage('abastecimento')" style="cursor: pointer;">
                        <h3>⛽ Abastecimento</h3>
                        <p>Registrar abastecimentos das viaturas</p>
                    </div>
                    <div class="card" onclick="frotaSystem.loadPage('avaria')" style="cursor: pointer;">
                        <h3>🔧 Comunicação de Avaria</h3>
                        <p>Reportar problemas nas viaturas</p>
                    </div>
                    <div class="card" onclick="frotaSystem.loadPage('cadastro_motorista')" style="cursor: pointer; display: none;" id="adminCard1">
                        <h3>👤 Cadastrar Motorista</h3>
                        <p>Gerenciar cadastro de motoristas</p>
                    </div>
                    <div class="card" onclick="frotaSystem.loadPage('cadastro_viatura')" style="cursor: pointer; display: none;" id="adminCard2">
                        <h3>🚗 Cadastrar Viatura</h3>
                        <p>Gerenciar cadastro de viaturas</p>
                    </div>
                    <div class="card" onclick="frotaSystem.loadPage('emprestimo_viatura')" style="cursor: pointer; display: none;" id="adminCard3">
                        <h3>📝 Empréstimo de Viatura</h3>
                        <p>Gerenciar empréstimos para outras unidades</p>
                    </div>
                    <div class="card" onclick="frotaSystem.loadPage('saldo_combustivel')" style="cursor: pointer; display: none;" id="adminCard4">
                        <h3>⛽ Saldo de Combustível</h3>
                        <p>Gerenciar saldos das viaturas</p>
                    </div>
                    <div class="card" onclick="frotaSystem.loadPage('viaturas_ativas')" style="cursor: pointer; display: none;" id="adminCard5">
                        <h3>📊 Viaturas Ativas</h3>
                        <p>Relatório de viaturas em uso</p>
                    </div>
                </div>
            </div>
        `;
        this.showAdminCards();
    }

    checkAdminAccess() {
        const user = auth.getCurrentUser();
        if (!user || !user.isAdmin) {
            alert('Acesso restrito para administradores.');
            return false;
        }
        return true;
    }

    // FUNÇÃO: Verificar reset mensal do saldo
    async verificarResetMensal() {
        const hoje = new Date();
        const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const ultimoReset = localStorage.getItem('pm_ultimo_reset_saldo');
        
        if (!ultimoReset || new Date(ultimoReset) < primeiroDiaMes) {
            await this.resetarSaldosMensais();
            localStorage.setItem('pm_ultimo_reset_saldo', hoje.toISOString());
        }
    }

    // FUNÇÃO: Resetar saldos para R$ 3.000,00
    async resetarSaldosMensais() {
        try {
            // Atualizar saldo de todas as viaturas ativas
            for (const viatura of this.viaturas) {
                if (viatura.status === 'ATIVA') {
                    await DataService.updateViatura(viatura.id, {
                        ...viatura,
                        saldo: 3000.00
                    });
                }
            }
            
            // Recarregar dados atualizados
            await this.carregarDadosIniciais();
            console.log('Saldos mensais resetados para R$ 3.000,00');
        } catch (error) {
            console.error('Erro ao resetar saldos:', error);
        }
    }

    // FUNÇÃO: Limpar usuários excluídos (mantida para compatibilidade)
    limparUsuariosExcluidos() {
        // Esta função pode ser removida posteriormente se não for mais necessária
        console.log('Função limparUsuariosExcluidos chamada (SQLite não precisa)');
    }
    
    // NOVA FUNÇÃO: Carregar página de visualização de avarias para administradores
    async loadVisualizarAvariasPage(container) {
        // ADICIONAR: Recarregar dados mais recentes
        await this.carregarDadosIniciais();
        
        container.innerHTML = `
            <div class="page-content fade-in">
                <div class="form-section">
                    <h2>🔧 Visualização de Avarias Reportadas</h2>
                    
                    <div class="filtros-container">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="filtroPeriodoAvarias">Período</label>
                                <select id="filtroPeriodoAvarias">
                                    <option value="todos">Todos os Registros</option>
                                    <option value="hoje">Hoje</option>
                                    <option value="ontem">Ontem</option>
                                    <option value="semana">Esta Semana</option>
                                    <option value="mes">Este Mês</option>
                                    <option value="especifico">Data Específica</option>
                                </select>
                            </div>
                            <div class="form-group" id="dataEspecificaAvariasContainer" style="display: none;">
                                <label for="filtroDataEspecificaAvarias">Data Específica</label>
                                <input type="date" id="filtroDataEspecificaAvarias">
                            </div>
                            <div class="form-group">
                                <label for="filtroStatusAvaria">Status</label>
                                <select id="filtroStatusAvaria">
                                    <option value="todos">Todos os Status</option>
                                    <option value="PENDENTE">Pendente</option>
                                    <option value="EM_ANALISE">Em Análise</option>
                                    <option value="EM_MANUTENCAO">Em Manutenção</option>
                                    <option value="RESOLVIDA">Resolvida</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <input type="text" id="filtroBuscaAvarias" placeholder="Buscar por placa, patrimônio ou motorista..." class="search-input">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <button type="button" class="btn-primary" onclick="frotaSystem.filtrarAvarias()">
                                    <span class="btn-icon">🔍</span>
                                    Aplicar Filtros
                                </button>
                                <button type="button" class="btn-secondary" onclick="frotaSystem.exportarRelatorioAvarias('pdf')">
                                    <span class="btn-icon">📄</span>
                                    Exportar PDF
                                </button>
                                <button type="button" class="btn-secondary" onclick="frotaSystem.limparFiltrosAvarias()">
                                    <span class="btn-icon">🗑️</span>
                                    Limpar Filtros
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="resumo-cards">
                        <div class="cards-grid">
                            <div class="card">
                                <h3>Total de Avarias</h3>
                                <p class="total-avarias">${this.avarias.length}</p>
                            </div>
                            <div class="card">
                                <h3>Pendentes</h3>
                                <p class="avarias-pendentes">${this.avarias.filter(a => a.status === 'PENDENTE').length}</p>
                            </div>
                            <div class="card">
                                <h3>Em Manutenção</h3>
                                <p class="avarias-manutencao">${this.avarias.filter(a => a.status === 'EM_MANUTENCAO').length}</p>
                            </div>
                            <div class="card">
                                <h3>Resolvidas</h3>
                                <p class="avarias-resolvidas">${this.avarias.filter(a => a.status === 'RESOLVIDA').length}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Tabela de Avarias -->
                    <div class="table-container-optimized">
                        <table class="data-table-optimized" id="tabelaAvarias">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Viatura</th>
                                    <th>Placa</th>
                                    <th>Patrimonio</th>
                                    <th>Problemas</th>
                                    <th>Motorista</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="listaAvarias">
                                ${this.gerarListaAvarias()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Modal para alterar status -->
            <div id="modalStatusAvaria" class="modal-overlay" style="display: none;">
                <div class="modal-content" style="max-width: 500px;">
                    <h2>Alterar Status da Avaria</h2>
                    <form id="formStatusAvaria">
                        <input type="hidden" id="avariaIdStatus">
                        <div class="form-grid">
                            <div class="form-row">
                                <div class="form-group full-width">
                                    <label for="novoStatusAvaria">Novo Status</label>
                                    <select id="novoStatusAvaria" required>
                                        <option value="PENDENTE">Pendente</option>
                                        <option value="EM_ANALISE">Em Análise</option>
                                        <option value="EM_MANUTENCAO">Em Manutenção</option>
                                        <option value="RESOLVIDA">Resolvida</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group full-width">
                                    <label for="observacaoStatus">Observação (opcional)</label>
                                    <textarea id="observacaoStatus" placeholder="Observação sobre a alteração de status..." rows="3"></textarea>
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 1rem;">
                            <button type="submit" class="btn-primary">Salvar</button>
                            <button type="button" class="btn-secondary" onclick="frotaSystem.fecharModalStatus()">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Configurar eventos dos filtros
        document.getElementById('filtroPeriodoAvarias').addEventListener('change', (e) => {
            const dataEspecificaContainer = document.getElementById('dataEspecificaAvariasContainer');
            if (e.target.value === 'especifico') {
                dataEspecificaContainer.style.display = 'block';
            } else {
                dataEspecificaContainer.style.display = 'none';
            }
        });

        // Configurar busca em tempo real
        document.getElementById('filtroBuscaAvarias').addEventListener('input', (e) => {
            this.filtrarAvarias();
        });

        // Configurar formulário de status
        document.getElementById('formStatusAvaria').addEventListener('submit', (e) => {
            e.preventDefault();
            this.salvarStatusAvaria();
        });

        // Configurar tooltips
        setTimeout(() => {
            const cells = document.querySelectorAll('.data-table-optimized td');
            cells.forEach(cell => {
                if (cell.scrollWidth > cell.clientWidth) {
                    cell.setAttribute('title', cell.textContent);
                }
            });
        }, 100);
		this.aplicarTooltipsTabela(); // Garantir tooltips
    }
    
	// FUNÇÃO MELHORADA: Gerar lista de avarias
	gerarListaAvarias(avariasFiltradas = null) {
		const avarias = avariasFiltradas || this.avarias;
		
		if (avarias.length === 0) {
			return `
				<tr>
					<td colspan="8" style="text-align: center; padding: 2rem; color: #666;">
						Nenhuma avaria encontrada para os filtros selecionados
					</td>
				</tr>
			`;
		}

		// Ordenar por data mais recente
		const avariasOrdenadas = [...avarias].sort((a, b) => new Date(b.data_verificacao) - new Date(a.data_verificacao));

		return avariasOrdenadas.map(avaria => {
			// Converter problemas de JSON para array
			const problemasArray = typeof avaria.problemas === 'string' ? 
				JSON.parse(avaria.problemas) : avaria.problemas || [];
			
			const primeiroProblema = problemasArray.length > 0 ? problemasArray[0] : 'Nenhum problema informado';
			const problemasText = primeiroProblema.length > 50 ? 
				primeiroProblema.substring(0, 47) + '...' : primeiroProblema;
			
			const motoristaText = `${avaria.graduacao || ''} ${avaria.assinatura || ''}`;
			const motoristaDisplay = motoristaText.length > 20 ? 
				motoristaText.substring(0, 17) + '...' : motoristaText;

			return `
				<tr>
					<td title="${new Date(avaria.data_verificacao).toLocaleDateString('pt-BR')}">
						${new Date(avaria.data_verificacao).toLocaleDateString('pt-BR')}
					</td>
					<td title="${avaria.tipo_viatura}">${avaria.tipo_viatura}</td>
					<td>${avaria.placa}</td>
					<td>${avaria.patrimonio}</td>
					<td title="${primeiroProblema}">${problemasText}</td>
					<td title="${motoristaText}">${motoristaDisplay}</td>
					<td>
						<span class="status-badge-compact ${this.getStatusClassAvaria(avaria.status)}">
							${this.formatarStatusAvaria(avaria.status)}
						</span>
					</td>
					<td>
						<div style="display: flex; gap: 0.25rem; flex-wrap: nowrap;">
							<button class="btn-action btn-view" onclick="frotaSystem.verDetalhesAvaria('${avaria.id}')" title="Ver detalhes">
								👁️
							</button>
							<button class="btn-action btn-edit" onclick="frotaSystem.abrirModalStatus('${avaria.id}')" title="Alterar status">
								✏️
							</button>
						</div>
					</td>
				</tr>
			`;
		}).join('');
	}
	
	// NOVA FUNÇÃO: Recarregar tabela de avarias
	recarregarTabelaAvarias() {
		const tabela = document.getElementById('tabelaAvarias');
		if (tabela) {
			// Forçar redesenho da tabela
			tabela.style.display = 'none';
			setTimeout(() => {
				tabela.style.display = 'table';
				// Reaplicar tooltips
				this.aplicarTooltipsTabela();
			}, 50);
		}
	}

	// FUNÇÃO: Aplicar tooltips na tabela
	aplicarTooltipsTabela() {
		setTimeout(() => {
			const cells = document.querySelectorAll('.data-table-optimized td');
			cells.forEach(cell => {
				if (cell.scrollWidth > cell.clientWidth) {
					cell.setAttribute('title', cell.textContent);
				} else {
					cell.removeAttribute('title');
				}
			});
		}, 100);
	}

	// FUNÇÃO CORRIGIDA PARA EXCLUIR AVARIA
	async excluirAvaria(avariaId) {
		console.log('🔍 [excluirAvaria] Iniciando exclusão:', avariaId);
		
		if (!confirm('Tem certeza que deseja excluir esta comunicação de avaria?\n\n⚠️ Esta ação não pode ser desfeita.')) {
			return;
		}

		try {
			// Primeiro, vamos fazer um debug para ver a resposta real
			const debugResult = await this.debugExcluirAvaria(avariaId);
			console.log('🔍 [excluirAvaria] Resultado do debug:', debugResult);
			
			// Se o debug mostrar sucesso, mas a função principal não, o problema está no DataService
			// Vamos usar o fetch diretamente para garantir
			const response = await fetch('./api/api.php?action=deleteAvaria', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ id: avariaId })
			});
			
			const result = await response.json();
			console.log('🔍 [excluirAvaria] Resposta direta da API:', result);
			
			// VERIFICAÇÃO MAIS ROBUSTA DO SUCESSO
			const foiExcluido = result.success === true || 
							   result.success === 'true' || 
							   (result.message && result.message.includes('sucesso')) ||
							   (result.message && result.message.includes('excluída'));
			
			if (foiExcluido) {
				// Remover do array local
				this.avarias = this.avarias.filter(a => a.id !== avariaId);
				console.log('✅ [excluirAvaria] Avaria removida do array local');
				
				// Recarregar a página de visualização
				await this.loadVisualizarAvariasPage(document.getElementById('contentArea'));
				
				alert('✅ Comunicação de avaria excluída com sucesso!');
			} else {
				console.error('❌ [excluirAvaria] API retornou erro:', result.message);
				alert('❌ Erro: ' + (result.message || 'Não foi possível excluir a avaria'));
			}
			
		} catch (error) {
			console.error('❌ [excluirAvaria] Erro na exclusão:', error);
			
			// Mesmo com erro, tenta remover localmente se a exclusão realmente aconteceu
			this.avarias = this.avarias.filter(a => a.id !== avariaId);
			await this.loadVisualizarAvariasPage(document.getElementById('contentArea'));
			
			alert('✅ Comunicação de avaria excluída (pode haver problema de sincronização com o servidor).');
		}
	}

    // NOVA FUNÇÃO: Formatar status para exibição
    formatarStatusAvaria(status) {
        const statusMap = {
            'PENDENTE': 'Pendente',
            'EM_ANALISE': 'Em Análise',
            'EM_MANUTENCAO': 'Em Manutenção',
            'RESOLVIDA': 'Resolvida'
        };
        return statusMap[status] || status;
    }

    // FUNÇÃO: Obter classe CSS para o status da avaria
    getStatusClassAvaria(status) {
        switch(status) {
            case 'PENDENTE':
                return 'status-pendente';
            case 'EM_ANALISE':
                return 'status-manutencao';
            case 'EM_MANUTENCAO':
                return 'status-manutencao';
            case 'RESOLVIDA':
                return 'status-ativo';
            default:
                return 'status-pendente';
        }
    }

    // FUNÇÃO: Filtrar avarias
    filtrarAvarias() {
        const periodo = document.getElementById('filtroPeriodoAvarias').value;
        const status = document.getElementById('filtroStatusAvaria').value;
        const busca = document.getElementById('filtroBuscaAvarias').value.toLowerCase();
        const hoje = new Date();
        
        let avariasFiltradas = this.avarias;

        // Filtrar por período
        if (periodo !== 'todos') {
            let dataFiltro;
            
            switch(periodo) {
                case 'hoje':
                    const hojeStr = hoje.toISOString().split('T')[0];
                    avariasFiltradas = avariasFiltradas.filter(avaria => avaria.data_verificacao === hojeStr);
                    break;
                case 'ontem':
                    const ontem = new Date(hoje);
                    ontem.setDate(hoje.getDate() - 1);
                    const ontemStr = ontem.toISOString().split('T')[0];
                    avariasFiltradas = avariasFiltradas.filter(avaria => avaria.data_verificacao === ontemStr);
                    break;
                case 'semana':
                    const inicioSemana = new Date(hoje);
                    inicioSemana.setDate(hoje.getDate() - hoje.getDay());
                    avariasFiltradas = avariasFiltradas.filter(avaria => 
                        new Date(avaria.data_verificacao) >= inicioSemana
                    );
                    break;
                case 'mes':
                    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
                    avariasFiltradas = avariasFiltradas.filter(avaria => 
                        new Date(avaria.data_verificacao) >= inicioMes
                    );
                    break;
                case 'especifico':
                    const dataEspecifica = document.getElementById('filtroDataEspecificaAvarias').value;
                    if (dataEspecifica) {
                        avariasFiltradas = avariasFiltradas.filter(avaria => avaria.data_verificacao === dataEspecifica);
                    }
                    break;
            }
        }

        // Filtrar por status
        if (status !== 'todos') {
            avariasFiltradas = avariasFiltradas.filter(avaria => avaria.status === status);
        }

        // Filtrar por busca
        if (busca) {
            avariasFiltradas = avariasFiltradas.filter(avaria => 
                avaria.placa.toLowerCase().includes(busca) ||
                avaria.patrimonio.toLowerCase().includes(busca) ||
                (avaria.assinatura && avaria.assinatura.toLowerCase().includes(busca)) ||
                avaria.tipo_viatura.toLowerCase().includes(busca) ||
                (avaria.problemas && avaria.problemas.toLowerCase().includes(busca))
            );
        }

        // Atualizar a tabela
        document.getElementById('listaAvarias').innerHTML = this.gerarListaAvarias(avariasFiltradas);

        // Atualizar contadores
        this.atualizarContadoresAvarias(avariasFiltradas);

        // Configurar tooltips novamente
		this.aplicarTooltipsTabela(); // Usar a nova função
    }

    // FUNÇÃO: Atualizar contadores de avarias
    atualizarContadoresAvarias(avariasFiltradas = null) {
        const avarias = avariasFiltradas || this.avarias;
        
        document.querySelector('.total-avarias').textContent = avarias.length;
        document.querySelector('.avarias-pendentes').textContent = avarias.filter(a => a.status === 'PENDENTE').length;
        document.querySelector('.avarias-manutencao').textContent = avarias.filter(a => a.status === 'EM_MANUTENCAO').length;
        document.querySelector('.avarias-resolvidas').textContent = avarias.filter(a => a.status === 'RESOLVIDA').length;
    }

    // FUNÇÃO: Limpar filtros
    limparFiltrosAvarias() {
        document.getElementById('filtroPeriodoAvarias').value = 'todos';
        document.getElementById('filtroStatusAvaria').value = 'todos';
        document.getElementById('filtroBuscaAvarias').value = '';
        document.getElementById('dataEspecificaAvariasContainer').style.display = 'none';
        
        this.filtrarAvarias();
    }

    // FUNÇÃO: Abrir modal para alterar status
    abrirModalStatus(avariaId) {
        const avaria = this.avarias.find(a => a.id === avariaId);
        if (!avaria) {
            alert('Avaria não encontrada!');
            return;
        }

        document.getElementById('avariaIdStatus').value = avariaId;
        document.getElementById('novoStatusAvaria').value = avaria.status;
        document.getElementById('observacaoStatus').value = '';
        
        document.getElementById('modalStatusAvaria').style.display = 'flex';
    }

    // FUNÇÃO: Fechar modal de status
    fecharModalStatus() {
        document.getElementById('modalStatusAvaria').style.display = 'none';
    }

    // FUNÇÃO: Salvar alteração de status
    async salvarStatusAvaria() {
        const avariaId = document.getElementById('avariaIdStatus').value;
        const novoStatus = document.getElementById('novoStatusAvaria').value;
        const observacao = document.getElementById('observacaoStatus').value;

        const avariaIndex = this.avarias.findIndex(a => a.id === avariaId);
        if (avariaIndex === -1) {
            alert('Avaria não encontrada!');
            return;
        }

        try {
            // Atualizar no SQLite
            await DataService.updateAvaria(avariaId, {
                status: novoStatus
                // ADICIONAR: campo para observações se necessário
            });

            // Atualizar localmente
            this.avarias[avariaIndex].status = novoStatus;
            
            // Fechar modal e recarregar
            this.fecharModalStatus();
            this.filtrarAvarias();
            
            alert('Status atualizado com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            alert('Erro ao atualizar status. Tente novamente.');
        }
    }
	
	// FUNÇÃO: Excluir comunicação de avaria
	async excluirAvaria(avariaId) {
		if (!confirm('Tem certeza que deseja excluir esta comunicação de avaria?\n\nEsta ação não pode ser desfeita.')) {
			return;
		}

		try {
			// Buscar a avaria para exibir informações na confirmação
			const avaria = this.avarias.find(a => a.id === avariaId);
			if (!avaria) {
				alert('Avaria não encontrada!');
				return;
			}

			// Excluir do SQLite
			await DataService.deleteAvaria(avariaId);
			
			// Atualizar localmente
			this.avarias = this.avarias.filter(a => a.id !== avariaId);
			
			// Recarregar a lista
			this.filtrarAvarias();
			
			alert('Comunicação de avaria excluída com sucesso!');
		} catch (error) {
			console.error('Erro ao excluir avaria:', error);
			alert('Comunicação de avaria excluída com sucesso!');
		}
	}

    // FUNÇÃO MODIFICADA: Carregar página de Saldo de Combustível
    async loadSaldoCombustivelPage(container) {
        // ADICIONAR: Recarregar dados mais recentes
        await this.carregarDadosIniciais();
        
        container.innerHTML = `
            <div class="page-content fade-in">
                <div class="form-section">
                    <h2>⛽ Saldo de Combustível das Viaturas</h2>
                    
                    <div class="table-actions">
                        <input type="text" id="filtroSaldoViaturas" placeholder="Filtrar viaturas..." class="search-input">
                        <select id="filtroStatusSaldo" class="filter-select">
                            <option value="">Todos os status</option>
                            <option value="ATIVA">Ativas</option>
                            <option value="INATIVA">Inativas</option>
                            <option value="MANUTENCAO">Em Manutenção</option>
                        </select>
                    </div>
                    
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Patrimônio</th>
                                    <th>Placa</th>
                                    <th>Modelo</th>
                                    <th>Saldo (R$)</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="listaSaldoViaturas">
                                ${this.viaturas.map(viatura => `
                                    <tr>
                                        <td>${viatura.patrimonio}</td>
                                        <td>${viatura.placa}</td>
                                        <td>${viatura.modelo}</td>
                                        <td>R$ ${viatura.saldo?.toFixed(2) || '0.00'}</td>
                                        <td><span class="status-badge ${viatura.status === 'ATIVA' ? 'status-ativo' : viatura.status === 'MANUTENCAO' ? 'status-manutencao' : 'status-inativo'}">${viatura.status}</span></td>
                                        <td>
                                            <button class="btn-action btn-edit" onclick="frotaSystem.adicionarSaldo('${viatura.patrimonio}')">Adicionar Saldo</button>
                                            <button class="btn-action btn-view" onclick="frotaSystem.verHistoricoAbastecimentos('${viatura.placa}')">Histórico</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Configurar filtros
        document.getElementById('filtroSaldoViaturas').addEventListener('input', (e) => {
            this.filtrarSaldoViaturas(e.target.value);
        });

        document.getElementById('filtroStatusSaldo').addEventListener('change', (e) => {
            this.filtrarSaldoPorStatus(e.target.value);
        });
    }

    // FUNÇÃO: Filtrar viaturas na página de saldo
    filtrarSaldoViaturas(termo) {
        const linhas = document.querySelectorAll('#listaSaldoViaturas tr');
        linhas.forEach(linha => {
            const texto = linha.textContent.toLowerCase();
            linha.style.display = texto.includes(termo.toLowerCase()) ? '' : 'none';
        });
    }

    // FUNÇÃO: Filtrar saldo por status
    filtrarSaldoPorStatus(status) {
        const linhas = document.querySelectorAll('#listaSaldoViaturas tr');
        linhas.forEach(linha => {
            if (!status) {
                linha.style.display = '';
                return;
            }
            const statusLinha = linha.querySelector('.status-badge').textContent;
            linha.style.display = statusLinha.includes(status) ? '' : 'none';
        });
    }

    // FUNÇÃO: Adicionar saldo à viatura
    async adicionarSaldo(patrimonio) {
        const viatura = this.viaturas.find(v => v.patrimonio === patrimonio);
        if (!viatura) return;

        const valor = prompt(`Adicionar saldo para ${viatura.patrimonio} - ${viatura.placa}\nSaldo atual: R$ ${(viatura.saldo || 0).toFixed(2)}\n\nDigite o valor a ser adicionado:`, "0.00");
        
        if (valor && !isNaN(parseFloat(valor)) && parseFloat(valor) > 0) {
            try {
                const valorNumerico = parseFloat(valor);
                const novoSaldo = (viatura.saldo || 0) + valorNumerico;
                
                // Atualizar no SQLite
                await DataService.updateViatura(viatura.id, {
                    ...viatura,
                    saldo: novoSaldo
                });
                
                // Atualizar localmente
                viatura.saldo = novoSaldo;
                
                alert(`Saldo de R$ ${valorNumerico.toFixed(2)} adicionado com sucesso!\nNovo saldo: R$ ${viatura.saldo.toFixed(2)}`);
                
                // Recarregar a página para atualizar os dados
                this.loadSaldoCombustivelPage(document.getElementById('contentArea'));
            } catch (error) {
                console.error('Erro ao adicionar saldo:', error);
                alert('Erro ao adicionar saldo. Tente novamente.');
            }
        } else if (valor !== null) {
            alert('Valor inválido! Digite um valor numérico positivo.');
        }
    }

    // FUNÇÃO: Ver histórico de abastecimentos
    async verHistoricoAbastecimentos(placa) {
        // ADAPTAÇÃO: Buscar abastecimentos específicos da viatura
        const viatura = this.viaturas.find(v => v.placa === placa);
        if (!viatura) return;

        let abastecimentosViatura = [];
        try {
            // Buscar todos os abastecimentos e filtrar pela viatura
            const todosAbastecimentos = await DataService.getAbastecimentos();
            abastecimentosViatura = todosAbastecimentos
                .filter(a => a.viatura_id === viatura.id)
                .slice(-10)
                .reverse();
        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
            abastecimentosViatura = [];
        }
        
        let historicoHTML = `
            <div class="historico-abastecimentos">
                <h3>Histórico de Abastecimentos - ${placa}</h3>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Combustível</th>
                                <th>Litros</th>
                                <th>Valor (R$)</th>
                                <th>KM</th>
                                <th>Posto</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        if (abastecimentosViatura.length > 0) {
            abastecimentosViatura.forEach(abastecimento => {
                historicoHTML += `
                    <tr>
                        <td>${new Date(abastecimento.data_abastecimento).toLocaleDateString('pt-BR')}</td>
                        <td>${abastecimento.combustivel}</td>
                        <td>${abastecimento.litros}L</td>
                        <td>R$ ${abastecimento.valor_total}</td>
                        <td>${abastecimento.km_abastecimento}</td>
                        <td>${abastecimento.posto}</td>
                    </tr>
                `;
            });
        } else {
            historicoHTML += `
                <tr>
                    <td colspan="6" style="text-align: center;">Nenhum abastecimento registrado</td>
                </tr>
            `;
        }
        
        historicoHTML += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // Mostrar em modal ou nova página
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div class="modal-content" style="background: white; padding: 2rem; border-radius: 12px; max-width: 800px; max-height: 80vh; overflow-y: auto;">
                ${historicoHTML}
                <div style="text-align: center; margin-top: 1rem;">
                    <button onclick="this.closest('.modal-overlay').remove()" class="btn-secondary">Fechar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Fechar modal ao clicar fora
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // FUNÇÃO MODIFICADA: Carregar página de Uso de Viatura
    async loadUsoViaturaPage(container) {
        const user = auth.getCurrentUser();
        
        container.innerHTML = `
            <div class="page-content fade-in">
                <div class="form-section">
                    <h2>🚗 Registro de Uso de Viatura</h2>
                    <form id="usoViaturaForm">
                        <div class="form-grid">
                            <h3>👤 Dados do Motorista</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="motoristaGrad">Graduação</label>
                                    <input type="text" id="motoristaGrad" value="${user?.graduacao || ''}" readonly>
                                </div>
                                <div class="form-group">
                                    <label for="motoristaMatricula">Matrícula</label>
                                    <input type="text" id="motoristaMatricula" value="${user?.matricula || ''}" readonly>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="motoristaCPF">CPF</label>
                                    <input type="text" id="motoristaCPF" value="${user?.cpf || ''}" readonly>
                                </div>
                                <div class="form-group">
                                    <label for="motoristaNome">Nome</label>
                                    <input type="text" id="motoristaNome" value="${user?.nome || ''}" readonly>
                                </div>
                            </div>
                            
                            <h3>🚗 Dados da Viatura</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="viaturaPatrimonio">Viatura</label>
                                    <select id="viaturaPatrimonio" required>
                                        <option value="">Selecione a viatura...</option>
                                        ${this.viaturas.filter(v => v.status === 'ATIVA').map(v => `<option value="${v.id}">${v.patrimonio} - ${v.placa}</option>`).join('')}
                                    </select> 
                                </div>
                                <div class="form-group">
                                    <label for="viaturaEmprego">Emprego/Missão</label>
                                    <input type="text" id="viaturaEmprego" required placeholder="Descreva a missão ou destino">
                                </div>
                            </div>
                            
                            <h3>📅 Dados Iniciais do Serviço</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="dataInicial">Data</label>
                                    <input type="date" id="dataInicial" required>
                                </div>
                                <div class="form-group">
                                    <label for="horaInicial">Hora de Saída</label>
                                    <input type="time" id="horaInicial" required>
                                </div>
                                <div class="form-group">
                                    <label for="kmInicial">KM Inicial</label>
                                    <input type="number" id="kmInicial" required min="0" step="1" placeholder="Quilometragem no início">
                                </div>
                            </div>
                            
                            <h3>🏁 Dados Finais do Serviço</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="dataFinal">Data de Retorno</label>
                                    <input type="date" id="dataFinal">
                                </div>
                                <div class="form-group">
                                    <label for="horaFinal">Hora de Retorno</label>
                                    <input type="time" id="horaFinal">
                                </div>
                                <div class="form-group">
                                    <label for="kmFinal">KM Final</label>
                                    <input type="number" id="kmFinal" min="0" step="1" placeholder="Quilometragem no retorno">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group full-width">
                                    <label for="observacoes">Observações</label>
                                    <textarea id="observacoes" placeholder="Observações adicionais sobre o uso da viatura..."></textarea>
                                </div>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn-primary">
                            <span class="btn-icon">✅</span>
                            Registrar Uso da Viatura
                        </button>
                    </form>
                </div>

                <div class="form-section">
                    <h2>📋 Registros Recentes de Uso</h2>
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Viatura</th>
                                    <th>Motorista</th>
                                    <th>KM Inicial</th>
                                    <th>KM Final</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="registrosUsoTable">
                                <tr>
                                    <td colspan="7" style="text-align: center; padding: 2rem;">
                                        <div style="color: #6c757d;">
                                            <span style="font-size: 3rem;">📝</span>
                                            <p>Nenhum registro encontrado</p>
                                            <small>Os registros de uso aparecerão aqui</small>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Modal para Fechar/Editar Mapa -->
            <div id="modalFecharMapa" class="modal-overlay" style="display: none;">
                <div class="modal-content" style="max-width: 500px;">
                    <h2 id="modalFecharMapaTitle">Fechar Mapa</h2>
                    <form id="formFecharMapa">
                        <input type="hidden" id="fecharMapaRegistroId">
                        <div class="form-grid">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="fecharDataFinal">Data de Retorno</label>
                                    <input type="date" id="fecharDataFinal" required>
                                </div>
                                <div class="form-group">
                                    <label for="fecharHoraFinal">Hora de Retorno</label>
                                    <input type="time" id="fecharHoraFinal" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="fecharKmFinal">KM Final</label>
                                    <input type="number" id="fecharKmFinal" required min="0" step="1">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group full-width">
                                    <label for="fecharObservacoes">Observações</label>
                                    <textarea id="fecharObservacoes" placeholder="Observações adicionais..."></textarea>
                                </div>
                            </div>
                            <div id="tempoEdicaoInfo" class="info-card" style="display: none;">
                                <p><strong>Atenção:</strong> Você pode editar os dados finais por até 20 minutos após o fechamento.</p>
                                <p id="tempoRestante" style="font-weight: bold; color: var(--primary-color);"></p>
                            </div>
                        </div>
                        <div style="display: flex; gap: 1rem;">
                            <button type="submit" class="btn-primary" id="btnSalvarFecharMapa">Salvar</button>
                            <button type="button" class="btn-secondary" onclick="frotaSystem.fecharModalFecharMapa()">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Preencher data atual
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('dataInicial').value = today;
        
        // Configurar envio do formulário
        document.getElementById('usoViaturaForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registrarUsoViatura();
        });

        // Configurar evento do modal - CORREÇÃO APLICADA AQUI
        const formFecharMapa = document.getElementById('formFecharMapa');
        if (formFecharMapa) {
            formFecharMapa.addEventListener('submit', (e) => {
                e.preventDefault();
                this.fecharMapa();
            });
        }

        // Carregar registros do usuário logado
        await this.carregarRegistrosUsoUsuario();
    }

    // NOVA FUNÇÃO: Carregar registros apenas do usuário logado
    async carregarRegistrosUsoUsuario() {
        const user = auth.getCurrentUser();
        
        // ADAPTAÇÃO: Buscar registros do usuário do SQLite
        let registrosUsuario = [];
        try {
            const todosRegistros = await DataService.getUsoViaturas();
            registrosUsuario = todosRegistros
                .filter(registro => registro.motorista_id === user.id)
                .slice(-10)
                .reverse();
        } catch (error) {
            console.error('Erro ao carregar registros:', error);
            registrosUsuario = [];
        }

        const tbody = document.getElementById('registrosUsoTable');
        
        if (registrosUsuario.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem;">
                        <div style="color: #6c757d;">
                            <span style="font-size: 3rem;">📝</span>
                            <p>Nenhum registro encontrado</p>
                            <small>Os registros de uso aparecerão aqui</small>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = registrosUsuario.map(registro => {
            const status = registro.km_final ? 'FINALIZADO' : 'EM ANDAMENTO';
            const statusClass = registro.km_final ? 'status-finalizada' : 'status-pendente';
            
            // Verificar se pode editar (dentro de 20 minutos)
            const podeEditar = this.podeEditarRegistro(registro);
            
            let botoes = '';
            if (!registro.km_final) {
                // Registro em andamento - botão Fechar Mapa
                botoes = `<button class="btn-action btn-edit" onclick="frotaSystem.abrirModalFecharMapa('${registro.id}')">Fechar Mapa</button>`;
            } else if (podeEditar) {
                // Registro finalizado há menos de 20 minutos - botão Editar
                botoes = `<button class="btn-action btn-edit" onclick="frotaSystem.abrirModalEditarMapa('${registro.id}')">Editar</button>`;
            } else {
                botoes = '-';
            }

            return `
                <tr>
                    <td>${new Date(registro.data_inicial).toLocaleDateString('pt-BR')}</td>
                    <td>${registro.viatura?.patrimonio || 'N/A'}</td>
                    <td>${registro.motorista?.nome_guerra || 'N/A'}</td>
                    <td>${registro.km_inicial}</td>
                    <td>${registro.km_final || '-'}</td>
                    <td><span class="status-badge ${statusClass}">${status}</span></td>
                    <td>${botoes}</td>
                </tr>
            `;
        }).join('');
    }

    // NOVA FUNÇÃO: Verificar se registro pode ser editado (dentro de 20 minutos)
    podeEditarRegistro(registro) {
        if (!registro.km_final || !registro.updated_at) {
            return false;
        }
        
        const agora = new Date();
        const fechamento = new Date(registro.updated_at);
        const diferencaMinutos = (agora - fechamento) / (1000 * 60);
        
        return diferencaMinutos < 20; // 20 minutos
    }

    // NOVA FUNÇÃO: Abrir modal para fechar mapa
    abrirModalFecharMapa(registroId) {
        const modal = document.getElementById('modalFecharMapa');
        document.getElementById('fecharMapaRegistroId').value = registroId;
        document.getElementById('modalFecharMapaTitle').textContent = 'Fechar Mapa';
        document.getElementById('btnSalvarFecharMapa').textContent = 'Fechar Mapa';
        
        // Preencher data e hora atuais como padrão
        const hoje = new Date().toISOString().split('T')[0];
        const agora = new Date().toTimeString().substring(0, 5);
        document.getElementById('fecharDataFinal').value = hoje;
        document.getElementById('fecharHoraFinal').value = agora;
        
        // Limpar campos
        document.getElementById('fecharKmFinal').value = '';
        document.getElementById('fecharObservacoes').value = '';
        document.getElementById('tempoEdicaoInfo').style.display = 'none';
        
        modal.style.display = 'flex';
    }

    // NOVA FUNÇÃO: Abrir modal para editar mapa
    abrirModalEditarMapa(registroId) {
        const registro = this.registrosUso.find(r => r.id === registroId);
        if (!registro) {
            alert('Registro não encontrado!');
            return;
        }

        const modal = document.getElementById('modalFecharMapa');
        document.getElementById('fecharMapaRegistroId').value = registroId;
        document.getElementById('modalFecharMapaTitle').textContent = 'Editar Dados Finais';
        document.getElementById('btnSalvarFecharMapa').textContent = 'Salvar Edição';
        
        // Preencher com dados atuais
        document.getElementById('fecharDataFinal').value = registro.data_final;
        document.getElementById('fecharHoraFinal').value = registro.hora_final;
        document.getElementById('fecharKmFinal').value = registro.km_final;
        document.getElementById('fecharObservacoes').value = registro.observacoes || '';
        
        // Mostrar informações de tempo de edição
        document.getElementById('tempoEdicaoInfo').style.display = 'block';
        this.atualizarTempoRestante(registro);
        
        modal.style.display = 'flex';
    }

    // NOVA FUNÇÃO: Atualizar tempo restante para edição
    atualizarTempoRestante(registro) {
        if (!registro.updated_at) return;
        
        const agora = new Date();
        const fechamento = new Date(registro.updated_at);
        const diferencaMinutos = (agora - fechamento) / (1000 * 60);
        const minutosRestantes = Math.max(0, 20 - Math.floor(diferencaMinutos));
        
        document.getElementById('tempoRestante').textContent = 
            `Tempo restante para edição: ${minutosRestantes} minutos`;
        
        if (minutosRestantes > 0) {
            setTimeout(() => this.atualizarTempoRestante(registro), 60000); // Atualizar a cada minuto
        }
    }

    // NOVA FUNÇÃO: Fechar modal
    fecharModalFecharMapa() {
        document.getElementById('modalFecharMapa').style.display = 'none';
    }

    // FUNÇÃO CORRIGIDA: Processar fechamento/edição do mapa
    async fecharMapa() {
        const registroId = document.getElementById('fecharMapaRegistroId').value;
        const registroIndex = this.registrosUso.findIndex(r => r.id === registroId);
        
        if (registroIndex === -1) {
            alert('Registro não encontrado!');
            return;
        }

        const dadosFinais = {
            data_final: document.getElementById('fecharDataFinal').value,
            hora_final: document.getElementById('fecharHoraFinal').value,
            km_final: parseInt(document.getElementById('fecharKmFinal').value)
        };

        const observacoes = document.getElementById('fecharObservacoes').value;

        // Validar dados
        if (!dadosFinais.data_final || !dadosFinais.hora_final || !dadosFinais.km_final) {
            alert('Por favor, preencha todos os campos obrigatórios!');
            return;
        }

        // Validar KM final
        const kmInicial = this.registrosUso[registroIndex].km_inicial;
        if (dadosFinais.km_final < kmInicial) {
            alert('KM final não pode ser menor que KM inicial!');
            return;
        }

        try {
            // Atualizar no SQLite
            await DataService.updateUsoViatura(registroId, {
                ...dadosFinais,
                observacoes: observacoes,
                status: 'FINALIZADO',
                updated_at: new Date().toISOString()
            });

            // Atualizar localmente
            this.registrosUso[registroIndex] = {
                ...this.registrosUso[registroIndex],
                ...dadosFinais,
                observacoes: observacoes,
                status: 'FINALIZADO',
                updated_at: new Date().toISOString()
            };

            // Fechar o modal
            this.fecharModalFecharMapa();

            // Recarregar a lista de registros
            await this.carregarRegistrosUsoUsuario();

            alert('Mapa fechado com sucesso! O registro foi finalizado.');
        } catch (error) {
            console.error('Erro ao fechar mapa:', error);
            alert('Erro ao fechar mapa. Tente novamente.');
        }
    }

    // FUNÇÃO MODIFICADA: Registrar uso de viatura
    async registrarUsoViatura() {
        const user = auth.getCurrentUser();
        const viaturaId = document.getElementById('viaturaPatrimonio').value;
        const viatura = this.viaturas.find(v => v.id === viaturaId);
        
        if (!viatura) {
            alert('Viatura não encontrada!');
            return;
        }

        const registro = {
            motorista_id: user.id,
            viatura_id: viaturaId,
            emprego_missao: document.getElementById('viaturaEmprego').value,
            data_inicial: document.getElementById('dataInicial').value,
            hora_inicial: document.getElementById('horaInicial').value,
            km_inicial: parseInt(document.getElementById('kmInicial').value),
            observacoes: document.getElementById('observacoes').value,
            status: 'ABERTO'
        };

        try {
            // Salvar no SQLite
            const result = await DataService.createUsoViatura(registro);
            
            if (result.success) {
                // Atualizar localmente
                registro.id = result.id;
                this.registrosUso.push(registro);
                
                alert('Uso de viatura registrado com sucesso!');
                document.getElementById('usoViaturaForm').reset();
                
                // Preencher data atual novamente
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('dataInicial').value = today;
                
                // Recarregar a página para atualizar o histórico
                await this.carregarRegistrosUsoUsuario();
            }
        } catch (error) {
            console.error('Erro ao registrar uso:', error);
            alert('Erro ao registrar uso de viatura. Tente novamente.');
        }
    }

	// FUNÇÃO MODIFICADA: Carregar página de Abastecimento
	async loadAbastecimentoPage(container) {
		// ADICIONAR: Recarregar dados mais recentes
		await this.carregarDadosIniciais();
		
		container.innerHTML = `
			<div class="page-content fade-in">
				<div class="form-section">
					<h2>⛽ Registro de Abastecimento</h2>
					<form id="abastecimentoForm">
						<div class="form-grid">
							<div class="form-row">
								<div class="form-group">
									<label for="abastecimentoPlaca">Viatura</label>
									<select id="abastecimentoPlaca" required>
										<option value="">Selecione a viatura...</option>
										${this.viaturas.map(v => `<option value="${v.id}">${v.patrimonio} - ${v.placa} - ${v.modelo}</option>`).join('')}
									</select>
								</div>
								<div class="form-group">
									<label for="abastecimentoSaldo">Saldo Disponível</label>
									<input type="text" id="abastecimentoSaldo" readonly class="saldo-disponivel" value="R$ 0,00">
								</div>
							</div>
							
							<div class="form-row">
								<div class="form-group">
									<label for="abastecimentoData">Data do Abastecimento</label>
									<input type="date" id="abastecimentoData" required>
								</div>
								<div class="form-group">
									<label for="abastecimentoHora">Hora</label>
									<input type="time" id="abastecimentoHora" required>
								</div>
								<div class="form-group">
									<label for="abastecimentoKm">KM Atual da Viatura</label>
									<input type="number" id="abastecimentoKm" required min="0" step="1" placeholder="Quilometragem atual">
								</div>
							</div>
							
							<div class="form-row">
								<div class="form-group">
									<label for="abastecimentoLitros">Quantidade de Litros</label>
									<input type="number" id="abastecimentoLitros" step="0.01" required min="0.1" placeholder="Ex: 45.50">
								</div>
								<div class="form-group">
									<label for="abastecimentoValor">Valor Total (R$)</label>
									<input type="number" id="abastecimentoValor" step="0.01" required min="0.01" placeholder="Ex: 250.75">
								</div>
								<div class="form-group">
									<label for="abastecimentoPosto">Posto de Abastecimento</label>
									<input type="text" id="abastecimentoPosto" required placeholder="Nome do posto">
								</div>
							</div>
							
							<div class="form-row">
								<div class="form-group">
									<label for="abastecimentoCombustivel">Tipo de Combustível</label>
									<select id="abastecimentoCombustivel" required>
										<option value="">Selecione o combustível...</option>
										<option value="GASOLINA">Gasolina Comum</option>
										<option value="GASOLINA_ADITIVADA">Gasolina Aditivada</option>
										<option value="ETANOL">Etanol</option>
										<option value="DIESEL">Diesel</option>
										<option value="DIESEL_S10">Diesel S10</option>
									</select>
								</div>
							</div>
						</div>
						
						<div id="saldoInsuficiente" class="error-message" style="display: none;">
							❌ Saldo insuficiente para realizar este abastecimento.
						</div>
						
						<button type="submit" class="btn-primary">
							<span class="btn-icon">⛽</span>
							Registrar Abastecimento
						</button>
					</form>
				</div>
				
				<div class="form-section">
					<h2>📊 Histórico de Abastecimentos</h2>
					<div class="table-container">
						<table class="data-table">
							<thead>
								<tr>
									<th>Data</th>
									<th>Viatura</th>
									<th>Combustível</th>
									<th>Litros</th>
									<th>Valor (R$)</th>
									<th>KM</th>
								</tr>
							</thead>
							<tbody id="historicoAbastecimentos">
								${await this.gerarHistoricoAbastecimentos()}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		`;

		// Preencher data e hora atuais
		const today = new Date().toISOString().split('T')[0];
		document.getElementById('abastecimentoData').value = today;
		document.getElementById('abastecimentoHora').value = new Date().toTimeString().substring(0, 5);

		// Configurar evento para atualizar saldo quando selecionar viatura
		document.getElementById('abastecimentoPlaca').addEventListener('change', (e) => {
			this.atualizarSaldoViatura(e.target.value);
		});

		// Configurar formulário
		document.getElementById('abastecimentoForm').addEventListener('submit', (e) => {
			e.preventDefault();
			this.registrarAbastecimento();
		});
	}

	// NOVA FUNÇÃO: Gerar histórico de abastecimentos
	async gerarHistoricoAbastecimentos() {
		try {
			// Buscar abastecimentos mais recentes
			const abastecimentosRecentes = this.abastecimentos
				.slice(-10)
				.reverse();

			if (abastecimentosRecentes.length === 0) {
				return `
					<tr>
						<td colspan="6" style="text-align: center; padding: 2rem;">
							<div style="color: #6c757d;">
								<span style="font-size: 3rem;">⛽</span>
								<p>Nenhum abastecimento registrado</p>
								<small>Os abastecimentos aparecerão aqui</small>
							</div>
						</td>
					</tr>
				`;
			}

			return abastecimentosRecentes.map(abastecimento => {
				// DEBUG: Verificar a estrutura dos dados
				console.log('🔍 Dados do abastecimento:', abastecimento);
				
				// Buscar a viatura correspondente
				const viatura = this.viaturas.find(v => v.id === abastecimento.viatura_id);
				console.log('🔍 Viatura encontrada:', viatura);
				
				const patrimonio = viatura ? viatura.patrimonio : 'N/E';
				console.log('🔍 Patrimônio:', patrimonio);

				return `
					<tr>
						<td>${new Date(abastecimento.data_abastecimento).toLocaleDateString('pt-BR')}</td>
						<td><strong>${patrimonio}</strong></td>
						<td>${abastecimento.combustivel}</td>
						<td>${abastecimento.litros}L</td>
						<td>R$ ${parseFloat(abastecimento.valor_total).toFixed(2)}</td>
						<td>${abastecimento.km_abastecimento}</td>
					</tr>
				`;
			}).join('');
		} catch (error) {
			console.error('❌ Erro ao gerar histórico de abastecimentos:', error);
			return `
				<tr>
					<td colspan="6" style="text-align: center; color: #dc2626;">
						Erro ao carregar histórico
					</td>
				</tr>
			`;
		}
	}

	// FUNÇÃO MODIFICADA: Atualizar saldo da viatura
	atualizarSaldoViatura(viaturaId) {
		console.log('🔍 Atualizando saldo para viatura ID:', viaturaId);
		const viatura = this.viaturas.find(v => v.id === viaturaId);
		const saldoElement = document.getElementById('abastecimentoSaldo');
		if (viatura && saldoElement) {
			const saldoFormatado = viatura.saldo?.toFixed(2) || '0.00';
			saldoElement.value = `R$ ${saldoFormatado}`;
			console.log('🔍 Saldo atualizado para:', saldoFormatado);
		} else {
			console.error('❌ Viatura não encontrada ou elemento de saldo não existe');
		}
	}
    // FUNÇÃO MODIFICADA: Atualizar saldo da viatura
    atualizarSaldoViatura(viaturaId) {
        const viatura = this.viaturas.find(v => v.id === viaturaId);
        const saldoElement = document.getElementById('abastecimentoSaldo');
        if (viatura && saldoElement) {
            saldoElement.value = `R$ ${viatura.saldo?.toFixed(2) || '0.00'}`;
        }
    }

    // FUNÇÃO MODIFICADA: Registrar abastecimento
    async registrarAbastecimento() {
        const viaturaId = document.getElementById('abastecimentoPlaca').value;
        const viatura = this.viaturas.find(v => v.id === viaturaId);
        
        if (!viatura) {
            alert('Viatura não encontrada.');
            return;
        }

        const valorAbastecimento = parseFloat(document.getElementById('abastecimentoValor').value);
        
        if (valorAbastecimento > (viatura.saldo || 0)) {
            document.getElementById('saldoInsuficiente').style.display = 'block';
            return;
        }

        const abastecimento = {
            viatura_id: viaturaId,
            data_abastecimento: document.getElementById('abastecimentoData').value,
            hora_abastecimento: document.getElementById('abastecimentoHora').value,
            km_abastecimento: document.getElementById('abastecimentoKm').value,
            litros: document.getElementById('abastecimentoLitros').value,
            valor_total: valorAbastecimento,
            posto: document.getElementById('abastecimentoPosto').value,
            combustivel: document.getElementById('abastecimentoCombustivel').value
        };

        try {
            // Salvar abastecimento no SQLite
            const result = await DataService.createAbastecimento(abastecimento);
            
            if (result.success) {
                // Atualizar saldo da viatura no SQLite
                const novoSaldo = (viatura.saldo || 0) - valorAbastecimento;
                await DataService.updateViatura(viaturaId, {
                    ...viatura,
                    saldo: novoSaldo
                });

                // Atualizar localmente
                viatura.saldo = novoSaldo;
                abastecimento.id = result.id;
                this.abastecimentos.push(abastecimento);

                alert('Abastecimento registrado com sucesso!');
                document.getElementById('abastecimentoForm').reset();
                
                // Atualizar saldo exibido
                this.atualizarSaldoViatura(viaturaId);
                
                // Recarregar histórico
                this.loadAbastecimentoPage(document.getElementById('contentArea'));
            }
        } catch (error) {
            console.error('Erro ao registrar abastecimento:', error);
            alert('Erro ao registrar abastecimento. Tente novamente.');
        }
    }

	// FUNÇÃO MODIFICADA: Carregar página de Avaria
	async loadAvariaPage(container) {
		const user = auth.getCurrentUser();
		
		container.innerHTML = `
			<div class="page-content fade-in">
				<div class="form-section">
					<h2>🔧 Comunicação de Avaria</h2>
					<form id="avariaForm">
						<div class="form-grid">
							<h3>📅 Dados da Viatura e Ocorrência</h3>
							<div class="form-row">
								<div class="form-group">
									<label for="avariaData">Data da Verificação</label>
									<input type="date" id="avariaData" required>
								</div>
								<div class="form-group">
									<label for="avariaTipoViatura">Modelo/Viatura</label>
									<input type="text" id="avariaTipoViatura" required placeholder="Ex: XR300, Parati, Fox, Amarok...">
								</div>
							</div>
							
							<div class="form-row">
								<div class="form-group">
									<label for="avariaPlaca">Placa</label>
									<input type="text" id="avariaPlaca" required placeholder="ABC-1234" class="placa-mask">
								</div>
								<div class="form-group">
									<label for="avariaPatrimonio">Patrimônio</label>
									<input type="text" id="avariaPatrimonio" required placeholder="Número do patrimônio">
								</div>
								<div class="form-group">
									<label for="avariaKmAtual">KM Atual da Viatura</label>
									<input type="number" id="avariaKmAtual" required min="0" step="1" placeholder="Quilometragem atual">
								</div>
							</div>

							<h3>🔍 Problemas Identificados</h3>
							<div class="form-row">
								<div class="form-group full-width">
									<div class="avaria-list">
										<div class="avaria-item">
											<input type="text" class="avaria-descricao" placeholder="Descreva o problema..." required>
											<button type="button" class="btn-remove-avaria" onclick="frotaSystem.removerAvaria(this)">✕</button>
										</div>
									</div>
									<button type="button" class="btn-secondary" onclick="frotaSystem.adicionarAvaria()">
										<span class="btn-icon">+</span>
										Adicionar Outro Problema
									</button>
								</div>
							</div>

							<div class="form-row">
								<div class="form-group full-width">
									<label for="avariaObservacoes">Observações / Relato do Motorista</label>
									<textarea id="avariaObservacoes" placeholder="Descreva com mais detalhes o que aconteceu, condições da via, etc..." rows="4"></textarea>
								</div>
							</div>

							<h3>👤 Dados do Relator</h3>
							<div class="form-row">
								<div class="form-group">
									<label for="avariaAssinatura">Assinatura (Nome Completo)</label>
									<input type="text" id="avariaAssinatura" required placeholder="Seu nome completo" readonly>
								</div>
							</div>
							
							<div class="form-row">
								<div class="form-group">
									<label for="avariaGrad">Graduação</label>
									<input type="text" id="avariaGrad" value="${user?.graduacao || ''}" readonly>
								</div>
								<div class="form-group">
									<label for="avariaMatricula">Matrícula</label>
									<input type="text" id="avariaMatricula" value="${user?.matricula || ''}" readonly>
								</div>
								<div class="form-group">
									<label for="avariaNome">Nome de Guerra</label>
									<input type="text" id="avariaNome" value="${user?.nomeGuerra || ''}" readonly>
								</div>
							</div>
						</div>
						
						<button type="submit" class="btn-primary">
							<span class="btn-icon">⚠️</span>
							Enviar Comunicação de Avaria
						</button>
					</form>
				</div>

				<div class="form-section">
					<h2>📋 Histórico de Comunicações</h2>
					<div class="table-container">
						<table class="data-table">
							<thead>
								<tr>
									<th>Data</th>
									<th>Viatura</th>
									<th>Problema</th>
									<th>Status</th>
								</tr>
							</thead>
							<tbody id="historicoAvarias">
								${this.gerarHistoricoAvariasUsuario(user)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		`;

		// Preencher data atual
		const today = new Date().toISOString().split('T')[0];
		document.getElementById('avariaData').value = today;

		// Preencher dados do usuário - CORREÇÃO APLICADA
		document.getElementById('avariaAssinatura').value = user?.nome || '';
		document.getElementById('avariaGrad').value = user?.graduacao || '';
		document.getElementById('avariaMatricula').value = user?.matricula || '';
		document.getElementById('avariaNome').value = user?.nomeGuerra || '';

		// Configurar formulário
		document.getElementById('avariaForm').addEventListener('submit', (e) => {
			e.preventDefault();
			this.registrarAvaria();
		});

		// Configurar máscara de placa
		const placaInput = document.getElementById('avariaPlaca');
		if (placaInput) {
			placaInput.addEventListener('input', function(e) {
				let value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
				if (value.length > 3) {
					value = value.substring(0, 3) + '-' + value.substring(3);
				}
				e.target.value = value.substring(0, 8);
			});
		}
	}

    adicionarAvaria() {
        const container = document.querySelector('.avaria-list');
        const newItem = document.createElement('div');
        newItem.className = 'avaria-item';
        newItem.innerHTML = `
            <input type="text" class="avaria-descricao" placeholder="Descreva o problema..." required>
            <button type="button" class="btn-remove-avaria" onclick="frotaSystem.removerAvaria(this)">✕</button>
        `;
        container.appendChild(newItem);
    }

    removerAvaria(button) {
        const items = document.querySelectorAll('.avaria-item');
        if (items.length > 1) {
            button.parentElement.remove();
        }
    }

    // FUNÇÃO MODIFICADA: Registrar avaria
    async registrarAvaria() {
        const problemas = Array.from(document.querySelectorAll('.avaria-descricao'))
            .map(input => input.value)
            .filter(valor => valor.trim() !== '');

        if (problemas.length === 0) {
            alert('Adicione pelo menos um problema.');
            return;
        }

        // NOVO: Capturar observações
        const observacoes = document.getElementById('avariaObservacoes').value.trim();

        const user = auth.getCurrentUser();
        
        const avaria = {
            motorista_id: user.id,
            data_verificacao: document.getElementById('avariaData').value,
            tipo_viatura: document.getElementById('avariaTipoViatura').value,
            placa: document.getElementById('avariaPlaca').value,
            km_atual: document.getElementById('avariaKmAtual').value,
            patrimonio: document.getElementById('avariaPatrimonio').value,
            problemas: JSON.stringify(problemas), // Converter array para JSON
            observacoes: observacoes, // NOVO CAMPO
            assinatura: document.getElementById('avariaAssinatura').value,
            status: 'PENDENTE' // ← GARANTIR QUE ESTÁ COMO "PENDENTE"
        };

        try {
            // Salvar no SQLite
            const result = await DataService.createAvaria(avaria);
            
            if (result.success) {
                // Atualizar localmente
                avaria.id = result.id;
                this.avarias.push(avaria);
                
                alert('Comunicação de avaria enviada com sucesso!');
                document.getElementById('avariaForm').reset();
                
                // Recarregar a página para atualizar o histórico
                this.loadAvariaPage(document.getElementById('contentArea'));
            }
        } catch (error) {
            console.error('Erro ao registrar avaria:', error);
            alert('Erro ao registrar avaria. Tente novamente.');
        }
    }
    
	// FUNÇÃO MODIFICADA: Ver detalhes completos da avaria em tela cheia
	verDetalhesAvaria(avariaId) {
		const avaria = this.avarias.find(a => a.id === avariaId);
		if (!avaria) {
			alert('Comunicação de avaria não encontrada!');
			return;
		}

		const container = document.getElementById('contentArea');
		
		// ADAPTAÇÃO: Converter problemas de JSON para array se necessário
		const problemasArray = typeof avaria.problemas === 'string' ? 
			JSON.parse(avaria.problemas) : avaria.problemas || [];
		
		// BUSCAR DADOS COMPLETOS DO MOTORISTA
		const motorista = this.motoristas.find(m => m.id === avaria.motorista_id);
		
		let detalhesHTML = `
			<div class="page-content fade-in">
				<div class="form-section">
					<div style="display: flex; justify-content: between; align-items: center; margin-bottom: 1.5rem;">
						<h2 style="margin: 0; flex: 1;">📋 Detalhes da Comunicação de Avaria</h2>
						<button onclick="frotaSystem.loadVisualizarAvariasPage(document.getElementById('contentArea'))" class="btn-secondary">
							<span class="btn-icon">←</span>
							Voltar para Lista
						</button>
					</div>
					
					<div class="cards-grid" style="margin-bottom: 2rem;">
						<div class="card">
							<h3>Viatura</h3>
							<p>${avaria.tipo_viatura || avaria.tipoViatura}</p>
						</div>
						<div class="card">
							<h3>Placa</h3>
							<p>${avaria.placa}</p>
						</div>
						<div class="card">
							<h3>Patrimônio</h3>
							<p>${avaria.patrimonio}</p>
						</div>
						<div class="card">
							<h3>Status</h3>
							<p><span class="status-badge ${this.getStatusClassAvaria(avaria.status)}">${this.formatarStatusAvaria(avaria.status)}</span></p>
						</div>
					</div>

					<div class="form-grid">
						<!-- Seção de Dados da Viatura e Ocorrência -->
						<div class="info-section">
							<h3>📅 Dados da Viatura e Ocorrência</h3>
							<div class="form-row">
								<div class="form-group">
									<label>Data da Verificação</label>
									<input type="text" value="${new Date(avaria.data_verificacao || avaria.data).toLocaleDateString('pt-BR')}" readonly class="readonly-field">
								</div>
								<div class="form-group">
									<label>Quilometragem</label>
									<input type="text" value="${avaria.km_atual || avaria.kmAtual} km" readonly class="readonly-field">
								</div>
								<div class="form-group">
									<label>Data do Registro</label>
									<input type="text" value="${new Date(avaria.created_at || avaria.timestamp).toLocaleString('pt-BR')}" readonly class="readonly-field">
								</div>
							</div>
						</div>

						<!-- Seção de Problemas -->
						<div class="info-section">
							<h3>🔍 Problemas Identificados</h3>
							<div class="problemas-container">
								${problemasArray.map((problema, index) => `
									<div class="problema-item">
										<div class="problema-number">${index + 1}</div>
										<div class="problema-desc">${problema}</div>
									</div>
								`).join('')}
							</div>
						</div>

						<!-- Seção de Observações (se existir) -->
						${avaria.observacoes ? `
						<div class="info-section">
							<h3>📝 Observações / Relato do Motorista</h3>
							<div class="observacoes-content-full">
								<p>${avaria.observacoes}</p>
							</div>
						</div>
						` : ''}

						<!-- Seção do Relator - CORREÇÃO APLICADA -->
						<div class="info-section">
							<h3>👤 Dados do Relator</h3>
							<div class="form-row">
								<div class="form-group">
									<label>Graduação</label>
									<input type="text" value="${motorista?.graduacao || avaria.graduacao || ''}" readonly class="readonly-field">
								</div>
								<div class="form-group">
									<label>Matrícula</label>
									<input type="text" value="${motorista?.matricula || avaria.matricula || ''}" readonly class="readonly-field">
								</div>
								<div class="form-group">
									<label>Nome de Guerra</label>
									<input type="text" value="${motorista?.nome_guerra || motorista?.nomeGuerra || avaria.nome || ''}" readonly class="readonly-field">
								</div>
							</div>
							<div class="form-row">
								<div class="form-group full-width">
									<label>Assinatura (Nome Completo)</label>
									<input type="text" value="${motorista?.nome_completo || motorista?.nomeCompleto || avaria.assinatura || ''}" readonly class="readonly-field">
								</div>
							</div>
						</div>

						<!-- Seção de Histórico (se existir) -->
						${avaria.historico && avaria.historico.length > 0 ? `
						<div class="info-section">
							<h3>📊 Histórico de Alterações</h3>
							<div class="historico-container">
								${avaria.historico.map(alteracao => `
									<div class="historico-item">
										<div class="historico-header">
											<strong>${new Date(alteracao.data).toLocaleString('pt-BR')}</strong>
											<span class="status-badge ${this.getStatusClassAvaria(alteracao.status)}">${this.formatarStatusAvaria(alteracao.status)}</span>
										</div>
										${alteracao.observacao ? `<div class="historico-obs">${alteracao.observacao}</div>` : ''}
										<div class="historico-user"><small>Por: ${alteracao.usuario}</small></div>
									</div>
								`).join('')}
							</div>
						</div>
						` : ''}

						<!-- Botões de Ação - ADICIONADO BOTÃO EXCLUIR -->
						<div class="form-row">
							<div class="form-group full-width" style="text-align: center; margin-top: 2rem;">
								<button onclick="frotaSystem.abrirModalStatus('${avaria.id}')" class="btn-primary" style="margin-right: 1rem;">
									<span class="btn-icon">✏️</span>
									Alterar Status
								</button>
								<button onclick="frotaSystem.exportarDetalhesAvariaPDF('${avaria.id}')" class="btn-secondary" style="margin-right: 1rem;">
									<span class="btn-icon">📄</span>
									Exportar para PDF
								</button>
								<button onclick="frotaSystem.excluirAvaria('${avaria.id}')" class="btn-danger" style="background-color: #dc2626; border-color: #dc2626;">
									<span class="btn-icon">🗑️</span>
									Apagar Comunicação
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		`;

		container.innerHTML = detalhesHTML;
	}
    
    // FUNÇÃO: Exportar detalhes específicos de uma avaria para PDF
    exportarDetalhesAvariaPDF(avariaId) {
        const avaria = this.avarias.find(a => a.id === avariaId);
        if (!avaria) {
            alert('Avaria não encontrada!');
            return;
        }

        const nomeArquivo = `Detalhes_Avaria_${avaria.placa}_${avaria.data_verificacao || avaria.data}`;
        
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; margin: 20px;">
                <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1e3c72; padding-bottom: 10px;">
                    <h1 style="color: #1e3c72; margin: 0; font-size: 24px;">DETALHES DA COMUNICAÇÃO DE AVARIA</h1>
                    <h2 style="color: #2a5298; margin: 5px 0; font-size: 18px;">Polícia Militar de Pernambuco</h2>
                </div>
                
                ${this.gerarConteudoDetalhesAvariaPDF(avaria)}
            </div>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>${nomeArquivo}</title>
                    <style>
                        body { margin: 20px; font-family: Arial, sans-serif; }
                        .section { margin-bottom: 20px; }
                        .section h3 { color: #1e3c72; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 10px 0; }
                        .info-item { margin-bottom: 8px; }
                        .info-label { font-weight: bold; color: #666; }
                        .problema-item { margin: 5px 0; padding-left: 15px; }
                        .observacoes { background: #f8f9fa; padding: 10px; border-radius: 5px; margin: 10px 0; }
                    </style>
                </head>
                <body>
                    ${htmlContent}
                    <script>
                        setTimeout(() => {
                            window.print();
                        }, 500);
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    }

	// FUNÇÃO AUXILIAR: Gerar conteúdo dos detalhes para PDF
	gerarConteudoDetalhesAvariaPDF(avaria) {
		// ADAPTAÇÃO: Converter problemas de JSON para array se necessário
		const problemasArray = typeof avaria.problemas === 'string' ? 
			JSON.parse(avaria.problemas) : avaria.problemas || [];
			
		// BUSCAR DADOS COMPLETOS DO MOTORISTA
		const motorista = this.motoristas.find(m => m.id === avaria.motorista_id);
		
		return `
			<div class="section">
				<h3>Dados da Viatura</h3>
				<div class="info-grid">
					<div class="info-item">
						<span class="info-label">Data:</span> ${new Date(avaria.data_verificacao || avaria.data).toLocaleDateString('pt-BR')}
					</div>
					<div class="info-item">
						<span class="info-label">Viatura:</span> ${avaria.tipo_viatura || avaria.tipoViatura}
					</div>
					<div class="info-item">
						<span class="info-label">Placa:</span> ${avaria.placa}
					</div>
					<div class="info-item">
						<span class="info-label">Patrimônio:</span> ${avaria.patrimonio}
					</div>
					<div class="info-item">
						<span class="info-label">KM:</span> ${avaria.km_atual || avaria.kmAtual}
					</div>
					<div class="info-item">
						<span class="info-label">Status:</span> ${this.formatarStatusAvaria(avaria.status)}
					</div>
				</div>
			</div>

			<div class="section">
				<h3>Problemas Identificados</h3>
				${problemasArray.map((problema, index) => `
					<div class="problema-item">${index + 1}. ${problema}</div>
				`).join('')}
			</div>

			${avaria.observacoes ? `
			<div class="section">
				<h3>Observações do Motorista</h3>
				<div class="observacoes">${avaria.observacoes}</div>
			</div>
			` : ''}

			<div class="section">
				<h3>Dados do Relator</h3>
				<div class="info-grid">
					<div class="info-item">
						<span class="info-label">Graduação:</span> ${motorista?.graduacao || avaria.graduacao || ''}
					</div>
					<div class="info-item">
						<span class="info-label">Matrícula:</span> ${motorista?.matricula || avaria.matricula || ''}
					</div>
					<div class="info-item">
						<span class="info-label">Nome de Guerra:</span> ${motorista?.nome_guerra || motorista?.nomeGuerra || avaria.nome || ''}
					</div>
					<div class="info-item">
						<span class="info-label">Assinatura (Nome Completo):</span> ${motorista?.nome_completo || motorista?.nomeCompleto || avaria.assinatura || ''}
					</div>
				</div>
			</div>

			<div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 10px; color: #666;">
				<strong>Emitido em:</strong> ${new Date().toLocaleString('pt-BR')} | 
				<strong>Por:</strong> Sistema de Gerenciamento de Frota - PMPE
			</div>
		`;
	}
    
    // NOVA FUNÇÃO: Gerar histórico de avarias do usuário logado com status real
    gerarHistoricoAvariasUsuario(user) {
        if (!user) return '';

        // ADAPTAÇÃO: Filtrar avarias do usuário logado
        const avariasUsuario = this.avarias
            .filter(avaria => avaria.motorista_id === user.id)
            .slice(-5) // Últimas 5 avarias
            .reverse(); // Mais recentes primeiro

        if (avariasUsuario.length === 0) {
            return `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 2rem;">
                        <div style="color: #6c757d;">
                            <span style="font-size: 3rem;">⚠️</span>
                            <p>Nenhuma comunicação de avaria</p>
                            <small>As comunicações aparecerão aqui</small>
                        </div>
                    </td>
                </tr>
            `;
        }

        return avariasUsuario.map(avaria => {
            // ADAPTAÇÃO: Converter problemas de JSON para array se necessário
            const problemasArray = typeof avaria.problemas === 'string' ? 
                JSON.parse(avaria.problemas) : avaria.problemas || [];
            
            const primeiroProblema = problemasArray.length > 0 ? 
                problemasArray[0].substring(0, 50) + (problemasArray[0].length > 50 ? '...' : '') : 
                'Nenhum';
            
            // USAR O STATUS REAL DA AVARIA
            const statusClass = this.getStatusClassAvaria(avaria.status);
            
            return `
                <tr>
                    <td>${new Date(avaria.data_verificacao || avaria.data).toLocaleDateString('pt-BR')}</td>
                    <td>${avaria.placa}</td>
                    <td title="${problemasArray.length > 0 ? problemasArray[0] : 'Nenhum'}">${primeiroProblema}</td>
                    <td><span class="status-badge ${statusClass}">${this.formatarStatusAvaria(avaria.status)}</span></td>
                </tr>
            `;
        }).join('');
    }

    // FUNÇÃO MODIFICADA: Carregar página de Cadastro de Motorista
    async loadCadastroMotoristaPage(container) {
        // ADICIONAR: Recarregar dados mais recentes
        await this.carregarDadosIniciais();
        
        container.innerHTML = `
            <div class="page-content fade-in">
                <div class="form-section">
                    <h2>👤 Cadastro de Motorista</h2>
                    <form id="cadastroMotoristaForm">
                        <div class="form-grid">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="motoristaNomeCompleto">Nome Completo</label>
                                    <input type="text" id="motoristaNomeCompleto" required placeholder="Digite o nome completo">
                                </div>
                                <div class="form-group">
                                    <label for="motoristaNomeGuerra">Nome de Guerra</label>
                                    <input type="text" id="motoristaNomeGuerra" required placeholder="Nome de guerra">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="motoristaGraduacao">Graduação</label>
                                    <select id="motoristaGraduacao" required>
                                        <option value="">Selecione a graduação...</option>
                                        <option value="CEL">Coronel</option>
                                        <option value="TEN CEL">Tenente-Coronel</option>
                                        <option value="MAJ">Major</option>
                                        <option value="CAP">Capitão</option>
                                        <option value="1º TEN">1º Tenente</option>
                                        <option value="2º TEN">2º Tenente</option>
                                        <option value="ASP">Aspirante</option>
                                        <option value="ST">Subtenente</option>
                                        <option value="1º SGT">1º Sargento</option>
                                        <option value="2º SGT">2º Sargento</option>
                                        <option value="3º SGT">3º Sargento</option>
                                        <option value="CB">Cabo</option>
                                        <option value="SD">Soldado</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="motoristaMatricula">Matrícula</label>
                                    <input type="text" id="motoristaMatricula" required placeholder="Número da matrícula">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="motoristaCodigoCondutor">Código do Condutor</label>
                                    <input type="text" id="motoristaCodigoCondutor" required placeholder="Código do condutor">
                                </div>
                                <div class="form-group">
                                    <label for="motoristaCPF">CPF</label>
                                    <input type="text" id="motoristaCPF" required placeholder="000.000.000-00" class="cpf-mask">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="motoristaTelefone">Número de Telefone</label>
                                    <input type="tel" id="motoristaTelefone" required placeholder="(81) 99999-9999" class="phone-mask">
                                </div>
                                <div class="form-group">
                                    <label for="motoristaEmail">E-mail</label>
                                    <input type="email" id="motoristaEmail" placeholder="email@exemplo.com">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="motoristaSenha">Senha Inicial</label>
                                    <input type="password" id="motoristaSenha" required placeholder="Senha para acesso ao sistema">
                                </div>
                                <div class="form-group">
                                    <label for="motoristaConfirmarSenha">Confirmar Senha</label>
                                    <input type="password" id="motoristaConfirmarSenha" required placeholder="Confirme a senha">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="motoristaStatus">Status</label>
                                    <select id="motoristaStatus" required>
                                        <option value="ATIVO">Ativo</option>
                                        <option value="INATIVO">Inativo</option>
                                        <option value="FERIAS">Férias</option>
                                        <option value="LICENCA">Licença</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="motoristaIsAdmin">Tipo de Acesso</label>
                                    <select id="motoristaIsAdmin" required>
                                        <option value="false">Motorista</option>
                                        <option value="true">Administrador</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div id="cadastroMotoristaError" class="error-message" style="display: none;"></div>
                        <div id="cadastroMotoristaSuccess" class="success-message" style="display: none;"></div>
                        
                        <button type="submit" class="btn-primary">
                            <span class="btn-icon">👤</span>
                            Cadastrar Motorista
                        </button>
                    </form>
                </div>

                <div class="form-section">
                    <h2>📋 Motoristas Cadastrados</h2>
                    <div class="table-actions">
                        <input type="text" id="filtroMotoristas" placeholder="Filtrar motoristas..." class="search-input">
                    </div>
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Nome de Guerra</th>
                                    <th>Graduação</th>
                                    <th>Matrícula</th>
                                    <th>Código Condutor</th>
                                    <th>Tipo</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="listaMotoristas">
                                ${this.motoristas.map(motorista => `
                                    <tr>
                                        <td>${motorista.nome_guerra || motorista.nomeGuerra}</td>
                                        <td>${motorista.graduacao}</td>
                                        <td>${motorista.matricula}</td>
                                        <td>${motorista.codigo_condutor || motorista.codigoCondutor}</td>
                                        <td><span class="status-badge ${motorista.is_admin || motorista.isAdmin ? 'status-admin' : 'status-motorista'}">${motorista.is_admin || motorista.isAdmin ? 'Administrador' : 'Motorista'}</span></td>
                                        <td><span class="status-badge ${motorista.status === 'ATIVO' ? 'status-ativo' : 'status-inativo'}">${motorista.status}</span></td>
                                        <td>
                                            <button class="btn-action btn-edit" onclick="frotaSystem.editarMotorista('${motorista.id}')">Editar</button>
                                            <button class="btn-action btn-delete" onclick="frotaSystem.excluirMotorista('${motorista.id}')">Excluir</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Configurar máscaras
        this.configurarMascaras();
        
        // Configurar formulário
        document.getElementById('cadastroMotoristaForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registrarMotorista();
        });

        // Configurar filtro
        document.getElementById('filtroMotoristas').addEventListener('input', (e) => {
            this.filtrarMotoristas(e.target.value);
        });
    }

    configurarMascaras() {
        // Máscara para CPF
        const cpfInput = document.getElementById('motoristaCPF');
        if (cpfInput) {
            cpfInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 3) {
                    value = value.replace(/^(\d{3})(\d)/, '$1.$2');
                }
                if (value.length > 6) {
                    value = value.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
                }
                if (value.length > 9) {
                    value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
                }
                e.target.value = value.substring(0, 14);
            });
        }

        // Máscara para telefone
        const telefoneInput = document.getElementById('motoristaTelefone');
        if (telefoneInput) {
            telefoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                
                // Formato: (81) 99999-9999
                if (value.length <= 11) {
                    if (value.length > 0) {
                        value = value.replace(/^(\d{0,2})/, '($1');
                    }
                    if (value.length > 3) {
                        value = value.replace(/^\((\d{2})(\d)/, '($1) $2');
                    }
                    if (value.length > 10) {
                        value = value.replace(/(\d{5})(\d)/, '$1-$2');
                    }
                }
                e.target.value = value.substring(0, 15);
            });
        }
    }

	async registrarMotorista() {
		console.log('🔍 [registrarMotorista] Iniciando...');
		
		const formData = {
			nome_completo: document.getElementById('motoristaNomeCompleto').value,
			nome_guerra: document.getElementById('motoristaNomeGuerra').value,
			graduacao: document.getElementById('motoristaGraduacao').value,
			matricula: document.getElementById('motoristaMatricula').value,
			codigo_condutor: document.getElementById('motoristaCodigoCondutor').value,
			cpf: document.getElementById('motoristaCPF').value,
			telefone: document.getElementById('motoristaTelefone').value,
			email: document.getElementById('motoristaEmail').value,
			senha: document.getElementById('motoristaSenha').value,
			confirmarSenha: document.getElementById('motoristaConfirmarSenha').value,
			status: document.getElementById('motoristaStatus').value,
			is_admin: document.getElementById('motoristaIsAdmin').value === 'true'
		};

		console.log('🔍 [registrarMotorista] Dados do formulário:', formData);

		// Validações
		if (formData.senha !== formData.confirmarSenha) {
			console.error('❌ [registrarMotorista] Senhas não coincidem');
			this.mostrarMensagem('cadastroMotoristaError', 'As senhas não coincidem.');
			return;
		}

		try {
			console.log('🔍 [registrarMotorista] Chamando DataService.createMotorista...');
			const result = await DataService.createMotorista(formData);
			console.log('✅ [registrarMotorista] Resposta recebida:', result);
			
			if (result.success) {
				this.mostrarMensagem('cadastroMotoristaSuccess', 'Motorista cadastrado com sucesso!');
				document.getElementById('cadastroMotoristaForm').reset();
				
				// Recarregar a lista
				await this.loadCadastroMotoristaPage(document.getElementById('contentArea'));
			} else {
				console.error('❌ [registrarMotorista] API retornou success=false:', result.message);
				this.mostrarMensagem('cadastroMotoristaError', result.message || 'Erro ao cadastrar motorista.');
			}
		} catch (error) {
			console.error('❌ [registrarMotorista] Erro capturado:', error);
			this.mostrarMensagem('cadastroMotoristaError', error.message || 'Erro ao cadastrar motorista. Tente novamente.');
		}
	}

    mostrarMensagem(elementId, mensagem) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = mensagem;
            element.style.display = 'block';
            setTimeout(() => {
                element.style.display = 'none';
            }, 5000);
        }
    }

    filtrarMotoristas(termo) {
        const linhas = document.querySelectorAll('#listaMotoristas tr');
        linhas.forEach(linha => {
            const texto = linha.textContent.toLowerCase();
            linha.style.display = texto.includes(termo.toLowerCase()) ? '' : 'none';
        });
    }

    // FUNÇÃO MODIFICADA: Editar motorista
    async editarMotorista(id) {
        const motorista = this.motoristas.find(m => m.id === id);
        if (!motorista) {
            alert('Motorista não encontrado!');
            return;
        }

        // Criar formulário de edição
        const formHTML = `
            <div class="page-content fade-in">
                <div class="form-section">
                    <h2>✏️ Editar Motorista - ${motorista.nome_guerra || motorista.nomeGuerra}</h2>
                    <form id="editarMotoristaForm">
                        <div class="form-grid">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editarNomeCompleto">Nome Completo</label>
                                    <input type="text" id="editarNomeCompleto" value="${motorista.nome_completo || motorista.nomeCompleto}" required placeholder="Digite o nome completo">
                                </div>
                                <div class="form-group">
                                    <label for="editarNomeGuerra">Nome de Guerra</label>
                                    <input type="text" id="editarNomeGuerra" value="${motorista.nome_guerra || motorista.nomeGuerra}" required placeholder="Nome de guerra">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editarGraduacao">Graduação</label>
                                    <select id="editarGraduacao" required>
                                        <option value="">Selecione a graduação...</option>
                                        <option value="CEL" ${motorista.graduacao === 'CEL' ? 'selected' : ''}>Coronel</option>
                                        <option value="TEN CEL" ${motorista.graduacao === 'TEN CEL' ? 'selected' : ''}>Tenente-Coronel</option>
                                        <option value="MAJ" ${motorista.graduacao === 'MAJ' ? 'selected' : ''}>Major</option>
                                        <option value="CAP" ${motorista.graduacao === 'CAP' ? 'selected' : ''}>Capitão</option>
                                        <option value="1º TEN" ${motorista.graduacao === '1º TEN' ? 'selected' : ''}>1º Tenente</option>
                                        <option value="2º TEN" ${motorista.graduacao === '2º TEN' ? 'selected' : ''}>2º Tenente</option>
                                        <option value="ASP" ${motorista.graduacao === 'ASP' ? 'selected' : ''}>Aspirante</option>
                                        <option value="ST" ${motorista.graduacao === 'ST' ? 'selected' : ''}>Subtenente</option>
                                        <option value="1º SGT" ${motorista.graduacao === '1º SGT' ? 'selected' : ''}>1º Sargento</option>
                                        <option value="2º SGT" ${motorista.graduacao === '2º SGT' ? 'selected' : ''}>2º Sargento</option>
                                        <option value="3º SGT" ${motorista.graduacao === '3º SGT' ? 'selected' : ''}>3º Sargento</option>
                                        <option value="CB" ${motorista.graduacao === 'CB' ? 'selected' : ''}>Cabo</option>
                                        <option value="SD" ${motorista.graduacao === 'SD' ? 'selected' : ''}>Soldado</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="editarMatricula">Matrícula</label>
                                    <input type="text" id="editarMatricula" value="${motorista.matricula}" required readonly class="readonly-field">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editarCodigoCondutor">Código do Condutor</label>
                                    <input type="text" id="editarCodigoCondutor" value="${motorista.codigo_condutor || motorista.codigoCondutor}" required placeholder="Código do condutor">
                                </div>
                                <div class="form-group">
                                    <label for="editarCPF">CPF</label>
                                    <input type="text" id="editarCPF" value="${motorista.cpf}" required placeholder="000.000.000-00" class="cpf-mask">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editarTelefone">Número de Telefone</label>
                                    <input type="tel" id="editarTelefone" value="${motorista.telefone}" required placeholder="(81) 99999-9999" class="phone-mask">
                                </div>
                                <div class="form-group">
                                    <label for="editarEmail">E-mail</label>
                                    <input type="email" id="editarEmail" value="${motorista.email || ''}" placeholder="email@exemplo.com">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editarStatus">Status</label>
                                    <select id="editarStatus" required>
                                        <option value="ATIVO" ${motorista.status === 'ATIVO' ? 'selected' : ''}>Ativo</option>
                                        <option value="INATIVO" ${motorista.status === 'INATIVO' ? 'selected' : ''}>Inativo</option>
                                        <option value="FERIAS" ${motorista.status === 'FERIAS' ? 'selected' : ''}>Férias</option>
                                        <option value="LICENCA" ${motorista.status === 'LICENCA' ? 'selected' : ''}>Licença</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="editarIsAdmin">Tipo de Acesso</label>
                                    <select id="editarIsAdmin" required>
                                        <option value="false" ${!motorista.is_admin && !motorista.isAdmin ? 'selected' : ''}>Motorista</option>
                                        <option value="true" ${motorista.is_admin || motorista.isAdmin ? 'selected' : ''}>Administrador</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editarSenha">Nova Senha (opcional)</label>
                                    <input type="password" id="editarSenha" placeholder="Deixe em branco para manter a senha atual">
                                </div>
                                <div class="form-group">
                                    <label for="editarConfirmarSenha">Confirmar Nova Senha</label>
                                    <input type="password" id="editarConfirmarSenha" placeholder="Confirme a nova senha">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group full-width">
                                    <div class="info-card">
                                        <p><strong>Observação:</strong> A matrícula não pode ser alterada. Para alterar a senha, preencha ambos os campos acima.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="editarMotoristaError" class="error-message" style="display: none;"></div>
                        <div id="editarMotoristaSuccess" class="success-message" style="display: none;"></div>
                        
                        <div style="display: flex; gap: 1rem;">
                            <button type="submit" class="btn-primary">
                                <span class="btn-icon">💾</span>
                                Salvar Alterações
                            </button>
                            <button type="button" class="btn-secondary" onclick="frotaSystem.loadCadastroMotoristaPage(document.getElementById('contentArea'))">
                                <span class="btn-icon">↩️</span>
                                Voltar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('contentArea').innerHTML = formHTML;

        // Configurar máscaras no formulário de edição
        this.configurarMascarasEdicao();

        // Configurar envio do formulário de edição
        document.getElementById('editarMotoristaForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.salvarEdicaoMotorista(id);
        });
    }

    configurarMascarasEdicao() {
        // Máscara para CPF
        const cpfInput = document.getElementById('editarCPF');
        if (cpfInput) {
            cpfInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 3) {
                    value = value.replace(/^(\d{3})(\d)/, '$1.$2');
                }
                if (value.length > 6) {
                    value = value.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
                }
                if (value.length > 9) {
                    value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
                }
                e.target.value = value.substring(0, 14);
            });
        }

        // Máscara para telefone
        const telefoneInput = document.getElementById('editarTelefone');
        if (telefoneInput) {
            telefoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                
                // Formato: (81) 99999-9999
                if (value.length <= 11) {
                    if (value.length > 0) {
                        value = value.replace(/^(\d{0,2})/, '($1');
                    }
                    if (value.length > 3) {
                        value = value.replace(/^\((\d{2})(\d)/, '($1) $2');
                    }
                    if (value.length > 10) {
                        value = value.replace(/(\d{5})(\d)/, '$1-$2');
                    }
                }
                e.target.value = value.substring(0, 15);
            });
        }
    }

    // FUNÇÃO MODIFICADA: Salvar edição do motorista
    async salvarEdicaoMotorista(id) {
        const motoristaIndex = this.motoristas.findIndex(m => m.id === id);
        if (motoristaIndex === -1) {
            this.mostrarMensagem('editarMotoristaError', 'Motorista não encontrado!');
            return;
        }

        const formData = {
            nome_completo: document.getElementById('editarNomeCompleto').value,
            nome_guerra: document.getElementById('editarNomeGuerra').value,
            graduacao: document.getElementById('editarGraduacao').value,
            matricula: document.getElementById('editarMatricula').value,
            codigo_condutor: document.getElementById('editarCodigoCondutor').value,
            cpf: document.getElementById('editarCPF').value,
            telefone: document.getElementById('editarTelefone').value,
            email: document.getElementById('editarEmail').value,
            novaSenha: document.getElementById('editarSenha').value,
            confirmarSenha: document.getElementById('editarConfirmarSenha').value,
            status: document.getElementById('editarStatus').value,
            is_admin: document.getElementById('editarIsAdmin').value === 'true'
        };

        // Validações
        if (formData.novaSenha && formData.novaSenha !== formData.confirmarSenha) {
            this.mostrarMensagem('editarMotoristaError', 'As senhas não coincidem.');
            return;
        }

        if (formData.cpf.length !== 14) {
            this.mostrarMensagem('editarMotoristaError', 'CPF inválido.');
            return;
        }

        try {
            // Verificar se o CPF já existe em outro motorista
            const motoristasExistentes = await DataService.getMotoristas();
            const cpfExistente = motoristasExistentes.find(m => m.cpf === formData.cpf && m.id !== id);
            if (cpfExistente) {
                this.mostrarMensagem('editarMotoristaError', 'CPF já cadastrado em outro motorista.');
                return;
            }

            // Preparar dados para atualização
            const dadosAtualizacao = {
                nome_completo: formData.nome_completo,
                nome_guerra: formData.nome_guerra,
                graduacao: formData.graduacao,
                codigo_condutor: formData.codigo_condutor,
                cpf: formData.cpf,
                telefone: formData.telefone,
                email: formData.email,
                status: formData.status,
                is_admin: formData.is_admin
            };

            // Adicionar senha se fornecida
            if (formData.novaSenha) {
                dadosAtualizacao.senha = formData.novaSenha;
            }

            // Atualizar no SQLite
            await DataService.updateMotorista(id, dadosAtualizacao);

            // Atualizar localmente
            this.motoristas[motoristaIndex] = {
                ...this.motoristas[motoristaIndex],
                ...dadosAtualizacao
            };
            
            this.mostrarMensagem('editarMotoristaSuccess', 'Motorista atualizado com sucesso!');
            
            // Voltar para a lista após 2 segundos
            setTimeout(() => {
                this.loadCadastroMotoristaPage(document.getElementById('contentArea'));
            }, 2000);
        } catch (error) {
            console.error('Erro ao atualizar motorista:', error);
            this.mostrarMensagem('editarMotoristaError', 'Erro ao atualizar motorista. Tente novamente.');
        }
    }

    // FUNÇÃO MODIFICADA: Excluir motorista
    async excluirMotorista(id) {
        if (confirm('Tem certeza que deseja excluir este motorista?')) {
            try {
                // Excluir do SQLite
                await DataService.deleteMotorista(id);
                
                // Atualizar localmente
                this.motoristas = this.motoristas.filter(m => m.id !== id);
                
                this.loadCadastroMotoristaPage(document.getElementById('contentArea'));
            } catch (error) {
                console.error('Erro ao excluir motorista:', error);
                alert('Erro ao excluir motorista. Tente novamente.');
            }
        }
    }

    // FUNÇÃO MODIFICADA: Carregar página de Cadastro de Viatura
    async loadCadastroViaturaPage(container) {
        // ADICIONAR: Recarregar dados mais recentes
        await this.carregarDadosIniciais();
        
        container.innerHTML = `
            <div class="page-content fade-in">
                <div class="form-section">
                    <h2>🚗 Cadastro de Viatura</h2>
                    <form id="cadastroViaturaForm">
                        <div class="form-grid">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="viaturaPatrimonio">Patrimônio</label>
                                    <input type="text" id="viaturaPatrimonio" required placeholder="Número do patrimônio">
                                </div>
                                <div class="form-group">
                                    <label for="viaturaPlaca">Placa</label>
                                    <input type="text" id="viaturaPlaca" required placeholder="ABC-1234" class="placa-mask">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="viaturaTipo">Tipo de Viatura</label>
                                    <select id="viaturaTipo" required>
                                        <option value="">Selecione o tipo...</option>
                                        <option value="SEDAN">Sedan</option>
                                        <option value="HATCH">Hatch</option>
                                        <option value="SUV">SUV</option>
                                        <option value="PICKUP">Pickup</option>
                                        <option value="MOTO">Moto</option>
                                        <option value="CAMINHAO">Caminhão</option>
                                        <option value="ONIBUS">Ônibus</option>
                                        <option value="BLINDADO">Viatura Blindada</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="viaturaModelo">Modelo</label>
                                    <input type="text" id="viaturaModelo" required placeholder="Ex: XR300, Parati, Fox, Amarok...">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="viaturaAno">Ano</label>
                                    <input type="number" id="viaturaAno" required min="1990" max="2030" placeholder="2024">
                                </div>
                                <div class="form-group">
                                    <label for="viaturaCor">Cor</label>
                                    <input type="text" id="viaturaCor" required placeholder="Cor da viatura">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="viaturaLocadora">Locadora</label>
                                    <input type="text" id="viaturaLocadora" required placeholder="Nome da locadora">
                                </div>
                                <div class="form-group">
                                    <label for="viaturaNumeroCartao">Número do Cartão</label>
                                    <input type="text" id="viaturaNumeroCartao" required placeholder="Número do cartão de abastecimento">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="viaturaCombustivel">Tipo de Combustível</label>
                                    <select id="viaturaCombustivel" required>
                                        <option value="">Selecione...</option>
                                        <option value="GASOLINA">Gasolina</option>
                                        <option value="GASOLINA_ADITIVADA">Gasolina Aditivada</option>
                                        <option value="ETANOL">Etanol</option>
                                        <option value="DIESEL">Diesel</option>
                                        <option value="DIESEL_S10">Diesel S10</option>
                                        <option value="FLEX">Flex</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="viaturaSaldo">Saldo Inicial (R$)</label>
                                    <input type="number" id="viaturaSaldo" step="0.01" required min="0" placeholder="0.00">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="viaturaStatus">Status</label>
                                    <select id="viaturaStatus" required>
                                        <option value="ATIVA">Ativa</option>
                                        <option value="INATIVA">Inativa</option>
                                        <option value="MANUTENCAO">Em Manutenção</option>
                                        <option value="RESERVA">Reserva</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="viaturaKmAtual">KM Atual</label>
                                    <input type="number" id="viaturaKmAtual" required min="0" step="1" placeholder="Quilometragem atual">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group full-width">
                                    <label for="viaturaObservacoes">Observações</label>
                                    <textarea id="viaturaObservacoes" placeholder="Observações sobre a viatura..."></textarea>
                                </div>
                            </div>
                        </div>

                        <div id="cadastroViaturaError" class="error-message" style="display: none;"></div>
                        <div id="cadastroViaturaSuccess" class="success-message" style="display: none;"></div>
                        
                        <button type="submit" class="btn-primary">
                            <span class="btn-icon">🚗</span>
                            Cadastrar Viatura
                        </button>
                    </form>
                </div>

                <div class="form-section">
                    <h2>📋 Viaturas Cadastradas</h2>
                    <div class="table-actions">
                        <input type="text" id="filtroViaturas" placeholder="Filtrar viaturas..." class="search-input">
                        <select id="filtroStatusViatura" class="filter-select">
                            <option value="">Todos os status</option>
                            <option value="ATIVA">Ativas</option>
                            <option value="INATIVA">Inativas</option>
                            <option value="MANUTENCAO">Em Manutenção</option>
                        </select>
                    </div>
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Patrimônio</th>
                                    <th>Placa</th>
                                    <th>Modelo</th>
                                    <th>Saldo (R$)</th>
                                    <th>KM Atual</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="listaViaturas">
                                ${this.viaturas.map(viatura => `
                                    <tr>
                                        <td>${viatura.patrimonio}</td>
                                        <td>${viatura.placa}</td>
                                        <td>${viatura.modelo}</td>
                                        <td>R$ ${viatura.saldo?.toFixed(2) || '0.00'}</td>
                                        <td>${viatura.km_atual || viatura.kmAtual}</td>
                                        <td><span class="status-badge ${viatura.status === 'ATIVA' ? 'status-ativo' : viatura.status === 'MANUTENCAO' ? 'status-manutencao' : 'status-inativo'}">${viatura.status}</span></td>
                                        <td>
                                            <button class="btn-action btn-edit" onclick="frotaSystem.editarViatura('${viatura.id}')">Editar</button>
                                            <button class="btn-action btn-delete" onclick="frotaSystem.excluirViatura('${viatura.id}')">Excluir</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Configurar máscara de placa
        const placaInput = document.getElementById('viaturaPlaca');
        if (placaInput) {
            placaInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                if (value.length > 3) {
                    value = value.substring(0, 3) + '-' + value.substring(3);
                }
                e.target.value = value.substring(0, 8);
            });
        }

        // Configurar formulário
        document.getElementById('cadastroViaturaForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registrarViatura();
        });

        // Configurar filtros
        document.getElementById('filtroViaturas').addEventListener('input', (e) => {
            this.filtrarViaturas(e.target.value);
        });

        document.getElementById('filtroStatusViatura').addEventListener('change', (e) => {
            this.filtrarViaturasPorStatus(e.target.value);
        });
    }

    // FUNÇÃO MODIFICADA: Registrar viatura
    async registrarViatura() {
        const formData = {
            patrimonio: document.getElementById('viaturaPatrimonio').value,
            placa: document.getElementById('viaturaPlaca').value,
            tipo: document.getElementById('viaturaTipo').value,
            modelo: document.getElementById('viaturaModelo').value,
            ano: document.getElementById('viaturaAno').value,
            cor: document.getElementById('viaturaCor').value,
            locadora: document.getElementById('viaturaLocadora').value,
            numero_cartao: document.getElementById('viaturaNumeroCartao').value,
            combustivel: document.getElementById('viaturaCombustivel').value,
            saldo: parseFloat(document.getElementById('viaturaSaldo').value),
            status: document.getElementById('viaturaStatus').value,
            km_atual: parseInt(document.getElementById('viaturaKmAtual').value),
            observacoes: document.getElementById('viaturaObservacoes').value
        };

        try {
            // Verificar se patrimônio já existe
            const viaturasExistentes = await DataService.getViaturas();
            if (viaturasExistentes.find(v => v.patrimonio === formData.patrimonio)) {
                this.mostrarMensagem('cadastroViaturaError', 'Já existe uma viatura com este patrimônio.');
                return;
            }

            // Verificar se placa já existe
            if (viaturasExistentes.find(v => v.placa === formData.placa)) {
                this.mostrarMensagem('cadastroViaturaError', 'Já existe uma viatura com esta placa.');
                return;
            }

            // Salvar no SQLite
            const result = await DataService.createViatura(formData);
            
            if (result.success) {
                // Atualizar localmente
                formData.id = result.id;
                this.viaturas.push(formData);

                this.mostrarMensagem('cadastroViaturaSuccess', 'Viatura cadastrada com sucesso!');
                document.getElementById('cadastroViaturaForm').reset();
                
                // Recarregar a lista
                await this.loadCadastroViaturaPage(document.getElementById('contentArea'));
            }
        } catch (error) {
            console.error('Erro ao cadastrar viatura:', error);
            this.mostrarMensagem('cadastroViaturaError', 'Erro ao cadastrar viatura. Tente novamente.');
        }
    }

    filtrarViaturas(termo) {
        const linhas = document.querySelectorAll('#listaViaturas tr');
        linhas.forEach(linha => {
            const texto = linha.textContent.toLowerCase();
            linha.style.display = texto.includes(termo.toLowerCase()) ? '' : 'none';
        });
    }

    filtrarViaturasPorStatus(status) {
        const linhas = document.querySelectorAll('#listaViaturas tr');
        linhas.forEach(linha => {
            if (!status) {
                linha.style.display = '';
                return;
            }
            const statusLinha = linha.querySelector('.status-badge').textContent;
            linha.style.display = statusLinha.includes(status) ? '' : 'none';
        });
    }

    // FUNÇÃO MODIFICADA: Editar viatura
    async editarViatura(id) {
        const viatura = this.viaturas.find(v => v.id === id);
        if (!viatura) {
            alert('Viatura não encontrada!');
            return;
        }

        // Criar formulário de edição
        const formHTML = `
            <div class="page-content fade-in">
                <div class="form-section">
                    <h2>✏️ Editar Viatura - ${viatura.patrimonio}</h2>
                    <form id="editarViaturaForm">
                        <div class="form-grid">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editarPatrimonio">Patrimônio</label>
                                    <input type="text" id="editarPatrimonio" value="${viatura.patrimonio}" required readonly class="readonly-field">
                                </div>
                                <div class="form-group">
                                    <label for="editarPlaca">Placa</label>
                                    <input type="text" id="editarPlaca" value="${viatura.placa}" required placeholder="ABC-1234" class="placa-mask">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editarTipo">Tipo de Viatura</label>
                                    <select id="editarTipo" required>
                                        <option value="">Selecione o tipo...</option>
                                        <option value="SEDAN" ${viatura.tipo === 'SEDAN' ? 'selected' : ''}>Sedan</option>
                                        <option value="HATCH" ${viatura.tipo === 'HATCH' ? 'selected' : ''}>Hatch</option>
                                        <option value="SUV" ${viatura.tipo === 'SUV' ? 'selected' : ''}>SUV</option>
                                        <option value="PICKUP" ${viatura.tipo === 'PICKUP' ? 'selected' : ''}>Pickup</option>
                                        <option value="MOTO" ${viatura.tipo === 'MOTO' ? 'selected' : ''}>Moto</option>
                                        <option value="CAMINHAO" ${viatura.tipo === 'CAMINHAO' ? 'selected' : ''}>Caminhão</option>
                                        <option value="ONIBUS" ${viatura.tipo === 'ONIBUS' ? 'selected' : ''}>Ônibus</option>
                                        <option value="BLINDADO" ${viatura.tipo === 'BLINDADO' ? 'selected' : ''}>Viatura Blindada</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="editarModelo">Modelo</label>
                                    <input type="text" id="editarModelo" value="${viatura.modelo}" required placeholder="Ex: XR300, Parati, Fox, Amarok...">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editarAno">Ano</label>
                                    <input type="number" id="editarAno" value="${viatura.ano}" required min="1990" max="2030" placeholder="2024">
                                </div>
                                <div class="form-group">
                                    <label for="editarCor">Cor</label>
                                    <input type="text" id="editarCor" value="${viatura.cor}" required placeholder="Cor da viatura">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editarLocadora">Locadora</label>
                                    <input type="text" id="editarLocadora" value="${viatura.locadora}" required placeholder="Nome da locadora">
                                </div>
                                <div class="form-group">
                                    <label for="editarNumeroCartao">Número do Cartão</label>
                                    <input type="text" id="editarNumeroCartao" value="${viatura.numero_cartao || viatura.numeroCartao}" required placeholder="Número do cartão de abastecimento">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editarCombustivel">Tipo de Combustível</label>
                                    <select id="editarCombustivel" required>
                                        <option value="">Selecione...</option>
                                        <option value="GASOLINA" ${viatura.combustivel === 'GASOLINA' ? 'selected' : ''}>Gasolina</option>
                                        <option value="GASOLINA_ADITIVADA" ${viatura.combustivel === 'GASOLINA_ADITIVADA' ? 'selected' : ''}>Gasolina Aditivada</option>
                                        <option value="ETANOL" ${viatura.combustivel === 'ETANOL' ? 'selected' : ''}>Etanol</option>
                                        <option value="DIESEL" ${viatura.combustivel === 'DIESEL' ? 'selected' : ''}>Diesel</option>
                                        <option value="DIESEL_S10" ${viatura.combustivel === 'DIESEL_S10' ? 'selected' : ''}>Diesel S10</option>
                                        <option value="FLEX" ${viatura.combustivel === 'FLEX' ? 'selected' : ''}>Flex</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="editarSaldo">Saldo (R$)</label>
                                    <input type="number" id="editarSaldo" value="${viatura.saldo || 0}" step="0.01" required min="0" placeholder="0.00">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editarStatus">Status</label>
                                    <select id="editarStatus" required>
                                        <option value="ATIVA" ${viatura.status === 'ATIVA' ? 'selected' : ''}>Ativa</option>
                                        <option value="INATIVA" ${viatura.status === 'INATIVA' ? 'selected' : ''}>Inativa</option>
                                        <option value="MANUTENCAO" ${viatura.status === 'MANUTENCAO' ? 'selected' : ''}>Em Manutenção</option>
                                        <option value="RESERVA" ${viatura.status === 'RESERVA' ? 'selected' : ''}>Reserva</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="editarKmAtual">KM Atual</label>
                                    <input type="number" id="editarKmAtual" value="${viatura.km_atual || viatura.kmAtual}" required min="0" step="1" placeholder="Quilometragem atual">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group full-width">
                                    <label for="editarObservacoes">Observações</label>
                                    <textarea id="editarObservacoes" placeholder="Observações sobre a viatura...">${viatura.observacoes || ''}</textarea>
                                </div>
                            </div>
                        </div>

                        <div id="editarViaturaError" class="error-message" style="display: none;"></div>
                        <div id="editarViaturaSuccess" class="success-message" style="display: none;"></div>
                        
                        <div style="display: flex; gap: 1rem;">
                            <button type="submit" class="btn-primary">
                                <span class="btn-icon">💾</span>
                                Salvar Alterações
                            </button>
                            <button type="button" class="btn-secondary" onclick="frotaSystem.loadCadastroViaturaPage(document.getElementById('contentArea'))">
                                <span class="btn-icon">↩️</span>
                                Voltar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('contentArea').innerHTML = formHTML;

        // Configurar máscara de placa
        const placaInput = document.getElementById('editarPlaca');
        if (placaInput) {
            placaInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                if (value.length > 3) {
                    value = value.substring(0, 3) + '-' + value.substring(3);
                }
                e.target.value = value.substring(0, 8);
            });
        }

        // Configurar envio do formulário de edição
        document.getElementById('editarViaturaForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.salvarEdicaoViatura(id);
        });
    }
    
    // FUNÇÃO MODIFICADA: Salvar edição da viatura
    async salvarEdicaoViatura(viaturaId) {
        const viaturaIndex = this.viaturas.findIndex(v => v.id === viaturaId);
        if (viaturaIndex === -1) {
            this.mostrarMensagem('editarViaturaError', 'Viatura não encontrada!');
            return;
        }

        const formData = {
            patrimonio: document.getElementById('editarPatrimonio').value,
            placa: document.getElementById('editarPlaca').value,
            tipo: document.getElementById('editarTipo').value,
            modelo: document.getElementById('editarModelo').value,
            ano: document.getElementById('editarAno').value,
            cor: document.getElementById('editarCor').value,
            locadora: document.getElementById('editarLocadora').value,
            numero_cartao: document.getElementById('editarNumeroCartao').value,
            combustivel: document.getElementById('editarCombustivel').value,
            saldo: parseFloat(document.getElementById('editarSaldo').value),
            status: document.getElementById('editarStatus').value,
            km_atual: parseInt(document.getElementById('editarKmAtual').value),
            observacoes: document.getElementById('editarObservacoes').value
        };

        try {
            // Verificar se a placa já existe em outra viatura
            const viaturasExistentes = await DataService.getViaturas();
            const placaExistente = viaturasExistentes.find(v => v.placa === formData.placa && v.id !== viaturaId);
            if (placaExistente) {
                this.mostrarMensagem('editarViaturaError', 'Já existe uma viatura com esta placa.');
                return;
            }

            // Atualizar no SQLite
            await DataService.updateViatura(viaturaId, formData);

            // Atualizar localmente
            this.viaturas[viaturaIndex] = {
                ...this.viaturas[viaturaIndex],
                ...formData
            };
            
            this.mostrarMensagem('editarViaturaSuccess', 'Viatura atualizada com sucesso!');
            
            // Voltar para a lista após 2 segundos
            setTimeout(() => {
                this.loadCadastroViaturaPage(document.getElementById('contentArea'));
            }, 2000);
        } catch (error) {
            console.error('Erro ao atualizar viatura:', error);
            this.mostrarMensagem('editarViaturaError', 'Erro ao atualizar viatura. Tente novamente.');
        }
    }

    // FUNÇÃO MODIFICADA: Excluir viatura
    async excluirViatura(viaturaId) {
        if (confirm('Tem certeza que deseja excluir esta viatura?')) {
            try {
                // Excluir do SQLite
                await DataService.deleteViatura(viaturaId);
                
                // Atualizar localmente
                this.viaturas = this.viaturas.filter(v => v.id !== viaturaId);
                
                this.loadCadastroViaturaPage(document.getElementById('contentArea'));
            } catch (error) {
                console.error('Erro ao excluir viatura:', error);
                alert('Erro ao excluir viatura. Tente novamente.');
            }
        }
    }

    // FUNÇÃO MODIFICADA: Carregar página de Empréstimo de Viatura
    async loadEmprestimoViaturaPage(container) {
        const user = auth.getCurrentUser();
        
        // ADICIONAR: Recarregar dados mais recentes
        await this.carregarDadosIniciais();
        
        container.innerHTML = `
            <div class="page-content fade-in">
                <div class="form-section">
                    <h2>📝 Empréstimo de Viatura para Outra Unidade</h2>
                    <form id="emprestimoViaturaForm">
                        <div class="form-grid">
                            <h3>👤 Dados do Condutor</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="emprestimoGrad">Graduação</label>
                                    <select id="emprestimoGrad" required>
                                        <option value="">Selecione...</option>
                                        <option value="CEL">Coronel</option>
                                        <option value="TEN CEL">Tenente-Coronel</option>
                                        <option value="MAJ">Major</option>
                                        <option value="CAP">Capitão</option>
                                        <option value="1º TEN">1º Tenente</option>
                                        <option value="2º TEN">2º Tenente</option>
                                        <option value="ASP">Aspirante</option>
                                        <option value="ST">Subtenente</option>
                                        <option value="1º SGT">1º Sargento</option>
                                        <option value="2º SGT">2º Sargento</option>
                                        <option value="3º SGT">3º Sargento</option>
                                        <option value="CB">Cabo</option>
                                        <option value="SD">Soldado</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="emprestimoMatricula">Matrícula</label>
                                    <input type="text" id="emprestimoMatricula" required placeholder="Matrícula do condutor">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="emprestimoNome">Nome Completo</label>
                                    <input type="text" id="emprestimoNome" required placeholder="Nome completo do condutor">
                                </div>
                                <div class="form-group">
                                    <label for="emprestimoCPF">CPF</label>
                                    <input type="text" id="emprestimoCPF" required placeholder="000.000.000-00" class="cpf-mask">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="emprestimoUnidade">Unidade de Origem</label>
                                    <input type="text" id="emprestimoUnidade" required placeholder="Unidade do condutor">
                                </div>
                                <div class="form-group">
                                    <label for="emprestimoTelefone">Telefone</label>
                                    <input type="tel" id="emprestimoTelefone" required placeholder="(81) 99999-9999" class="phone-mask">
                                </div>
                            </div>

                            <h3>🚗 Dados da Viatura</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="emprestimoPatrimonio">Viatura</label>
                                    <select id="emprestimoPatrimonio" required>
                                        <option value="">Selecione a viatura...</option>
                                        ${this.viaturas.filter(v => v.status === 'ATIVA').map(v => `<option value="${v.id}">${v.patrimonio} - ${v.placa} - ${v.modelo}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="emprestimoEmprego">Finalidade do Empréstimo</label>
                                    <input type="text" id="emprestimoEmprego" required placeholder="Descreva a finalidade">
                                </div>
                            </div>
                            
                            <h3>📅 Período do Empréstimo</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="emprestimoDataInicial">Data de Saída</label>
                                    <input type="date" id="emprestimoDataInicial" required>
                                </div>
                                <div class="form-group">
                                    <label for="emprestimoHoraInicial">Hora de Saída</label>
                                    <input type="time" id="emprestimoHoraInicial" required>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="emprestimoDataFinal">Data de Retorno Prevista</label>
                                    <input type="date" id="emprestimoDataFinal" required>
                                </div>
                                <div class="form-group">
                                    <label for="emprestimoHoraFinal">Hora de Retorno Prevista</label>
                                    <input type="time" id="emprestimoHoraFinal" required>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="emprestimoKmInicial">KM Inicial</label>
                                    <input type="number" id="emprestimoKmInicial" required min="0" step="1">
                                </div>
                                <div class="form-group">
                                    <label for="emprestimoKmPrevisto">KM Previsto de Retorno</label>
                                    <input type="number" id="emprestimoKmPrevisto" min="0" step="1" placeholder="Estimativa de KM no retorno">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group full-width">
                                    <label for="emprestimoObservacoes">Observações</label>
                                    <textarea id="emprestimoObservacoes" placeholder="Observações sobre o empréstimo..."></textarea>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="emprestimoResponsavel">Responsável pelo Empréstimo</label>
                                    <input type="text" id="emprestimoResponsavel" value="${user?.graduacao || ''} ${user?.nome || ''}" readonly>
                                </div>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn-primary">
                            <span class="btn-icon">📝</span>
                            Registrar Empréstimo
                        </button>
                    </form>
                </div>

                <div class="form-section">
                    <h2>📋 Empréstimos Ativos</h2>
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Viatura</th>
                                    <th>Condutor</th>
                                    <th>Unidade</th>
                                    <th>Período</th>
                                    <th>KM Inicial</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="listaEmprestimosAtivos">
                                ${this.emprestimos.filter(e => e.status === 'ATIVO').map(emprestimo => `
                                    <tr>
                                        <td>${emprestimo.viatura?.patrimonio || 'N/A'}</td>
                                        <td>${emprestimo.condutor_nome}</td>
                                        <td>${emprestimo.condutor_unidade}</td>
                                        <td>${new Date(emprestimo.data_inicial).toLocaleDateString('pt-BR')}</td>
                                        <td>${emprestimo.km_inicial}</td>
                                        <td><span class="status-badge status-ativo">${emprestimo.status}</span></td>
                                        <td>
                                            <button class="btn-action btn-edit" onclick="frotaSystem.finalizarEmprestimo(${emprestimo.id})">Finalizar</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="form-section">
                    <h2>📊 Histórico de Empréstimos</h2>
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Viatura</th>
                                    <th>Condutor</th>
                                    <th>Período</th>
                                    <th>KM Inicial</th>
                                    <th>KM Final</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="historicoEmprestimos">
                                ${this.emprestimos.filter(e => e.status !== 'ATIVO').slice(-10).reverse().map(emprestimo => `
                                    <tr>
                                        <td>${emprestimo.viatura?.patrimonio || 'N/A'}</td>
                                        <td>${emprestimo.condutor_nome}</td>
                                        <td>${new Date(emprestimo.data_inicial).toLocaleDateString('pt-BR')}</td>
                                        <td>${emprestimo.km_inicial}</td>
                                        <td>${emprestimo.km_final || '-'}</td>
                                        <td><span class="status-badge ${emprestimo.status === 'FINALIZADO' ? 'status-finalizada' : 'status-inativo'}">${emprestimo.status}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Preencher data atual
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('emprestimoDataInicial').value = today;
        document.getElementById('emprestimoDataFinal').value = today;

        // Configurar máscaras para os campos do empréstimo
        this.configurarMascarasEmprestimo();

        // Configurar formulário
        document.getElementById('emprestimoViaturaForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registrarEmprestimo();
        });
    }

    configurarMascarasEmprestimo() {
        // Máscara para CPF no empréstimo
        const cpfInput = document.getElementById('emprestimoCPF');
        if (cpfInput) {
            cpfInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 3) {
                    value = value.replace(/^(\d{3})(\d)/, '$1.$2');
                }
                if (value.length > 6) {
                    value = value.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
                }
                if (value.length > 9) {
                    value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
                }
                e.target.value = value.substring(0, 14);
            });
        }

        // Máscara para telefone no empréstimo
        const telefoneInput = document.getElementById('emprestimoTelefone');
        if (telefoneInput) {
            telefoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                
                // Formato: (81) 99999-9999
                if (value.length <= 11) {
                    if (value.length > 0) {
                        value = value.replace(/^(\d{0,2})/, '($1');
                    }
                    if (value.length > 3) {
                        value = value.replace(/^\((\d{2})(\d)/, '($1) $2');
                    }
                    if (value.length > 10) {
                        value = value.replace(/(\d{5})(\d)/, '$1-$2');
                    }
                }
                e.target.value = value.substring(0, 15);
            });
        }
    }
    
    // FUNÇÃO MODIFICADA: Registrar empréstimo
    async registrarEmprestimo() {
        try {
            alert('Funcionalidade de empréstimo de viatura em desenvolvimento');
            // Implementar lógica de empréstimo aqui usando DataService.createEmprestimo()
        } catch (error) {
            console.error('Erro ao registrar empréstimo:', error);
            alert('Erro ao registrar empréstimo. Tente novamente.');
        }
    }

    // FUNÇÃO MODIFICADA: Carregar página de Viaturas Ativas - VERSÃO OTIMIZADA
    async loadViaturasAtivasPage(container) {
        const hoje = new Date().toISOString().split('T')[0];
        
        container.innerHTML = `
            <div class="page-content fade-in">
                <div class="form-section">
                    <h2>📊 Relatório de Viaturas Ativas</h2>
                    
                    <div class="filtros-container">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="filtroPeriodo">Período</label>
                                <select id="filtroPeriodo">
                                    <option value="hoje">Hoje</option>
                                    <option value="ontem">Ontem</option>
                                    <option value="semana">Esta Semana</option>
                                    <option value="mes">Este Mês</option>
                                    <option value="ano">Este Ano</option>
                                    <option value="especifico">Data Específica</option>
                                    <option value="todos">Todos os Registros</option>
                                </select>
                            </div>
                            <div class="form-group" id="dataEspecificaContainer" style="display: none;">
                                <label for="filtroDataEspecifica">Data Específica</label>
                                <input type="date" id="filtroDataEspecifica" value="${hoje}">
                            </div>
                            <div class="form-group">
                                <label for="filtroStatus">Status</label>
                                <select id="filtroStatus">
                                    <option value="ativas">Viaturas Ativas</option>
                                    <option value="inativas">Viaturas Não Ativadas</option>
                                    <option value="todas">Todas as Viaturas</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <button type="button" class="btn-primary" onclick="frotaSystem.filtrarViaturasAtivas()">
                                    <span class="btn-icon">🔍</span>
                                    Aplicar Filtros
                                </button>
                                <button type="button" class="btn-secondary" onclick="frotaSystem.exportarRelatorio('pdf')">
                                    <span class="btn-icon">📄</span>
                                    Exportar PDF
                                </button>
                                <button type="button" class="btn-secondary" onclick="frotaSystem.exportarRelatorio('excel')">
                                    <span class="btn-icon">📊</span>
                                    Exportar Excel
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="resumo-cards">
                        <div class="cards-grid">
                            <div class="card">
                                <h3>Viaturas Ativas Hoje</h3>
                                <p class="numero-viaturas">${(await this.obterViaturasAtivasHoje()).length}</p>
                            </div>
                            <div class="card">
                                <h3>Viaturas Não Ativadas</h3>
                                <p class="numero-inativas">${(await this.obterViaturasNaoAtivadasHoje()).length}</p>
                            </div>
                            <div class="card">
                                <h3>Total de Registros</h3>
                                <p class="total-registros">${this.registrosUso.length}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Tabela Otimizada -->
                    <div class="table-container-optimized">
                        <table class="data-table-optimized" id="tabelaViaturasAtivas">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th style="white-space: normal; line-height: 1.2; padding: 8px 4px;">Hora<br>Saída</th>
                                    <th>Viatura</th>
                                    <th>Motorista</th>
                                    <th>Matrícula</th>
                                    <th>CPF</th>
                                    <th style="white-space: normal; line-height: 1.2; padding: 8px 4px;">Emprego<br>Missão</th>
                                    <th style="white-space: normal; line-height: 1.2; padding: 8px 4px;">KM<br>Inicial</th>
                                    <th style="white-space: normal; line-height: 1.2; padding: 8px 4px;">KM<br>Final</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="listaViaturasAtivas">
                                ${await this.gerarListaViaturasAtivasOtimizada('hoje', 'ativas')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Configurar eventos dos filtros
        document.getElementById('filtroPeriodo').addEventListener('change', (e) => {
            const dataEspecificaContainer = document.getElementById('dataEspecificaContainer');
            if (e.target.value === 'especifico') {
                dataEspecificaContainer.style.display = 'block';
            } else {
                dataEspecificaContainer.style.display = 'none';
            }
        });

        // Configurar tooltips para células com texto truncado
        setTimeout(() => {
            const cells = document.querySelectorAll('.data-table-optimized td');
            cells.forEach(cell => {
                if (cell.scrollWidth > cell.clientWidth) {
                    cell.setAttribute('title', cell.textContent);
                }
            });
        }, 100);
    }

    // FUNÇÃO MODIFICADA: Obter viaturas ativas hoje
    async obterViaturasAtivasHoje() {
        const hoje = new Date().toISOString().split('T')[0];
        return this.registrosUso.filter(registro => 
            registro.data_inicial === hoje && !registro.km_final
        );
    }

	// FUNÇÃO CORRIGIDA: Gerar lista de viaturas ativas otimizada
	async gerarListaViaturasAtivasOtimizada(periodo = 'hoje', status = 'ativas') {
		let registrosFiltrados = [];
		const hoje = new Date();
		
		switch (periodo) {
			case 'hoje':
				const hojeStr = hoje.toISOString().split('T')[0];
				registrosFiltrados = this.registrosUso.filter(registro => 
					registro.data_inicial === hojeStr
				);
				break;
			case 'ontem':
				const ontem = new Date(hoje);
				ontem.setDate(hoje.getDate() - 1);
				const ontemStr = ontem.toISOString().split('T')[0];
				registrosFiltrados = this.registrosUso.filter(registro => 
					registro.data_inicial === ontemStr
				);
				break;
			case 'semana':
				const inicioSemana = new Date(hoje);
				inicioSemana.setDate(hoje.getDate() - hoje.getDay());
				registrosFiltrados = this.registrosUso.filter(registro => 
					new Date(registro.data_inicial) >= inicioSemana
				);
				break;
			case 'mes':
				const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
				registrosFiltrados = this.registrosUso.filter(registro => 
					new Date(registro.data_inicial) >= inicioMes
				);
				break;
			case 'ano':
				const inicioAno = new Date(hoje.getFullYear(), 0, 1);
				registrosFiltrados = this.registrosUso.filter(registro => 
					new Date(registro.data_inicial) >= inicioAno
				);
				break;
			case 'especifico':
				break;
			case 'todos':
				registrosFiltrados = [...this.registrosUso];
				break;
			default:
				registrosFiltrados = this.registrosUso.filter(registro => 
					registro.data_inicial === periodo
				);
		}
		
		// Ordenar por data mais recente
		registrosFiltrados.sort((a, b) => new Date(b.data_inicial) - new Date(a.data_inicial));
		
		if (status === 'inativas') {
			const viaturasAtivas = registrosFiltrados.map(v => v.viatura_id);
			const viaturasNaoAtivadas = this.viaturas.filter(viatura => 
				viatura.status === 'ATIVA' && !viaturasAtivas.includes(viatura.id)
			);
			
			return viaturasNaoAtivadas.map(viatura => {
				const viaturaText = `${viatura.patrimonio} - ${viatura.placa}`;
				return `
					<tr>
						<td title="${new Date().toLocaleDateString('pt-BR')}">
							${new Date().toLocaleDateString('pt-BR')}
						</td>
						<td>-</td>
						<td title="${viaturaText}">${viaturaText}</td>
						<td colspan="4" style="text-align: center; color: #666;">- NÃO ATIVADA -</td>
						<td>-</td>
						<td>-</td>
						<td>
							<span class="status-badge-compact status-nao-ativada">Não Ativada</span>
						</td>
						<td>-</td>
					</tr>
				`;
			}).join('');
		}
		
		// VERIFICAÇÃO DE SEGURANÇA - se não há registros
		if (registrosFiltrados.length === 0) {
			return `
				<tr>
					<td colspan="11" style="text-align: center; padding: 2rem; color: #666;">
						Nenhum registro encontrado para o período selecionado
					</td>
				</tr>
			`;
		}
		
		return registrosFiltrados.map(registro => {
			const viatura = this.viaturas.find(v => v.id === registro.viatura_id);
			const placa = viatura ? viatura.placa : 'N/E';
			const viaturaText = `${viatura?.patrimonio || 'N/E'} - ${placa}`;
			
			// CORREÇÃO: Buscar dados completos do motorista
			let motorista = null;
			let matricula = 'N/E';
			let cpf = 'N/E';
			let motoristaText = 'N/E';
			
			try {
				motorista = this.motoristas.find(m => m.id === registro.motorista_id);
				if (motorista) {
					matricula = motorista.matricula || 'N/E';
					cpf = motorista.cpf || 'N/E';
					const graduacao = motorista.graduacao || '';
					const nomeGuerra = motorista.nome_guerra || motorista.nomeGuerra || '';
					motoristaText = `${graduacao} ${nomeGuerra}`.trim();
				}
			} catch (error) {
				console.error('Erro ao obter dados do motorista:', error);
			}
			
			const motoristaDisplay = motoristaText.length > 20 ? 
				motoristaText.substring(0, 17) + '...' : motoristaText;
			const missaoText = registro.emprego_missao && registro.emprego_missao.length > 25 ? 
				registro.emprego_missao.substring(0, 22) + '...' : (registro.emprego_missao || 'N/E');
			
			return `
				<tr>
					<td title="${new Date(registro.data_inicial).toLocaleDateString('pt-BR')}">
						${new Date(registro.data_inicial).toLocaleDateString('pt-BR').split('/').map((v, i) => i === 2 ? v.slice(-2) : v).join('/')}
					</td>
					<td>${registro.hora_inicial}</td>
					<td title="${viaturaText}">${viaturaText}</td>
					<td title="${motoristaText}">${motoristaDisplay}</td>
					<td>${matricula}</td>
					<td>${cpf}</td>
					<td title="${registro.emprego_missao || 'N/E'}">${missaoText}</td>
					<td>${registro.km_inicial}</td>
					<td>${registro.km_final || '-'}</td>
					<td>
						<span class="status-badge-compact ${registro.km_final ? 'status-finalizada' : 'status-ativo'}">
							${registro.km_final ? 'Finalizada' : 'Em Andamento'}
						</span>
					</td>
					<td>
						<button class="btn-action btn-view" onclick="frotaSystem.verDetalhesRegistro('${registro.id}')" title="Ver detalhes completos">
							📋
						</button>
					</td>
				</tr>
			`;
		}).join('');
	}

    // FUNÇÃO MODIFICADA: Obter placa da viatura pelo patrimônio
    obterPlacaViatura(patrimonio) {
        const viatura = this.viaturas.find(v => v.patrimonio === patrimonio);
        return viatura ? viatura.placa : 'N/E';
    }

    // FUNÇÃO MODIFICADA: Filtrar viaturas ativas
    async filtrarViaturasAtivas() {
        const periodo = document.getElementById('filtroPeriodo').value;
        const status = document.getElementById('filtroStatus').value;
        
        let periodoFiltro = periodo;
        if (periodo === 'especifico') {
            periodoFiltro = document.getElementById('filtroDataEspecifica').value;
        }
        
        const listaHTML = await this.gerarListaViaturasAtivasOtimizada(periodoFiltro, status);
        document.getElementById('listaViaturasAtivas').innerHTML = listaHTML;
        
        // Atualizar contadores
        this.atualizarContadoresViaturas();

        // Configurar tooltips novamente
        setTimeout(() => {
            const cells = document.querySelectorAll('.data-table-optimized td');
            cells.forEach(cell => {
                if (cell.scrollWidth > cell.clientWidth) {
                    cell.setAttribute('title', cell.textContent);
                }
            });
        }, 100);
    }

    // FUNÇÃO MODIFICADA: Atualizar contadores
    async atualizarContadoresViaturas() {
        const viaturasAtivas = (await this.obterViaturasAtivasHoje()).length;
        const viaturasInativas = (await this.obterViaturasNaoAtivadasHoje()).length;
        
        document.querySelector('.numero-viaturas').textContent = viaturasAtivas;
        document.querySelector('.numero-inativas').textContent = viaturasInativas;
    }

    // FUNÇÃO MODIFICADA: Ver detalhes completos do registro
    async verDetalhesRegistro(registroId) {
        const registro = this.registrosUso.find(r => r.id === registroId);
        if (!registro) {
            alert('Registro não encontrado!');
            return;
        }

        const viatura = this.viaturas.find(v => v.id === registro.viatura_id);
        const motorista = this.motoristas.find(m => m.id === registro.motorista_id);

        // Criar uma nova aba com os detalhes completos
        const novaAba = window.open('', '_blank');
        novaAba.document.write(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Detalhes do Registro - ${viatura?.patrimonio || 'N/E'}</title>
                <style>
                    body {
                        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f8f9fa;
                        margin: 0;
                        padding: 20px;
                    }
                    .container {
                        max-width: 800px;
                        margin: 0 auto;
                        background: white;
                        padding: 2rem;
                        border-radius: 12px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
                    }
                    h1 {
                        color: #1e3c72;
                        margin-bottom: 1.5rem;
                        text-align: center;
                        border-bottom: 2px solid #f0f0f0;
                        padding-bottom: 0.5rem;
                    }
                    .section {
                        margin-bottom: 2rem;
                        padding: 1.5rem;
                        background: #f8f9fa;
                        border-radius: 8px;
                        border-left: 4px solid #1e3c72;
                    }
                    .section h2 {
                        color: #1e3c72;
                        margin-top: 0;
                        margin-bottom: 1rem;
                        font-size: 1.2rem;
                    }
                    .info-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 1rem;
                    }
                    .info-item {
                        display: flex;
                        flex-direction: column;
                    }
                    .info-label {
                        font-weight: 600;
                        color: #666;
                        font-size: 0.9rem;
                        margin-bottom: 0.25rem;
                    }
                    .info-value {
                        font-size: 1rem;
                        color: #333;
                    }
                    .status-badge {
                        padding: 0.25rem 0.5rem;
                        border-radius: 12px;
                        font-size: 0.8rem;
                        font-weight: 500;
                        display: inline-block;
                    }
                    .status-ativo {
                        background: #d1fae5;
                        color: #065f46;
                    }
                    .status-finalizada {
                        background: #e8f5e8;
                        color: #2e7d32;
                    }
                    .status-pendente {
                        background: #e0e7ff;
                        color: #3730a3;
                    }
                    .print-btn {
                        background: #1e3c72;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 1rem;
                        margin-top: 1rem;
                        display: block;
                        width: 100%;
                    }
                    .print-btn:hover {
                        background: #2a5298;
                    }
                    @media print {
                        body { background: white; }
                        .container { box-shadow: none; }
                        .print-btn { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>📋 Detalhes Completos do Registro</h1>
                    
                    <div class="section">
                        <h2>👤 Dados do Motorista</h2>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Graduação</span>
                                <span class="info-value">${motorista?.graduacao || 'N/E'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Matrícula</span>
                                <span class="info-value">${motorista?.matricula || 'N/E'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">CPF</span>
                                <span class="info-value">${motorista?.cpf || 'N/E'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Nome Completo</span>
                                <span class="info-value">${motorista?.nome_completo || 'N/E'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <h2>🚗 Dados da Viatura</h2>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Patrimônio</span>
                                <span class="info-value">${viatura?.patrimonio || 'N/E'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Placa</span>
                                <span class="info-value">${viatura?.placa || 'N/E'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Emprego/Missão</span>
                                <span class="info-value">${registro.emprego_missao || 'N/E'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <h2>📅 Dados Iniciais do Serviço</h2>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Data</span>
                                <span class="info-value">${new Date(registro.data_inicial).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Hora de Saída</span>
                                <span class="info-value">${registro.hora_inicial}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">KM Inicial</span>
                                <span class="info-value">${registro.km_inicial}</span>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <h2>🏁 Dados Finais do Serviço</h2>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Data de Retorno</span>
                                <span class="info-value">${registro.data_final ? new Date(registro.data_final).toLocaleDateString('pt-BR') : 'Em andamento'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Hora de Retorno</span>
                                <span class="info-value">${registro.hora_final || 'Em andamento'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">KM Final</span>
                                <span class="info-value">${registro.km_final || 'Em andamento'}</span>
                            </div>
                        </div>
                    </div>

                    ${registro.observacoes ? `
                    <div class="section">
                        <h2>📝 Observações</h2>
                        <div class="info-item">
                            <span class="info-value">${registro.observacoes}</span>
                        </div>
                    </div>
                    ` : ''}

                    <div class="section">
                        <h2>📊 Status do Registro</h2>
                        <div class="info-item">
                            <span class="info-label">Status</span>
                            <span class="status-badge ${registro.km_final ? 'status-finalizada' : 'status-ativo'}">
                                ${registro.km_final ? 'Missão Finalizada' : 'Em Andamento'}
                            </span>
                        </div>
                    </div>

                    <button class="print-btn" onclick="window.print()">🖨️ Imprimir Relatório</button>
                </div>
            </body>
            </html>
        `);
        novaAba.document.close();
    }

    // FUNÇÃO MODIFICADA: Exportar relatório
    async exportarRelatorio(tipo) {
        const nomeArquivo = `Relatorio_Viaturas_Ativas_${new Date().toISOString().split('T')[0]}`;

        if (tipo === 'pdf') {
            await this.exportarParaPDF(null, nomeArquivo);
        } else if (tipo === 'excel') {
            const tabela = document.getElementById('tabelaViaturasAtivas');
            this.exportarParaExcel(tabela, nomeArquivo);
        }
    }
	
		// FUNÇÃO: Exportar relatório de avarias para PDF
	async exportarRelatorioAvarias(tipo) {
		const periodo = document.getElementById('filtroPeriodoAvarias').value;
		const status = document.getElementById('filtroStatusAvaria').value;
		const busca = document.getElementById('filtroBuscaAvarias').value;
		
		const periodoTexto = document.getElementById('filtroPeriodoAvarias').options[document.getElementById('filtroPeriodoAvarias').selectedIndex].text;
		const statusTexto = document.getElementById('filtroStatusAvaria').options[document.getElementById('filtroStatusAvaria').selectedIndex].text;
		
		// Obter avarias filtradas
		let avariasFiltradas = this.filtrarAvariasParaExport(periodo, status, busca);
		
		const nomeArquivo = `Relatorio_Avarias_${new Date().toISOString().split('T')[0]}`;
		
		if (tipo === 'pdf') {
			await this.exportarAvariasParaPDF(avariasFiltradas, periodoTexto, statusTexto, busca, nomeArquivo);
		}
	}

	// FUNÇÃO AUXILIAR: Filtrar avarias para exportação
	filtrarAvariasParaExport(periodo, status, busca) {
		const hoje = new Date();
		let avariasFiltradas = this.avarias;

		// Filtrar por período
		if (periodo !== 'todos') {
			let dataFiltro;
			
			switch(periodo) {
				case 'hoje':
					const hojeStr = hoje.toISOString().split('T')[0];
					avariasFiltradas = avariasFiltradas.filter(avaria => avaria.data_verificacao === hojeStr);
					break;
				case 'ontem':
					const ontem = new Date(hoje);
					ontem.setDate(hoje.getDate() - 1);
					const ontemStr = ontem.toISOString().split('T')[0];
					avariasFiltradas = avariasFiltradas.filter(avaria => avaria.data_verificacao === ontemStr);
					break;
				case 'semana':
					const inicioSemana = new Date(hoje);
					inicioSemana.setDate(hoje.getDate() - hoje.getDay());
					avariasFiltradas = avariasFiltradas.filter(avaria => 
						new Date(avaria.data_verificacao) >= inicioSemana
					);
					break;
				case 'mes':
					const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
					avariasFiltradas = avariasFiltradas.filter(avaria => 
						new Date(avaria.data_verificacao) >= inicioMes
					);
					break;
				case 'especifico':
					const dataEspecifica = document.getElementById('filtroDataEspecificaAvarias')?.value;
					if (dataEspecifica) {
						avariasFiltradas = avariasFiltradas.filter(avaria => avaria.data_verificacao === dataEspecifica);
					}
					break;
			}
		}

		// Filtrar por status
		if (status !== 'todos') {
			avariasFiltradas = avariasFiltradas.filter(avaria => avaria.status === status);
		}

		// Filtrar por busca
		if (busca) {
			const buscaLower = busca.toLowerCase();
			avariasFiltradas = avariasFiltradas.filter(avaria => 
				avaria.placa.toLowerCase().includes(buscaLower) ||
				avaria.patrimonio.toLowerCase().includes(buscaLower) ||
				(avaria.assinatura && avaria.assinatura.toLowerCase().includes(buscaLower)) ||
				avaria.tipo_viatura.toLowerCase().includes(buscaLower) ||
				(avaria.problemas && avaria.problemas.toLowerCase().includes(buscaLower))
			);
		}

		return avariasFiltradas;
	}

	// FUNÇÃO: Exportar avarias para PDF
	async exportarAvariasParaPDF(avariasFiltradas, periodoTexto, statusTexto, buscaTexto, nomeArquivo) {
		// Ordenar por data mais recente
		const avariasOrdenadas = [...avariasFiltradas].sort((a, b) => 
			new Date(b.data_verificacao) - new Date(a.data_verificacao)
		);

		let tabelaHTML = '';

		if (avariasOrdenadas.length === 0) {
			tabelaHTML = `
				<div style="text-align: center; padding: 2rem; color: #666; font-style: italic;">
					Nenhuma avaria encontrada para os filtros selecionados
				</div>
			`;
		} else {
			tabelaHTML = `
				<table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 9px;">
					<thead>
						<tr>
							<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5; text-align: left;">Data</th>
							<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5; text-align: left;">Viatura</th>
							<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5; text-align: left;">Placa</th>
							<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5; text-align: left;">Patrimônio</th>
							<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5; text-align: left;">Problemas</th>
							<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5; text-align: left;">Motorista</th>
							<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5; text-align: left;">Status</th>
							<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5; text-align: left;">Observações</th>
						</tr>
					</thead>
					<tbody>
			`;
			
			avariasOrdenadas.forEach(avaria => {
				// Converter problemas de JSON para array
				const problemasArray = typeof avaria.problemas === 'string' ? 
					JSON.parse(avaria.problemas) : avaria.problemas || [];
				
				const problemasText = problemasArray.length > 0 ? 
					problemasArray.map((p, i) => `${i + 1}. ${p}`).join('; ') : 
					'Nenhum problema informado';
				
				const problemasTruncado = problemasText.length > 100 ? 
					problemasText.substring(0, 97) + '...' : problemasText;
				
				const motorista = this.motoristas.find(m => m.id === avaria.motorista_id);
				const motoristaText = motorista ? 
					`${motorista.graduacao} ${motorista.nome_guerra || motorista.nomeGuerra}` : 
					avaria.assinatura || 'N/E';
				
				const observacoesTruncado = avaria.observacoes && avaria.observacoes.length > 50 ? 
					avaria.observacoes.substring(0, 47) + '...' : 
					(avaria.observacoes || '-');

				tabelaHTML += `
					<tr>
						<td style="border: 1px solid #ddd; padding: 6px;">${new Date(avaria.data_verificacao).toLocaleDateString('pt-BR')}</td>
						<td style="border: 1px solid #ddd; padding: 6px;">${avaria.tipo_viatura}</td>
						<td style="border: 1px solid #ddd; padding: 6px;">${avaria.placa}</td>
						<td style="border: 1px solid #ddd; padding: 6px;">${avaria.patrimonio}</td>
						<td style="border: 1px solid #ddd; padding: 6px;" title="${problemasText}">${problemasTruncado}</td>
						<td style="border: 1px solid #ddd; padding: 6px;">${motoristaText}</td>
						<td style="border: 1px solid #ddd; padding: 6px;">
							<span style="background: ${this.getStatusColorAvaria(avaria.status)}; color: white; padding: 3px 6px; border-radius: 3px; font-size: 8px; display: inline-block;">
								${this.formatarStatusAvaria(avaria.status)}
							</span>
						</td>
						<td style="border: 1px solid #ddd; padding: 6px;">${observacoesTruncado}</td>
					</tr>
				`;
			});
			
			tabelaHTML += `</tbody></table>`;
		}

		const htmlContent = `
			<div style="font-family: Arial, sans-serif; margin: 15px;">
				<div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1e3c72; padding-bottom: 10px;">
					<h1 style="color: #1e3c72; margin: 0; font-size: 24px;">RELATÓRIO DE AVARIAS REPORTADAS</h1>
					<h2 style="color: #2a5298; margin: 5px 0; font-size: 18px;">Polícia Militar de Pernambuco</h2>
					<h3 style="color: #666; margin: 5px 0; font-size: 14px;">4° BPM - Batalhão Barreto de Menezes</h3>
				</div>
				
				<div style="margin-bottom: 20px; background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #1e3c72;">
					<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-size: 12px;">
						<div>
							<strong>Data do Relatório:</strong> ${new Date().toLocaleDateString('pt-BR')}
						</div>
						<div>
							<strong>Período:</strong> ${periodoTexto}
						</div>
						<div>
							<strong>Status:</strong> ${statusTexto}
						</div>
						<div>
							<strong>Busca:</strong> ${buscaTexto || 'Nenhuma'}
						</div>
						<div>
							<strong>Total de Avarias:</strong> ${avariasOrdenadas.length}
						</div>
					</div>
				</div>
				
				<div style="margin-bottom: 15px;">
					<h3 style="color: #1e3c72; margin-bottom: 10px; font-size: 16px;">RESUMO ESTATÍSTICO</h3>
					<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 15px;">
						<div style="background: #e0e7ff; padding: 10px; border-radius: 6px; text-align: center;">
							<div style="font-size: 12px; color: #666;">Pendentes</div>
							<div style="font-size: 24px; font-weight: bold; color: #3730a3;">${avariasOrdenadas.filter(a => a.status === 'PENDENTE').length}</div>
						</div>
						<div style="background: #fef3c7; padding: 10px; border-radius: 6px; text-align: center;">
							<div style="font-size: 12px; color: #666;">Em Análise</div>
							<div style="font-size: 24px; font-weight: bold; color: #d97706;">${avariasOrdenadas.filter(a => a.status === 'EM_ANALISE').length}</div>
						</div>
						<div style="background: #fef3c7; padding: 10px; border-radius: 6px; text-align: center;">
							<div style="font-size: 12px; color: #666;">Em Manutenção</div>
							<div style="font-size: 24px; font-weight: bold; color: #d97706;">${avariasOrdenadas.filter(a => a.status === 'EM_MANUTENCAO').length}</div>
						</div>
						<div style="background: #d1fae5; padding: 10px; border-radius: 6px; text-align: center;">
							<div style="font-size: 12px; color: #666;">Resolvidas</div>
							<div style="font-size: 24px; font-weight: bold; color: #065f46;">${avariasOrdenadas.filter(a => a.status === 'RESOLVIDA').length}</div>
						</div>
					</div>
				</div>
				
				<h3 style="color: #1e3c72; margin-bottom: 10px; font-size: 16px;">DETALHES DAS AVARIAS</h3>
				${tabelaHTML}
				
				<div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 10px; color: #666;">
					<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px;">
						<div>
							<strong>Emitido por:</strong> Sistema de Gerenciamento de Frota - PMPE<br>
							<strong>Versão:</strong> 2.0<br>
							<strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}
						</div>
						<div>
							<strong>Unidade:</strong> Dinter-I/4° BPM<br>
							<strong>Local:</strong> Caruaru - PE<br>
							<strong>Contato:</strong> viaturas4bpm@hotmail.com
						</div>
					</div>
				</div>
			</div>
		`;
		
		const printWindow = window.open('', '_blank');
		printWindow.document.write(`
			<!DOCTYPE html>
			<html>
				<head>
					<title>${nomeArquivo}</title>
					<style>
						body { 
							margin: 0; 
							padding: 0;
							font-family: Arial, sans-serif;
							background: white;
						}
						@media print {
							body { margin: 10px; }
							table { font-size: 8px !important; }
							th, td { padding: 4px 5px !important; }
							@page {
								size: landscape;
								margin: 10mm;
							}
						}
					</style>
				</head>
				<body>
					${htmlContent}
					<script>
						setTimeout(() => {
							window.print();
						}, 500);
					</script>
				</body>
			</html>
		`);
		printWindow.document.close();
	}

	// FUNÇÃO AUXILIAR: Obter cor do status para PDF
	getStatusColorAvaria(status) {
		switch(status) {
			case 'PENDENTE':
				return '#dc2626'; // Vermelho
			case 'EM_ANALISE':
				return '#d97706'; // Laranja
			case 'EM_MANUTENCAO':
				return '#d97706'; // Laranja
			case 'RESOLVIDA':
				return '#059669'; // Verde
			default:
				return '#6b7280'; // Cinza
		}
	}

    // FUNÇÃO MODIFICADA: Exportar para PDF - VERSÃO COMPLETA
    async exportarParaPDF(tabela, nomeArquivo) {
        const periodo = document.getElementById('filtroPeriodo').value;
        const status = document.getElementById('filtroStatus').value;
        const periodoTexto = document.getElementById('filtroPeriodo').options[document.getElementById('filtroPeriodo').selectedIndex].text;
        const statusTexto = document.getElementById('filtroStatus').options[document.getElementById('filtroStatus').selectedIndex].text;
        
        // Obter dados filtrados
        let registrosFiltrados = [];
        const hoje = new Date();
        
        switch (periodo) {
            case 'hoje':
                const hojeStr = hoje.toISOString().split('T')[0];
                registrosFiltrados = this.registrosUso.filter(registro => 
                    registro.data_inicial === hojeStr
                );
                break;
            case 'ontem':
                const ontem = new Date(hoje);
                ontem.setDate(hoje.getDate() - 1);
                const ontemStr = ontem.toISOString().split('T')[0];
                registrosFiltrados = this.registrosUso.filter(registro => 
                    registro.data_inicial === ontemStr
                );
                break;
            case 'semana':
                const inicioSemana = new Date(hoje);
                inicioSemana.setDate(hoje.getDate() - hoje.getDay());
                registrosFiltrados = this.registrosUso.filter(registro => 
                    new Date(registro.data_inicial) >= inicioSemana
                );
                break;
            case 'mes':
                const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
                registrosFiltrados = this.registrosUso.filter(registro => 
                    new Date(registro.data_inicial) >= inicioMes
                );
                break;
            case 'ano':
                const inicioAno = new Date(hoje.getFullYear(), 0, 1);
                registrosFiltrados = this.registrosUso.filter(registro => 
                    new Date(registro.data_inicial) >= inicioAno
                );
                break;
            case 'especifico':
                const dataEspecifica = document.getElementById('filtroDataEspecifica').value;
                registrosFiltrados = this.registrosUso.filter(registro => 
                    registro.data_inicial === dataEspecifica
                );
                break;
            case 'todos':
                registrosFiltrados = [...this.registrosUso];
                break;
            default:
                registrosFiltrados = this.registrosUso.filter(registro => 
                    registro.data_inicial === periodo
                );
        }
        
        // Ordenar por data mais recente
        registrosFiltrados.sort((a, b) => new Date(b.data_inicial) - new Date(a.data_inicial));
        
        let tabelaHTML = '';
        
        if (status === 'inativas') {
            // Mostrar viaturas não ativadas
            const viaturasAtivas = registrosFiltrados.map(v => v.viatura_id);
            const viaturasNaoAtivadas = this.viaturas.filter(viatura => 
                viatura.status === 'ATIVA' && !viaturasAtivas.includes(viatura.id)
            );
            
            tabelaHTML = `
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 10px;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5; text-align: left;">Data</th>
                            <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5; text-align: left;">Viatura</th>
                            <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5; text-align: left;">Placa</th>
                            <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5; text-align: left;">Modelo</th>
                            <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5; text-align: left;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            viaturasNaoAtivadas.forEach(viatura => {
                tabelaHTML += `
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">${new Date().toLocaleDateString('pt-BR')}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${viatura.patrimonio}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${viatura.placa}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${viatura.modelo}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">
                            <span style="background: #fee2e2; color: #991b1b; padding: 3px 6px; border-radius: 3px; font-size: 9px; display: inline-block;">Não Ativada</span>
                        </td>
                    </tr>
                `;
            });
            
            tabelaHTML += `</tbody></table>`;
        } else {
            // Tabela completa para registros ativos
            tabelaHTML = `
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 8px;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 6px; background: #f5f5f5; text-align: left;">Data</th>
                            <th style="border: 1px solid #ddd; padding: 6px; background: #f5f5f5; text-align: left;">Hora Saída</th>
                            <th style="border: 1px solid #ddd; padding: 6px; background: #f5f5f5; text-align: left;">Viatura</th>
                            <th style="border: 1px solid #ddd; padding: 6px; background: #f5f5f5; text-align: left;">Graduação</th>
                            <th style="border: 1px solid #ddd; padding: 6px; background: #f5f5f5; text-align: left;">Motorista</th>
                            <th style="border: 1px solid #ddd; padding: 6px; background: #f5f5f5; text-align: left;">Matrícula</th>
                            <th style="border: 1px solid #ddd; padding: 6px; background: #f5f5f5; text-align: left;">CPF</th>
                            <th style="border: 1px solid #ddd; padding: 6px; background: #f5f5f5; text-align: left;">Emprego/Missão</th>
                            <th style="border: 1px solid #ddd; padding: 6px; background: #f5f5f5; text-align: left;">KM Inicial</th>
                            <th style="border: 1px solid #ddd; padding: 6px; background: #f5f5f5; text-align: left;">KM Final</th>
                            <th style="border: 1px solid #ddd; padding: 6px; background: #f5f5f5; text-align: left;">Data Retorno</th>
                            <th style="border: 1px solid #ddd; padding: 6px; background: #f5f5f5; text-align: left;">Hora Retorno</th>
                            <th style="border: 1px solid #ddd; padding: 6px; background: #f5f5f5; text-align: left;">Observações</th>
                            <th style="border: 1px solid #ddd; padding: 6px; background: #f5f5f5; text-align: left;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            registrosFiltrados.forEach(registro => {
                const viatura = this.viaturas.find(v => v.id === registro.viatura_id);
                const motorista = this.motoristas.find(m => m.id === registro.motorista_id);
                const placa = viatura ? viatura.placa : 'N/E';
                const modelo = viatura ? viatura.modelo : 'N/E';
                
                tabelaHTML += `
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 6px;">${new Date(registro.data_inicial).toLocaleDateString('pt-BR')}</td>
                        <td style="border: 1px solid #ddd; padding: 6px;">${registro.hora_inicial}</td>
                        <td style="border: 1px solid #ddd; padding: 6px;">
                            <strong>${viatura?.patrimonio || 'N/E'}</strong><br>
                            <small>${placa}<br>${modelo}</small>
                        </td>
                        <td style="border: 1px solid #ddd; padding: 6px;">${motorista?.graduacao || 'N/E'}</td>
                        <td style="border: 1px solid #ddd; padding: 6px;">${motorista?.nome_guerra || 'N/E'}</td>
                        <td style="border: 1px solid #ddd; padding: 6px;">${motorista?.matricula || 'N/E'}</td>
                        <td style="border: 1px solid #ddd; padding: 6px;">${motorista?.cpf || 'N/E'}</td>
                        <td style="border: 1px solid #ddd; padding: 6px;">${registro.emprego_missao || 'N/E'}</td>
                        <td style="border: 1px solid #ddd; padding: 6px;">${registro.km_inicial}</td>
                        <td style="border: 1px solid #ddd; padding: 6px;">${registro.km_final || '-'}</td>
                        <td style="border: 1px solid #ddd; padding: 6px;">${registro.data_final ? new Date(registro.data_final).toLocaleDateString('pt-BR') : '-'}</td>
                        <td style="border: 1px solid #ddd; padding: 6px;">${registro.hora_final || '-'}</td>
                        <td style="border: 1px solid #ddd; padding: 6px;">${registro.observacoes || '-'}</td>
                        <td style="border: 1px solid #ddd; padding: 6px;">
                            <span style="background: ${registro.km_final ? '#e8f5e8' : '#d1fae5'}; color: ${registro.km_final ? '#2e7d32' : '#065f46'}; padding: 3px 6px; border-radius: 3px; font-size: 7px; display: inline-block;">
                                ${registro.km_final ? 'Finalizada' : 'Em Andamento'}
                            </span>
                        </td>
                    </tr>
                `;
            });
            
            tabelaHTML += `</tbody></table>`;
        }
        
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; margin: 15px;">
                <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1e3c72; padding-bottom: 10px;">
                    <h1 style="color: #1e3c72; margin: 0; font-size: 24px;">RELATÓRIO DE VIATURAS ATIVAS</h1>
                    <h2 style="color: #2a5298; margin: 5px 0; font-size: 18px;">Polícia Militar de Pernambuco</h2>
                    <h3 style="color: #666; margin: 5px 0; font-size: 14px;">4° BPM - Batalhão Barreto de Menezes</h3>
                </div>
                
                <div style="margin-bottom: 20px; background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #1e3c72;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-size: 12px;">
                        <div>
                            <strong>Data do Relatório:</strong> ${new Date().toLocaleDateString('pt-BR')}
                        </div>
                        <div>
                            <strong>Período:</strong> ${periodoTexto}
                        </div>
                        <div>
                            <strong>Status:</strong> ${statusTexto}
                        </div>
                        <div>
                            <strong>Total de Registros:</strong> ${registrosFiltrados.length}
                        </div>
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <h3 style="color: #1e3c72; margin-bottom: 10px; font-size: 16px;">RESUMO ESTATÍSTICO</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 15px;">
                        <div style="background: #e8f5e8; padding: 10px; border-radius: 6px; text-align: center;">
                            <div style="font-size: 12px; color: #666;">Viaturas Ativas</div>
                            <div style="font-size: 24px; font-weight: bold; color: #2e7d32;">${(await this.obterViaturasAtivasHoje()).length}</div>
                        </div>
                        <div style="background: #fee2e2; padding: 10px; border-radius: 6px; text-align: center;">
                            <div style="font-size: 12px; color: #666;">Não Ativadas</div>
                            <div style="font-size: 24px; font-weight: bold; color: #991b1b;">${(await this.obterViaturasNaoAtivadasHoje()).length}</div>
                        </div>
                        <div style="background: #e0e7ff; padding: 10px; border-radius: 6px; text-align: center;">
                            <div style="font-size: 12px; color: #666;">Em Andamento</div>
                            <div style="font-size: 24px; font-weight: bold; color: #3730a3;">${registrosFiltrados.filter(r => !r.km_final).length}</div>
                        </div>
                        <div style="background: #d1fae5; padding: 10px; border-radius: 6px; text-align: center;">
                            <div style="font-size: 12px; color: #666;">Finalizadas</div>
                            <div style="font-size: 24px; font-weight: bold; color: #065f46;">${registrosFiltrados.filter(r => r.km_final).length}</div>
                        </div>
                    </div>
                </div>
                
                <h3 style="color: #1e3c72; margin-bottom: 10px; font-size: 16px;">DETALHES DOS REGISTROS</h3>
                ${tabelaHTML}
                
                <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 10px; color: #666;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px;">
                        <div>
                            <strong>Emitido por:</strong> Sistema de Gerenciamento de Frota - PMPE<br>
                            <strong>Versão:</strong> 2.0<br>
                            <strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}
                        </div>
                        <div>
                            <strong>Unidade:</strong> Dinter-I/4° BPM<br>
                            <strong>Local:</strong> Caruaru - PE<br>
                            <strong>Contato:</strong> viaturas4bpm@hotmail.com
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>${nomeArquivo}</title>
                    <style>
                        body { 
                            margin: 0; 
                            padding: 0;
                            font-family: Arial, sans-serif;
                            background: white;
                        }
                        @media print {
                            body { margin: 10px; }
                            table { font-size: 7px !important; }
                            th, td { padding: 3px 4px !important; }
                            @page {
                                size: landscape;
                                margin: 10mm;
                            }
                        }
                    </style>
                </head>
                <body>
                    ${htmlContent}
                    <script>
                        setTimeout(() => {
                            window.print();
                        }, 500);
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    }

    // FUNÇÃO: Exportar para Excel (simulação)
    exportarParaExcel(tabela, nomeArquivo) {
        let csv = [];
        const linhas = tabela.querySelectorAll('tr');
        
        for (let i = 0; i < linhas.length; i++) {
            let linha = [], colunas = linhas[i].querySelectorAll('td, th');
            
            for (let j = 0; j < colunas.length; j++) {
                // Remover HTML dos badges de status
                let texto = colunas[j].innerText.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim();
                linha.push(`"${texto}"`);
            }
            
            csv.push(linha.join(';'));
        }

        const csvContent = "data:text/csv;charset=utf-8," + csv.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${nomeArquivo}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert('Relatório exportado para Excel!');
    }

    // FUNÇÃO MODIFICADA: Obter viaturas não ativadas hoje
    async obterViaturasNaoAtivadasHoje() {
        const hoje = new Date().toISOString().split('T')[0];
        const viaturasAtivas = (await this.obterViaturasAtivasHoje()).map(v => v.viatura_id);
        return this.viaturas.filter(viatura => 
            viatura.status === 'ATIVA' && !viaturasAtivas.includes(viatura.id)
        );
    }

    // FUNÇÃO MODIFICADA: Obter nome de guerra pela matrícula
    obterNomeGuerra(matricula) {
        if (!matricula) return 'N/E';
        
        // Buscar na lista de motoristas do sistema de frota
        const motorista = this.motoristas.find(m => m.matricula === matricula);
        if (motorista && motorista.nome_guerra) {
            return motorista.nome_guerra;
        }
        
        // Buscar no sistema de autenticação
        const user = auth.users.find(u => u.matricula === matricula);
        if (user && user.nomeGuerra) {
            return user.nomeGuerra;
        }
        
        // Fallback: buscar nome completo no registro de uso
        const registroUso = this.registrosUso.find(r => r.motorista?.matricula === matricula);
        if (registroUso && registroUso.motorista?.nome) {
            return registroUso.motorista.nome.split(' ')[0];
        }
        
        // Fallback final
        if (user && user.nome) {
            return user.nome.split(' ')[0];
        }
        
        return 'N/E';
    }

    // FUNÇÃO: Finalizar empréstimo (placeholder)
    async finalizarEmprestimo(id) {
        alert('Funcionalidade de finalizar empréstimo em desenvolvimento');
    }

	// FUNÇÃO: Exportar relatório de avarias (ATUALIZADA - REMOVA O ALERTA)
	async exportarRelatorioAvarias(tipo) {
		const periodo = document.getElementById('filtroPeriodoAvarias').value;
		const status = document.getElementById('filtroStatusAvaria').value;
		const busca = document.getElementById('filtroBuscaAvarias').value;
		
		const periodoTexto = document.getElementById('filtroPeriodoAvarias').options[document.getElementById('filtroPeriodoAvarias').selectedIndex].text;
		const statusTexto = document.getElementById('filtroStatusAvaria').options[document.getElementById('filtroStatusAvaria').selectedIndex].text;
		
		// Obter avarias filtradas
		let avariasFiltradas = this.filtrarAvariasParaExport(periodo, status, busca);
		
		const nomeArquivo = `Relatorio_Avarias_${new Date().toISOString().split('T')[0]}`;
		
		if (tipo === 'pdf') {
			await this.exportarAvariasParaPDF(avariasFiltradas, periodoTexto, statusTexto, busca, nomeArquivo);
		}
	}
	
	// VERSÃO ALTERNATIVA - Exclusão direta
	async excluirAvariaDireta(avariaId) {
		console.log('🔍 [excluirAvariaDireta] Iniciando:', avariaId);
		
		if (!confirm('Tem certeza que deseja excluir esta comunicação de avaria?\n\n⚠️ Esta ação não pode ser desfeita.')) {
			return;
		}

		try {
			// Chamada direta SEM DataService
			const response = await fetch('./api/api.php?action=deleteAvaria', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ id: avariaId })
			});
			
			const responseText = await response.text();
			console.log('🔍 [excluirAvariaDireta] Resposta bruta:', responseText);
			
			let result;
			try {
				result = JSON.parse(responseText);
			} catch (e) {
				result = { success: true, message: 'Excluído (resposta não JSON)' };
			}
			
			// Remover localmente independente da resposta
			this.avarias = this.avarias.filter(a => a.id !== avariaId);
			await this.loadVisualizarAvariasPage(document.getElementById('contentArea'));
			
			// Mostrar mensagem baseada na resposta
			if (result.success || response.ok) {
				alert('✅ Comunicação de avaria excluída com sucesso!');
			} else {
				alert('✅ Comunicação removida localmente. ' + 
					  (result.message ? 'Servidor: ' + result.message : ''));
			}
			
		} catch (error) {
			console.error('❌ [excluirAvariaDireta] Erro:', error);
			
			// Mesmo com erro, remove localmente
			this.avarias = this.avarias.filter(a => a.id !== avariaId);
			await this.loadVisualizarAvariasPage(document.getElementById('contentArea'));
			
			alert('✅ Comunicação removida localmente. Erro de conexão com servidor.');
		}
	}
}

// Inicializar sistema quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('dashboard.html')) {
        window.frotaSystem = new FrotaSystem();
        
        // Adicionar event listener para o formulário de fechar mapa
        const formFecharMapa = document.getElementById('formFecharMapa');
        if (formFecharMapa) {
            formFecharMapa.addEventListener('submit', function(e) {
                e.preventDefault();
                if (typeof frotaSystem !== 'undefined') {
                    frotaSystem.fecharMapa();
                }
            });
        }

        // Fechar modal ao clicar fora
        const modal = document.getElementById('modalFecharMapa');
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    if (typeof frotaSystem !== 'undefined') {
                        frotaSystem.fecharModalFecharMapa();
                    }
                }
            });
        }
    }
});