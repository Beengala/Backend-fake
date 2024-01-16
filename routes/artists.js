// routes/artists.js
const express = require('express');
const router = express.Router();
const database = require('../db/database');
const authenticateToken = require('../middleware/authenticateToken');

router.get('/', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT u.userId, u.userType, u.name, u.lastname, u.email, 
                   a.semblance, a.art_style, a.birthday, a.origin, a.sex, a.city
            FROM users u
            JOIN artists a ON u.userId = a.userId
            WHERE u.userType = 'artist'`;

        const [artists] = await database.query(query);

        res.json(artists);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;