const mongoose = require('mongoose');

const websitePageSchema = new mongoose.Schema({
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    },
    name: { type: String, required: true }, // Örn: "Hakkımızda Sayfası" (Yönetici görür)
    slug: { type: String, required: true }, // Örn: "/about-us"
    
    // Sayfanın içindeki bileşenler (Sürükle-Bırak verisi buraya gelecek)
    components: { type: Array, default: [] }, 
    
    isSystemPage: { type: Boolean, default: false } // Silinemeyen sayfalar için
}, { timestamps: true });

// Aynı otelde aynı slug'dan (url) iki tane olamaz
websitePageSchema.index({ hotelId: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('WebsitePage', websitePageSchema);