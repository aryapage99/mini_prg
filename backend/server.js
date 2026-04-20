const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { ensureHistorySchema } = require('./services/historyStoreService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/auth');
const queryRoutes = require('./routes/query');
const historyRoutes = require('./routes/history');
const researchRoutes = require('./routes/research');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/query', queryRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/research', researchRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'success', message: 'Backend is running and connected!' });
});

ensureHistorySchema()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Failed to prepare history schema:', error);
        process.exit(1);
    });