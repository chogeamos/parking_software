require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const ussd = require('./routes/ussd');
const mpesa = require('./routes/mpesa');
const officer = require('./routes/officer');
const path = require('path');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.locals.db = db;

// Serve static frontend files
app.use('/', express.static(path.join(__dirname, '..', 'public')));

// Route handlers
app.use('/ussd', ussd);
app.use('/mpesa', mpesa);
app.use('/officer', officer);

// Local server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`K-Parking server running on ${PORT}`));
