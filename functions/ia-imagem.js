const axios = require("axios");

exports.handler = async (event) => {
    const { text, api_key } = event.queryStringParameters;

    if (!api_key || api_key !== "visionario") {
        return {
            statusCode: 403,
            body: JSON.stringify({ error: "Chave de API inválida ou não fornecida." }),
        };
    }

    if (!text) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Parâmetro 'text' é obrigatório." }),
        };
    }

    try {
        const response = await axios.get("https://api.spiderx.com.br/api/ai/prodia", {
            params: { text, api_key: "aFsgFlKcpTHmFG98cd3i" },
            headers: { "User-Agent": "Mozilla/5.0" },
            timeout: 8000, // ⏳ Define um limite de tempo de 8 segundos
        });

        if (response.data && response.data.image) {
            return {
                statusCode: 200,
                body: JSON.stringify({ image: response.data.image }),
            };
        } else {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Erro ao processar a imagem." }),
            };
        }
    } catch (error) {
        console.error("Erro na API externa:", error.message);
        return {
            statusCode: error.response?.status || 500,
            body: JSON.stringify({
                error: "Falha ao acessar a API externa.",
                details: error.response?.data || error.message,
            }),
        };
    }
};
