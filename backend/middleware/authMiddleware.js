// backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // 1. Header'dan token'ı al
    // Format genellikle şöyledir: "Bearer <token>"
    const authHeader = req.header('Authorization');

    // Token yoksa durdur
    if (!authHeader) {
        return res.status(401).json({ message: 'Erişim reddedildi. Token bulunamadı.' });
    }

    try {
        // "Bearer " öneki varsa temizle, yoksa direkt al
        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7, authHeader.length) 
            : authHeader;

        // 2. Token'ı doğrula
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Çözülen kullanıcı verisini (id, email vs.) "req.user" içine at
        // Böylece sonraki aşamalarda (route'larda) bu bilgiye erişebiliriz.
        req.user = decoded;

        // 4. İşleme devam et
        next();

    } catch (error) {
        res.status(401).json({ message: 'Geçersiz veya süresi dolmuş token.' });
    }
};

module.exports = authMiddleware;