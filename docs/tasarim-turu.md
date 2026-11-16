# Tasarım turu — ekran haritası (v1)

Durum: §5'teki kararlar 17 Kasım 2026'da verildi; §6 prototip aşamasında. Mobil ekran tasarımı daha önce yapılmadı; bu belge turu
başlatmak için ilk öneridir. Kapsam: `docs/urun-analizi.md` §10 "daraltılmış MVP" + çevrimiçiyken
canlı harita. Bluetooth yok.

## 1. Tasarım ilkeleri (kodda zaten gömülü olanlardan türetildi)

1. **Çevrimdışı varsayılan.** Her ekran sinyal yokken de anlamlı olmalı; "bağlan" diyen boş ekran yok.
   Üstte tek bir ince durum şeridi: `Çevrimdışı · son senkron 2 sa önce · 3 bekleyen`.
2. **Yürürken tek elle.** Büyük dokunma hedefleri, alt sekme çubuğu, birincil aksiyonlar başparmak
   bölgesinde. Güneşte okunabilir: yüksek kontrast, açık tema varsayılan, koyu tema gece/konaklama için.
3. **Güvenlik iki dokunuşta.** Acil ekran her yerden erişilir (sekme çubuğunda sabit 🆘 ya da sağ üst).
   İlk adım 112; uygulama arama-kurtarmanın yerine geçmez (README ilkesi).
4. **Gizlilik görünür.** Konum paylaşımı kapalıyken haritada "sen görünmüyorsun" rozeti; açıkken
   "250 m hücre" açıklaması. Ham konum asla başkasına gitmez.
5. **TR + EN eşit birinci sınıf.** Kitle çoğunlukla yabancı; metinler kısa, emoji ihtiyaç türlerinde
   dil bağımsız (`NEED_EMOJI`).

## 2. Sekme yapısı (öneri: 4 sekme + sabit acil)

```
[ Harita ]  [ Etap ]  [ Pano ]  [ Ben ]        (🆘 sağ üstte her ekranda)
```

- **Harita** — çevrimdışı MapLibre paketi, rota çizgisi, POI'ler, konumum, "sonraki su 3,4 km" kartı.
  Çevrimiçiyken: yakındaki yürüyüşçü sayacı ve kabalaştırılmış noktalar (`/presence/nearby`, 30 sn).
- **Etap** — 29 etabın listesi; etap detayı: profil (mesafe/tırmanış/süre), POI listesi sırayla,
  her POI'nin son durumu ve tazeliği, "rapor ver" düğmesi.
- **Pano** — etap bazlı asenkron dayanışma: ihtiyaç ilanları (emoji + metin + durum), "bugün bu
  etaptayım" kartları, teklif ver / kabul / tamamla akışı.
- **Ben** — profil, yürüyüş planı ve güvenilir kişiler, harita paketi indirme, konum paylaşım
  anahtarı, dil, hesap.

Karar: 4 sekme (17 Kas 2026).

## 3. Ekran envanteri (MVP)

| # | Ekran | Sekme | Ana içerik | API / yerel kaynak |
|---|-------|-------|------------|--------------------|
| 1 | Hoş geldin + dil | — | TR/EN seçimi, 3 slaytlık değer önerisi | i18n |
| 2 | Giriş (e-posta kodu) | — | e-posta → 6 haneli kod; sonra Apple/Google | `/auth/request-code`, `/auth/verify` |
| 3 | İzinler | — | konum (kullanırken → her zaman), bildirim; neden istediğimizi anlatan kartlar | expo-location |
| 4 | Harita paketi indir | Ben / ilk açılış | koridor paketi boyutu, ilerleme, "Wi‑Fi'da indir" | `src/map/offline.ts` |
| 5 | Harita | Harita | rota, POI'ler, konum, sonraki su/konaklama kartı, sapma uyarısı banner'ı, yakındakiler sayacı | SQLite pois, `/presence/nearby` |
| 6 | POI detayı (alt sayfa) | Harita/Etap | tip, son durum + tazelik, rapor geçmişi, "rapor ver", "buraya su bıraktım" | pois, poi_reports |
| 7 | Rapor ver (sheet) | — | durum seçimi (akıyor/az/kuru…), not, foto (ertelendi) | outbox → `/sync/push` |
| 8 | Etap listesi | Etap | 29 etap kartı: mesafe, tırmanış, süre, su sayısı | stages |
| 9 | Etap detayı | Etap | yükseklik profili, sıralı POI listesi, "bu etaptayım" | stages, pois |
| 10 | Pano listesi | Pano | etap filtresi, açık ihtiyaçlar, "bu etaptayım" kartları | `/needs` |
| 11 | İhtiyaç oluştur (sheet) | Pano | emoji tür, kısa metin, etap, süre (`NEED_TTL_HOURS`) | `/needs` |
| 12 | İhtiyaç detayı | Pano | durum makinesi görseli, teklifler, kabul/tamamla, basit mesaj | `/needs/:id`, offers |
| 13 | Yürüyüş planı | Ben | başlangıç/hedef etap, tahmini varış, güvenilir kişi; "Vardım" büyük düğme | `/hikes` |
| 14 | Acil | 🆘 | 112 ara, koordinatı kopyala, güvenilir kişiye SMS taslağı, son bilinen konumu gönder | `sms:` URL, `/me/last-known` |
| 15 | Profil | Ben | takma ad, avatar, diller, deneyim, görünürlük anahtarı | `/me` |
| 16 | Ayarlar | Ben | dil, tema, takip modu (tam/tasarruf/manuel), paket yönetimi, hesap silme | — |

Toplam 16 ekran, 3'ü bottom-sheet. Tek geliştirici için makul; fotoğraf, mesajlaşma ve moderasyon
ekranları MVP dışında.

## 4. Kritik akışlar (önce bunlar prototiplenecek)

1. **İlk açılış → harita paketi indirilmiş, çevrimdışı harita görünüyor** (1→2→3→4→5).
2. **Yürüyüş modu**: Etap detayı → "bu etaptayım" → Harita'da sonraki su kartı → sapma uyarısı → POI'ye
   rapor (çevrimdışı, outbox) → sinyal gelince senkron.
3. **Güvenlik**: Yürüyüş planı oluştur → güvenilir kişi ekle → "Vardım" → (gelmezse) bildirim.
4. **Pano**: İhtiyaç oluştur → teklif al → kabul → tamamla.

## 5. Kararlar (17 Kasım 2026)

| Soru | Karar | Not |
|------|-------|-----|
| Sekme sayısı | **4 sekme**: Harita / Etap / Pano / Ben | Etap listesi kendi sekmesinde |
| Acil düğmesi | **Sağ üst, her ekranda** | Kısa basış → acil ekranı; uzun basış → doğrudan 112 |
| Prototip aracı | **Tıklanabilir HTML taslak** | `docs/prototip/`; beğenilince Expo'ya taşınır |
| Renk tonu | **A · Toprak ve doğa** | Yeşil/krem zemin; su mavi, acil kırmızı; açık tema varsayılan |
| Ürün adı | **Patika** (şimdilik) | Mağazaya çıkmadan önce yeniden değerlendirilecek |
| Harita stili | **Outdoor + eş yükselti** | OpenMapTiles tabanlı, kontur + gölgeleme; Planetiler ile üretilecek |

### Renk token'ları (v1, taslak)
- Zemin: `#F4F1E8` (krem), kart: `#FFFFFF`, harita zemini: `#EAF3DE`
- Birincil (rota, aksiyon): `#3B6D11`; koyu metin: `#173404`; ikincil metin: `#5F5E5A`
- Su: `#378ADD`; konaklama/bakkal: `#854F0B`; tehlike: `#BA7517`; acil: `#A32D2D`
- Kenarlık: `#D3D1C7`

## 6. Sonraki adım

1. ve 2. akış için tıklanabilir prototip hazır: https://claude.ai/artifact/4iQbJxbtaidGW53V7Lqkxz (kaynaklar `docs/prototip/`). Geri bildirim sonrası:
sonra tasarım token'ları (renk, tip ölçeği, boşluk) ve ortak bileşen listesi (durum şeridi, POI
kartı, ihtiyaç kartı, büyük aksiyon düğmesi).
