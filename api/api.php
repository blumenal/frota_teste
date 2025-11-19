<?php
// api/api.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../includes/Database.php';

$db = new Database();
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);
$entity = $_GET['entity'] ?? '';
$action = $_GET['action'] ?? '';
$id = $_GET['id'] ?? '';

function generateId() {
    return uniqid();
}

function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function sendError($message, $statusCode = 400) {
    sendResponse(['error' => $message], $statusCode);
}

try {
    switch ($entity) {
        case 'motoristas':
            handleMotoristas($db, $method, $input, $id, $action);
            break;
            
        case 'viaturas':
            handleViaturas($db, $method, $input, $id, $action);
            break;
            
        case 'abastecimentos':
            handleAbastecimentos($db, $method, $input, $id, $action);
            break;
            
        case 'uso_viaturas':
            handleUsoViaturas($db, $method, $input, $id, $action);
            break;
            
        case 'avarias':
            handleAvarias($db, $method, $input, $id, $action);
            break;
            
        case 'emprestimos':
            handleEmprestimos($db, $method, $input, $id, $action);
            break;
            
        case 'auth':
            handleAuth($db, $method, $input);
            break;
            
        case 'dashboard':
            handleDashboard($db, $method, $input);
            break;
            
        default:
            sendError('Entidade não encontrada', 404);
    }
} catch (Exception $e) {
    sendError('Erro interno: ' . $e->getMessage(), 500);
}

// Handlers para cada entidade
function handleMotoristas($db, $method, $input, $id, $action) {
    switch ($method) {
        case 'GET':
            if ($id) {
                $motorista = $db->query("SELECT id, nome_completo, nome_guerra, graduacao, matricula, codigo_condutor, cpf, telefone, email, status, is_admin FROM motoristas WHERE id = ?", [$id]);
                sendResponse($motorista[0] ?? null);
            } else {
                $motoristas = $db->query("SELECT id, nome_completo, nome_guerra, graduacao, matricula, codigo_condutor, status, is_admin FROM motoristas ORDER BY nome_guerra");
                sendResponse($motoristas);
            }
            break;
            
        case 'POST':
            if ($action === 'login') {
                // Login
                $matricula = $input['matricula'] ?? '';
                $senha = $input['senha'] ?? '';
                
                $user = $db->query("SELECT * FROM motoristas WHERE matricula = ? AND status = 'ATIVO'", [$matricula]);
                
                if (empty($user) || !password_verify($senha, $user[0]['senha'])) {
                    sendError('Matrícula ou senha incorretos', 401);
                }
                
                // Remover senha da resposta
                unset($user[0]['senha']);
                sendResponse($user[0]);
            } else {
                // Cadastrar motorista
                $input['id'] = generateId();
                $input['senha'] = password_hash($input['senha'], PASSWORD_DEFAULT);
                
                $sql = "INSERT INTO motoristas (id, nome_completo, nome_guerra, graduacao, matricula, codigo_condutor, cpf, telefone, email, senha, status, is_admin) 
                        VALUES (:id, :nome_completo, :nome_guerra, :graduacao, :matricula, :codigo_condutor, :cpf, :telefone, :email, :senha, :status, :is_admin)";
                
                $db->execute($sql, $input);
                sendResponse(['success' => true, 'id' => $input['id']]);
            }
            break;
            
        case 'PUT':
            if (isset($input['senha']) && !empty($input['senha'])) {
                $input['senha'] = password_hash($input['senha'], PASSWORD_DEFAULT);
            } else {
                unset($input['senha']);
            }
            
            $fields = [];
            $params = [];
            foreach ($input as $key => $value) {
                if ($key !== 'id') {
                    $fields[] = "$key = :$key";
                }
                $params[$key] = $value;
            }
            
            $sql = "UPDATE motoristas SET " . implode(', ', $fields) . " WHERE id = :id";
            $db->execute($sql, $params);
            sendResponse(['success' => true]);
            break;
            
        case 'DELETE':
            $db->execute("DELETE FROM motoristas WHERE id = ?", [$id]);
            sendResponse(['success' => true]);
            break;
    }
}

function handleViaturas($db, $method, $input, $id, $action) {
    switch ($method) {
        case 'GET':
            if ($id) {
                $viatura = $db->query("SELECT * FROM viaturas WHERE id = ?", [$id]);
                sendResponse($viatura[0] ?? null);
            } else {
                $viaturas = $db->query("SELECT * FROM viaturas ORDER BY patrimonio");
                sendResponse($viaturas);
            }
            break;
            
        case 'POST':
            $input['id'] = generateId();
            $sql = "INSERT INTO viaturas (id, patrimonio, placa, tipo, modelo, ano, cor, locadora, numero_cartao, combustivel, saldo, status, km_atual, observacoes) 
                    VALUES (:id, :patrimonio, :placa, :tipo, :modelo, :ano, :cor, :locadora, :numero_cartao, :combustivel, :saldo, :status, :km_atual, :observacoes)";
            
            $db->execute($sql, $input);
            sendResponse(['success' => true, 'id' => $input['id']]);
            break;
            
        case 'PUT':
            $fields = [];
            $params = [];
            foreach ($input as $key => $value) {
                if ($key !== 'id') {
                    $fields[] = "$key = :$key";
                }
                $params[$key] = $value;
            }
            
            $sql = "UPDATE viaturas SET " . implode(', ', $fields) . " WHERE id = :id";
            $db->execute($sql, $params);
            sendResponse(['success' => true]);
            break;
            
        case 'DELETE':
            $db->execute("DELETE FROM viaturas WHERE id = ?", [$id]);
            sendResponse(['success' => true]);
            break;
    }
}

function handleAbastecimentos($db, $method, $input, $id, $action) {
    switch ($method) {
        case 'GET':
            if ($id) {
                $abastecimento = $db->query("SELECT * FROM abastecimentos WHERE id = ?", [$id]);
                sendResponse($abastecimento[0] ?? null);
            } else {
                $abastecimentos = $db->query("
                    SELECT a.*, v.patrimonio, v.placa 
                    FROM abastecimentos a 
                    LEFT JOIN viaturas v ON a.viatura_id = v.id 
                    ORDER BY a.data_abastecimento DESC, a.hora_abastecimento DESC
                ");
                sendResponse($abastecimentos);
            }
            break;
            
        case 'POST':
            $input['id'] = generateId();
            $sql = "INSERT INTO abastecimentos (id, viatura_id, data_abastecimento, hora_abastecimento, km_abastecimento, litros, valor_total, posto, combustivel) 
                    VALUES (:id, :viatura_id, :data_abastecimento, :hora_abastecimento, :km_abastecimento, :litros, :valor_total, :posto, :combustivel)";
            
            $db->execute($sql, $input);
            
            // Atualizar saldo da viatura
            if (isset($input['valor_total'])) {
                $db->execute("UPDATE viaturas SET saldo = saldo - ? WHERE id = ?", [$input['valor_total'], $input['viatura_id']]);
            }
            
            sendResponse(['success' => true, 'id' => $input['id']]);
            break;
            
        case 'DELETE':
            $db->execute("DELETE FROM abastecimentos WHERE id = ?", [$id]);
            sendResponse(['success' => true]);
            break;
    }
}

function handleUsoViaturas($db, $method, $input, $id, $action) {
    switch ($method) {
        case 'GET':
            if ($id) {
                $uso = $db->query("
                    SELECT uv.*, m.nome_guerra, m.graduacao, v.patrimonio, v.placa 
                    FROM uso_viaturas uv 
                    LEFT JOIN motoristas m ON uv.motorista_id = m.id 
                    LEFT JOIN viaturas v ON uv.viatura_id = v.id 
                    WHERE uv.id = ?
                ", [$id]);
                sendResponse($uso[0] ?? null);
            } else {
                $usos = $db->query("
                    SELECT uv.*, m.nome_guerra, m.graduacao, v.patrimonio, v.placa 
                    FROM uso_viaturas uv 
                    LEFT JOIN motoristas m ON uv.motorista_id = m.id 
                    LEFT JOIN viaturas v ON uv.viatura_id = v.id 
                    ORDER BY uv.data_inicial DESC, uv.hora_inicial DESC
                ");
                sendResponse($usos);
            }
            break;
            
        case 'POST':
            $input['id'] = generateId();
            $sql = "INSERT INTO uso_viaturas (id, motorista_id, viatura_id, emprego_missao, data_inicial, hora_inicial, km_inicial, observacoes) 
                    VALUES (:id, :motorista_id, :viatura_id, :emprego_missao, :data_inicial, :hora_inicial, :km_inicial, :observacoes)";
            
            $db->execute($sql, $input);
            sendResponse(['success' => true, 'id' => $input['id']]);
            break;
            
        case 'PUT':
            $fields = [];
            $params = [];
            foreach ($input as $key => $value) {
                if ($key !== 'id') {
                    $fields[] = "$key = :$key";
                }
                $params[$key] = $value;
            }
            
            // Se está fechando o uso, atualizar KM da viatura
            if (isset($input['km_final']) && isset($input['viatura_id'])) {
                $db->execute("UPDATE viaturas SET km_atual = ? WHERE id = ?", [$input['km_final'], $input['viatura_id']]);
            }
            
            $sql = "UPDATE uso_viaturas SET " . implode(', ', $fields) . " WHERE id = :id";
            $db->execute($sql, $params);
            sendResponse(['success' => true]);
            break;
            
        case 'DELETE':
            $db->execute("DELETE FROM uso_viaturas WHERE id = ?", [$id]);
            sendResponse(['success' => true]);
            break;
    }
}

function handleAvarias($db, $method, $input, $id, $action) {
    switch ($method) {
        case 'GET':
            if ($id) {
                $avaria = $db->query("
                    SELECT a.*, m.nome_guerra, m.graduacao 
                    FROM avarias a 
                    LEFT JOIN motoristas m ON a.motorista_id = m.id 
                    WHERE a.id = ?
                ", [$id]);
                sendResponse($avaria[0] ?? null);
            } else {
                $avarias = $db->query("
                    SELECT a.*, m.nome_guerra, m.graduacao 
                    FROM avarias a 
                    LEFT JOIN motoristas m ON a.motorista_id = m.id 
                    ORDER BY a.data_verificacao DESC
                ");
                sendResponse($avarias);
            }
            break;
            
        case 'POST':
            $input['id'] = generateId();
            // Converter array de problemas para JSON
            if (isset($input['problemas']) && is_array($input['problemas'])) {
                $input['problemas'] = json_encode($input['problemas'], JSON_UNESCAPED_UNICODE);
            }
            
            $sql = "INSERT INTO avarias (id, motorista_id, data_verificacao, tipo_viatura, placa, km_atual, patrimonio, problemas, observacoes, assinatura, status) 
                    VALUES (:id, :motorista_id, :data_verificacao, :tipo_viatura, :placa, :km_atual, :patrimonio, :problemas, :observacoes, :assinatura, :status)";
            
            $db->execute($sql, $input);
            sendResponse(['success' => true, 'id' => $input['id']]);
            break;
            
        case 'PUT':
            // Converter array de problemas para JSON se existir
            if (isset($input['problemas']) && is_array($input['problemas'])) {
                $input['problemas'] = json_encode($input['problemas'], JSON_UNESCAPED_UNICODE);
            }
            
            $fields = [];
            $params = [];
            foreach ($input as $key => $value) {
                if ($key !== 'id') {
                    $fields[] = "$key = :$key";
                }
                $params[$key] = $value;
            }
            
            $sql = "UPDATE avarias SET " . implode(', ', $fields) . " WHERE id = :id";
            $db->execute($sql, $params);
            sendResponse(['success' => true]);
            break;
            
        case 'DELETE':
            $db->execute("DELETE FROM avarias WHERE id = ?", [$id]);
            sendResponse(['success' => true]);
            break;
    }
}

function handleEmprestimos($db, $method, $input, $id, $action) {
    switch ($method) {
        case 'GET':
            if ($id) {
                $emprestimo = $db->query("
                    SELECT e.*, v.patrimonio, v.placa 
                    FROM emprestimos e 
                    LEFT JOIN viaturas v ON e.viatura_id = v.id 
                    WHERE e.id = ?
                ", [$id]);
                sendResponse($emprestimo[0] ?? null);
            } else {
                $emprestimos = $db->query("
                    SELECT e.*, v.patrimonio, v.placa 
                    FROM emprestimos e 
                    LEFT JOIN viaturas v ON e.viatura_id = v.id 
                    ORDER BY e.data_inicial DESC
                ");
                sendResponse($emprestimos);
            }
            break;
            
        case 'POST':
            $input['id'] = generateId();
            $sql = "INSERT INTO emprestimos (id, condutor_grad, condutor_matricula, condutor_nome, condutor_cpf, condutor_unidade, condutor_telefone, viatura_id, finalidade, data_inicial, hora_inicial, data_final, hora_final, km_inicial, km_previsto, observacoes, responsavel, status) 
                    VALUES (:id, :condutor_grad, :condutor_matricula, :condutor_nome, :condutor_cpf, :condutor_unidade, :condutor_telefone, :viatura_id, :finalidade, :data_inicial, :hora_inicial, :data_final, :hora_final, :km_inicial, :km_previsto, :observacoes, :responsavel, :status)";
            
            $db->execute($sql, $input);
            sendResponse(['success' => true, 'id' => $input['id']]);
            break;
            
        case 'PUT':
            $fields = [];
            $params = [];
            foreach ($input as $key => $value) {
                if ($key !== 'id') {
                    $fields[] = "$key = :$key";
                }
                $params[$key] = $value;
            }
            
            $sql = "UPDATE emprestimos SET " . implode(', ', $fields) . " WHERE id = :id";
            $db->execute($sql, $params);
            sendResponse(['success' => true]);
            break;
            
        case 'DELETE':
            $db->execute("DELETE FROM emprestimos WHERE id = ?", [$id]);
            sendResponse(['success' => true]);
            break;
    }
}

function handleAuth($db, $method, $input) {
    if ($method === 'POST' && ($input['action'] ?? '') === 'verify') {
        $matricula = $input['matricula'] ?? '';
        $user = $db->query("SELECT id, nome_guerra, graduacao, matricula, is_admin FROM motoristas WHERE matricula = ? AND status = 'ATIVO'", [$matricula]);
        
        if (empty($user)) {
            sendError('Usuário não encontrado', 404);
        }
        
        sendResponse($user[0]);
    }
}

function handleDashboard($db, $method, $input) {
    if ($method === 'GET') {
        $stats = [
            'total_viaturas' => $db->query("SELECT COUNT(*) as total FROM viaturas")[0]['total'],
            'viaturas_ativas' => $db->query("SELECT COUNT(*) as total FROM viaturas WHERE status = 'ATIVA'")[0]['total'],
            'viaturas_manutencao' => $db->query("SELECT COUNT(*) as total FROM viaturas WHERE status = 'MANUTENCAO'")[0]['total'],
            'total_motoristas' => $db->query("SELECT COUNT(*) as total FROM motoristas WHERE status = 'ATIVO'")[0]['total'],
            'uso_aberto' => $db->query("SELECT COUNT(*) as total FROM uso_viaturas WHERE status = 'ABERTO'")[0]['total'],
            'avarias_pendentes' => $db->query("SELECT COUNT(*) as total FROM avarias WHERE status = 'PENDENTE'")[0]['total']
        ];
        
        sendResponse($stats);
    }
}
?>