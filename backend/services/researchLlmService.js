const axios = require('axios');

const RESEARCH_OLLAMA_URL = process.env.RESEARCH_OLLAMA_URL || 'http://127.0.0.1:11434/api/generate';
const RESEARCH_OLLAMA_MODEL = process.env.RESEARCH_OLLAMA_MODEL || 'qwen2.5:3b-instruct';

function normalizeSearchQuery(text, fallback) {
    const normalized = text
        .replace(/[\r\n]+/g, ' ')
        .replace(/[_-]+/g, ' ')
        .replace(/[^a-zA-Z0-9@./+# ]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return normalized || fallback;
}

async function generateResearchText(prompt, numPredict = 180) {
    try {
        const response = await axios.post(RESEARCH_OLLAMA_URL, {
            model: RESEARCH_OLLAMA_MODEL,
            prompt,
            stream: false,
            options: {
                temperature: 0.2,
                num_predict: numPredict
            }
        }, {
            timeout: 30000
        });

        return response.data.response?.trim() || '';
    } catch (error) {
        const failure = new Error('Windows research LLM is unreachable. Ensure the local Ollama service is running and the model is available.');
        failure.code = 'RESEARCH_LLM_UNAVAILABLE';
        throw failure;
    }
}

function cleanSingleLineResponse(text, fallback) {
    const line = text
        .split('\n')
        .map((entry) => entry.trim())
        .filter(Boolean)[0];

    return line ? line.replace(/^['"]|['"]$/g, '') : fallback;
}

async function optimizeResearchQuery(query) {
    const prompt = [
        'Rewrite the following developer research request into one concise natural-language web search query.',
        'Keep important technical keywords, frameworks, and versions.',
        'Use normal spaces between words. Do not use underscores, bullets, labels, or quotes.',
        'Return only the rewritten query with no explanation.',
        '',
        `Request: ${query}`
    ].join('\n');

    const response = await generateResearchText(prompt, 80);
    return normalizeSearchQuery(cleanSingleLineResponse(response, query), query);
}

async function summarizePage({ query, title, url, content, fallbackDescription }) {
    const prompt = [
        'You summarize technical webpages for developers doing research.',
        'Use only the supplied source text. Do not invent details.',
        'Return exactly 2 short sentences that explain what the page covers and why it is relevant to the query.',
        'Prefer concrete technical terms over generic phrases.',
        'Mention uncertainty if the source text is weak.',
        '',
        `User query: ${query}`,
        `Page title: ${title}`,
        `Page URL: ${url}`,
        `Search snippet: ${fallbackDescription || 'N/A'}`,
        '',
        'Source text:',
        content
    ].join('\n');

    const response = await generateResearchText(prompt, 140);
    return response || fallbackDescription || 'Relevant page discovered, but the local summarizer returned an empty response.';
}

module.exports = {
    optimizeResearchQuery,
    summarizePage,
    RESEARCH_OLLAMA_MODEL
};