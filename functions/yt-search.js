const axios = require('axios');
const fs = require('fs');

// Carregar as chaves da API a partir do arquivo JSON
const apis = JSON.parse(fs.readFileSync('./apis.json', 'utf8')).apis;

// Função para obter a chave da API pelo nome
const getApiKey = (name) => {
    const api = apis.find(api => api.name === name);
    return api ? api.key : null;
};

const YOUTUBE_API_KEY = getApiKey("youtube");
const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search";

exports.handler = async (event, context) => {
    const { search, api_key } = event.queryStringParameters;

    // Verifica se a chave da API foi fornecida e se é válida
    const validApiKey = getApiKey("visionario"); // Verificando se a chave é válida para o sistema
    if (!api_key || api_key !== validApiKey) {
        return {
            statusCode: 403,
            body: JSON.stringify({ error: "Unauthorized. Invalid API Key." })
        };
    }

    if (!search) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Search query is required." })
        };
    }

    try {
        const response = await axios.get(YOUTUBE_API_URL, {
            params: {
                part: "snippet",
                q: search,
                key: YOUTUBE_API_KEY,
                type: "video",
                maxResults: 5
            }
        });

        const videos = response.data.items.map(item => ({
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high.url,
            published_at: item.snippet.publishedAt,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`
        }));

        return {
            statusCode: 200,
            body: JSON.stringify(videos)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch from YouTube API." })
        };
    }
};
