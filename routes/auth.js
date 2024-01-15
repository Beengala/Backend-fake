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

        let userProfile = {};

        if (user.userType === 'artist') {
            const artistQuery = 'SELECT semblance, art_style, birthday, origin, sex, city FROM artists WHERE userId = ?';
            const [artistData] = await database.query(artistQuery, [user.userId]);
            userProfile = artistData.length > 0 ? artistData[0] : {};

        } else if (user.userType === 'buyer') {
            const buyerQuery = 'SELECT buyer_type, art_styles, birthday, origin, sex, city FROM buyers WHERE userId = ?';
            const [buyerData] = await database.query(buyerQuery, [user.userId]);
            userProfile = buyerData.length > 0 ? buyerData[0] : {};
        }

        const token = jwt.sign({ userId: user.userId }, process.env.ACCESS_TOKEN_SECRET);

        res.status(200).json({ token, user: {...user, ...userProfile} });

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
