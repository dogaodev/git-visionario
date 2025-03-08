const axios = require('axios');

// Lista de chaves válidas
const validKeys = ["aFsgFlKcpTHmFG98cd3i", "visionario"];

exports.handler = async (event, context) => {
    const { text, api_key } = event.queryStringParameters;

    if (!api_key || !validKeys.includes(api_key)) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Unauthorized. Invalid API key.' })
        };
    }

    if (!text) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Text parameter is required.' })
        };
    }

    try {
        const response = await axios.get('https://api.spiderx.com.br/api/ai/prodia', {
            params: {
                text,
                api_key: api_key // Usa a mesma key fornecida pelo usuário
            }
        });

        return {
            statusCode: 200,
            body: JSON.stringify(response.data)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch from Prodia API.' })
        };
    }
};
