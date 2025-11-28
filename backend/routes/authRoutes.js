const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const authMiddleware = require('../middleware/authMiddleware');

// ⚡ Nodemailer Transport Oluşturma
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_PORT == 465, // Eğer 465 ise true
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

// 🛎️ /api/auth/register : Yeni Otel Kaydı ve Mail Gönderme
router.post('/register', async (req, res) => {
    const { name, adminEmail, password, customDomain } = req.body;

    try {
        const existingHotel = await Hotel.findOne({ adminEmail });
        if (existingHotel) {
            return res.status(400).json({ message: 'Bu e-posta adresi zaten kayıtlı.' });
        }

        // Şifreyi hash'le
        const hashedPassword = await bcrypt.hash(password, 10);

        // Doğrulama token'ı oluştur
        const verificationToken = jwt.sign({ adminEmail }, process.env.JWT_SECRET, { expiresIn: '1d' });

        const newHotel = new Hotel({
            name,
            adminEmail,
            password: hashedPassword,
            customDomain,
            isVerified: false,
            verificationToken: verificationToken
        });

        await newHotel.save();

        // 📧 Doğrulama Mailini Gönderme
        const verificationLink = `${process.env.CLIENT_URL}/verify?token=${verificationToken}`;
        
        await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: adminEmail,
            subject: 'The Room | E-posta Adresi Doğrulama',
            html: `
                <h2>The Room Platformuna Hoş Geldiniz!</h2>
                <p>Otel yönetim panelinizi kullanmaya başlamak için e-posta adresinizi doğrulayın:</p>
                <a href="${verificationLink}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Hesabımı Doğrula</a>
                <p>Bu bağlantı 24 saat geçerlidir.</p>
            `,
        });

        res.status(201).json({ 
            message: 'Otel kaydınız oluşturuldu. Lütfen gelen kutunuzu kontrol edin ve e-postanızı doğrulayın.' 
        });

    } catch (error) {
        console.error("Kayıt Hatası:", error);
        res.status(500).json({ message: 'Sunucu hatası. Kayıt işlemi başarısız.' });
    }
});

// ✅ /api/auth/verify : E-posta Doğrulama
router.get('/verify', async (req, res) => {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { adminEmail } = decoded;

        console.log("✅ İstek Geldi. Email:", adminEmail);

        const hotel = await Hotel.findOne({ adminEmail });

        if (!hotel) {
            return res.status(400).json({ message: 'Böyle bir otel kaydı bulunamadı.' });
        }

        // Zaten doğrulanmışsa tekrar işlem yapma
        if (hotel.isVerified) {
            console.log("ℹ️ Kullanıcı zaten doğrulanmış.");
            return res.status(200).json({ message: 'Hesabınız zaten doğrulanmış. Giriş yapabilirsiniz.' });
        }

        // Token kontrolü
        if (hotel.verificationToken !== token) {
            console.log("❌ Token uyuşmazlığı.");
            return res.status(400).json({ message: 'Geçersiz doğrulama tokenı.' });
        }

        // Doğrula
        hotel.isVerified = true;
        hotel.verificationToken = undefined; // Token'ı sil
        await hotel.save();

        console.log("🎉 Doğrulama başarılı.");
        res.status(200).json({ message: 'E-posta adresiniz başarıyla doğrulandı. Giriş yapabilirsiniz.' });

    } catch (error) {
        console.error("❌ HATA:", error.message);
        res.status(400).json({ 
            message: 'Doğrulama bağlantısı geçersiz veya süresi dolmuş.' 
        });
    }
});

// 🔑 /api/auth/login : Giriş Yapma
router.post('/login', async (req, res) => {
    const { adminEmail, password } = req.body;

    try {
        const hotel = await Hotel.findOne({ adminEmail });
        if (!hotel) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }

        if (!hotel.isVerified) {
            return res.status(403).json({ message: 'Lütfen önce e-posta adresinizi doğrulayın.' });
        }

        const isMatch = await bcrypt.compare(password, hotel.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Hatalı şifre.' });
        }

        const token = jwt.sign(
            { id: hotel._id, tenantId: hotel.tenantId, email: hotel.adminEmail },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Giriş başarılı.',
            token,
            hotel: {
                id: hotel._id,
                name: hotel.name,
                email: hotel.adminEmail,
                tenantId: hotel.tenantId,
                customDomain: hotel.customDomain,
                subscription: hotel.subscription,
                siteSettings: hotel.siteSettings // Site ayarlarını da döndür
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası: ' + error.message });
    }
});

// ❓ /api/auth/forgot-password : Şifre Sıfırlama İsteği
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const hotel = await Hotel.findOne({ adminEmail: email });
        if (!hotel) {
            return res.status(404).json({ message: 'Bu e-posta ile kayıtlı otel bulunamadı.' });
        }

        const resetToken = jwt.sign({ id: hotel._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        hotel.resetPasswordToken = resetToken;
        hotel.resetPasswordExpires = Date.now() + 3600000; // 1 saat
        await hotel.save();

        const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

        await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: email,
            subject: 'The Room | Şifre Sıfırlama',
            html: `
                <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
                <a href="${resetLink}">Şifremi Sıfırla</a>
                <p>Link 1 saat geçerlidir.</p>
            `
        });

        res.status(200).json({ message: 'Sıfırlama bağlantısı e-posta adresinize gönderildi.' });

    } catch (error) {
        res.status(500).json({ message: 'Hata: ' + error.message });
    }
});

// 🔄 /api/auth/reset-password : Yeni Şifreyi Kaydetme
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const hotel = await Hotel.findOne({ 
            _id: decoded.id, 
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } 
        });

        if (!hotel) {
            return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş token.' });
        }

        hotel.password = await bcrypt.hash(newPassword, 10);
        hotel.resetPasswordToken = undefined;
        hotel.resetPasswordExpires = undefined;
        await hotel.save();

        res.status(200).json({ message: 'Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.' });

    } catch (error) {
        res.status(400).json({ message: 'Token geçersiz veya süresi dolmuş.' });
    }
});

// ✏️ /api/auth/update : Genel Bilgileri Güncelle (Otel Adı, Domain, Özellikler)
router.put('/update', authMiddleware, async (req, res) => {
    const { name, customDomain, details, facilities } = req.body;

    try {
        const hotel = await Hotel.findById(req.user.id);
        if (!hotel) return res.status(404).json({ message: 'Otel bulunamadı.' });

        if (name) hotel.name = name;
        if (customDomain) hotel.customDomain = customDomain;
        
        // Yeni alanları güncelle
        if (details) {
            // Nested (iç içe) objeleri koruyarak güncelle
            hotel.details = { 
                ...hotel.details, // Mevcut verileri koru
                ...details        // Yenileri üzerine yaz
            };
        }
        if (facilities) {
            hotel.facilities = facilities;
        }

        await hotel.save();

        res.status(200).json({ 
            message: 'Bilgiler güncellendi.',
            hotel: {
                id: hotel._id,
                name: hotel.name,
                email: hotel.adminEmail,
                tenantId: hotel.tenantId,
                customDomain: hotel.customDomain,
                subscription: hotel.subscription,
                details: hotel.details,
                facilities: hotel.facilities
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// 🌐 /api/auth/update-site-settings : SEO ve Sayfa Eşleştirmelerini Güncelle
router.put('/update-site-settings', authMiddleware, async (req, res) => {
    const { siteSettings } = req.body;

    try {
        const hotel = await Hotel.findById(req.user.id);
        if (!hotel) return res.status(404).json({ message: 'Otel bulunamadı.' });

        if (siteSettings) {
            // 🛡️ KRİTİK DÜZELTME: PageMappings içindeki boş stringleri NULL yap
            if (siteSettings.pageMappings) {
                for (const key in siteSettings.pageMappings) {
                    if (siteSettings.pageMappings[key] === "") {
                        siteSettings.pageMappings[key] = null;
                    }
                }
            }

            // Mevcut ayarları koruyarak güncelle (Deep Merge)
            hotel.siteSettings = {
                ...hotel.siteSettings, // Eskiler kalsın
                ...siteSettings,       // Yenileri üzerine yaz
                pageMappings: {        // Mappingleri ayrıca merge et
                    ...(hotel.siteSettings.pageMappings || {}),
                    ...(siteSettings.pageMappings || {})
                }
            };
        }

        await hotel.save();
        res.status(200).json({ message: 'Site ayarları güncellendi.', hotel });
    } catch (error) {
        console.error("Site Settings Update Error:", error);
        res.status(500).json({ message: 'Güncelleme hatası: ' + error.message });
    }
});

module.exports = router;