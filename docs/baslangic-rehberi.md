# Başlangıç rehberi — bu projede ne var, nereden bakılır

Bu dosya, projeyi ilk kez açan birinin 15 dakikada yönünü bulması için yazıldı.

## 1. Bu proje nedir?
Likya Yolu yürüyüşçüleri için mobil uygulama. Üç parça:
- **Mobil uygulama** (`apps/mobile`): telefonda çalışacak olan.
- **API / sunucu** (`apps/api`): telefonun konuştuğu arka uç.
- **Veritabanı şeması** (`packages/db`): verinin nasıl saklandığı.

Ürün kararları ve analiz: `docs/urun-analizi.md`. Teknik kararlar: `docs/mimari.md`.

## 2. Klasör klasör ne var?

```
apps/api/src/
  index.ts          Sunucuyu başlatır (bun run api)
  app.ts            Tüm modülleri birleştirir, /health ve /openapi
  env.ts            Ortam değişkenleri (.env) okunur ve doğrulanır
  plugins/auth.ts   JWT kontrolü: route'a { auth: true } yazınca kullanıcı zorunlu olur
  modules/          Her dosya bir API alanı:
    auth.ts         e-posta ile kod iste / kodu doğrula / giriş jetonu
    me.ts           profil, güvenilir kişiler, cihaz kaydı, hesap silme
    trails.ts       rota, etaplar, POI listesi, "sonraki su kaç km"
    reports.ts      bir POI için durum raporu ("çeşme kuru")
    needs.ts        ihtiyaç ilanı, teklif verme, kabul, tamamlama
    hikes.ts        yürüyüş planı, "vardım", son bilinen konum
    presence.ts     canlı haritadaki yürüyüşçüler (kabalaştırılmış konum)
    sync.ts         telefonun çevrimdışı birikmiş işlemlerini toplu alma (push) ve güncel veriyi verme (pull)
  services/         İş kuralları (modüller bunları çağırır):
    needs.ts        ihtiyaç kuralları (en fazla 3 açık ihtiyaç, kendi ihtiyacına teklif yok...)
    needs-state.ts  durum makinesi: open → offered → accepted → completed
    hikes.ts        gecikme kontrolü: ETA+30dk kullanıcıya, ETA+2sa güvenilir kişiye
    derive-poi.ts   raporlardan çeşmenin "akıyor/kuru" özetini hesaplar
    mail.ts         e-posta gönderimi (geliştirmede konsola yazar)
    notify.ts       telefon bildirimi (Expo push)
  jobs/scheduler.ts Dakikada bir çalışan zamanlayıcı (süresi dolan ihtiyaçlar, gecikmeler)
  test/             API testleri (bun test)

packages/shared/src/
  enums.ts          Sabit listeler: POI tipleri, ihtiyaç türleri ve emojileri, durumlar
  constants.ts      Sayılar: 250 m hücre, 2 saat varlık süresi, 60 m sapma eşiği...
  geo/track.ts      Rota çizgisine "snap" ve patika boyunca mesafe hesabı (kuş uçuşu değil)
  geo/coarse.ts     Konumu 250 m hücreye yuvarlama (gizlilik)
  schemas/          Gelen verilerin doğrulama şemaları (zod)

packages/db/src/
  schema/           Tablolar (Drizzle). Her dosya bir alan: users, trails, needs, hikes...
  geometry.ts       PostGIS nokta/çizgi tipleri
  migrate.ts        Tabloları veritabanında oluşturur
  seed.ts           Örnek etap ve POI ekler
  drizzle/0000_init.sql  Üretilmiş SQL

apps/mobile/
  app/_layout.tsx   Uygulama kökü; SQLite ve senkronu başlatır
  app/index.tsx     Yer tutucu ekran (tasarım sonra)
  src/db/client.ts  Telefondaki SQLite tabloları (pois, needs, outbox...)
  src/sync/         outbox.ts: çevrimdışı işlemleri kuyruğa yaz; engine.ts: bağlantı gelince gönder/çek
  src/api/client.ts Sunucuya HTTP istekleri
  src/location/tracking.ts  Arka planda konum kaydı
  src/map/offline.ts        Çevrimdışı harita paketi indirme
  app.json          İzin metinleri, eklentiler, paket adı

tools/data-pipeline/  OSM'den gerçek rota verisini çeken betikler (henüz çalıştırılmadı)
infra/                Docker ile sunucuda çalıştırma
```

## 3. Bilgisayarımda nasıl çalıştırırım?
1. Bun kur: https://bun.sh
2. PostgreSQL 16 + PostGIS kur (ya da Docker: `cd infra && docker compose up -d db`)
3. Proje kökünde:
   ```bash
   bun install
   cp .env.example .env
   bun run db:migrate
   bun run db:seed
   bun run api
   ```
4. Tarayıcıda `http://localhost:3000/openapi` → tüm API uçlarını görüp deneyebilirsin.
5. Testler: `bun test`

Mobil uygulama için ayrıca Android Studio ya da Xcode gerekir; o adımı tasarım turundan sonra birlikte yapacağız.

## 4. Okumaya nereden başlamalı?
1. `packages/shared/src/enums.ts` — ürünün kelime dağarcığı.
2. `packages/db/src/schema/needs.ts` ve `trails.ts` — veri modeli.
3. `apps/api/src/services/needs.ts` — iş kuralları.
4. `apps/api/test/api.test.ts` — sistemin uçtan uca nasıl kullanıldığı; en iyi "örnek".
5. `apps/mobile/src/sync/engine.ts` — çevrimdışı çalışma mantığı.
