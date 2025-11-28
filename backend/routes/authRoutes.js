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

        // Doğrulama token'ı oluştur (Kullanıcı ID'sini kullanıyoruz)
        const verificationToken = jwt.sign({ adminEmail }, process.env.JWT_SECRET, { expiresIn: '1d' });

        const newHotel = new Hotel({
            name,
            adminEmail,
            password: hashedPassword, // Hashlenmiş şifreyi kaydet
            customDomain,
            isVerified: false, // Doğrulama durumunu FALSE olarak ayarla
            verificationToken: verificationToken // Token'ı kaydet
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
        res.status(500).json({ message: 'Sunucu hatası. Kayıt veya mail gönderme işlemi başarısız.' });
    }
});

router.get('/verify', async (req, res) => {
    const { token } = req.query;

    try {
        // 1. JWT Token'ı çöz
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { adminEmail } = decoded;

        console.log("✅ İstek Geldi. Email:", adminEmail);

        // 2. Sadece E-posta ile kullanıcıyı bul (Token şartını burada koyma!)
        const hotel = await Hotel.findOne({ adminEmail });

        if (!hotel) {
            return res.status(400).json({ message: 'Böyle bir otel kaydı bulunamadı.' });
        }

        // 3. 🛡️ KORUMA: Eğer otel zaten doğrulanmışsa, tekrar işlem yapma, direk başarılı dön.
        // Bu adım, çift istek sorununu kökten çözer.
        if (hotel.isVerified) {
            console.log("ℹ️ Kullanıcı zaten doğrulanmış. Başarılı dönülüyor.");
            return res.status(200).json({ message: 'Hesabınız zaten doğrulanmış. Giriş yapabilirsiniz.' });
        }

        // 4. Eğer doğrulanmamışsa, Token eşleşmesini kontrol et
        if (hotel.verificationToken !== token) {
            console.log("❌ Token uyuşmazlığı.");
            return res.status(400).json({ message: 'Geçersiz doğrulama tokenı.' });
        }

        // 5. İlk kez doğrulanıyorsa işlemi yap
        hotel.isVerified = true;
        hotel.verificationToken = undefined; // Token'ı sil
        await hotel.save();

        console.log("🎉 Doğrulama ilk kez başarıyla yapıldı.");
        res.status(200).json({ message: 'E-posta adresiniz başarıyla doğrulandı. Giriş yapabilirsiniz.' });

    } catch (error) {
        console.error("❌ HATA:", error.message);
        res.status(400).json({ 
            message: 'Doğrulama bağlantısı geçersiz veya süresi dolmuş.' 
        });
    }
});

// ... (Önceki register ve verify kodları buranın üstünde kalacak)

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
                customDomain: hotel.customDomain, // Bunu da ekleyelim, lazım olur
                subscription: hotel.subscription // 👈 EKSİK OLAN BU SATIRDI!
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

        // Sıfırlama Token'ı oluştur (1 saat geçerli)
        const resetToken = jwt.sign({ id: hotel._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        // Token'ı DB'ye kaydet
        hotel.resetPasswordToken = resetToken;
        hotel.resetPasswordExpires = Date.now() + 3600000; // 1 saat
        await hotel.save();

        // Mail Gönder
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
        // Token geçerli mi ve süresi dolmamış mı kontrol et
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const hotel = await Hotel.findOne({ 
            _id: decoded.id, 
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } 
        });

        if (!hotel) {
            return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş token.' });
        }

        // Yeni şifreyi hash'le ve kaydet
        hotel.password = await bcrypt.hash(newPassword, 10);
        hotel.resetPasswordToken = undefined;
        hotel.resetPasswordExpires = undefined;
        await hotel.save();

        res.status(200).json({ message: 'Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.' });

    } catch (error) {
        res.status(400).json({ message: 'Token geçersiz veya süresi dolmuş.' });
    }
});

router.put('/update', authMiddleware, async (req, res) => {
    const { name, customDomain, details, facilities } = req.body; // details ve facilities eklendi

    try {
        const hotel = await Hotel.findById(req.user.id);
        if (!hotel) return res.status(404).json({ message: 'Otel bulunamadı.' });

        if (name) hotel.name = name;
        if (customDomain) hotel.customDomain = customDomain;
        
        // Yeni alanları güncelle
        if (details) {
            hotel.details = { ...hotel.details, ...details };
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
                details: hotel.details,     // Eklendi
                facilities: hotel.facilities // Eklendi
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// ... module.exports = router;

module.exports = router;