const axios = require("axios");
const fs = require("fs");

// Carregar as chaves de API a partir do arquivo apis.json
const apis = JSON.parse(fs.readFileSync('./apis.json'));

// API do Prodia
const API_KEY_PRODIA = apis.apis.find(api => api.name === "prodia").key; // A chave do Prodia vem do arquivo JSON

// Defina as chaves de API válidas
const VALID_API_KEYS = apis.apis.map(api => api.key); // Carrega as chaves válidas do arquivo JSON

// Função que será chamada ao receber a requisição
exports.handler = async (event, context) => {
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
        // Fazendo a requisição para a API com o método GET
        const response = await axios.get("https://api.spiderx.com.br/api/ai/prodia", {
            params: { 
                text, 
                api_key: API_KEY_PRODIA // Adiciona a chave de API diretamente na URL
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
        return {
            statusCode: error.response ? error.response.status : 500,
            body: JSON.stringify({
                error: "Falha ao acessar a API externa.",
                details: error.message
            })
        };
    }
};
