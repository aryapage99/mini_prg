const { searchWeb } = require('./tavilySearchService');
const { extractPageContent } = require('./pageExtractionService');
const { optimizeResearchQuery, summarizePage, RESEARCH_OLLAMA_MODEL } = require('./researchLlmService');

function getQueryTerms(query) {
    return query
        .toLowerCase()
        .split(/[^a-z0-9+#.@/]+/)
        .filter((term) => term.length >= 3);
}

function computeRelevanceScore(result, queryTerms) {
    const haystack = `${result.title} ${result.url} ${result.description} ${result.domain}`.toLowerCase();
    const keywordHits = queryTerms.reduce((count, term) => count + (haystack.includes(term) ? 1 : 0), 0);
    const domainBoost = /(sap|nodejs|postgresql|react|vite|developer|docs|community|github)/i.test(result.domain) ? 0.15 : 0;
    const titleBoost = queryTerms.some((term) => result.title.toLowerCase().includes(term)) ? 0.2 : 0;
    const baseScore = typeof result.score === 'number' ? result.score : 0;

    return baseScore + keywordHits * 0.08 + domainBoost + titleBoost;
}

function rankResults(results, query) {
    const queryTerms = getQueryTerms(query);

    return [...results]
        .map((result) => ({
            ...result,
            researchScore: computeRelevanceScore(result, queryTerms)
        }))
        .sort((left, right) => right.researchScore - left.researchScore);
}

function deduplicateResults(results) {
    const seenUrls = new Set();

    return results.filter((result) => {
        if (seenUrls.has(result.url)) {
            return false;
        }

        seenUrls.add(result.url);
        return true;
    });
}

async function enrichResult(query, result) {
    try {
        const extracted = await extractPageContent(result.url);
        const summary = await summarizePage({
            query,
            title: extracted.title || result.title,
            url: result.url,
            content: extracted.content,
            fallbackDescription: result.description
        });

        return {
            title: extracted.title || result.title,
            url: result.url,
            domain: result.domain,
            summary,
            excerpt: extracted.excerpt,
            extractionStatus: 'scraped',
            searchSnippet: result.description,
            researchScore: result.researchScore ?? null
        };
    } catch (error) {
        const summary = await summarizePage({
            query,
            title: result.title,
            url: result.url,
            content: result.description || result.title,
            fallbackDescription: result.description
        });

        return {
            title: result.title,
            url: result.url,
            domain: result.domain,
            summary,
            excerpt: result.description || 'This result could not be fully scraped, so the summary is based on the search snippet.',
            extractionStatus: 'snippet-only',
            searchSnippet: result.description,
            researchScore: result.researchScore ?? null
        };
    }
}

async function performResearch(query) {
    const optimizedQuery = await optimizeResearchQuery(query);
    const { results, quota } = await searchWeb(optimizedQuery, 8);
    const candidates = rankResults(deduplicateResults(results), query).slice(0, 3);

    const enriched = await Promise.all(candidates.map((result) => enrichResult(query, result)));

    return {
        originalQuery: query,
        optimizedQuery,
        llmModel: RESEARCH_OLLAMA_MODEL,
        quota,
        results: enriched
    };
}

module.exports = { performResearch };