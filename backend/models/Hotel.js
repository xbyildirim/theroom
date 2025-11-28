const mongoose = require('mongoose');

// Her otel, sistemimizdeki bir "Kiracı" (Tenant) olacaktır.
const hotelSchema = new mongoose.Schema({
    // 🔑 Temel Kimlik Bilgileri
    
    // Kiracıyı (Otel) benzersiz olarak tanımlayan ana kimlik. 
    // Bu, diğer tüm koleksiyonlarda (Oda, Rezervasyon) veriyi izole etmek için kullanılacaktır.
    tenantId: {
        type: String,
        required: true,
        unique: true,
        // Yeni bir ObjectId üretip string'e çevirerek benzersiz ID atar
        default: () => new mongoose.Types.ObjectId().toString() 
    },
    
    // Otel tarafından girilen temel bilgiler
    name: {
        type: String,
        required: true,
        trim: true
    },
    
    // Kullanıcının panelden sitesini bağlamak istediği domain
    customDomain: {
        type: String,
        required: false, // İlk başta zorunlu değil
        unique: true,
        sparse: true // Yalnızca değer varsa benzersizlik kontrolü yap
    },

    // 👤 Yönetici Kullanıcı Bilgileri
    
    // Yönetici Kullanıcının E-postası (Sisteme girişi için)
    adminEmail: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    // Güvenli bir şekilde hashlenmiş şifre
    password: {
        type: String,
        required: true
    },
    
    // 📧 E-posta Doğrulama Bilgileri
    
    // E-posta adresinin doğrulanıp doğrulanmadığı
    isVerified: {
        type: Boolean,
        default: false
    },
    
    // Mail ile gönderilen ve doğrulama için kullanılan token
    verificationToken: {
        type: String,
        required: false
    },
    
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    // 💳 Abonelik ve Paket Bilgileri
    
    subscription: {
        // Mevcut Paket Durumu
        package: {
            type: String,
            enum: ['TRIAL', 'MONTHLY', 'ANNUAL', 'INACTIVE'], // Paket türleri
            default: 'TRIAL'
        },
        // Deneme süresinin biteceği tarih (14 gün)
        trialEndsAt: {
            type: Date,
            // Otomatik olarak kayıt anından 14 gün sonrası hesaplanır
            default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) 
        },
        // Ödeme sonrası aboneliğin biteceği tarih
        renewalDate: { 
            type: Date 
        },
        // Ödeme başarılı olduktan sonra Stripe/PayPal vb. sistemlerden gelen abonelik ID'si
        subscriptionId: {
            type: String,
            required: false 
        }
    }
}, { 
    // Otomatik olarak 'createdAt' ve 'updatedAt' alanlarını ekler
    timestamps: true 
});

const Hotel = mongoose.model('Hotel', hotelSchema);

// 🚨 EKSİK OLAN KISIM: Modeli dışa aktar (export)
module.exports = Hotel;