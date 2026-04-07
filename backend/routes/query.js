const express = require('express');
const router = express.Router();
const { ChromaClient } = require('chromadb');
const { generateAnswer } = require('../llmService');
const pool = require('../db');

const client = new ChromaClient({
    host: "localhost",
    port: 8000
});

router.post('/ask', async (req, res) => {
    const { query, developer_id } = req.body;

    try {
        console.log(`🔎 Searching for: "${query}"`);
        
        // 1. Get the collection
        const collection = await client.getCollection({ 
            name: "sap_cap_docs"
        });
        
        // 2. Query using the server-side embedding
        // By NOT providing an embedding function in Node, 
        // the Chroma Server will use the one it was initialized with in Python.
        const results = await collection.query({
            queryTexts: [query],
            nResults: 5
        });

        if (!results.documents || results.documents[0].length === 0) {
            return res.json({ answer: "I couldn't find any relevant documentation." });
        }

        const context = results.documents[0].join("\n\n");

        const fullPrompt = `
            You are a technical assistant for SAP CAP developers.
            Use the following context to answer the question.

            Context:
            ${context}

            User Question: ${query}
            
            Answer:
        `;

        // 3. Send to MacBook Air M3
        const aiResponse = await generateAnswer(fullPrompt);

        // 4. Save to PostgreSQL
        await pool.query(
            'INSERT INTO query_history (developer_id, query_text, result_output, was_summarized) VALUES ($1, $2, $3, $4)',
            [developer_id, query, aiResponse, true]
        );

        res.json({ answer: aiResponse });

    } catch (error) {
        console.error("Query Logic Error:", error);
        res.status(500).json({ error: "Failed to process query." });
    }
});

module.exports = router;