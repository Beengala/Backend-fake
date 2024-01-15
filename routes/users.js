// routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const database = require('../db/database');
const authenticateToken = require('../middleware/authenticateToken');

router.post('/', authenticateToken, async (req, res) => {
    try {
        const { userType, name, lastname, email, password, ...additionalData } = req.body;

        if (!userType || !name || !lastname || !email || !password) {
            return res.status(400).send('All fields are required');
        }

        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);

         try {
            const insertUserQuery = 'INSERT INTO users (userType, name, lastname, email, password) VALUES (?, ?, ?, ?, ?)';
            const [userResult] = await database.query(insertUserQuery, [userType, name, lastname, email, hashedPassword]);
            const userId = userResult.insertId;
            let additionalUserInfo = {};

            if (userType === 'artist') {
                const artistInsertQuery = 'INSERT INTO artists (userId, semblance, art_style, birthday, origin, sex, city) VALUES (?, ?, ?, ?, ?, ?, ?)';
                await database.query(artistInsertQuery, [userId, additionalData.semblance, additionalData.art_style, additionalData.birthday, additionalData.origin, additionalData.sex, additionalData.city]);
                additionalUserInfo = { semblance: additionalData.semblance, art_style: additionalData.art_style, birthday: additionalData.birthday, origin: additionalData.origin, sex: additionalData.sex, city: additionalData.city };
           
            } else if (userType === 'buyer') {
                const buyerInsertQuery = 'INSERT INTO buyers (userId, buyer_type, art_styles, birthday, origin, sex, city) VALUES (?, ?, ?, ?, ?, ?, ?)';
                await database.query(buyerInsertQuery, [userId, additionalData.buyer_type, additionalData.art_styles, additionalData.birthday, additionalData.origin, additionalData.sex, additionalData.city]);
                additionalUserInfo = { buyer_type: additionalData.buyer_type, art_styles: additionalData.art_styles, birthday: additionalData.birthday, origin: additionalData.origin, sex: additionalData.sex, city: additionalData.city };
            }

            const selectUserQuery = 'SELECT userId, userType, name, lastname, email, creation_date FROM users WHERE userId = ?';
            const [userRows] = await database.query(selectUserQuery, [userId]);

            if (userRows.length > 0) {
                const user = userRows[0];
                const response = { ...user, ...additionalUserInfo };
                res.status(201).json(response);
                
            } else {
                res.status(404).send('User not found after insertion');
            }

        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).send('Email is already in use');
            }
            throw err;
        }
        
    } catch (err) {
        console.error(err)
        res.status(500).send('Internal server error');
    }
});

router.delete('/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;

        const deleteQuery = 'DELETE FROM users WHERE userId = ?';
        const [result] = await database.query(deleteQuery, [userId]);

        if (result.affectedRows === 0) {
            return res.status(404).send('User not found');
        }

        res.status(200).send(`User with ID ${userId} deleted successfully`)
        
    } catch (err) {
        console.error(err)
        res.status(500).send('Internal server error');
    }
});

router.put('/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { userType, name, lastname, email } = req.body;

        if (!userType || !name || !lastname || !email) {
            return res.status(400).send('All fields are required');
        }

        const updatedQuery = 'UPDATE users SET userType = ?, name = ?, lastname = ?, email = ? WHERE userId = ?';
        const [updatedResult] = await database.query(updatedQuery, [userType, name, lastname, email, userId]);

        if (updatedResult.affectedRows === 0) {
            return res.status(404).send('User not found')
        }

        const selectQuery = 'SELECT userId, userType, name, lastname, email FROM users WHERE userId = ?';
        const [updatedUser] = await database.query(selectQuery, [userId]);
        
        res.status(200).json(updatedUser[0]);
        
    } catch (err) {
        console.error(err)
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
