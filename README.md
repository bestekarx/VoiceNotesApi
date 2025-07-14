# VoiceNotesApi

## 🎙️ Proje Amacı

VoiceNotesApi, sesli notlarınızı yükleyip, otomatik olarak metne dönüştüren ve özetleyen modern bir RESTful API servisidir. Node.js ve TypeScript ile geliştirilmiş olup, AssemblyAI gibi güçlü bir yapay zeka servisiyle entegredir. Mobil uygulamalar veya web istemcileri için hızlı, güvenli ve ölçeklenebilir bir arka uç sağlar.

## 🚀 Temel Özellikler
- Ses dosyası yükleme (mp3, wav, m4a, ogg, webm, aac)
- AssemblyAI ile otomatik transkripsiyon (Speech-to-Text)
- AI destekli özetleme ve anahtar noktaları çıkarma
- Dosya durumunu ve işlenme sürecini sorgulama
- Modern, tip güvenli TypeScript kod tabanı
- Express.js ile hızlı ve güvenli API

## 📁 Proje Yapısı
```
voicenotesapi/
├── src/
│   ├── controllers/      # API endpoint fonksiyonları
│   ├── services/         # Harici servislerle iletişim
│   ├── models/           # Veri modelleri
│   ├── routes/           # API rotaları
│   ├── middleware/       # Yükleme, hata yönetimi gibi arakatmanlar
│   └── app.ts            # Uygulamanın ana başlatıcısı
├── uploads/              # Yüklenen ses dosyalarının tutulduğu klasör
├── package.json          # Proje bağımlılıkları ve scriptler
└── tsconfig.json         # TypeScript ayarları
```

## ⚡ Kurulum

1. **Node.js ve npm** kurulu olmalı ([Node.js İndir](https://nodejs.org/))
2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
3. Geliştirme ortamında başlatmak için:
   ```bash
   npm run dev
   ```
   Sunucu varsayılan olarak `http://localhost:3000` adresinde çalışır.

## 🏗️ Build ve Deploy

1. TypeScript dosyalarını derleyin:
   ```bash
   npm run build
   ```
2. Üretim ortamında başlatmak için:
   ```bash
   npm start
   ```

## ☁️ Yayınlama (Deploy)
- Railway, Vercel, Heroku gibi platformlarda kolayca deploy edilebilir.
- Ortam değişkenlerini ve API anahtarlarını `.env` dosyasında saklayın.
- HTTPS ve CORS ayarlarını production için yapılandırın.

## 🔒 Güvenlik
- API anahtarları ve hassas bilgileri kodda paylaşmayın, `.env` kullanın.
- Yüklenen dosya türü ve boyutunu kontrol edin.
- Sadece güvenilir istemcilere CORS açın.

## 👨‍💻 Katkı ve Lisans
- Bu proje özel (private) olarak barındırılmaktadır.
- Katkı için lütfen repository sahibiyle iletişime geçin.

---

**VoiceNotesApi** ile sesli notlarınızı akıllı şekilde yönetin ve özetleyin!

# Trigger redeploy

