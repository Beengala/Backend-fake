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
                res.status(200).json(response);
                
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
    const { userId } = req.params;
    const connection = await database.getConnection();

    try {
        await connection.beginTransaction();

        const userQuery = 'SELECT userType FROM users WHERE userId = ?';
        const [users] = await connection.query(userQuery, [userId]);

        if (users.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).send('User not found');
        }

        const userType = users[0].userType;

        if (userType === 'artist') {
            await connection.query('DELETE FROM artists WHERE userId = ?', [userId]);
        } else if (userType === 'buyer') {
            await connection.query('DELETE FROM buyers WHERE userId = ?', [userId]);
        }

        await connection.query('DELETE FROM users WHERE userId = ?', [userId]);

        await connection.commit();
        res.status(200).send('User deleted successfully');

    } catch (err) {
        await connection.rollback();
        connection.release();
        console.error(err);
        res.status(500).send('Internal server error');

    } finally {
        connection.release();
    }
});

router.put('/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { userType, name, lastname, email, ...additionalData } = req.body;

        if (!userType || !name || !lastname || !email) {
            return res.status(400).send('All fields are required');
        }

        const connection = await database.getConnection();
        await connection.beginTransaction();

        try {
            const updatedUserQuery = 'UPDATE users SET userType = ?, name = ?, lastname = ?, email = ? WHERE userId = ?';
            await connection.query(updatedUserQuery, [userType, name, lastname, email, userId]);

            if (userType === 'artist') {
                const updatedArtistQuery = 'UPDATE artists SET semblance = ?, art_style = ?, birthday = ?, origin = ?, sex = ?, city = ? WHERE userId = ?';
                await connection.query(updatedArtistQuery, [additionalData.semblance, additionalData.art_style, additionalData.birthday, additionalData.origin, additionalData.sex, additionalData.city, userId]);
            } else if (userType === 'buyer') {
                const updatedBuyerQuery = 'UPDATE buyers SET buyer_type = ?, art_styles = ?, birthday = ?, origin = ?, sex = ?, city = ? WHERE userId = ?';
                await connection.query(updatedBuyerQuery, [additionalData.buyer_type, additionalData.art_styles, additionalData.birthday, additionalData.origin, additionalData.sex, additionalData.city, userId]);
            }

            const selectUserQuery = 'SELECT userId, userType, name, lastname, email FROM users WHERE userId = ?';
            const [updatedUsers] = await connection.query(selectUserQuery, [userId]);

            if (updatedUsers.length === 0) {
                await connection.rollback();
                connection.release();
                return res.status(404).send('User not found');
            }

            let userInfo = updatedUsers[0];
            if (userType === 'artist') {
                const artistQuery = 'SELECT semblance, art_style, birthday, origin, sex, city FROM artists WHERE userId = ?';
                const [artistData] = await connection.query(artistQuery, [userId]);
                if (artistData.length > 0) {
                    userInfo = { ...userInfo, ...artistData[0] };
                }
            } else if (userType === 'buyer') {
                const buyerQuery = 'SELECT buyer_type, art_styles, birthday, origin, sex, city FROM buyers WHERE userId = ?';
                const [buyerData] = await connection.query(buyerQuery, [userId]);
                if (buyerData.length > 0) {
                    userInfo = { ...userInfo, ...buyerData[0] };
                }
            }

            await connection.commit();
            res.status(200).json(userInfo);

        } catch (err) {
            await connection.rollback();
            console.error(err);
            res.status(500).send('Internal server error');

        } finally {
            connection.release();
        }
    
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
