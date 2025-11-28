// backend/routes/pageRoutes.js
const express = require('express');
const router = express.Router();
const Page = require('../models/Page');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// --- MULTER AYARLARI (GEÇİCİ BELLEKTE TUTMA) ---
const storage = multer.memoryStorage(); // Dosyayı önce RAM'e al, sonra Sharp ile işleyip diske yazacağız.

const upload = multer({
    storage: storage,
    limits: { fileSize: 3 * 1024 * 1024 }, // 3MB Sınırı
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
        }
    }
});

// 🔍 GET: Belirli bir sayfa türünü getir
router.get('/:type', authMiddleware, async (req, res) => {
    try {
        const { type } = req.params;
        const page = await Page.findOne({ hotelId: req.user.id, type });
        
        // Eğer sayfa henüz yoksa boş bir şablon döndür (Frontend hata almasın)
        if (!page) {
            return res.json({ type, title: '', content: '', imageUrl: '' });
        }
        res.json(page);
    } catch (error) {
        res.status(500).json({ message: 'Sayfa getirilemedi.' });
    }
});

// 💾 PUT: Sayfayı Güncelle (Resim + Metin)
router.put('/:type', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { type } = req.params;
        let { title, content } = req.body;

        // 🛠️ DÜZELTME: FormData'dan gelen JSON string'leri objeye çeviriyoruz
        if (typeof title === 'string') {
            try { title = JSON.parse(title); } catch (e) {}
        }
        if (typeof content === 'string') {
            try { content = JSON.parse(content); } catch (e) {}
        }

        let imageUrl = undefined;

        // ... (Resim işleme kodları AYNI KALACAK) ...
        if (req.file) {
             const filename = `page-${req.user.id}-${type}-${Date.now()}.jpeg`;
             const outputPath = path.join(__dirname, '../uploads', filename);
             await sharp(req.file.buffer)
                .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toFile(outputPath);
             imageUrl = `/uploads/${filename}`;
        }

        const updateData = { title, content };
        if (imageUrl) updateData.imageUrl = imageUrl;

        const page = await Page.findOneAndUpdate(
            { hotelId: req.user.id, type },
            updateData,
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.json({ message: 'Sayfa başarıyla güncellendi.', page });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Güncelleme sırasında hata oluştu.' });
    }
});

module.exports = router;