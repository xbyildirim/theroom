const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const authMiddleware = require('../middleware/authMiddleware');

// 🔍 GET: Otelin tüm odalarını getir
router.get('/', authMiddleware, async (req, res) => {
    try {
        const rooms = await Room.find({ hotelId: req.user.id }).sort({ createdAt: -1 });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Odalar getirilemedi.' });
    }
});

// ➕ POST: Yeni oda ekle
router.post('/', authMiddleware, async (req, res) => {
    try {
        const newRoom = new Room({
            hotelId: req.user.id,
            ...req.body
        });
        await newRoom.save();
        res.status(201).json(newRoom);
    } catch (error) {
        res.status(500).json({ message: 'Oda eklenemedi.' });
    }
});

// ✏️ PUT: Odayı Güncelle
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const updatedRoom = await Room.findOneAndUpdate(
            { _id: req.params.id, hotelId: req.user.id },
            req.body,
            { new: true }
        );
        res.json(updatedRoom);
    } catch (error) {
        res.status(500).json({ message: 'Güncelleme başarısız.' });
    }
});

// 🗑️ DELETE: Odayı Sil
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await Room.findOneAndDelete({ _id: req.params.id, hotelId: req.user.id });
        res.json({ message: 'Oda silindi.' });
    } catch (error) {
        res.status(500).json({ message: 'Silme başarısız.' });
    }
});

module.exports = router;