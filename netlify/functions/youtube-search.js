const axios = require('axios');

// Configuração do KeyAuth
const KEYAUTH_URL = "https://keyauth.win/api/1.3/";
const APP_NAME = "1";
const OWNER_ID = "CVVEioBafh";
const APP_SECRET = "a8dc27b3c76e8ed49cb979b09425a908fa173e32f9f56448265ec1fbeb7ba580";
const APP_VERSION = "1.0";

// API do YouTube
const YOUTUBE_API_KEY = "AIzaSyAj0uMyoj89SX-6d8AG6NRE5PZu6RLgCAw";
const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search";

// Função para validar a chave no KeyAuth
async function validarKey(api_key) {
    try {
        const response = await axios.post(`${KEYAUTH_URL}`, {
            type: "license",
            key: api_key,
            name: APP_NAME,
            ownerid: OWNER_ID
        });

        return response.data.success; // Retorna true se a chave for válida
    } catch (error) {
        return false;
    }
}

exports.handler = async (event, context) => {
    const { search, api_key } = event.queryStringParameters;

    if (!api_key) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: "Unauthorized. API Key is required." })
        };
    }

    const keyValida = await validarKey(api_key);
    if (!keyValida) {
        return {
            statusCode: 403,
            body: JSON.stringify({ error: "Invalid API Key." })
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
