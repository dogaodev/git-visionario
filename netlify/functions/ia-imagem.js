const express = require('express');
const axios = require('axios');

const app = express();
const API_KEY = process.env.SPIDERX_API_KEY; // Obtém a API key do .env

exports.handler = async function(event, context) {
    const text = event.queryStringParameters.text;
    const apiKey = event.queryStringParameters.api_key;
    
    if (!text || !apiKey) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Parâmetros text e api_key são obrigatórios' })
        };
    }

    if (apiKey !== 'visionario') {
        return {
            statusCode: 403,
            body: JSON.stringify({ error: 'Chave de API inválida' })
        };
    }

    try {
        const response = await axios.get(`https://api.spiderx.com.br/api/ai/prodia`, {
            params: { text, api_key: API_KEY },
            timeout: 30000 // Timeout de 30 segundos para evitar falhas por lentidão
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ image: response.data.image })
        };
    } catch (error) {
        return {
            statusCode: error.response ? error.response.status : 500,
            body: JSON.stringify({
                error: 'Erro ao gerar a imagem',
                details: error.message
            })
        };
    }
};