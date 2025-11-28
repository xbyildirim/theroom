const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    // Faz 2'de buraya renkler, fontlar vb. gelecek. Şimdilik boş obje.
    config: {
        type: Object,
        default: {} 
    }
}, { timestamps: true });

module.exports = mongoose.model('Theme', themeSchema);