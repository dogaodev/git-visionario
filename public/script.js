const axios = require('axios');
require('dotenv').config();

// Lista de chaves válidas
const API_KEYS = process.env.VALID_API_KEYS.split(',');

// URLs das APIs
const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const DETAILS_URL = 'https://www.googleapis.com/youtube/v3/videos';
const PRODIA_URL = 'https://api.spiderx.com.br/api/ai/prodia';

exports.handler = async (event, context) => {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    const { search, api_key, image_text } = event.queryStringParameters;

    // Verifica se a API Key foi fornecida e é válida
    if (!api_key || !API_KEYS.includes(api_key)) {
        return {
            statusCode: 403,
            body: JSON.stringify({ error: 'Forbidden. Invalid API key.' })
        };
    }

    // Se for uma requisição de imagem
    if (image_text) {
        try {
            const response = await axios.get(`${PRODIA_URL}?text=${encodeURIComponent(image_text)}&api_key=${encodeURIComponent(api_key)}`, {
                headers: {
                    "User-Agent": "Mozilla/5.0" // Adiciona um User-Agent para evitar bloqueios
                }
            });

            // Verifica se a resposta contém a URL da imagem gerada
            if (response.data && response.data.image) {
                return {
                    statusCode: 200,
                    body: JSON.stringify({ image: response.data.image })
                };
            } else {
                return {
                    statusCode: 500,
                    body: JSON.stringify({ error: "Erro ao processar a imagem." })
                };
            }
        } catch (error) {
            console.error("Erro na API externa:", error.response ? error.response.data : error.message);
            return {
                statusCode: error.response?.status || 500,
                body: JSON.stringify({
                    error: "Falha ao acessar a API externa.",
                    details: error.response?.data || error.message
                })
            };
        }
    }

    // Se for uma requisição de busca no YouTube
    if (!search) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Search query is required.' })
        };
    }

    try {
        const searchResponse = await axios.get(SEARCH_URL, {
            params: {
                part: 'snippet',
                q: search,
                key: API_KEY,
                type: 'video',
                maxResults: 5
            }
        });

        if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'No videos found.' })
            };
        }

        const videoIds = searchResponse.data.items.map(item => item.id.videoId).join(',');

        const detailsResponse = await axios.get(DETAILS_URL, {
            params: {
                part: 'contentDetails,statistics',
                id: videoIds,
                key: API_KEY
            }
        });

        const videoDetailsMap = {};
        detailsResponse.data.items.forEach(video => {
            videoDetailsMap[video.id] = {
                duration: video.contentDetails.duration,
                views: video.statistics.viewCount
            };
        });

        const videos = searchResponse.data.items.map(item => {
            const videoId = item.id.videoId;
            return {
                title: item.snippet.title,
                views: videoDetailsMap[videoId]?.views || 'N/A',
                thumbnail: item.snippet.thumbnails.high.url,
                duration: videoDetailsMap[videoId]?.duration || 'N/A',
                published_at: item.snippet.publishedAt,
                url: `https://www.youtube.com/watch?v=${videoId}`
            };
        });

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