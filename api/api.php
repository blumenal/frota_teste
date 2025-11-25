<?php
// api/api.php - VERSÃO DEFINITIVA COM LOGIN
while (ob_get_level()) ob_end_clean();
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once __DIR__ . '/../includes/Database.php';

try {
    $db = new Database();
    $action = $_GET['action'] ?? 'test';
    
    switch($action) {
        case 'test':
            echo json_encode(['success' => true, 'message' => 'API funcionando', 'timestamp' => date('Y-m-d H:i:s')]);
            break;
            
        case 'login':
            $input = json_decode(file_get_contents('php://input'), true);
            echo json_encode($db->loginUser($input));
            break;
            
        case 'getMotoristas':
            echo json_encode(['success' => true, 'data' => $db->getMotoristas()]);
            break;
        case 'createMotorista':
            $input = json_decode(file_get_contents('php://input'), true);
            echo json_encode($db->createMotorista($input));
            break;
        case 'updateMotorista':
            $input = json_decode(file_get_contents('php://input'), true);
            echo json_encode($db->updateMotorista($input['id'], $input));
            break;
        case 'deleteMotorista':
            $input = json_decode(file_get_contents('php://input'), true);
            echo json_encode($db->deleteMotorista($input['id']));
            break;
        case 'getViaturas':
            echo json_encode(['success' => true, 'data' => $db->getViaturas()]);
            break;
        case 'createViatura':
            $input = json_decode(file_get_contents('php://input'), true);
            echo json_encode($db->createViatura($input));
            break;
        case 'updateViatura':
            $input = json_decode(file_get_contents('php://input'), true);
            echo json_encode($db->updateViatura($input['id'], $input));
            break;
        case 'deleteViatura':
            $input = json_decode(file_get_contents('php://input'), true);
            echo json_encode($db->deleteViatura($input['id']));
            break;
        case 'getUsoViaturas':
            echo json_encode(['success' => true, 'data' => $db->getUsoViaturas()]);
            break;
        case 'createUsoViatura':
            $input = json_decode(file_get_contents('php://input'), true);
            echo json_encode($db->createUsoViatura($input));
            break;
        case 'updateUsoViatura':
            $input = json_decode(file_get_contents('php://input'), true);
            echo json_encode($db->updateUsoViatura($input['id'], $input));
            break;
        case 'getAbastecimentos':
            echo json_encode(['success' => true, 'data' => $db->getAbastecimentos()]);
            break;
        case 'createAbastecimento':
            $input = json_decode(file_get_contents('php://input'), true);
            echo json_encode($db->createAbastecimento($input));
            break;
        case 'getAvarias':
            echo json_encode(['success' => true, 'data' => $db->getAvarias()]);
            break;
        case 'createAvaria':
            $input = json_decode(file_get_contents('php://input'), true);
            echo json_encode($db->createAvaria($input));
            break;
        case 'updateAvaria':
            $input = json_decode(file_get_contents('php://input'), true);
            echo json_encode($db->updateAvaria($input['id'], $input));
            break;
        case 'deleteAvaria': // ← CORRIGIDO: Use a classe Database
            $input = json_decode(file_get_contents('php://input'), true);
            echo json_encode($db->deleteAvaria($input['id']));
            break;
        case 'getEmprestimos':
            echo json_encode(['success' => true, 'data' => $db->getEmprestimos()]);
            break;
        case 'createEmprestimo':
            $input = json_decode(file_get_contents('php://input'), true);
            echo json_encode($db->createEmprestimo($input));
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Ação não reconhecida: ' . $action]);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
}