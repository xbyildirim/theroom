const express = require('express');
const router = express.Router();
const WebsitePage = require('../models/WebsitePage');
const authMiddleware = require('../middleware/authMiddleware');

// 🔍 GET: Tüm Sayfaları Getir
router.get('/', authMiddleware, async (req, res) => {
    try {
        const pages = await WebsitePage.find({ hotelId: req.user.id });
        res.json(pages);
    } catch (error) {
        res.status(500).json({ message: 'Sayfalar getirilemedi.' });
    }
});

// ➕ POST: Yeni Sayfa Oluştur
router.post('/', authMiddleware, async (req, res) => {
    const { name, slug } = req.body;
    try {
        // Slug kontrolü (başında / var mı?)
        const formattedSlug = slug.startsWith('/') ? slug : `/${slug}`;
        
        const newPage = new WebsitePage({
            hotelId: req.user.id,
            name,
            slug: formattedSlug
        });
        await newPage.save();
        res.status(201).json(newPage);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Bu URL adresi zaten kullanılıyor.' });
        }
        res.status(500).json({ message: 'Sayfa oluşturulamadı.' });
    }
});

// 🗑️ DELETE: Sayfa Sil
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await WebsitePage.findOneAndDelete({ _id: req.params.id, hotelId: req.user.id });
        res.json({ message: 'Sayfa silindi.' });
    } catch (error) {
        res.status(500).json({ message: 'Silme başarısız.' });
    }
});

module.exports = router;