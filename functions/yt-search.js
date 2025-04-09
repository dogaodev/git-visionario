const axios = require('axios');

const YOUTUBE_API_KEY = "AIzaSyAfb29L9WVbJcJVGnqK0L9-hdIaIO0bxAM";
const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search";

exports.handler = async (event, context) => {
    const { search, api_key } = event.queryStringParameters;

    if (!api_key || api_key !== "visionario") {
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
