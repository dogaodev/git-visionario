const axios = require("axios");
require('dotenv').config();

// Defina as chaves de API válidas
const VALID_API_KEYS = process.env.VALID_API_KEYS.split(','); // Carrega as chaves válidas do .env

exports.handler = async (event, context) => {
    const { text, api_key } = event.queryStringParameters;

    // Verifica se a chave foi fornecida e se é válida
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
        // Fazendo a requisição para a API com o método GET
        const response = await axios.get("https://api.spiderx.com.br/api/ai/prodia", {
            params: { 
                text, 
                api_key: process.env.PRODIA_API_KEY // Adiciona a chave de API diretamente na URL
            },
            headers: {
                "User-Agent": "Mozilla/5.0" // Adiciona um User-Agent para evitar bloqueios
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