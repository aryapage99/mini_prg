const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/auth');
const queryRoutes = require('./routes/query');
const historyRoutes = require('./routes/history');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/query', queryRoutes);
app.use('/api/history', historyRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'success', message: 'Backend is running and connected!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});