const mongoose = require('mongoose');

// Çoklu dil şeması (Tekrarlamamak için)
const localizedString = {
    tr: { type: String, default: '' },
    en: { type: String, default: '' },
    ru: { type: String, default: '' },
    ar: { type: String, default: '' }
    // Yeni dil eklenirse buraya eklenecek (Migration gerekir)
    // VEYA daha esnek olması için: { type: Map, of: String } kullanılabilir.
    // Biz şimdilik Map yapısını kullanalım ki backend kodunu değiştirmeden dil ekleyebilelim.
};

const roomSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    
    // 🌍 ÇOKLU DİL ALANLARI (Map kullanarak dinamik hale getirdik)
    title: { type: Map, of: String, default: {} }, 
    description: { type: Map, of: String, default: {} }, 
    
    // Diğer alanlar aynı kalıyor (Sayısal ve Boolean değerler çevrilmez)
    type: { type: String, default: 'Standart' },
    price: { type: Number, required: true },
    size: { type: Number },
    capacity: { type: Number, default: 2 },
    bedType: { type: String },
    floor: { type: String },
    isAccessible: { type: Boolean, default: false },

    // Features (Eğer özellik isimleri standart ise çeviri frontend'de yapılır, 
    // ama özel metin girilecekse burası da Map olmalı. Biz standart varsayıyoruz.)
    features: {
        tv: { type: Boolean, default: false },
        tvType: { type: String, default: '' },
        ac: { type: Boolean, default: false },
        minibar: { type: Boolean, default: false },
        safe: { type: Boolean, default: false },
        wifi: { type: Boolean, default: true },
        roomService: { type: Boolean, default: false }
    },

    bathroom: {
        type: { type: String, default: 'Duş' },
        hairDryer: { type: Boolean, default: true },
        toiletries: { type: Boolean, default: true }
    },

    balcony: { type: Boolean, default: false },
    view: { type: Map, of: String, default: {} }, // Manzara metni çevrilebilir

    smokingAllowed: { type: Boolean, default: false },
    petFriendly: { type: Boolean, default: false },
    cancellationPolicy: { type: Map, of: String, default: {} }, // İptal politikası metni çevrilebilir

    images: [{ type: String }],
    videos: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);