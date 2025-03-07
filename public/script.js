const axios = require('axios');
require('dotenv').config();

const KeyAuth = require('./keyauth'); // Importa o sistema de KeyAuth

exports.handler = async (event, context) => {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
    const DETAILS_URL = 'https://www.googleapis.com/youtube/v3/videos';

    const { search, api_key } = event.queryStringParameters;

    if (!api_key) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Unauthorized. API key is required.' })
        };
    }

    // Verifica se a chave fornecida é válida no KeyAuth
    const isValidKey = await KeyAuth.validate(api_key);
    if (!isValidKey) {
        return {
            statusCode: 403,
            body: JSON.stringify({ error: 'Forbidden. Invalid API key.' })
        };
    }

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
