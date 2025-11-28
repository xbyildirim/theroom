// backend/models/Page.js
const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    },
    // Sayfa Türü: Hangi sayfa olduğunu belirler
    type: {
        type: String,
        enum: ['kvkk', 'privacy', 'cookie', 'terms', 'contact'], 
        required: true
    },
    title: { type: String, required: true },
    content: { type: String, default: '' }, // Sayfa metni
    imageUrl: { type: String, default: '' } // Resim yolu
}, { timestamps: true });

// Bir otelin her türden sadece 1 sayfası olabilir (Örn: 1 tane KVKK sayfası)
pageSchema.index({ hotelId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Page', pageSchema);