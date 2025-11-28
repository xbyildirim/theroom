const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    },
    // --- TEMEL BİLGİLER ---
    title: { type: String, required: true }, // Örn: King Suite
    type: { 
        type: String, 
        enum: ['Standart', 'Deluxe', 'Suite', 'Family', 'King', 'Economy'],
        default: 'Standart' 
    },
    price: { type: Number, required: true },
    size: { type: Number }, // m2
    capacity: { type: Number, default: 2 },
    
    // --- YATAK & ERİŞİM ---
    bedType: { type: String }, // Çift Kişilik, 2 Tek Kişilik vb.
    floor: { type: String }, // Zemin Kat, 5. Kat vb.
    isAccessible: { type: Boolean, default: false }, // Engelli erişimi

    // --- DONANIM & OLANAKLAR ---
    features: {
        tv: { type: Boolean, default: false },
        tvType: { type: String, default: '' }, // LED, Smart TV
        ac: { type: Boolean, default: false }, // Klima
        heatingType: { type: String, default: '' }, // Merkezi, Klima vb.
        minibar: { type: Boolean, default: false },
        safe: { type: Boolean, default: false }, // Kasa
        phone: { type: Boolean, default: false },
        wifi: { type: Boolean, default: true },
        wifiSpeed: { type: String, default: '' },
        roomService: { type: Boolean, default: false }
    },

    // --- BANYO & TEMİZLİK ---
    bathroom: {
        type: { type: String, default: 'Duş' }, // Duş, Küvet, Jakuzi
        hairDryer: { type: Boolean, default: true },
        toiletries: { type: Boolean, default: true }, // Şampuan, sabun vs.
        cleaningFreq: { type: String, default: 'Günlük' } // Günlük, Haftalık
    },

    // --- BALKON & MANZARA ---
    balcony: { type: Boolean, default: false },
    view: { type: String, default: '' }, // Deniz, Dağ, Şehir

    // --- KURALLAR ---
    smokingAllowed: { type: Boolean, default: false },
    petFriendly: { type: Boolean, default: false },
    cancellationPolicy: { type: String, default: 'Girişten 24 saat öncesine kadar ücretsiz.' },
    
    // --- GÖRSELLER (Şimdilik string array) ---
    images: [{ type: String }],

}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);