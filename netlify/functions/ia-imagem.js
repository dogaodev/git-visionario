const axios = require('axios');

exports.handler = async function(event, context) {
    const text = event.queryStringParameters.text;

    try {
        const response = await axios.get("https://api.spiderx.com.br/api/ai/prodia", {
            params: {
                text: text,
                api_key: process.env.SPIDERX_API_KEY // Obtém a API key do .env
            },
             // Timeout de 30 segundos para evitar falhas por lentidão
        });

        return {
            statusCode: 200,
            body: JSON.stringify(response.data)
        };
    } catch (error) {
        return {
            statusCode: error.response ? error.response.status : 500,
            body: JSON.stringify({
                error: "Erro de API",
                details: error.message
            })
        };
    }
};