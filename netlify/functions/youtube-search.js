const axios = require('axios');
require('dotenv').config();

// Verifica se as variáveis de ambiente foram carregadas corretamente
if (!process.env.VALID_API_KEYS || !process.env.YOUTUBE_API_KEY) {
    throw new Error("Variáveis de ambiente não definidas corretamente.");
}

// Lista de chaves válidas
const API_KEYS = process.env.VALID_API_KEYS.split(',');

// API do YouTube
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search";

exports.handler = async (event, context) => {
    const { search, api_key } = event.queryStringParameters;

    // Verifica se a chave da API foi fornecida e se é válida
    if (!api_key || !API_KEYS.includes(api_key)) {
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