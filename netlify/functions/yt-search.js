const axios = require('axios');
const fs = require('fs');

// Carregar as chaves de API a partir do arquivo apis.json
const apis = JSON.parse(fs.readFileSync('./apis.json'));

// API do YouTube
const YOUTUBE_API_KEY = apis.apis.find(api => api.name === "youtube").key;
const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search";

// Função que lida com a requisição
exports.handler = async (event, context) => {
    const { search, api_key } = event.queryStringParameters;

    // Verifica se a chave da API foi fornecida e se é válida
    const api = apis.apis.find(api => api.key === api_key);

    if (!api) {
        return {
            statusCode: 403,
            body: JSON.stringify({ error: "Unauthorized. Invalid API Key." })
        };
    }

    // Verifica se o parâmetro 'search' foi fornecido
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
