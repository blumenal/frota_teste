<?php
// api/api-debug.php

// Limpar qualquer output anterior
ob_clean();

header('Content-Type: text/plain; charset=utf-8');

echo "=== DEBUG API ===\n";
echo "PHP Version: " . phpversion() . "\n";
echo "Server: " . $_SERVER['SERVER_SOFTWARE'] . "\n";
echo "Request Method: " . $_SERVER['REQUEST_METHOD'] . "\n";
echo "GET params: " . print_r($_GET, true) . "\n";

// Testar SQLite
try {
    echo "\n=== SQLite Test ===\n";
    $db_file = __DIR__ . '/../database/frota.db';
    echo "Database file: " . $db_file . "\n";
    echo "File exists: " . (file_exists($db_file) ? 'YES' : 'NO') . "\n";
    echo "File readable: " . (is_readable($db_file) ? 'YES' : 'NO') . "\n";
    echo "File writable: " . (is_writable($db_file) ? 'YES' : 'NO') . "\n";
    
    if (file_exists($db_file)) {
        $db = new SQLite3($db_file);
        $result = $db->query("SELECT name FROM sqlite_master WHERE type='table'");
        $tables = [];
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            $tables[] = $row['name'];
        }
        echo "Tables: " . implode(', ', $tables) . "\n";
        $db->close();
    }
} catch (Exception $e) {
    echo "SQLite Error: " . $e->getMessage() . "\n";
}

// Testar includes
echo "\n=== Includes Test ===\n";
$database_path = __DIR__ . '/../includes/Database.php';
echo "Database.php path: " . $database_path . "\n";
echo "Database.php exists: " . (file_exists($database_path) ? 'YES' : 'NO') . "\n";

if (file_exists($database_path)) {
    require_once $database_path;
    echo "Database class exists: " . (class_exists('Database') ? 'YES' : 'NO') . "\n";
    
    try {
        $db = new Database();
        echo "Database connection: SUCCESS\n";
        
        // Testar uma consulta simples
        $motoristas = $db->getMotoristas();
        echo "Motoristas count: " . count($motoristas) . "\n";
        
    } catch (Exception $e) {
        echo "Database Error: " . $e->getMessage() . "\n";
    }
}

echo "\n=== PHP Extensions ===\n";
$extensions = ['pdo', 'pdo_sqlite', 'json'];
foreach ($extensions as $ext) {
    echo "$ext: " . (extension_loaded($ext) ? 'LOADED' : 'MISSING') . "\n";
}