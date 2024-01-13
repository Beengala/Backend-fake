const jwt = require('jsonwebtoken');

require('dotenv').config();

const token = jwt.sign({ user: 'admin' }, process.env.ACCESS_TOKEN_SECRET);
console.log(token);
