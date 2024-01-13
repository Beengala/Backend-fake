// app.js
require('dotenv').config();

const express = require('express');
const db = require('./db/database');
const userRoutes = require('./routes/users')
const app = express();

app.use(express.json());

app.use('/users', userRoutes)

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
