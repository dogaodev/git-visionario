const axios = require('axios');
require('dotenv').config();

exports.handler = async (event, context) => {
    // Defina sua chave da API aqui
    const API_KEY = process.env.YOUTUBE_API_KEY || "AIzaSyAfb29L9WVbJcJVGnqK0L9-hdIaIO0bxAM";  
    const API_URL = 'https://www.googleapis.com/youtube/v3/search';

    // Pegue o parâmetro de pesquisa
    const { search } = event.queryStringParameters;

    if (!search) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Search query is required.' })
        };
    }

    try {
        // Fazendo a requisição para a API do YouTube
        const response = await axios.get(API_URL, {
            params: {
                part: 'snippet',
                q: search,
                key: API_KEY,  // Agora usa a chave interna, sem precisar passar na URL
                type: 'video',
                maxResults: 5
            }
        });

        // Formata e retorna os dados dos vídeos encontrados
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
            body: JSON.stringify({ error: `Failed to fetch from YouTube API. ${error.message}` })
        };
    }
};
