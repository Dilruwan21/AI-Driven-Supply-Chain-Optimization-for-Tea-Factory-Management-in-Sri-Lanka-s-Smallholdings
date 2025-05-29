require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

mongoose.connect(MONGO_URI)

// ➤ API to Add Tea Transport Data
app.post('/add-transport', async (req, res) => {
    try {
        const { gardenOwner, gardenName, teaKilos } = req.body;
        const newTransport = new TeaTransport({ gardenOwner, gardenName, teaKilos });
        await newTransport.save();
        res.status(201).json({ message: "✅ Tea transport data added successfully" });
    } catch (err) {
        res.status(500).json({ error: "❌ Error adding data" });
    }
});
