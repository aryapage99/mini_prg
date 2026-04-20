const express = require('express');
const { performResearch } = require('../services/researchService');
const { findCachedResearch, saveResearchHistory } = require('../services/historyStoreService');

const router = express.Router();

router.post('/search', async (req, res) => {
    const query = req.body?.query?.trim();
    const developerId = req.body?.developer_id;

    if (!query) {
        return res.status(400).json({ error: 'A research query is required.' });
    }

    try {
        const cachedEntry = await findCachedResearch({
            developerId,
            queryText: query
        });

        if (cachedEntry?.result_metadata?.results?.length) {
            return res.json({
                originalQuery: query,
                optimizedQuery: cachedEntry.result_metadata.optimizedQuery,
                llmModel: cachedEntry.result_metadata.llmModel,
                quota: cachedEntry.result_metadata.quota,
                results: cachedEntry.result_metadata.results,
                cached: true,
                historyEntryId: cachedEntry.query_id
            });
        }

        const response = await performResearch(query);

        const historyEntry = await saveResearchHistory({
            developerId,
            queryText: query,
            optimizedQuery: response.optimizedQuery,
            llmModel: response.llmModel,
            quota: response.quota,
            results: response.results
        });

        response.cached = false;
        response.historyEntryId = historyEntry?.query_id || null;
        res.json(response);
    } catch (error) {
        console.error('Research route error:', error.message);

        if (error.code === 'TAVILY_QUOTA_EXCEEDED') {
            return res.status(429).json({ error: error.message, quota: error.quota });
        }

        if (error.code === 'TAVILY_API_KEY_MISSING' || error.code === 'RESEARCH_LLM_UNAVAILABLE') {
            return res.status(503).json({ error: error.message });
        }

        res.status(500).json({ error: 'Failed to run web research search.' });
    }
});

module.exports = router;