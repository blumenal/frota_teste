<?php
// includes/Database.php
class Database {
    private $pdo;
    private $db_file;
    
    public function __construct() {
        // Criar diretório database se não existir
        if (!is_dir(__DIR__ . '/../database')) {
            mkdir(__DIR__ . '/../database', 0755, true);
        }
        
        $this->db_file = __DIR__ . '/../database/frota.db';
        $this->connect();
        $this->createTables();
    }
    
    private function connect() {
        try {
            $this->pdo = new PDO("sqlite:" . $this->db_file);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->pdo->exec("PRAGMA foreign_keys = ON;");
        } catch (PDOException $e) {
            die("Erro ao conectar com o banco: " . $e->getMessage());
        }
    }
    
    private function createTables() {
        $tables = [
            // Tabela de usuários/motoristas
            "CREATE TABLE IF NOT EXISTS motoristas (
                id TEXT PRIMARY KEY,
                nome_completo TEXT NOT NULL,
                nome_guerra TEXT NOT NULL,
                graduacao TEXT NOT NULL,
                matricula TEXT UNIQUE NOT NULL,
                codigo_condutor TEXT,
                cpf TEXT UNIQUE,
                telefone TEXT,
                email TEXT,
                senha TEXT NOT NULL,
                status TEXT DEFAULT 'ATIVO',
                is_admin INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
            
            // Tabela de viaturas
            "CREATE TABLE IF NOT EXISTS viaturas (
                id TEXT PRIMARY KEY,
                patrimonio TEXT UNIQUE NOT NULL,
                placa TEXT UNIQUE NOT NULL,
                tipo TEXT NOT NULL,
                modelo TEXT NOT NULL,
                ano INTEGER NOT NULL,
                cor TEXT NOT NULL,
                locadora TEXT,
                numero_cartao TEXT,
                combustivel TEXT NOT NULL,
                saldo REAL DEFAULT 0,
                status TEXT DEFAULT 'ATIVA',
                km_atual INTEGER DEFAULT 0,
                observacoes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
            
            // Tabela de abastecimentos
            "CREATE TABLE IF NOT EXISTS abastecimentos (
                id TEXT PRIMARY KEY,
                viatura_id TEXT NOT NULL,
                data_abastecimento DATE NOT NULL,
                hora_abastecimento TIME NOT NULL,
                km_abastecimento INTEGER NOT NULL,
                litros REAL NOT NULL,
                valor_total REAL NOT NULL,
                posto TEXT NOT NULL,
                combustivel TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (viatura_id) REFERENCES viaturas (id)
            )",
            
            // Tabela de uso de viaturas
            "CREATE TABLE IF NOT EXISTS uso_viaturas (
                id TEXT PRIMARY KEY,
                motorista_id TEXT NOT NULL,
                viatura_id TEXT NOT NULL,
                emprego_missao TEXT NOT NULL,
                data_inicial DATE NOT NULL,
                hora_inicial TIME NOT NULL,
                km_inicial INTEGER NOT NULL,
                data_final DATE,
                hora_final TIME,
                km_final INTEGER,
                observacoes TEXT,
                status TEXT DEFAULT 'ABERTO',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (motorista_id) REFERENCES motoristas (id),
                FOREIGN KEY (viatura_id) REFERENCES viaturas (id)
            )",
            
            // Tabela de avarias
            "CREATE TABLE IF NOT EXISTS avarias (
                id TEXT PRIMARY KEY,
                motorista_id TEXT NOT NULL,
                data_verificacao DATE NOT NULL,
                tipo_viatura TEXT NOT NULL,
                placa TEXT NOT NULL,
                km_atual INTEGER NOT NULL,
                patrimonio TEXT NOT NULL,
                problemas TEXT NOT NULL,
                observacoes TEXT,
                assinatura TEXT NOT NULL,
                status TEXT DEFAULT 'PENDENTE',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (motorista_id) REFERENCES motoristas (id)
            )",
            
            // Tabela de empréstimos
            "CREATE TABLE IF NOT EXISTS emprestimos (
                id TEXT PRIMARY KEY,
                condutor_grad TEXT NOT NULL,
                condutor_matricula TEXT NOT NULL,
                condutor_nome TEXT NOT NULL,
                condutor_cpf TEXT NOT NULL,
                condutor_unidade TEXT NOT NULL,
                condutor_telefone TEXT,
                viatura_id TEXT NOT NULL,
                finalidade TEXT NOT NULL,
                data_inicial DATE NOT NULL,
                hora_inicial TIME NOT NULL,
                data_final DATE NOT NULL,
                hora_final TIME NOT NULL,
                km_inicial INTEGER NOT NULL,
                km_previsto INTEGER,
                observacoes TEXT,
                responsavel TEXT NOT NULL,
                status TEXT DEFAULT 'ATIVO',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (viatura_id) REFERENCES viaturas (id)
            )"
        ];
        
        foreach ($tables as $table) {
            $this->pdo->exec($table);
        }
        
        // Inserir usuário admin padrão se não existir
        $this->createDefaultAdmin();
    }
    
    private function createDefaultAdmin() {
        $check = $this->pdo->query("SELECT COUNT(*) FROM motoristas WHERE is_admin = 1")->fetchColumn();
        
        if ($check == 0) {
            $defaultAdmin = [
                'id' => 'admin_' . uniqid(),
                'nome_completo' => 'Administrador do Sistema',
                'nome_guerra' => 'ADMIN',
                'graduacao' => 'MAJ',
                'matricula' => 'admin',
                'senha' => password_hash('admin123', PASSWORD_DEFAULT),
                'is_admin' => 1,
                'status' => 'ATIVO'
            ];
            
            $sql = "INSERT INTO motoristas (id, nome_completo, nome_guerra, graduacao, matricula, senha, is_admin, status) 
                    VALUES (:id, :nome_completo, :nome_guerra, :graduacao, :matricula, :senha, :is_admin, :status)";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($defaultAdmin);
        }
    }

    // =============================================
    // MÉTODO LOGIN - NOVO
    // =============================================
    
    public function loginUser($data) {
        try {
            $matricula = $data['matricula'] ?? '';
            $senha = $data['senha'] ?? '';
            
            if (empty($matricula) || empty($senha)) {
                return ['success' => false, 'message' => 'Matrícula e senha são obrigatórias'];
            }
            
            // Buscar usuário pela matrícula
            $stmt = $this->pdo->prepare("SELECT * FROM motoristas WHERE matricula = ? AND status = 'ATIVO'");
            $stmt->execute([$matricula]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user && password_verify($senha, $user['senha'])) {
                // Login bem-sucedido - remover senha do retorno
                unset($user['senha']);
                return [
                    'success' => true, 
                    'user' => $user,
                    'message' => 'Login realizado com sucesso'
                ];
            } else {
                return [
                    'success' => false, 
                    'message' => 'Matrícula ou senha incorretos'
                ];
            }
        } catch (PDOException $e) {
            error_log("Erro no login: " . $e->getMessage());
            return [
                'success' => false, 
                'message' => 'Erro no servidor: ' . $e->getMessage()
            ];
        }
    }

    // =============================================
    // MÉTODOS PARA MOTORISTAS
    // =============================================
    
    public function getMotoristas() {
        try {
            $sql = "SELECT * FROM motoristas ORDER BY nome_guerra";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erro ao buscar motoristas: " . $e->getMessage());
            return [];
        }
    }

    public function createMotorista($data) {
        try {
            $id = uniqid();
            
            // Hash da senha
            $senhaHash = password_hash($data['senha'], PASSWORD_DEFAULT);
            
            $sql = "INSERT INTO motoristas (id, nome_completo, nome_guerra, graduacao, matricula, codigo_condutor, cpf, telefone, email, senha, status, is_admin) 
                    VALUES (:id, :nome_completo, :nome_guerra, :graduacao, :matricula, :codigo_condutor, :cpf, :telefone, :email, :senha, :status, :is_admin)";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':id' => $id,
                ':nome_completo' => $data['nome_completo'],
                ':nome_guerra' => $data['nome_guerra'],
                ':graduacao' => $data['graduacao'],
                ':matricula' => $data['matricula'],
                ':codigo_condutor' => $data['codigo_condutor'],
                ':cpf' => $data['cpf'],
                ':telefone' => $data['telefone'],
                ':email' => $data['email'] ?? null,
                ':senha' => $senhaHash,
                ':status' => $data['status'],
                ':is_admin' => $data['is_admin'] ? 1 : 0
            ]);
            
            return ['success' => true, 'id' => $id];
        } catch (PDOException $e) {
            error_log("Erro ao criar motorista: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro ao criar motorista: ' . $e->getMessage()];
        }
    }

    public function updateMotorista($id, $data) {
        try {
            $sql = "UPDATE motoristas SET 
                    nome_completo = :nome_completo,
                    nome_guerra = :nome_guerra,
                    graduacao = :graduacao,
                    codigo_condutor = :codigo_condutor,
                    cpf = :cpf,
                    telefone = :telefone,
                    email = :email,
                    status = :status,
                    is_admin = :is_admin";
            
            // Se senha foi fornecida, atualiza também
            if (isset($data['senha']) && !empty($data['senha'])) {
                $sql .= ", senha = :senha";
            }
            
            $sql .= " WHERE id = :id";
            
            $stmt = $this->pdo->prepare($sql);
            
            $params = [
                ':id' => $id,
                ':nome_completo' => $data['nome_completo'],
                ':nome_guerra' => $data['nome_guerra'],
                ':graduacao' => $data['graduacao'],
                ':codigo_condutor' => $data['codigo_condutor'],
                ':cpf' => $data['cpf'],
                ':telefone' => $data['telefone'],
                ':email' => $data['email'] ?? null,
                ':status' => $data['status'],
                ':is_admin' => $data['is_admin'] ? 1 : 0
            ];
            
            if (isset($data['senha']) && !empty($data['senha'])) {
                $params[':senha'] = password_hash($data['senha'], PASSWORD_DEFAULT);
            }
            
            $stmt->execute($params);
            
            return ['success' => true];
        } catch (PDOException $e) {
            error_log("Erro ao atualizar motorista: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro ao atualizar motorista: ' . $e->getMessage()];
        }
    }

    public function deleteMotorista($id) {
        try {
            $sql = "DELETE FROM motoristas WHERE id = :id";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':id' => $id]);
            return ['success' => true];
        } catch (PDOException $e) {
            error_log("Erro ao excluir motorista: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro ao excluir motorista: ' . $e->getMessage()];
        }
    }

    // =============================================
    // MÉTODOS PARA VIATURAS
    // =============================================

    public function getViaturas() {
        try {
            $sql = "SELECT * FROM viaturas ORDER BY patrimonio";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erro ao buscar viaturas: " . $e->getMessage());
            return [];
        }
    }

    public function createViatura($data) {
        try {
            $id = uniqid();
            
            $sql = "INSERT INTO viaturas (id, patrimonio, placa, tipo, modelo, ano, cor, locadora, numero_cartao, combustivel, saldo, status, km_atual, observacoes) 
                    VALUES (:id, :patrimonio, :placa, :tipo, :modelo, :ano, :cor, :locadora, :numero_cartao, :combustivel, :saldo, :status, :km_atual, :observacoes)";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':id' => $id,
                ':patrimonio' => $data['patrimonio'],
                ':placa' => $data['placa'],
                ':tipo' => $data['tipo'],
                ':modelo' => $data['modelo'],
                ':ano' => $data['ano'],
                ':cor' => $data['cor'],
                ':locadora' => $data['locadora'],
                ':numero_cartao' => $data['numero_cartao'],
                ':combustivel' => $data['combustivel'],
                ':saldo' => $data['saldo'],
                ':status' => $data['status'],
                ':km_atual' => $data['km_atual'],
                ':observacoes' => $data['observacoes'] ?? null
            ]);
            
            return ['success' => true, 'id' => $id];
        } catch (PDOException $e) {
            error_log("Erro ao criar viatura: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro ao criar viatura: ' . $e->getMessage()];
        }
    }

    public function updateViatura($id, $data) {
        try {
            $sql = "UPDATE viaturas SET 
                    patrimonio = :patrimonio,
                    placa = :placa,
                    tipo = :tipo,
                    modelo = :modelo,
                    ano = :ano,
                    cor = :cor,
                    locadora = :locadora,
                    numero_cartao = :numero_cartao,
                    combustivel = :combustivel,
                    saldo = :saldo,
                    status = :status,
                    km_atual = :km_atual,
                    observacoes = :observacoes
                    WHERE id = :id";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':id' => $id,
                ':patrimonio' => $data['patrimonio'],
                ':placa' => $data['placa'],
                ':tipo' => $data['tipo'],
                ':modelo' => $data['modelo'],
                ':ano' => $data['ano'],
                ':cor' => $data['cor'],
                ':locadora' => $data['locadora'],
                ':numero_cartao' => $data['numero_cartao'],
                ':combustivel' => $data['combustivel'],
                ':saldo' => $data['saldo'],
                ':status' => $data['status'],
                ':km_atual' => $data['km_atual'],
                ':observacoes' => $data['observacoes'] ?? null
            ]);
            
            return ['success' => true];
        } catch (PDOException $e) {
            error_log("Erro ao atualizar viatura: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro ao atualizar viatura: ' . $e->getMessage()];
        }
    }

    public function deleteViatura($id) {
        try {
            $sql = "DELETE FROM viaturas WHERE id = :id";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':id' => $id]);
            return ['success' => true];
        } catch (PDOException $e) {
            error_log("Erro ao excluir viatura: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro ao excluir viatura: ' . $e->getMessage()];
        }
    }

    // =============================================
    // MÉTODOS PARA USO DE VIATURAS
    // =============================================

    public function getUsoViaturas() {
        try {
            $sql = "SELECT uv.*, m.nome_guerra, m.graduacao, m.matricula, v.patrimonio, v.placa 
                    FROM uso_viaturas uv 
                    LEFT JOIN motoristas m ON uv.motorista_id = m.id 
                    LEFT JOIN viaturas v ON uv.viatura_id = v.id 
                    ORDER BY uv.data_inicial DESC";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erro ao buscar uso de viaturas: " . $e->getMessage());
            return [];
        }
    }

    public function createUsoViatura($data) {
        try {
            $id = uniqid();
            
            $sql = "INSERT INTO uso_viaturas (id, motorista_id, viatura_id, emprego_missao, data_inicial, hora_inicial, km_inicial, observacoes, status) 
                    VALUES (:id, :motorista_id, :viatura_id, :emprego_missao, :data_inicial, :hora_inicial, :km_inicial, :observacoes, :status)";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':id' => $id,
                ':motorista_id' => $data['motorista_id'],
                ':viatura_id' => $data['viatura_id'],
                ':emprego_missao' => $data['emprego_missao'],
                ':data_inicial' => $data['data_inicial'],
                ':hora_inicial' => $data['hora_inicial'],
                ':km_inicial' => $data['km_inicial'],
                ':observacoes' => $data['observacoes'] ?? null,
                ':status' => $data['status']
            ]);
            
            return ['success' => true, 'id' => $id];
        } catch (PDOException $e) {
            error_log("Erro ao criar uso de viatura: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro ao criar uso de viatura: ' . $e->getMessage()];
        }
    }

    public function updateUsoViatura($id, $data) {
        try {
            $sql = "UPDATE uso_viaturas SET 
                    data_final = :data_final,
                    hora_final = :hora_final,
                    km_final = :km_final,
                    observacoes = :observacoes,
                    status = :status,
                    updated_at = CURRENT_TIMESTAMP
                    WHERE id = :id";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':id' => $id,
                ':data_final' => $data['data_final'],
                ':hora_final' => $data['hora_final'],
                ':km_final' => $data['km_final'],
                ':observacoes' => $data['observacoes'] ?? null,
                ':status' => $data['status']
            ]);
            
            return ['success' => true];
        } catch (PDOException $e) {
            error_log("Erro ao atualizar uso de viatura: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro ao atualizar uso de viatura: ' . $e->getMessage()];
        }
    }

    // =============================================
    // MÉTODOS PARA ABASTECIMENTOS
    // =============================================

    public function getAbastecimentos() {
        try {
            $sql = "SELECT a.*, v.placa, v.patrimonio 
                    FROM abastecimentos a 
                    LEFT JOIN viaturas v ON a.viatura_id = v.id 
                    ORDER BY a.data_abastecimento DESC";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erro ao buscar abastecimentos: " . $e->getMessage());
            return [];
        }
    }

    public function createAbastecimento($data) {
        try {
            $id = uniqid();
            
            $sql = "INSERT INTO abastecimentos (id, viatura_id, data_abastecimento, hora_abastecimento, km_abastecimento, litros, valor_total, posto, combustivel) 
                    VALUES (:id, :viatura_id, :data_abastecimento, :hora_abastecimento, :km_abastecimento, :litros, :valor_total, :posto, :combustivel)";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':id' => $id,
                ':viatura_id' => $data['viatura_id'],
                ':data_abastecimento' => $data['data_abastecimento'],
                ':hora_abastecimento' => $data['hora_abastecimento'],
                ':km_abastecimento' => $data['km_abastecimento'],
                ':litros' => $data['litros'],
                ':valor_total' => $data['valor_total'],
                ':posto' => $data['posto'],
                ':combustivel' => $data['combustivel']
            ]);
            
            return ['success' => true, 'id' => $id];
        } catch (PDOException $e) {
            error_log("Erro ao criar abastecimento: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro ao criar abastecimento: ' . $e->getMessage()];
        }
    }

    // =============================================
    // MÉTODOS PARA AVARIAS
    // =============================================

    public function getAvarias() {
        try {
            $sql = "SELECT a.*, m.graduacao, m.nome_guerra as assinatura 
                    FROM avarias a 
                    LEFT JOIN motoristas m ON a.motorista_id = m.id 
                    ORDER BY a.data_verificacao DESC";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erro ao buscar avarias: " . $e->getMessage());
            return [];
        }
    }

    public function createAvaria($data) {
        try {
            $id = uniqid();
            
            $sql = "INSERT INTO avarias (id, motorista_id, data_verificacao, tipo_viatura, placa, km_atual, patrimonio, problemas, observacoes, assinatura, status) 
                    VALUES (:id, :motorista_id, :data_verificacao, :tipo_viatura, :placa, :km_atual, :patrimonio, :problemas, :observacoes, :assinatura, :status)";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':id' => $id,
                ':motorista_id' => $data['motorista_id'],
                ':data_verificacao' => $data['data_verificacao'],
                ':tipo_viatura' => $data['tipo_viatura'],
                ':placa' => $data['placa'],
                ':km_atual' => $data['km_atual'],
                ':patrimonio' => $data['patrimonio'],
                ':problemas' => $data['problemas'],
                ':observacoes' => $data['observacoes'] ?? null,
                ':assinatura' => $data['assinatura'],
                ':status' => $data['status']
            ]);
            
            return ['success' => true, 'id' => $id];
        } catch (PDOException $e) {
            error_log("Erro ao criar avaria: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro ao criar avaria: ' . $e->getMessage()];
        }
    }

    public function updateAvaria($id, $data) {
        try {
            $sql = "UPDATE avarias SET status = :status WHERE id = :id";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':id' => $id,
                ':status' => $data['status']
            ]);
            
            return ['success' => true];
        } catch (PDOException $e) {
            error_log("Erro ao atualizar avaria: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro ao atualizar avaria: ' . $e->getMessage()];
        }
    }
	
	public function deleteAvaria($id) {
		try {
			// Verificar se a avaria existe
			$stmt = $this->pdo->prepare("SELECT id FROM avarias WHERE id = ?");
			$stmt->execute([$id]);
			$avaria = $stmt->fetch();
			
			if (!$avaria) {
				return ['success' => false, 'message' => 'Avaria não encontrada'];
			}
			
			// Excluir a avaria
			$stmt = $this->pdo->prepare("DELETE FROM avarias WHERE id = ?");
			$stmt->execute([$id]);
			
			if ($stmt->rowCount() > 0) {
				return ['success' => true, 'message' => 'Avaria excluída com sucesso'];
			} else {
				return ['success' => false, 'message' => 'Nenhuma avaria foi excluída'];
			}
			
		} catch (PDOException $e) {
			return ['success' => false, 'message' => 'Erro ao excluir avaria: ' . $e->getMessage()];
		}
	}

    // =============================================
    // MÉTODOS PARA EMPRÉSTIMOS
    // =============================================

    public function getEmprestimos() {
        try {
            $sql = "SELECT e.*, v.patrimonio, v.placa 
                    FROM emprestimos e 
                    LEFT JOIN viaturas v ON e.viatura_id = v.id 
                    ORDER BY e.data_inicial DESC";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erro ao buscar empréstimos: " . $e->getMessage());
            return [];
        }
    }

    public function createEmprestimo($data) {
        try {
            $id = uniqid();
            
            $sql = "INSERT INTO emprestimos (id, condutor_grad, condutor_matricula, condutor_nome, condutor_cpf, condutor_unidade, condutor_telefone, viatura_id, finalidade, data_inicial, hora_inicial, data_final, hora_final, km_inicial, km_previsto, observacoes, responsavel, status) 
                    VALUES (:id, :condutor_grad, :condutor_matricula, :condutor_nome, :condutor_cpf, :condutor_unidade, :condutor_telefone, :viatura_id, :finalidade, :data_inicial, :hora_inicial, :data_final, :hora_final, :km_inicial, :km_previsto, :observacoes, :responsavel, :status)";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':id' => $id,
                ':condutor_grad' => $data['condutor_grad'],
                ':condutor_matricula' => $data['condutor_matricula'],
                ':condutor_nome' => $data['condutor_nome'],
                ':condutor_cpf' => $data['condutor_cpf'],
                ':condutor_unidade' => $data['condutor_unidade'],
                ':condutor_telefone' => $data['condutor_telefone'] ?? null,
                ':viatura_id' => $data['viatura_id'],
                ':finalidade' => $data['finalidade'],
                ':data_inicial' => $data['data_inicial'],
                ':hora_inicial' => $data['hora_inicial'],
                ':data_final' => $data['data_final'],
                ':hora_final' => $data['hora_final'],
                ':km_inicial' => $data['km_inicial'],
                ':km_previsto' => $data['km_previsto'] ?? null,
                ':observacoes' => $data['observacoes'] ?? null,
                ':responsavel' => $data['responsavel'],
                ':status' => $data['status'] ?? 'ATIVO'
            ]);
            
            return ['success' => true, 'id' => $id];
        } catch (PDOException $e) {
            error_log("Erro ao criar empréstimo: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro ao criar empréstimo: ' . $e->getMessage()];
        }
    }

    // =============================================
    // MÉTODOS GENÉRICOS PARA COMPATIBILIDADE
    // =============================================
    
    public function query($sql, $params = []) {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function execute($sql, $params = []) {
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($params);
    }
    
    public function lastInsertId() {
        return $this->pdo->lastInsertId();
    }
}