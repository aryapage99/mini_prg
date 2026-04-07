const express = require('express');
const router = express.Router();
const pool = require('../db');

// 1. Fetch all history for a specific developer
router.get('/:developer_id', async (req, res) => {
    const { developer_id } = req.params;
    try {
        const result = await pool.query(
        'SELECT * FROM query_history WHERE developer_id = $1 ORDER BY query_id DESC',
        [developer_id]
    );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

// 2. Clear all history for a specific developer
router.delete('/clear/:developer_id', async (req, res) => {
    const { developer_id } = req.params;
    try {
        await pool.query('DELETE FROM query_history WHERE developer_id = $1', [developer_id]);
        res.json({ message: "History cleared successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to clear history" });
    }
});

module.exports = router;