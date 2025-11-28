const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');

// 🔒 Bu route'lara erişim için ilerde middleware ekleyeceğiz (auth check)

// 🏷️ Fiyat Bilgisi Döndür
router.get('/price', (req, res) => {
    // Fiyatı buraya sabitliyoruz. İlerde DB'den de çekilebilir.
    const PRICE_INFO = {
        amount: 1000, // Örn: 1000 TL
        currency: 'TRY',
        period: 'Yıllık'
    };
    res.json(PRICE_INFO);
});

// 💳 ÖDEME YAPMA ENDPOINT'İ (HENÜZ AKTİF DEĞİL)
// İleride Stripe/Iyzico entegrasyonu buraya gelecek.
router.post('/create-checkout', async (req, res) => {
    /* TODO: ÖDEME ALTYAPISI ENTEGRASYONU YAPILACAK
       1. Frontend'den gelen otel ID'sini al.
       2. Ödeme sağlayıcısına (Iyzico/Stripe) istek at.
       3. Başarılı ise DB'de 'subscription.package' = 'ANNUAL' yap.
       4. 'subscription.renewalDate' güncelle.
    */
    
    // Şimdilik geçici cevap
    res.json({ message: 'Ödeme sistemi yakında aktif olacak.' });
});

module.exports = router;