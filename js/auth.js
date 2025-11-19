// Sistema de autenticação melhorado
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('pm_users')) || [];
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

	// Substituir a função de login no auth.js
	async function login(matricula, senha) {
		try {
			const user = await DataService.login({ matricula, senha });
			
			if (user) {
				localStorage.setItem('pm_currentUser', JSON.stringify(user));
				window.location.href = 'dashboard.html';
				return true;
			}
		} catch (error) {
			console.error('Erro no login:', error);
			showLoginError(error.message || 'Matrícula ou senha incorretos');
			return false;
		}
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
        
        // Manter apenas os últimos 1000 logs
        if (logins.length > 1000) {
            logins.splice(0, logins.length - 1000);
        }
        
        localStorage.setItem('pm_login_logs', JSON.stringify(logins));
    }

    logout() {
        // Registrar logout
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

    registerUser(userData) {
        // Validar dados
        if (!userData.matricula || !userData.senha || !userData.nome) {
            return { success: false, message: 'Dados obrigatórios não preenchidos' };
        }

        if (this.users.find(u => u.matricula === userData.matricula)) {
            return { success: false, message: 'Matrícula já cadastrada' };
        }

        if (this.users.find(u => u.cpf === userData.cpf)) {
            return { success: false, message: 'CPF já cadastrado' };
        }

        const newUser = {
            id: Date.now(),
            ...userData,
            isAdmin: userData.isAdmin || false, // NOVO CAMPO PARA ADMINISTRADOR
            ativo: true,
            dataCadastro: new Date().toISOString()
        };

        this.users.push(newUser);
        this.saveUsers();
        
        return { 
            success: true, 
            message: 'Usuário cadastrado com sucesso',
            user: newUser
        };
    }

    updateUser(userId, userData) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return { success: false, message: 'Usuário não encontrado' };
        }

        this.users[userIndex] = { ...this.users[userIndex], ...userData };
        this.saveUsers();
        
        // Atualizar usuário atual se for o mesmo
        if (this.currentUser && this.currentUser.id === userId) {
            this.currentUser = this.users[userIndex];
            localStorage.setItem('pm_currentUser', JSON.stringify(this.currentUser));
        }
        
        return { success: true, message: 'Usuário atualizado com sucesso' };
    }

    changePassword(userId, currentPassword, newPassword) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            return { success: false, message: 'Usuário não encontrado' };
        }

        if (user.senha !== currentPassword) {
            return { success: false, message: 'Senha atual incorreta' };
        }

        user.senha = newPassword;
        this.saveUsers();
        
        return { success: true, message: 'Senha alterada com sucesso' };
    }
}

// Inicializar sistema de autenticação
const auth = new AuthSystem();

// Event listeners melhorados
document.addEventListener('DOMContentLoaded', function() {
    // Página de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const matricula = document.getElementById('matricula').value.trim();
            const senha = document.getElementById('senha').value;
            const errorElement = document.getElementById('loginError');
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            
            // Mostrar loading
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<span class="loading"></span> Entrando...';
            submitBtn.disabled = true;
            
            // Simular delay de rede
            setTimeout(() => {
                if (auth.login(matricula, senha)) {
                    // Login bem-sucedido
                    submitBtn.textContent = '✓ Login realizado!';
                    submitBtn.style.background = 'var(--success)';
                    
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                } else {
                    // Login falhou
                    errorElement.style.display = 'block';
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    
                    // Animar o erro
                    errorElement.style.animation = 'none';
                    setTimeout(() => {
                        errorElement.style.animation = 'fadeIn 0.3s ease';
                    }, 10);
                }
            }, 800);
        });

        // Focar no campo de matrícula automaticamente
        document.getElementById('matricula')?.focus();
    }

    // Verificar autenticação em páginas protegidas
    const protectedPages = ['dashboard.html', 'cadastro_motorista.html', 'cadastro_viatura.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && !auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // Configurar logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (confirm('Deseja realmente sair do sistema?')) {
                // Adicionar efeito visual de saída
                document.body.style.opacity = '0.7';
                setTimeout(() => {
                    auth.logout();
                }, 300);
            }
        });
    }

    // Configurar menu mobile
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.innerHTML = navMenu.classList.contains('active') ? 
                '✕' : '☰';
        });

        // Fechar menu ao clicar fora
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.main-nav') && !e.target.closest('.mobile-menu-btn')) {
                navMenu.classList.remove('active');
                mobileMenuBtn.innerHTML = '☰';
            }
        });
    }
});

// Utilitários de autenticação
window.auth = auth;