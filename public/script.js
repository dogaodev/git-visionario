const axios = require('axios');
require('dotenv').config();

// Lista de chaves válidas
const API_KEYS = [
    "visionario",
    "outra_key_456",
    "key_exemplo_789"
];

exports.handler = async (event, context) => {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
    const DETAILS_URL = 'https://www.googleapis.com/youtube/v3/videos';
    const IMAGE_API_URL = 'https://api.spiderx.com.br/api/ai/prodia';

    const { search, text, api_key, endpoint } = event.queryStringParameters;

    // Verifica se a API Key foi fornecida e é válida
    if (!api_key || !API_KEYS.includes(api_key)) {
        return {
            statusCode: 403,
            body: JSON.stringify({ error: 'Forbidden. Invalid API key.' })
        };
    }

    if (endpoint === "youtube-search") {
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
    } else if (endpoint === "generate-image") {
        if (!text) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Text parameter is required.' })
            };
        }

        try {
            const response = await axios.get(IMAGE_API_URL, {
                params: {
                    text: text,
                    api_key: process.env.SPIDERX_API_KEY
                }
            });

            return {
                statusCode: 200,
                body: JSON.stringify(response.data)
            };
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to fetch from Prodia API.', details: error.message })
            };
        }
    } else {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid endpoint. Use "youtube-search" or "generate-image".' })
        };
    }
};
