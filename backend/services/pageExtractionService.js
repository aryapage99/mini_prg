const axios = require('axios');
const cheerio = require('cheerio');

const REQUEST_HEADERS = {
    'User-Agent': 'MiniProjectResearchBot/1.0 (+local research feature)',
    Accept: 'text/html,application/xhtml+xml'
};

function collapseWhitespace(text) {
    return text.replace(/\s+/g, ' ').trim();
}

function pickMainContent($) {
    const selectors = [
        'main',
        'article',
        '[role="main"]',
        '.content',
        '.post',
        '.article',
        '.documentation',
        '.doc',
        '.markdown-body'
    ];

    for (const selector of selectors) {
        const candidate = $(selector).first();
        const text = collapseWhitespace(candidate.text());
        if (text.length > 300) {
            return { node: candidate, text };
        }
    }

    const body = $('body').first();
    return { node: body, text: collapseWhitespace(body.text()) };
}

async function extractPageContent(url) {
    const response = await axios.get(url, {
        headers: REQUEST_HEADERS,
        timeout: 12000,
        maxContentLength: 1024 * 1024 * 2,
        validateStatus: (status) => status >= 200 && status < 400
    });

    const contentType = response.headers['content-type'] || '';
    if (!contentType.includes('text/html')) {
        const error = new Error('The fetched resource is not an HTML page.');
        error.code = 'NON_HTML_PAGE';
        throw error;
    }

    const $ = cheerio.load(response.data);
    $('script, style, nav, footer, header, aside, noscript, svg, form, button').remove();

    const { text } = pickMainContent($);
    const cleanedText = collapseWhitespace(text).slice(0, 12000);
    const title = collapseWhitespace($('title').first().text()) || url;

    if (cleanedText.length < 160) {
        const error = new Error('Not enough readable content could be extracted from the page.');
        error.code = 'INSUFFICIENT_CONTENT';
        throw error;
    }

    return {
        title,
        content: cleanedText,
        excerpt: cleanedText.slice(0, 260)
    };
}

module.exports = { extractPageContent };