// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const database = require('../db/database');

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send('Email and password are required');
        }

        const userQuery = 'SELECT * FROM users WHERE email = ?';
        const [users] = await database.query(userQuery, [email]);

        if (users.length === 0) {
            return res.status(401).send('Incorrect email or password');
        }

        const user = users[0];

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).send('Incorrect email or password');
        }

        delete user.password;

        const token = jwt.sign({ userId: user.userId }, process.env.ACCESS_TOKEN_SECRET);

        res.json({ token, user });

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
