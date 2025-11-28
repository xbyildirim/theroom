const cron = require('node-cron');
const Hotel = require('./models/Hotel');
const nodemailer = require('nodemailer');

// Mail ayarlarını env'den alıyoruz (authRoutes ile aynı transporter kullanılabilir, kod tekrarı olmasın diye buraya da yazıyorum)
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_PORT == 465,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

const startCronJobs = () => {
    // ⏰ Her gün sabah 09:00'da çalışır ('0 9 * * *')
    cron.schedule('0 9 * * *', async () => {
        console.log('⏳ Günlük abonelik kontrolü çalışıyor...');

        const today = new Date();
        const fiveDaysLater = new Date();
        fiveDaysLater.setDate(today.getDate() + 5);

        // Sorgu mantığı: trialEndsAt tarihi, bugünden 5 gün sonrası olan (gün başlangıcı ve bitişi arasında) otelleri bul.
        const startOfDay = new Date(fiveDaysLater.setHours(0,0,0,0));
        const endOfDay = new Date(fiveDaysLater.setHours(23,59,59,999));

        try {
            const hotelsToRemind = await Hotel.find({
                'subscription.trialEndsAt': {
                    $gte: startOfDay,
                    $lte: endOfDay
                },
                'subscription.package': 'TRIAL' // Sadece deneme sürümündekiler
            });

            for (const hotel of hotelsToRemind) {
                // Mail Gönder
                await transporter.sendMail({
                    from: process.env.MAIL_USER,
                    to: hotel.adminEmail,
                    subject: 'The Room | Deneme Süreniz Dolmak Üzere!',
                    html: `
                        <h3>Merhaba ${hotel.name},</h3>
                        <p>Deneme sürenizin bitmesine <strong>son 5 gün</strong> kaldı.</p>
                        <p>Verilerinizi kaybetmemek ve paneli kullanmaya devam etmek için aboneliğinizi başlatmayı unutmayın.</p>
                    `
                });
                console.log(`📧 Hatırlatma maili gönderildi: ${hotel.adminEmail}`);
            }
        } catch (error) {
            console.error('Cron Job Hatası:', error);
        }
    });
};

module.exports = startCronJobs;