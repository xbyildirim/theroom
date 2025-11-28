const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    type: { type: String, required: true },
    
    // 🌍 Başlık ve İçerik Artık Map (Çoklu Dil)
    title: { type: Map, of: String, default: {} },
    content: { type: Map, of: String, default: {} },
    
    imageUrl: { type: String, default: '' }
}, { timestamps: true });

pageSchema.index({ hotelId: 1, type: 1 }, { unique: true });
module.exports = mongoose.model('Page', pageSchema);