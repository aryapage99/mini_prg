const axios = require('axios');
const { assertQuotaAvailable, getQuotaStatus, recordSearchRequest } = require('./tavilyQuotaService');

const TAVILY_SEARCH_URL = 'https://api.tavily.com/search';

function mapResult(result) {
    return {
        title: result.title,
        url: result.url,
        description: result.content || '',
        domain: new URL(result.url).hostname,
        score: result.score || null
    };
}

async function searchWeb(query, count = 5) {
    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
        const error = new Error('Tavily API key is not configured.');
        error.code = 'TAVILY_API_KEY_MISSING';
        throw error;
    }

    assertQuotaAvailable();

    try {
        const response = await axios.post(
            TAVILY_SEARCH_URL,
            {
                query,
                topic: 'general',
                search_depth: 'basic',
                max_results: count,
                include_answer: false,
                include_raw_content: false,
                include_images: false,
                include_usage: true
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 12000
            }
        );

        const results = (response.data.results || [])
            .map(mapResult)
            .filter((result) => result.url && result.title);

        const quota = recordSearchRequest();
        return {
            results,
            quota: {
                ...quota,
                creditsUsedLastRequest: response.data.usage?.credits || 1
            }
        };
    } catch (error) {
        if (error.code === 'TAVILY_QUOTA_EXCEEDED') {
            throw error;
        }

        const failure = new Error('Failed to fetch search results from Tavily.');
        failure.code = error.response?.status === 429 ? 'TAVILY_RATE_LIMITED' : 'TAVILY_SEARCH_FAILED';
        failure.quota = getQuotaStatus();
        throw failure;
    }
}

module.exports = { searchWeb };