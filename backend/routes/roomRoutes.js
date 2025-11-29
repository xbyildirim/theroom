// backend/routes/roomRoutes.js dosyasının TAMAMI:

const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const sharp = require('sharp'); // Resim optimizasyonu için
const path = require('path');
const fs = require('fs');

// --- MULTER AYARLARI ---
const storage = multer.memoryStorage(); // İşlemeden önce bellekte tut

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB Sınır (Video için artırdık)
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Sadece resim ve video dosyaları yüklenebilir!'), false);
        }
    }
});

// 🔍 GET: Odaları Getir
router.get('/', authMiddleware, async (req, res) => {
    try {
        const rooms = await Room.find({ hotelId: req.user.id }).sort({ createdAt: -1 });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Odalar getirilemedi.' });
    }
});

// ➕ POST: Yeni Oda Ekle (Çoklu Dosya Destekli)
router.post('/', authMiddleware, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'videos', maxCount: 3 }]), async (req, res) => {
    try {
        // FormData ile gelen veriler string olabilir, bunları parse etmemiz gerekebilir
        let roomData = { ...req.body };

        // JSON string gelen alanları objeye çevir
        ['title', 'description', 'features', 'bathroom', 'view', 'cancellationPolicy', 'minibarContents', 'safety'].forEach(field => {
            if (typeof roomData[field] === 'string') {
                try { roomData[field] = JSON.parse(roomData[field]); } catch(e) {}
            }
        });

        const imageUrls = [];
        const videoUrls = [];

        // 🖼️ RESİMLERİ İŞLE
        if (req.files && req.files['images']) {
            for (const file of req.files['images']) {
                const filename = `room-${req.user.id}-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpeg`;
                const outputPath = path.join(__dirname, '../uploads', filename);
                
                await sharp(file.buffer)
                    .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 80 })
                    .toFile(outputPath);
                
                imageUrls.push(`/uploads/${filename}`);
            }
        }

        // 🎥 VİDEOLARI İŞLE
        if (req.files && req.files['videos']) {
            for (const file of req.files['videos']) {
                const ext = path.extname(file.originalname);
                const filename = `video-${req.user.id}-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
                const outputPath = path.join(__dirname, '../uploads', filename);
                
                fs.writeFileSync(outputPath, file.buffer);
                videoUrls.push(`/uploads/${filename}`);
            }
        }

        const newRoom = new Room({
            hotelId: req.user.id,
            ...roomData,
            images: imageUrls,
            videos: videoUrls
        });

        await newRoom.save();
        res.status(201).json(newRoom);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Oda eklenemedi: ' + error.message });
    }
});

// ✏️ PUT: Odayı Güncelle
router.put('/:id', authMiddleware, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'videos', maxCount: 3 }]), async (req, res) => {
    try {
        let updateData = { ...req.body };

        // JSON Parse işlemleri
        ['title', 'description', 'features', 'bathroom', 'view', 'cancellationPolicy', 'minibarContents', 'safety'].forEach(field => {
            if (typeof updateData[field] === 'string') {
                try { updateData[field] = JSON.parse(updateData[field]); } catch(e) {}
            }
        });

        const existingRoom = await Room.findOne({ _id: req.params.id, hotelId: req.user.id });
        if (!existingRoom) return res.status(404).json({ message: 'Oda bulunamadı.' });

        let newImageUrls = [];
        let newVideoUrls = [];

        // Yeni Resimleri Yükle
        if (req.files && req.files['images']) {
            for (const file of req.files['images']) {
                const filename = `room-${req.user.id}-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpeg`;
                await sharp(file.buffer).resize(1200).jpeg({ quality: 80 }).toFile(path.join(__dirname, '../uploads', filename));
                newImageUrls.push(`/uploads/${filename}`);
            }
        }

        // Yeni Videoları Yükle
        if (req.files && req.files['videos']) {
            for (const file of req.files['videos']) {
                const filename = `video-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`;
                fs.writeFileSync(path.join(__dirname, '../uploads', filename), file.buffer);
                newVideoUrls.push(`/uploads/${filename}`);
            }
        }

        // Mevcut resimlerin üzerine ekle
        if (newImageUrls.length > 0) {
            updateData.images = [...existingRoom.images, ...newImageUrls];
        }
        if (newVideoUrls.length > 0) {
            updateData.videos = [...existingRoom.videos, ...newVideoUrls];
        }

        const updatedRoom = await Room.findOneAndUpdate(
            { _id: req.params.id, hotelId: req.user.id },
            updateData,
            { new: true }
        );
        res.json(updatedRoom);

    } catch (error) {
        console.error(error);
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