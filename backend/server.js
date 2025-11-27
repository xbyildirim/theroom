// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(express.json()); // JSON istek gövdelerini ayrıştırmak için

// Basit bir test route'u
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to The Room Backend API!' });
});

// Veritabanı Bağlantısı ve Sunucu Başlatma
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB connection successful.');
        // Bağlantı başarılıysa sunucuyu başlat
        app.listen(PORT, () => {
            console.log(`Server is running on port: ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error.message);
    });