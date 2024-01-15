// routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const database = require('../db/database');
const authenticateToken = require('../middleware/authenticateToken');

router.post('/', authenticateToken, async (req, res) => {
    try {
        const { userType, name, lastname, email, password } = req.body;

        if (!userType || !name || !lastname || !email || !password) {
            return res.status(400).send('All fields are required');
        }

        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);

         try {
            const insertQuery = 'INSERT INTO users (userType, name, lastname, email, password) VALUES (?, ?, ?, ?, ?)';
            const [result] = await database.query(insertQuery, [userType, name, lastname, email, hashedPassword]);

            const selectQuery = 'SELECT userId, userType, name, lastname, email, creation_date FROM users WHERE userId = ?';
            const [userRows] = await database.query(selectQuery, [result.insertId]);

            if (userRows.length > 0) {
                res.status(201).json(userRows[0]);

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