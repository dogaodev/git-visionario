const axios = require("axios");

// Chaves de API diretamente no código
const API_KEY_PRODIA = "aFsgFlKcpTHmFG98cd3i";
const VALID_API_KEYS = ["visionario"];

exports.handler = async (event) => {
    const { text, api_key } = event.queryStringParameters;

    // Verifica se a chave da API foi fornecida e se é válida
    if (!api_key || !VALID_API_KEYS.includes(api_key)) {
        return {
            statusCode: 403,
            body: JSON.stringify({ error: "Chave de API inválida ou não fornecida." })
        };
    }

    // Verifique se o parâmetro 'text' foi fornecido
    if (!text) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Parâmetro 'text' é obrigatório." })
        };
    }

    try {
        // Fazendo a requisição para a API externa
        const response = await axios.get("https://api.spiderx.com.br/api/ai/prodia", {
            params: { 
                text, 
                api_key: API_KEY_PRODIA
            },
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        // Verifica se a resposta contém a URL da imagem gerada
        if (response.data && response.data.image) {
            return {
                statusCode: 200,
                body: JSON.stringify({ image: response.data.image })
            };
        } else {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Erro ao processar a imagem." })
            };
        }
    } catch (error) {
        console.error("Erro na API externa:", error.response ? error.response.data : error.message);
        return {
            statusCode: error.response?.status || 500,
            body: JSON.stringify({
                error: "Falha ao acessar a API externa.",
                details: error.response?.data || error.message
            })
        };
    }
};
