<?php
// test.php - Para testar se tudo está funcionando
require_once 'includes/Database.php';

try {
    $db = new Database();
    echo "✅ Banco de dados conectado com sucesso!<br>";
    
    // Testar tabelas
    $tables = ['motoristas', 'viaturas', 'abastecimentos', 'uso_viaturas', 'avarias', 'emprestimos'];
    
    foreach ($tables as $table) {
        $count = $db->query("SELECT COUNT(*) as count FROM $table")[0]['count'];
        echo "✅ Tabela $table: $count registros<br>";
    }
    
    echo "<br>🎉 Sistema pronto para uso!";
    
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage();
}
?>