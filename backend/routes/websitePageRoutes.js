// backend/routes/websitePageRoutes.js

const express = require('express');
const router = express.Router();
const WebsitePage = require('../models/WebsitePage');
const authMiddleware = require('../middleware/authMiddleware');

// 🔍 GET / : Otelin tüm sayfalarını listele
router.get('/', authMiddleware, async (req, res) => {
    try {
        const pages = await WebsitePage.find({ hotelId: req.user.id }).sort({ createdAt: 1 });
        res.json(pages);
    } catch (error) {
        res.status(500).json({ message: 'Sayfalar getirilemedi.' });
    }
});

// 🔍 GET /:id : Tek bir sayfanın detayını ve bileşenlerini getir (Editör için)
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const page = await WebsitePage.findOne({ _id: req.params.id, hotelId: req.user.id });
        if (!page) {
            return res.status(404).json({ message: 'Sayfa bulunamadı.' });
        }
        res.json(page);
    } catch (error) {
        res.status(500).json({ message: 'Sayfa detayı alınamadı.' });
    }
});

// ➕ POST / : Yeni sayfa oluştur
router.post('/', authMiddleware, async (req, res) => {
    const { name, slug } = req.body;
    try {
        // Slug formatını düzelt (Başına / koy)
        const formattedSlug = slug.startsWith('/') ? slug : `/${slug}`;

        // Aynı isimde sayfa var mı kontrol et
        const existingPage = await WebsitePage.findOne({ hotelId: req.user.id, slug: formattedSlug });
        if (existingPage) {
            return res.status(400).json({ message: 'Bu URL adresi zaten kullanılıyor.' });
        }

        const newPage = new WebsitePage({
            hotelId: req.user.id,
            name,
            slug: formattedSlug,
            components: [] // Boş bileşen listesiyle başla
        });

        await newPage.save();
        res.status(201).json(newPage);
    } catch (error) {
        res.status(500).json({ message: 'Sayfa oluşturulamadı.' });
    }
});

// 💾 PUT /:id : Sayfa içeriğini (Components) ve ayarlarını güncelle (Editör Kaydetme)
router.put('/:id', authMiddleware, async (req, res) => {
    const { name, slug, components } = req.body;

    try {
        const page = await WebsitePage.findOne({ _id: req.params.id, hotelId: req.user.id });
        if (!page) {
            return res.status(404).json({ message: 'Sayfa bulunamadı.' });
        }

        if (name) page.name = name;
        if (slug) page.slug = slug.startsWith('/') ? slug : `/${slug}`;
        
        // Editörden gelen bileşen dizisini kaydet
        if (components) page.components = components;

        await page.save();
        res.json({ message: 'Sayfa başarıyla kaydedildi.', page });

    } catch (error) {
        res.status(500).json({ message: 'Güncelleme başarısız.' });
    }
});

// 🗑️ DELETE /:id : Sayfa Sil
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const page = await WebsitePage.findOneAndDelete({ _id: req.params.id, hotelId: req.user.id });
        if (!page) {
            return res.status(404).json({ message: 'Sayfa bulunamadı.' });
        }
        res.json({ message: 'Sayfa silindi.' });
    } catch (error) {
        res.status(500).json({ message: 'Silme işlemi başarısız.' });
    }
});

module.exports = router;