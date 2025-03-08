const axios = require('axios');
require('dotenv').config();

// Lista de chaves válidas (pode ser movida para um banco de dados no futuro)
const validKeys = ["visionario", "OUTRA_KEY_AQUI"];

exports.handler = async (event, context) => {
    const { text, api_key } = event.queryStringParameters;

    // Verifica se a chave da API foi fornecida e se é válida
    if (!api_key || !validKeys.includes(api_key)) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: "Unauthorized. Invalid API key." })
        };
    }

    // Verifica se o texto foi enviado
    if (!text) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Text parameter is required." })
        };
    }

    try {
        const response = await axios.get("https://api.spiderx.com.br/api/ai/prodia", {
            params: {
                text: text,
                api_key: process.env.SPIDERX_API_KEY // Melhor armazenar no .env
            },
            timeout: 30000 // Timeout de 30 segundos para evitar falhas por lentidão
        });

        return {
            statusCode: 200,
            body: JSON.stringify(response.data)
        };
    } catch (error) {
        let errorMessage = "Failed to fetch from Prodia API.";
        
        // Se houver resposta da API, pega a mensagem detalhada do erro
        if (error.response) {
            errorMessage = error.response.data?.error || `API Error: ${error.response.statusText}`;
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ error: errorMessage, details: error.message })
        };
    }
};
