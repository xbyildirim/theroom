const express = require('express');
const router = express.Router();
const Theme = require('../models/Theme');
const authMiddleware = require('../middleware/authMiddleware');

// 🔍 GET: Tüm temaları getir
router.get('/', authMiddleware, async (req, res) => {
    try {
        const themes = await Theme.find({ hotelId: req.user.id }).sort({ createdAt: -1 });
        res.json(themes);
    } catch (error) {
        res.status(500).json({ message: 'Temalar getirilemedi.' });
    }
});

// ➕ POST: Yeni tema oluştur
router.post('/', authMiddleware, async (req, res) => {
    const { name } = req.body;
    try {
        const newTheme = new Theme({
            hotelId: req.user.id,
            name,
            isActive: false, // Yeni tema varsayılan pasif gelir
            config: { 
                // Varsayılan Ayarlar (Faz 2 için hazırlık)
                primaryColor: '#007bff',
                backgroundColor: '#ffffff'
            }
        });
        await newTheme.save();
        res.status(201).json(newTheme);
    } catch (error) {
        res.status(500).json({ message: 'Tema oluşturulamadı.' });
    }
});

// ✏️ PUT: Tema Güncelle (Aktif/Pasif Yapma ve İsim Değiştirme)
router.put('/:id', authMiddleware, async (req, res) => {
    const { name, isActive } = req.body;
    try {
        const theme = await Theme.findOne({ _id: req.params.id, hotelId: req.user.id });
        
        if (!theme) return res.status(404).json({ message: 'Tema bulunamadı.' });

        // Eğer bu tema AKTİF yapılıyorsa, diğerlerini PASİF yap
        if (isActive === true) {
            await Theme.updateMany(
                { hotelId: req.user.id, _id: { $ne: theme._id } },
                { isActive: false }
            );
        }

        if (name) theme.name = name;
        if (isActive !== undefined) theme.isActive = isActive;

        await theme.save();
        res.json(theme);
    } catch (error) {
        res.status(500).json({ message: 'Güncelleme başarısız.' });
    }
});

// 🗑️ DELETE: Tema Sil
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const theme = await Theme.findOne({ _id: req.params.id, hotelId: req.user.id });
        
        if (!theme) return res.status(404).json({ message: 'Tema bulunamadı.' });
        if (theme.isActive) return res.status(400).json({ message: 'Aktif tema silinemez! Önce başka bir temayı aktif yapın.' });

        await Theme.findByIdAndDelete(req.params.id);
        res.json({ message: 'Tema silindi.' });
    } catch (error) {
        res.status(500).json({ message: 'Silme işlemi başarısız.' });
    }
});

module.exports = router;