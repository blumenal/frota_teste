static async makeRequest(action, data = null) {
    try {
        const url = `./api/api.php?action=${action}`;
        console.log(`?? [DataService] Fazendo requisição para: ${url}`);
        
        const options = {
            method: data ? 'POST' : 'GET',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        // Fazer a requisição com timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        options.signal = controller.signal;

        const response = await fetch(url, options);
        clearTimeout(timeoutId);

        // Verificar status HTTP
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseText = await response.text();
        console.log(`?? [DataService] Resposta bruta para ${action}:`, responseText);

        if (!responseText || responseText.trim() === '') {
            console.error(`? [DataService] Resposta vazia para ${action}`);
            return { success: true, data: [] }; // Retorna array vazio em vez de erro
        }

        const result = JSON.parse(responseText.trim());
        console.log(`? [DataService] Resposta parseada para ${action}:`, result);

        return result;
        
    } catch (error) {
        console.error(`? [DataService] Erro em ${action}:`, error);
        
        if (error.name === 'AbortError') {
            throw new Error('Timeout: Servidor não respondeu em 10 segundos');
        }
        
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Não foi possível conectar ao servidor');
        }
        
        // Para respostas vazias, retorna sucesso com array vazio
        if (error.message.includes('Resposta vazia')) {
            return { success: true, data: [] };
        }
        
        throw error;
    }
}