const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db'); // Adjust path if db.js is in the root
require('dotenv').config();

const router = express.Router();

// --- SIGN UP ROUTE ---
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // 1. Check if user already exists
        const userCheck = await pool.query('SELECT * FROM developers WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(401).json({ error: 'Developer already exists with that email.' });
        }

        // 2. Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 3. Insert new developer into the database
        const newUser = await pool.query(
            'INSERT INTO developers (name, email, password) VALUES ($1, $2, $3) RETURNING developer_id, name, email',
            [name, email, hashedPassword]
        );

        // 4. Generate JWT token
        const token = jwt.sign({ developer_id: newUser.rows[0].developer_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, developer: newUser.rows[0] });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error during sign up.' });
    }
});

// --- LOGIN ROUTE ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check if user exists
        const user = await pool.query('SELECT * FROM developers WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid Email or Password.' });
        }

        // 2. Check if password matches
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid Email or Password.' });
        }

        // 3. Generate JWT token
        const token = jwt.sign({ developer_id: user.rows[0].developer_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, developer: { developer_id: user.rows[0].developer_id, name: user.rows[0].name, email: user.rows[0].email } });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

module.exports = router;