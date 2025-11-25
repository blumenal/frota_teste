// Sistema de autenticação integrado com API
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('pm_users')) || [];
        this.apiUrl = './api/api.php';
        this.initAdminUser();
    }

    initAdminUser() {
        if (!this.users.find(u => u.matricula === 'admin')) {
            const adminUser = {
                id: 1,
                nome: 'Administrador do Sistema',
                nomeGuerra: 'ADMIN',
                graduacao: 'Administrador',
                matricula: 'admin',
                senha: 'admin123',
                cpf: '000.000.000-00',
                telefone: '(81) 99999-9999',
                codigoCondutor: 'ADM001',
                isAdmin: true,
                ativo: true
            };
            this.users.push(adminUser);
            this.saveUsers();
        }
    }

    saveUsers() {
        localStorage.setItem('pm_users', JSON.stringify(this.users));
    }

    // MÉTODO LOGIN CORRIGIDO - integrado com API
	// MÉTODO LOGIN CORRIGIDO - integrado com API
	async login(matricula, senha) {
		try {
			console.log('?? Iniciando processo de login para:', matricula);
			
			// PRIMEIRO: Tentar login local (para admin)
			const localUser = this.users.find(u => 
				u.matricula === matricula && 
				u.senha === senha && 
				u.ativo !== false
			);
			
			if (localUser) {
				console.log('? Login local bem-sucedido');
				this.currentUser = localUser;
				localStorage.setItem('pm_currentUser', JSON.stringify(localUser));
				this.registrarLogin(localUser);
				return { success: true, user: localUser };
			}
			
			// SEGUNDO: Tentar login via API (para outros usuários)
			console.log('?? Tentando login via API...');
			const apiUser = await this.loginViaAPI(matricula, senha);
			
			if (apiUser) {
				console.log('? Login API bem-sucedido');
				this.currentUser = apiUser;
				localStorage.setItem('pm_currentUser', JSON.stringify(apiUser));
				this.registrarLogin(apiUser);
				return { success: true, user: apiUser };
			}
			
			throw new Error('Matrícula ou senha incorretos');
			
		} catch (error) {
			console.error('? Erro no login:', error);
			this.showLoginError(error.message);
			return { success: false, error: error.message };
		}
	}

	// Login via API - VERSÃO CORRIGIDA
	async loginViaAPI(matricula, senha) {
		try {
			console.log('?? Tentando login via API para matrícula:', matricula);
			
			// Enviar matrícula e senha para o backend validar
			const loginData = {
				matricula: matricula,
				senha: senha
			};

			const response = await fetch(this.apiUrl + '?action=login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(loginData)
			});

			// Verificar se a resposta é válida
			if (!response.ok) {
				throw new Error(`Erro HTTP: ${response.status}`);
			}

			const data = await response.json();
			console.log('?? Resposta da API:', data);
			
			if (data.success && data.user) {
				console.log('? Login bem-sucedido via API');
				return this.formatUserFromAPI(data.user);
			} else {
				throw new Error(data.message || 'Credenciais inválidas');
			}
			
		} catch (error) {
			console.error('? Erro ao fazer login via API:', error);
			throw error;
		}
	}

    // Formatar usuário da API para o formato local
	// Formatar usuário da API para o formato local - VERSÃO CORRIGIDA
	formatUserFromAPI(apiUser) {
		console.log('?? Formatando usuário da API:', apiUser);
		
		return {
			id: apiUser.id,
			nome: apiUser.nome_completo || apiUser.nome,
			nomeGuerra: apiUser.nome_guerra,
			graduacao: apiUser.graduacao,
			matricula: apiUser.matricula,
			senha: apiUser.senha, // Manter o hash (não usado para login)
			cpf: apiUser.cpf,
			telefone: apiUser.telefone,
			email: apiUser.email,
			codigoCondutor: apiUser.codigo_condutor,
			isAdmin: apiUser.is_admin === 1 || apiUser.is_admin === true,
			ativo: apiUser.status === 'ATIVO',
			dataCadastro: apiUser.created_at
		};
	}

    showLoginError(message) {
        const errorElement = document.getElementById('loginError');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        console.error('Erro de login:', message);
    }

    registrarLogin(user) {
        const logins = JSON.parse(localStorage.getItem('pm_login_logs')) || [];
        logins.push({
            userId: user.id,
            matricula: user.matricula,
            nome: user.nome,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        });
        
        if (logins.length > 1000) {
            logins.splice(0, logins.length - 1000);
        }
        
        localStorage.setItem('pm_login_logs', JSON.stringify(logins));
    }

    logout() {
        if (this.currentUser) {
            const logins = JSON.parse(localStorage.getItem('pm_login_logs')) || [];
            const lastLogin = logins[logins.length - 1];
            if (lastLogin) {
                lastLogin.logoutTimestamp = new Date().toISOString();
                localStorage.setItem('pm_login_logs', JSON.stringify(logins));
            }
        }
        
        this.currentUser = null;
        localStorage.removeItem('pm_currentUser');
        window.location.href = 'login.html';
    }

    getCurrentUser() {
        if (!this.currentUser) {
            const storedUser = localStorage.getItem('pm_currentUser');
            if (storedUser) {
                this.currentUser = JSON.parse(storedUser);
            }
        }
        return this.currentUser;
    }

    isAuthenticated() {
        return this.getCurrentUser() !== null;
    }

    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.isAdmin;
    }
}

// Inicializar sistema de autenticação
const auth = new AuthSystem();

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Página de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const matricula = document.getElementById('matricula').value.trim();
            const senha = document.getElementById('senha').value;
            const errorElement = document.getElementById('loginError');
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            
            // Validação básica
            if (!matricula || !senha) {
                showError('Preencha matrícula e senha');
                return;
            }
            
            // Mostrar loading
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<i class="loading"></i> Entrando...';
            submitBtn.disabled = true;
            
            // Limpar erro anterior
            if (errorElement) {
                errorElement.style.display = 'none';
            }
            
            try {
                // Fazer login
                const result = await auth.login(matricula, senha);
                
                if (result.success) {
                    // Login bem-sucedido
                    submitBtn.textContent = '? Login realizado!';
                    submitBtn.style.background = '#28a745';
                    
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                } else {
                    // Login falhou
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            } catch (error) {
                console.error('Erro no processo de login:', error);
                showError('Erro inesperado no login');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });

        // Focar no campo de matrícula automaticamente
        document.getElementById('matricula')?.focus();
    }

    // Verificar autenticação em páginas protegidas
    const protectedPages = ['dashboard.html', 'cadastro_motorista.html', 'cadastro_viatura.html', 'usuarios.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        if (!auth.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }
    }

    // Configurar logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (confirm('Deseja realmente sair do sistema?')) {
                auth.logout();
            }
        });
    }

    // Mostrar informações do usuário logado
    const userInfoElement = document.getElementById('userInfo');
    if (userInfoElement) {
        const user = auth.getCurrentUser();
        if (user) {
            userInfoElement.textContent = `${user.nomeGuerra} (${user.graduacao})`;
        }
    }
});

// Função auxiliar para mostrar erros
function showError(message) {
    const errorElement = document.getElementById('loginError');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// Tornar auth globalmente disponível
window.auth = auth;

console.log('AuthSystem carregado com sucesso!');