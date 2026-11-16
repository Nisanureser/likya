# Mimari kararlar

## Veri akışı

```
[Mobil] SQLite (pois, needs, hikes, track_points, outbox)
   │  çevrimdışı: her yazma → outbox
   │  bağlantı: POST /sync/push (outbox) → GET /sync/pull?since (delta)
[API] Elysia → Postgres/PostGIS
   │  poi_reports (olay) → pois.derived (türetilmiş durum)
   │  needs durum makinesi; presence TTL; hikes gecikme zamanlayıcısı
[Veri hattı] OSM → stages.json/geojson, pois.json → seed; Planetiler → PMTiles → nginx/S3
```

## Kararlar

1. **Olay temelli raporlar, LWW yalnız kullanıcıya ait tekil kayıtlarda** (profil, yürüyüş planı). Çakışma yüzeyi minimum.
2. **Patika mesafesi için yönlendirme motoru yok.** Etap çizgisi üzerinde kümülatif ofset (`snapToTrail`, `trailOffsetM`). "Sonraki su 3,4 km" = ofset farkı. Valhalla/Dijkstra Faz 2'de, yalnız ihtiyaç kanıtlanırsa.
3. **Kaba konum sunucuda uygulanır** (`coarsen`, 250 m hücre); istemciye güvenilmez.
4. **Presence Postgres'te** (GiST + TTL). Redis gerekmedi; yoğunluk artarsa aynı arayüzle taşınır.
5. **WebSocket yok (MVP).** 5 dakikalık senkron + push bildirimi yeterli; canlı harita çevrimiçiyken `/presence/nearby` polling (30 sn).
6. **Arka plan konum: expo-location + TaskManager ile başla.** Pil ölçümü (3 Android OEM + iPhone, 8 saat) teknik deneme fazında. Yetersizse Transistorsoft veya Expo Modules ile native modül.
7. **Çevrimdışı harita: MapLibre OfflineManager paketi** (stil + bbox + z8–14). PMTiles yalnız sunucu tarafı kaynak; MapLibre Native PMTiles'ı offline pack olarak indirmez.
8. **Kimlik: e-posta OTP + (sonra) Apple/Google.** Telefon doğrulaması SOS/ihtiyaç gönderiminde istenecek (henüz uygulanmadı).
9. **Bluetooth/mesh MVP'de yok.** Faz 3 deneyi; ön plan BLE keşfi 1 günlük spike ile kapat/ertele kararı.

## Açık işler (iskelet sonrası)

- Mobil ekran akışları ve tasarım (ayrı tur).
- Eden ile uçtan uca tip paylaşımı (`apps/api` `App` tipini `apps/mobile`'da kullan).
- Fotoğraf yükleme (S3 presigned URL) — `photoKey` alanları hazır.
- SMS sağlayıcı (gecikme bildirimi) ve Expo push jetonu kaydı akışı.
- Apple/Google OAuth doğrulaması (`/auth/oauth/:provider` 501 döner).
- Moderasyon uçları (flags, blocks, öneri onayı) — tablolar hazır, uçlar yok.
- Rate limiting (presence/sync) ve admin yetkisi.
- Veri hattı: etap sınırları (Dernek listesi), yükseklik profili, PMTiles üretimi.
