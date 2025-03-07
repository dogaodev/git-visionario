const axios = require('axios');

exports.handler = async (event, context) => {
    const API_URL = 'https://www.googleapis.com/youtube/v3/search';

    const { search } = event.queryStringParameters;  // Obtendo o parâmetro de busca

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
                type: 'video',
                maxResults: 5
            }
        });

        // Formata e retorna os dados dos vídeos encontrados
        const videos = await Promise.all(response.data.items.map(async (item) => {
            // Requisição adicional para pegar visualizações e duração
            const videoDetailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
                params: {
                    part: 'contentDetails,statistics',
                    id: item.id.videoId
                }
            });
            const videoDetails = videoDetailsResponse.data.items[0];
            const duration = videoDetails.contentDetails.duration;
            const views = videoDetails.statistics.viewCount;

            return {
                title: item.snippet.title,
                views: views,  // Visualizações do vídeo
                thumbnail: item.snippet.thumbnails.high.url,
                duration: duration,  // Duração do vídeo
                published_at: item.snippet.publishedAt,
                url: `https://www.youtube.com/watch?v=${item.id.videoId}`
            };
        }));

        return {
            statusCode: 200,
            body: JSON.stringify(videos)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Failed to fetch from YouTube API. Error: ${error.message}` })
        };
    }
};
