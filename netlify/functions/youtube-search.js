const axios = require('axios');
require('dotenv').config();

exports.handler = async (event, context) => {
    // Defina sua chave da API aqui
    const API_KEY = "AIzaSyAfb29L9WVbJcJVGnqK0L9-hdIaIO0bxAM";  // Pega a chave da API das variáveis de ambiente
    const API_URL = 'https://www.googleapis.com/youtube/v3/search';

    // Pegue o parâmetro de pesquisa e a chave da API da URL
    const { search, api_key } = event.queryStringParameters;

    // Se a API key não for fornecida ou não for válida, retorne um erro
    if (!api_key || api_key !== API_KEY) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Unauthorized. Invalid API Key.' })
        };
    }

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
                key: API_KEY,
                type: 'video',
                maxResults: 5
            }
        });

        // Formata e retorna os dados dos vídeos encontrados
        const videos = response.data.items.map(item => ({
            title: item.snippet.title,
            views: 'N/A',  // O YouTube não retorna visualizações na busca, mas você pode buscar essas informações com outra API.
            thumbnail: item.snippet.thumbnails.high.url,
            duration: 'N/A',  // A duração não é retornada pela busca, é necessário um request adicional para obter.
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
            body: JSON.stringify({ error: 'Failed to fetch from YouTube API.' })
        };
    }
};
