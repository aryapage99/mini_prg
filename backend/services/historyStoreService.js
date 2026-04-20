const pool = require('../db');

let schemaReadyPromise;

function normalizeDeveloperId(developerId) {
    if (developerId === null || developerId === undefined || developerId === '') {
        return null;
    }

    const parsed = Number.parseInt(String(developerId), 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

async function resolveValidDeveloperId(developerId) {
    const normalizedId = normalizeDeveloperId(developerId);

    if (!normalizedId) {
        return null;
    }

    const result = await pool.query(
        'SELECT developer_id FROM developers WHERE developer_id = $1 LIMIT 1',
        [normalizedId]
    );

    return result.rows[0]?.developer_id || null;
}

async function ensureHistorySchema() {
    if (!schemaReadyPromise) {
        schemaReadyPromise = (async () => {
            await pool.query(`
                ALTER TABLE query_history
                ADD COLUMN IF NOT EXISTS entry_type TEXT NOT NULL DEFAULT 'query'
            `);

            await pool.query(`
                ALTER TABLE query_history
                ADD COLUMN IF NOT EXISTS result_metadata JSONB
            `);

            await pool.query(`
                CREATE INDEX IF NOT EXISTS query_history_developer_entry_type_idx
                ON query_history (developer_id, entry_type, query_id DESC)
            `);
        })().catch((error) => {
            schemaReadyPromise = null;
            throw error;
        });
    }

    return schemaReadyPromise;
}

function formatResearchMarkdown(results) {
    const lines = ['## Research Results', ''];

    results.forEach((result, index) => {
        lines.push(`### ${index + 1}. [${result.title}](${result.url})`);
        lines.push(`Source: ${result.domain}`);
        lines.push('');
        lines.push(result.summary);
        lines.push('');
    });

    return lines.join('\n');
}

async function saveQueryHistory({ developerId, queryText, resultOutput }) {
    await ensureHistorySchema();
    const validDeveloperId = await resolveValidDeveloperId(developerId);

    if (!validDeveloperId) {
        return null;
    }

    const insertResult = await pool.query(
        `INSERT INTO query_history (developer_id, query_text, result_output, was_summarized, entry_type, result_metadata)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [validDeveloperId, queryText, resultOutput, true, 'query', null]
    );

    return insertResult.rows[0];
}

async function findCachedResearch({ developerId, queryText }) {
    await ensureHistorySchema();
    const validDeveloperId = await resolveValidDeveloperId(developerId);

    if (!validDeveloperId) {
        return null;
    }

    const result = await pool.query(
        `SELECT *
         FROM query_history
         WHERE developer_id = $1 AND entry_type = 'research' AND query_text = $2
         ORDER BY query_id DESC
         LIMIT 1`,
        [validDeveloperId, queryText]
    );

    return result.rows[0] || null;
}

async function saveResearchHistory({ developerId, queryText, optimizedQuery, llmModel, quota, results }) {
    await ensureHistorySchema();
    const validDeveloperId = await resolveValidDeveloperId(developerId);

    if (!validDeveloperId) {
        return null;
    }

    const metadata = {
        optimizedQuery,
        llmModel,
        quota,
        results
    };

    const resultOutput = formatResearchMarkdown(results);
    const insertResult = await pool.query(
        `INSERT INTO query_history (developer_id, query_text, result_output, was_summarized, entry_type, result_metadata)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [validDeveloperId, queryText, resultOutput, true, 'research', metadata]
    );

    return insertResult.rows[0];
}

module.exports = {
    ensureHistorySchema,
    findCachedResearch,
    formatResearchMarkdown,
    saveQueryHistory,
    saveResearchHistory
};