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
    
    // Métodos genéricos para CRUD
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
?>