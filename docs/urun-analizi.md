# Likya Yolu Yürüyüşçü Dayanışma Uygulaması — Ürün Keşfi, Yapılabilirlik ve Yol Haritası

Tarih: 16 Kasım 2026
Amaç: Fikri bir startup ve gerçek bir mobil ürün olarak eleştirel biçimde değerlendirmek; kod yazmadan önce "doğru ürün mü, yapılabilir mi" sorusunu cevaplamak.

---

## 0. Yönetici Özeti (önce kötü haber, sonra iyi haber)

**Ana tespit:** Fikrin en çekici cümlesi ("internetin olmadığı yerde insanların birbirini gerçek zamanlı bulduğu dayanışma ağı") teknik olarak büyük ölçüde gerçekleştirilemez. İnternet yoksa canlı harita yoktur. Telefonlar arası Bluetooth menzili açık arazide ~100 m'dir; 500+ km'lik bir rotada, günde birkaç yüz kişinin dağıldığı ve uygulamayı belki %10'unun kullandığı bir ortamda "yakındaki yürüyüşçü" neredeyse her zaman "göz mesafesindeki yürüyüşçü" demektir. Yani Bluetooth, bağırarak sorabileceğiniz birine emoji göndermenizi sağlar.

**Ama bu fikri öldürmez.** Çünkü aynı problemi (su yok, kayboldum, şarjım bitti, nerede kalacağım) çözen ve çevrimdışı gerçekten çalışan bir ürün tanımı var:

1. **Çevrimdışı rehber + güvenlik katmanı**: Likya Yolu'na özel, indirilmiş harita, etaplar, su/konaklama/dükkân noktaları, tazelik bilgisi, rota üzerinde "bir sonraki suya 3,4 km" bilgisi, rotadan sapma uyarısı, varış onayı ve acil durum ekranı.
2. **Asenkron dayanışma panosu**: Yürüyüşçüler sinyal bulduklarında (pansiyonlar, köyler, etap sonları — ki Likya Yolu'nda bunlar her gün vardır) etap bazlı bir panoda "Bu gece Kabak'tayım, yarın Alınca'ya geçiyorum; fazladan gaz kartuşum var / powerbank lazım" diyebilir. Bu, gerçek zamanlı avatar haritasından daha kullanışlı, daha güvenli ve çok daha ucuzdur.
3. **Sakla-ve-ilet (store-and-forward)**: Çevrimdışı bırakılan su noktası, bozuk işaret, kuru çeşme raporları cihazda saklanır, sinyal gelince senkronize olur. Bu, FarOut'un (eski Guthook) Amerika'daki uzun rotalarda kanıtladığı modeldir.

Gerçek zamanlı yakınlık haritası ve BLE mesh, MVP'den çıkarılıp "deney" olarak 3. faza atılmalıdır.

**Ticari gerçeklik:** Bu, tek rotayla bir "venture" işi değil; iyi tasarlanmış niş bir ürün + yerel hizmet ağıdır. Mevsimsellik (Nisan–Mayıs ve Ekim–Kasım) ve yıllık 30–50 bin kişilik tahmini kitle, gelirin ancak çoklu rota + yerel hizmet komisyonu + ücretli rehber paketi ile anlamlı hale gelebileceğini gösteriyor. Savunulabilir varlık teknoloji değil; **doğrulanmış yerel veri ve pansiyon/transfer/dernek ilişkileri**dir.

**Karar önerim:** Devam et, ama önce 4–6 haftalık bir keşif fazı yap ve ürünü yukarıdaki üç katmana daralt. Bahar 2027 sezonuna (Nisan) yetişecek bir MVP gerçekçi.

---

## 1. Bu ürün gerçekten hangi problemleri çözüyor?

### Kanıtlı, gerçek problemler

| Problem                          | Kanıt                                                                                                                                                              | Çözülebilirlik                                                                      |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| **Su kıtlığı**                   | Kayaköy sonrası 15 km su yok; Eylül–Ekim'de çoğu kaynak kuruyor; gezi raporlarında "en büyük problem" olarak geçiyor                                               | Yüksek — çevrimdışı POI + tazelik raporları                                         |
| **Kaybolma ve ölümler**          | 2025–2026'da en az üç yabancı yürüyüşçü (Çinli, Alman, Avustralyalı) rotada hayatını kaybetti; Kate Clow bile rotada kayboldu; JAK/AFAD/AKUT düzenli arama yapıyor | Orta — rotadan sapma uyarısı, varış onayı, son bilinen konum; 112'nin yerine geçmez |
| **Sinyal boşlukları**            | Rotanın belirli kesimlerinde veri yok; ses/SMS kapsaması veri kapsamasından geniş                                                                                  | SMS yedekli acil durum akışı                                                        |
| **Konaklama/erzak belirsizliği** | Pansiyon doluluğu, köy bakkalı açık mı, transfer var mı — bilgi dağınık (Facebook grupları, operatör WhatsApp'ları)                                                | Yüksek — kürate edilmiş, tarihli, doğrulanmış yerel hizmet verisi                   |
| **Yalnızlık / yürüyüş arkadaşı** | Facebook gruplarında en sık mesaj türü "X tarihinde başlıyorum, katılan var mı?"                                                                                   | Orta — asenkron pano çözer, gerçek zamanlı harita şart değil                        |

### Varsayılan ama zayıf problemler

- **"Yanımdan geçen birinden anlık su istemek"**: Yoğunluk düşük, menzil kısa. Trail'de karşılaşan insanlar zaten konuşur. Teknoloji bu etkileşime çok az değer katar.
- **"Çevrimdışı canlı harita"**: Terim çelişkili. Çevrimdışı görülebilecek tek şey, son senkronizasyonda indirilen bayat verilerdir.

### Kitle gerçeği

Resmi istatistik yok. TÜRSAB yetkilisinin tahmini "30–50 bin kişilik potansiyel". Yürüyüşçülerin büyük kısmı yabancı (Alman, İngiliz, Rus, Ukraynalı, Polonyalı, son yıllarda Çinli). İki kısa sezon var. Bu üç gerçek, ürünün dil desteğini (EN zorunlu, TR, RU, DE), pazarlama kanalını (yabancı Facebook grupları, pansiyonlar) ve gelir modelini (sezonluk) belirliyor.

---

## 2–3. Rakipler ve zaten var olan özellikler

### Dünya

| Ürün                                    | Model                                                                 | Sizinle çakışan özellikler                                                                                                                                      | Eksikleri                                                                                                     |
| --------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **FarOut (Guthook)**                    | Rota başına ücretli rehber (PCT $49,99; AT $74,99); ABD uzun rotaları | Çevrimdışı rota + waypoint yorumları; **Su Durumu** (son 2 haftanın yorumlarını ML ile "kuru/az/akıyor"a çeviriyor); yorum flag/filtre; waypoint eskimiş raporu | Likya Yolu yok; sosyal/yardım katmanı yok; Türkiye'de yerel hizmet yok                                        |
| **Cairn Live** (2025)                   | Freemium                                                              | **Yakındaki yürüyüşçülere SOS**; kitle kaynaklı uyarılar (su, engel, tehlike); fotoğraf + oy ile doğrula/çöz; güvenilir kişiler (Pro)                           | ABD odaklı, yeni, bağımsız inceleme yok; çevrimdışı mod Pro'da                                                |
| **AllTrails**                           | Abonelik                                                              | Live Share (arkadaşlarla canlı konum), en büyük rota veritabanı                                                                                                 | Çevrimdışı harita ücretli; yabancılarla yardımlaşma yok                                                       |
| **Komoot, Gaia GPS, Wikiloc**           | Abonelik                                                              | Çevrimdışı topo, rota planlama, topluluk rotaları                                                                                                               | Yardım/ihtiyaç modeli yok; rotaya özel kürasyon yok                                                           |
| **OsmAnd / Organic Maps**               | Ücretsiz, OSM                                                         | Çevrimdışı harita + Likya Yolu OSM'de tam olarak var; **Kültür Rotaları Derneği resmi olarak OsmAnd öneriyor**                                                  | Topluluk, güvenlik, yerel hizmet yok; UX zor                                                                  |
| **HiiKER, Bivy, Homebound, Trailforks** | Çeşitli                                                               | Canlı konum paylaşımı, "yakındaki maceracılar", check-in isteme, grup takibi                                                                                    | Hepsi arkadaş çevresi odaklı                                                                                  |
| **Garmin inReach**                      | Donanım + abonelik ($15–65/ay)                                        | Uydu SOS ve mesaj, dünya genelinde                                                                                                                              | Donanım gerekir; bazı ülkelerde uydu cihazı düzenlemeye tabi (Türkiye için kontrol edin)                      |
| **Apple uydu SOS/Mesaj**                | iPhone 14+ ücretsiz                                                   | Uydu SOS                                                                                                                                                        | Türkiye desteklenen ülkeler listesinde yok (2025 listesi); Messages via satellite yalnızca ABD/Kanada/Meksika |
| **Bridgefy, bitchat, Meshtastic**       | Mesh                                                                  | Çevrimdışı mesajlaşma                                                                                                                                           | Bridgefy ~100 m menzil; Meshtastic ayrı LoRa donanımı ister                                                   |

### Likya Yolu'na özel

- **TrekRight: Lycian Way** (bağımsız geliştirici, çevrimdışı harita, etap rehberi, çok iyi yorumlar).
- **Lycian Way Pro** (Dernek'in kendi uygulaması, son güncelleme Şubat 2021 — fiilen terk edilmiş).
- **Lycian Way (Pixelo)**, **Trekopedia** web rehberi.
- Dernek'in resmi duruşu: "OSM kullanan her uygulama rotanın güncel halini gösterir; OsmAnd öneriyoruz."

### Türkiye

- **Kaşif** (rota kaydet/paylaş, Türk yapımı) — yardımlaşma modeli yok.
- Dayanışma modeli olan hiçbir yerli ürün bulamadım. Topluluk fiilen Facebook gruplarında ("Lycian Way / Likya Yolu" grupları — on binlerce üye; doğrulayın), Instagram'da ve tur operatörlerinin WhatsApp destek hatlarında yaşıyor.

**Sonuç:** Çevrimdışı harita ve rota: çözülmüş ve ücretsiz. Su yorumları ve tazelik: FarOut çözmüş ama Türkiye'de yok. Yakındakilere SOS: Cairn Live yeni denemiş, kanıtı yok. **Likya Yolu için kürate edilmiş, çok dilli, güvenlik + yerel hizmet + asenkron dayanışma birleşimi: boş.**

---

## 4. Farklılaşma noktaları (gerçekten savunulabilir olanlar)

1. **Rotaya özel derinlik, genel uygulamaların genişliğine karşı.** FarOut'un PCT'de yaptığını Likya Yolu'nda yapmak: her su noktasının mevsimsel durumu, her pansiyonun telefon/fiyat/açık dönemi, her köyün bakkal/dolmuş bilgisi, "bu etapta 2G var ama veri yok" gibi bilgiler. Bunu AllTrails asla yapmaz.
2. **İhtiyaç durum makinesi** (bekleniyor → teklif → kabul → tamamlandı) ve ücretsiz dayanışma ile ücretli hizmet ayrımı. Rakiplerde ya düz yorum var ya düz SOS.
3. **Yerel hizmet ağı**: Pansiyoncular, transfer şoförleri, bagaj taşıyıcılar, köy kadınlarının yaptığı gözleme. Bu ilişkiler ağı, kopyalanması en zor varlıktır ve gelir modelinin temelidir.
4. **Güvenlik protokolü**: Varış onayı, SMS yedekli acil akış, son bilinen konumun rızayla JAK/AFAD'a açılabilmesi. Derneğin ve jandarmanın işbirliğiyle "kayıp yürüyüşçü" protokolü, rakiplerin yapamayacağı bir yerel avantaj.
5. **Çok dillilik + Türkiye bilgisi**: 112 numarası, e-Devlet "112 Acil Yardım" uygulaması, AFAD, yabancılar için pasaport/konaklama bildirimi gibi pratik bilgiler.
6. **Sakla-ve-ilet topluluk verisi**: Yürüyüşçüler çevrimdışı rapor üretir, pansiyonda Wi-Fi'a girince senkronize olur. Düşük yoğunlukta bile çalışır, çünkü gerçek zamanlılık gerektirmez.

**Farklılaşma olmayan şeyler:** Emoji ile ihtiyaç göstermek (UI detayı), MapLibre kullanmak, "yürüyüş modu". Bunlar bir hafta sonunda kopyalanır.

---

## 5. Henüz çözülmemiş teknik ve ticari problemler

### Teknik

- **Çevrimdışı = gerçek zamansız.** Ürün dili buna göre değişmeli: "canlı harita" değil, "son görülme" ve "bugün bu etapta kimler var" panosu.
- **BLE platformlar arası arka plan keşfi**: iOS arka planda reklam yayınlarken servis UUID'lerini "overflow area"ya taşır; bunu yalnızca aynı UUID'yi tarayan başka iOS cihazlar görür. Android bir iPhone'u arka planda keşfedemez (bağlanıp sorgulama hilesi hariç). Android tarafında ekran kapalıyken filtresiz taramalar durur; arka planda düşük güç modu zorlanır; OEM'ler (Xiaomi, Huawei, Samsung) uygulamayı öldürür. Sonuç: iki telefon da **ön planda ve açıkken** çalışan bir BLE özelliği yapılabilir; arka planda "cebimde dururken yanımdan geçeni fark etsin" güvenilir değildir.
- **Yoğunluk / soğuk başlangıç**: Yardım ağı, ağ etkisine bağlı. İlk sezonda yardım isteklerinin çoğu cevapsız kalacak. Bu, kullanıcıya "kimse yok" hissi verir ve ürünü öldürür. Çözüm: asenkron pano + yerel hizmet sağlayıcıları (pansiyoncu "su bırakabilirim" diyebilir) + ilk sezonda tur operatörleriyle anlaşıp ağı tohumlamak.
- **Pil**: Sürekli GPS + BLE + harita = günde bir powerbank. Bölüm 8'de.
- **Çevrimdışı rota mesafesi**: "Kuş uçuşu değil, patika mesafesi" doğru talep; ama genel bir yönlendirme motoru (Valhalla/GraphHopper) gerekmez. Rota üzerinde kümülatif mesafe hesabı yeterli (Bölüm 6).
- **Sahte/bayat veri**: Su noktaları mevsimsel; Nisan'da akan Ekim'de kuru. Tazelik ve doğrulama mekanizması olmadan veri zararlı olur.

### Ticari / hukuki

- **Mevsimsellik**: Yılda ~4 ay aktif kullanım. Abonelik modeli zor; rota başına tek seferlik satın alma ya da sezonluk geçiş daha gerçekçi.
- **Kitle çoğunlukla yabancı**: Pazarlama Türkiye'de değil, Almanya/İngiltere/Rusya/Polonya'daki yürüyüş topluluklarında yapılmalı. Türkçe App Store optimizasyonu tek başına işe yaramaz.
- **Rezervasyon komisyonu ve seyahat acentası mevzuatı (1618 sayılı Kanun / TÜRSAB)**: Konaklama ve transfer rezervasyonundan komisyon alan bir platformun acenta belgesi gerektirip gerektirmediği avukata sorulmalı. Lead-gen (yönlendirme ücreti / sponsorlu listeleme) daha az riskli.
- **KVKK + GDPR**: Konum verisi kişisel veri; kullanıcıların çoğu AB vatandaşı → GDPR de uygulanır. VERBİS kaydı, açık rıza, saklama süreleri, veri konumu (TR veya AB) kararı gerekli.
- **Sorumluluk**: "Kayboldum" butonuna basan ve yardım gelmeyen bir kullanıcı. Kullanım koşulları, net "112'nin yerine geçmez" mesajı ve her acil akışta 112'yi öne koymak şart.
- **Veri kaynağı izinleri**: OSM verisi ODbL ile serbest (atıf şart). Derneğin GPX/etap metinleri telif altında; işbirliği yapılmalı.

---

## 6. Çevrimdışı GPS, harita, navigasyon ve telefonlar arası iletişim nasıl uygulanır?

### Harita

- **MapLibre React Native** (v11, yeni mimari) + `OfflineManager` ile rota koridoru (örn. 10 km genişlik) için çevrimdışı paket indirme. Alternatif: koridoru `.mbtiles` olarak uygulamaya gömmek (vektör karo + hillshade/kontur ile tahminen 100–300 MB; koridor daraltılarak düşürülür).
- **PMTiles çevrimdışı paket mekanizması değildir** (MapLibre Native dokümantasyonu). Sunucuda PMTiles, cihazda offline pack/mbtiles.
- Karo üretimi: OpenMapTiles/Planetiler ile Türkiye güneybatı kesiti; arazi için terrain-RGB karoları.
- **Rota verisi**: Likya Yolu OSM'de ilişki (relation) olarak var; Dernek OSM'yi referans gösteriyor. OSM'den etap bazlı GPX üret, sürümle, uygulama içinde SQLite'ta tut. Güncelleme = veri paketi sürümü.

### GPS çevrimdışı

- Çalışır; A-GPS yardımı olmadığından ilk sabitleme 30 sn–2 dk sürebilir. Yürüyüş modu açılırken şehirde/sinyalde "ısınma" yapılmalı. Barometre (varsa) yükseklik için.

### Navigasyon — motor gerekmeden

- Rota polyline'ı üzerinde **kümülatif mesafe** önceden hesaplanır. Kullanıcının konumu en yakın segmente "snap" edilir; bir sonraki su/pansiyon/köy için **patika boyunca mesafe** = hedefin kümülatif mesafesi − kullanıcınınki. Kuş uçuşu problemi böyle çözülür; Valhalla gerekmez.
- **Rotadan sapma uyarısı**: en yakın segmente dik uzaklık > 50–75 m, 2 dakikadan uzun → uyarı.
- **Yön/pusula oku** hedefe (kuş uçuşu açı, ama metinde "patika boyunca 3,4 km").
- Faz 2'de isteğe bağlı: koridor içindeki OSM patikalarından küçük bir graf çıkarıp cihazda Dijkstra (birkaç bin kenar; hafif). Valhalla-mobile tam motor isterseniz var ama ağır ve az bakımlı.

### Telefonlar arası iletişim — gerçekçi değerlendirme

| Teknoloji                             | Platform                  | Menzil               | Arka plan                                                                                    | Karar                                     |
| ------------------------------------- | ------------------------- | -------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------- |
| BLE reklam (advertising) + tarama     | iOS ↔ Android (ön planda) | 30–100 m             | iOS→Android keşfi arka planda çalışmaz; Android'de filtreli tarama + foreground service şart | Faz 3 deneyi                              |
| Wi-Fi Direct / Wi-Fi Aware            | Yalnız Android            | ~100–200 m           | Sınırlı                                                                                      | Hayır (platformlar arası değil)           |
| Multipeer Connectivity                | Yalnız iOS                | ~50 m                | Sınırlı                                                                                      | Hayır                                     |
| Bridgefy SDK                          | iOS, Android, RN          | ~100 m, çoklu atlama | Satıcı iddiası                                                                               | Teklif bazlı fiyat; değerlendirilebilir   |
| bitchat protokolü (açık kaynak, 2025) | iOS, Android              | ~100 m               | Belirsiz                                                                                     | Teknik referans olarak incelenir          |
| Meshtastic (LoRa)                     | Donanım                   | km'ler               | Donanım                                                                                      | Uygulama değil; partnerlik/kiralama fikri |

**Tek gerçekten anlamlı BLE kullanımı:** Sakla-ve-ilet verisini (su raporları, "ben buradayım" izleri) karşılaşan telefonlar arasında otomatik takas etmek (DTN / epidemik yönlendirme). Düşük yoğunlukta yavaş yayılır, ama sıfırdan iyidir. Bunu bile MVP'ye koymayın; önce Wi-Fi/mobil veri ile senkronizasyonun çalıştığını ve insanların rapor ürettiğini görün.

### Sinyalsiz acil durum için en gerçekçi yol

- **SMS**: 2G/ses kapsaması veri kapsamasından geniştir. Acil ekran, güvenilir kişiye koordinat içeren SMS taslağı açmalı (uygulama SMS'i kullanıcı adına otomatik gönderemez; `sms:` intent/URL ile taslak açılır).
- **112** araması + e-Devlet'in "112 Acil Yardım" uygulamasını önerme (doğrulayın).
- Uydu: Garmin inReach (abonelik, Türkiye'de kullanım mevzuatını kontrol edin); Apple uydu SOS Türkiye'de yok.

---

## 7. iOS ve Android arka plan kısıtları

### iOS

- Arka plan konum için `UIBackgroundModes: location` + "Always" izni. Expo'da `requestBackgroundPermissionsAsync` "Always"e eşlenir. App Store incelemesi gerekçe ister; "yürüyüş takibi ve güvenlik" meşru gerekçedir.
- Kullanıcı uygulamayı zorla kapatırsa (force quit) takip durur; bu sınır herkes için geçerlidir ve kullanıcıya anlatılmalıdır.
- `pausesLocationUpdatesAutomatically`, `distanceFilter`, `desiredAccuracy` ile pil yönetimi; hareketsizken sistem güncellemeyi duraklatabilir.
- Core Bluetooth arka plan: `bluetooth-central` / `bluetooth-peripheral` modları. Arka planda yerel ad yayınlanmaz, servis UUID'leri overflow alanına gider (yalnızca iOS tarayıcılar görür), tarama aralıkları seyrekleşir, overflow alanı başka uygulamalarla paylaşılır. State restoration (TN3115) ile uygulama öldürüldükten sonra bile BLE olaylarıyla uyandırılabilir, ama Android keşfi sorunu çözülmez.
- iOS 26 ile ilgili forumlarda arka plan BLE/navigasyon şikâyetleri var; Apple mühendisinin cevabı "iOS 18'e göre büyük fark yok". Gerçek cihazlarda test şart.

### Android

- `ACCESS_BACKGROUND_LOCATION` ("Her zaman izin ver") ayrı akışla istenir; Google Play için gerekçe formu ve video gerekir.
- Sürekli takip için **foreground service** (`foregroundServiceType="location"`) ve kalıcı bildirim zorunlu. Android 14+ servis tipleri açıkça bildirilmeli; BLE için `connectedDevice`.
- Android 16: foreground service'ten başlatılan arka plan işleri kota'ya tabi. Konum tipi 6 saatlik zaman aşımına tabi değil (dataSync/mediaProcessing tabi); doğrulayın.
- BLE: ekran kapalıyken **filtresiz tarama durur** → ScanFilter + PendingIntent tarama kullanın; arka planda düşük güç modu zorlanır; Doze taramayı askıya alabilir.
- **OEM pil katilleri**: Xiaomi/MIUI, Huawei, Oppo, Samsung agresif öldürür. dontkillmyapp.com rehberleri uygulama içinde gösterilmeli.
- Expo tarafında: Expo Go çalışmaz; **dev client + EAS Build** gerekir. Takip çekirdeği için ya ücretli `react-native-background-geolocation` (Transistorsoft; hareket algılamayla pil optimizasyonu, Android için lisans; güncel fiyatı satıcı sitesinden alın) ya da Expo Modules API ile kendi ince native modülünüz.

---

## 8. Pil tüketimi kontrolü

Hedef: 8 saatlik yürüyüşte %25–35 pil (modern telefon, ekran kapalı, harita açık değil).

1. **Konum örnekleme hıza göre adaptif**: yürüyüşte distanceFilter 25–50 m; durunca (activity recognition / Core Motion) GPS'i düşür veya duraklat; gece/konaklamada otomatik kapat.
2. **Native tarafta toplu yazım**: Konum noktaları native modülde SQLite'a yazılır; JS her noktada uyandırılmaz (bir geliştiricinin Android'de pil sorununu bu şekilde çözdüğü raporlanmış).
3. **Çevrimdışıyken ağ denemesi yok**: Bağlantı dinleyicisi; üstel geri çekilmeli senkron; "sinyal var" olayında tek seferde gönder.
4. **Harita**: Arka planda render yok; çevrimdışı karolar radyoyu uyandırmaz; raster yerine vektör.
5. **BLE** (ileride): Yalnızca yürüyüş modunda; 1 Hz düşük güç reklam; her 5 dk 10 sn tarama; ön planda daha sık.
6. **Kullanıcıya mod sunun**: "Tam takip / Tasarruf (5 dk'da bir) / Yalnızca manuel konum". Yürüyüşçüler powerbank taşır; uygulamanın ne kadar tükettiğini dürüstçe göstermek güven sağlar.
7. **Sinyal arama tüketimi**: Sinyalsiz bölgede modem hücre arar ve pil yer; "uçak modu + GPS" önerisi (GPS uçak modunda çalışır) uygulama içinde ipucu olarak verilmeli.

---

## 9. Güvenlik, gizlilik, sahte bildirimler

### Gizlilik (özellikle yalnız yürüyen kadınlar için)

- Konum paylaşımı **varsayılan kapalı**, süreli (örn. 4 saat), yalnız "yürüyüş modu" açıkken.
- Başkalarına gösterilen konum **kabalaştırılmış** (250 m'ye yuvarlanmış, "~1 km" gibi), gece ve konaklama noktasında otomatik gizlenmiş, geçmiş iz paylaşılmaz.
- Varlık kaydı TTL'li (2 saat güncelleme yoksa haritadan düşer).
- Mesajlaşma karşılıklı kabul olmadan açılmaz; engelle/şikâyet; "yalnız kadınlara görünür" seçeneği.
- KVKK/GDPR: açık rıza metni, veri minimizasyonu, saklama süresi (ham konum 30 gün), silme hakkı, VERBİS kontrolü.

### Sahte ve bayat ihtiyaç bildirimleri

- Telefon numarası doğrulaması (SMS) ihtiyaç/SOS gönderebilmek için; hesap yaşı; oran sınırı.
- İhtiyaçlar **otomatik sona erer** (su 6 saat, konaklama 24 saat); kullanıcı "çözüldü" demezse kapanır.
- Topluluk doğrulama/çözme oyu (FarOut ve Cairn Live modeli); itibar sayacı ("5 kişiye yardım etti").
- Şikâyet + gölge moderasyon; aynı cihazdan tekrarlayan SOS'lara otomatik kısıtlama.
- Ücretli hizmet sunan işletmeler **ayrı rozetle** ve ayrı akışta; dayanışma akışında reklam yasak.

### Acil durum ilkeleri

- Acil ekranın ilk butonu **112**, ikincisi koordinat kopyala/SMS, üçüncüsü uygulama içi SOS.
- SOS, "yardım garanti" vaat etmez; metin açık. Kullanıcı önceden "kaybolursam son konumumu arama-kurtarmaya açabilirsiniz" rızası verebilir; bu, JAK/AFAD işbirliği için zemin.

---

## 10. MVP kapsamı

### MVP'de olacaklar (Bahar 2027 sezonu, ~12 hafta geliştirme)

1. **Çevrimdışı rehber**: Rota koridoru harita paketi, 29 etap (Dernek sürümüne göre), etap profilleri (mesafe, tırmanış, süre), POI'ler (su, pansiyon, kamp, bakkal, dolmuş/taksi, sinyal noktası) tazelik tarihi ve son durumuyla.
2. **Konum ve yol takibi**: GPS konum, rotaya snap, "sonraki su / konaklama: patika boyunca X km", rotadan sapma uyarısı, basit iz kaydı.
3. **Çevrimdışı rapor + senkron**: POI durumu bildir (akıyor/kuru, açık/kapalı, fotoğraf opsiyonel), yeni nokta öner, "buraya su bıraktım"; cihazda outbox, bağlantıda senkron.
4. **Güvenlik**: Yürüyüş planı (başlangıç, hedef, tahmini varış), güvenilir kişi, varış onayı gelmezse önce kullanıcıya sonra kişiye bildirim (push + SMS taslağı), acil ekran (112, koordinat, SMS), son bilinen konum.
5. **Etap panosu (asenkron dayanışma)**: "Bugün/yarın bu etaptayım", ihtiyaç ilanı (emoji + açıklama) ve durum makinesi (bekleniyor → teklif → kabul → tamamlandı), teklif verme, basit mesaj.
6. **Profil**: takma ad, avatar, diller, deneyim; isteğe bağlı diğer alanlar. TR + EN.
7. **Kaba canlı varlık** (ucuz olduğu için): "5 km içinde 3 aktif yürüyüşçü" sayacı ve kabalaştırılmış konum listesi; avatar haritası değil.

### Ertelenecekler

- Gerçek zamanlı hassas avatar haritası (gizlilik + yoğunluk sorunları)
- BLE / Wi-Fi Direct mesh (Faz 3 deneyi)
- Çevrimdışı yönlendirme motoru
- Eşleştirme, rezervasyon, yemek siparişi, bagaj, ekipman kiralama, işletme paneli, pazar yeri
- Fotoğraflı ihtiyaç bildirimi (opsiyonel; bant genişliği ve moderasyon maliyeti)
- Diğer rotalar (şema rota-bağımsız tasarlanır, içerik eklenmez)

### MVP başarı ölçütleri (ilk sezon)

- Harita paketi indiren kullanıcı sayısı; yürüyüş modu başlatan oranı
- Haftada üretilen POI raporu sayısı (hedef: her popüler etapta haftada ≥3)
- Yayınlanan ihtiyaç / karşılanan ihtiyaç oranı (hedef ≥ %30; altındaysa gerçek zamanlı özelliklere hiç yatırım yapma)
- Varış onayı kullanan oran; yanlış alarm sayısı
- Sezon içi D7 tutma (yürüyüş 7–20 gün sürdüğü için anlamlı)

---

## 11. Veritabanı, backend ve mobil mimari

### İlkeler

- **Olay (event) temelli veri**: POI'nin "mevcut durumu" ekleme-yalnız raporlardan türetilir. Çakışma yönetimi çoğunlukla ortadan kalkar: iki cihaz aynı çeşmeye farklı rapor verirse ikisi de kaydedilir, en yeni ve en çok onaylanan öne çıkar.
- **Rota bağımsız şema**: `trail_id` her şeyde; Karia/Aziz Paul içerik eklemesi olur.
- **İstemci üretimli kimlikler (ULID)** ve idempotent upsert; outbox/inbox senkron deseni.
- **Son yazan kazanır (LWW)** yalnız kullanıcıya ait tekil kayıtlarda (profil, yürüyüş planı) ve `version` alanıyla.

### Şema (çekirdek tablolar, PostgreSQL + PostGIS)

```sql
trails(id, slug, name_i18n jsonb, data_version int, bbox geometry(Polygon,4326))
stages(id, trail_id, seq, name_i18n, distance_m, ascent_m, descent_m, track geometry(LineString,4326), cum_start_m)
pois(id ulid, trail_id, type enum[water,lodging,camp,shop,transport,signal,hazard,cache], name_i18n, geom geometry(Point,4326),
     stage_id, track_offset_m, is_paid boolean, business_id null, created_by, created_at, status_derived jsonb)
poi_reports(id ulid, poi_id, user_id, observed_at, status enum[flowing,low,dry,open,closed,ok,damaged,gone],
     note, photo_key, device_created_at, synced_at, confirmations int, flags int)
users(id, phone_hash, email null, locale, created_at)
profiles(user_id, nickname, avatar_key, age_band null, experience, languages text[], about, can_help text[], visibility_prefs jsonb, version int)
trusted_contacts(id, user_id, name, phone, channel enum[sms,push,email])
hikes(id ulid, user_id, trail_id, start_stage_id, end_stage_id, planned_start, planned_eta, status enum[planned,active,arrived,overdue,cancelled],
     last_known geometry(Point,4326), last_known_at, version int)
presence(user_id, geom_coarse geometry(Point,4326), stage_id, updated_at, expires_at)  -- Redis GEO + TTL ile de tutulabilir
needs(id ulid, user_id, trail_id, stage_id, kind enum[water,food,power,firstaid,lost,gear,transport,lodging,buddy,sos],
     geom_coarse, note, photo_key null, status enum[open,offered,accepted,completed,expired,cancelled], expires_at, created_at, version int)
need_offers(id ulid, need_id, helper_id, message, status enum[offered,accepted,declined,completed], created_at)
messages(id ulid, thread_id, sender_id, body, created_at)
businesses(id, trail_id, type, name, geom, contact, verified_at, tier enum[free,sponsored,pro])
flags(id, target_type, target_id, reporter_id, reason, created_at)
devices(id, user_id, platform, push_token, app_version, last_seen)
sync_cursors(user_id, device_id, last_pull_at)
```
Konum geçmişi (`track_points`) yalnız kullanıcının kendi cihazında; sunucuya yalnız `last_known` ve isteğe bağlı iz özeti gider.

### Backend

- **Çatı**: NestJS (ekip büyüyecekse, WebSocket/queue entegrasyonu olgun) veya Elysia+Bun (tek geliştirici, hız). Zor kısımlar çatıda değil; iki seçenek de olur. Karar kriteri: işe alacağınız insanların bildiği.
- **Katmanlar**: REST (senkron, CRUD) + WebSocket (yalnızca çevrimiçi varlık ve ihtiyaç bildirimleri; MVP'de 30 sn'lik polling bile yeter) + Expo Push.
- **PostGIS**: `ST_DWithin` ile yakınlık, `ST_LineLocatePoint` ile rotaya izdüşüm ve `track_offset_m` hesabı (sunucuda POI eklenince önceden hesaplanır).
- **Drizzle**: geometry kolon desteği var; ST_ fonksiyonları için `sql` şablonu. PostGIS yoğun sorgularda raw SQL kaçınılmaz; sorun değil.
- **Redis**: varlık (GEO + TTL), oran sınırlama, push kuyruğu. Kuyruk için BullMQ.
- **Depolama**: S3 uyumlu (fotoğraf, harita paketleri). CDN üzerinden harita paketi dağıtımı.
- **Senkron API**: `POST /sync/push` (outbox toplu), `GET /sync/pull?since=cursor&trail=likya` (delta). Her kayıt `client_id`, `version`, `device_updated_at` taşır.
- **Veri paketi derleme hattı**: OSM → etap GPX + kümülatif mesafeler + POI seed → sürümlü JSON/SQLite + mbtiles; uygulama "veri sürümü 2027.03" indirir.

### Mobil

- **Expo (dev client, EAS)**, expo-router, TypeScript.
- **Veri**: expo-sqlite (Drizzle'ın SQLite sürücüsü ile aynı şema dilini paylaşmak mümkün), outbox tablosu, TanStack Query çevrimiçi okuma için.
- **Harita**: `@maplibre/maplibre-react-native` + OfflineManager; rota ve POI'ler yerel GeoJSON kaynaklarından.
- **Takip çekirdeği**: native modül (Expo Modules API) ya da Transistorsoft; konum → SQLite; JS'e özetle.
- **Arka plan senkron**: expo-background-task (WorkManager / BGTaskScheduler); bağlantı gelince tetik.
- **Durum**: Zustand; çevrimiçi/çevrimdışı tek kaynak (`NetInfo`).
- **Test**: Fiziksel cihazlarda (en az bir Xiaomi, bir Samsung, bir iPhone) 8 saatlik pil ve takip testi; uçak modu senaryoları; zaman atlamalı GPS simülasyonu (iOS'ta GPX ile).

### Mimari diyagram (metin)

```
[Expo App] --SQLite/outbox--> (çevrimdışı) ---sinyal---> [API: /sync, /needs, /hikes, WS]
      |                                                         |
  MapLibre offline pack <---CDN--- [Veri paketi hattı: OSM→GPX/POI/mbtiles]
      |                                                         |
  Native tracking module                             [Postgres+PostGIS] [Redis] [S3] [Push]
```

---

## 12. Gelir ve büyüme

### Gerçekçi gelir kalemleri (sıra önemli)

1. **Rota rehber paketi (FarOut modeli)**: Temel harita ücretsiz; "Likya Yolu Pro paketi" (gelişmiş POI katmanı, çevrimdışı etap notları, yükseklik profilleri, işletme telefonları) 10–20 € tek seferlik veya sezonluk. Yabancı yürüyüşçü için düşük sürtünme; dayanışma özellikleri ücretsiz kalır.
2. **İşletme listeleme ve sponsorluk**: Pansiyon/transfer/bagaj için "doğrulanmış işletme" ücretsiz, öne çıkarma aylık/sezonluk ücretli. Acenta mevzuatına takılmaz.
3. **Yönlendirme/lead ücreti** (rezervasyon komisyonu yerine): "Ara / WhatsApp'tan yaz" butonlarına tıklama bazlı veya sabit sezon ücreti. Komisyon modeline geçmeden önce hukuki görüş.
4. **B2B**: Tur operatörlerine grup takibi/güvenlik paneli (beyaz etiket); seyahat sigortası ortaklığı; Dernek/belediye/Kültür Bakanlığı projeleri; KOSGEB/TÜBİTAK 1512 gibi hibeler.
5. **Çoklu rota**: Karia, Aziz Paul, Kaçkar, Hitit Yolu; sonra Türkiye dışı (Camino'ya girmeyin, doymuş; Balkan/Gürcistan rotaları boş).

### Büyüme kanalları

- Kültür Rotaları Derneği ile resmi veri/işbirliği (kredibilite + mevcut Lycian Way Pro boşluğu).
- Pansiyonlarda QR afiş ("Yarınki etabı indir, su noktalarını gör"): yürüyüşçünün Wi-Fi bulduğu an.
- Yabancı Facebook/Reddit/Telegram grupları, Alman/İngiliz yürüyüş blogları, Kate Clow'un rehber kitabı ekosistemi.
- Tur operatörleriyle ilk sezon tohumlama (rehberler "yardım edebilirim" durumu açar → ağ boş görünmez).
- Sezon sonu "etap raporu" paylaşım kartları (sosyal yayılım).

### Doğrulama (kod yazmadan önce, 4–6 hafta)

1. 20–30 yürüyüşçü görüşmesi (Facebook gruplarından, sezon kapanışında Kaş/Kabak/Çıralı pansiyonlarında). Sorular: su/konaklama bilgisini nereden aldın, kaç kez sinyalsiz kaldın, en kötü an neydi, ne için para ödersin.
2. 10 pansiyoncu/transferci görüşmesi: komisyon mu, listeleme mi, hangi fiyat.
3. **Kodsuz deney**: Bir sezon boyunca etap bazlı Telegram kanalı + Google My Maps su katmanı. Rapor ve ihtiyaç sayısı ölçülür. Eğer insanlar bunu bile kullanmıyorsa uygulama da kullanılmaz.
4. Landing page + bekleme listesi (EN/TR/DE/RU) ile talep sinyali.
5. Teknik spike'lar (toplam 2 hafta): (a) 3 Android OEM + iPhone'da 8 saat arka plan takip ve pil; (b) MapLibre offline pack boyutu/indirme süresi; (c) iOS↔Android ön plan BLE keşfi — 1 günlük test; sonucu belgeleyip BLE'yi kapatın veya Faz 3'e alın.
6. Hukuk: KVKK/GDPR, 1618 sayılı Kanun, acil durum sorumluluk metni.

---

## 13. Yol haritası

| Faz                                | Zaman                            | Çıktı                                                                                                                    | Git/gitme kriteri                                                                                              |
| ---------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| **0 – Keşif**                      | Kasım 2026 – Ocak 2027 (6 hafta) | Görüşme raporu, rakip teardown, veri kaynağı anlaşması (Dernek/OSM), hukuki not, 3 teknik spike raporu, daraltılmış PRD  | ≥%60 görüşmeci su/güvenlik bilgisi için ödemeye/kullanmaya istekli; arka plan takip 3 cihazda 8 saat çalışıyor |
| **1 – MVP**                        | Ocak – Mart 2027 (10–12 hafta)   | Çevrimdışı rehber + takip + rapor/senkron + güvenlik + etap panosu; TR/EN; iOS+Android                                   | Kapalı beta 30 kullanıcı; Nisan başı mağazada                                                                  |
| **2 – Sezon öğrenimi**             | Nisan – Mayıs 2027               | Canlı sezon; moderasyon; ölçümler; pansiyon tohumlama                                                                    | Karşılanan ihtiyaç oranı ≥%30, haftalık rapor hedefleri                                                        |
| **3 – Yaz (ölü sezon) geliştirme** | Haziran – Eylül 2027             | İşletme listeleme + Pro paket; kaba canlı varlık iyileştirme; BLE sakla-ve-ilet deneyi (yalnız ölçütler tutmuşsa); RU/DE | Ödeme yapan ilk 100 kullanıcı; 20 işletme                                                                      |
| **4 – Sonbahar sezonu**            | Ekim – Kasım 2027                | Gelir testi; B2B pilot (1–2 operatör); JAK/AFAD protokolü                                                                | Birim ekonomi: kullanıcı başına edinim maliyeti < Pro paket geliri                                             |
| **5 – Genişleme**                  | 2028                             | Karia / Aziz Paul içerik; işletme paneli; mesh kararı                                                                    | Rota başına içerik maliyeti ve kullanıcı sayısı                                                                |

---

## 14. Teknoloji seçimi üzerine kısa notlar

- **React Native + Expo**: Doğru; ama Expo Go değil, dev client + EAS. Native modül yazmayı göze alın.
- **NestJS vs Elysia**: İkisi de olur; işe alım kriteri belirlesin. Hono üçüncü seçenek.
- **PostgreSQL + PostGIS + Drizzle**: Doğru; PostGIS için raw SQL kabul edin.
- **SQLite**: Doğru; outbox/inbox desenini ilk günden tasarlayın.
- **MapLibre + OSM**: Doğru; çevrimdışı paket + mbtiles; PMTiles yalnız sunucu tarafı.
- **Redis**: MVP'de şart değil, varlık/oran sınırlama için ucuz ekleme.
- **WebSocket**: MVP'de polling + push yeter; WS Faz 2.
- **Bluetooth**: MVP'de yok. Faz 3'te Bridgefy SDK (teklif alın) ya da react-native-ble-plx + native peripheral ile sınırlı ön plan deneyi.

---

## Kaynaklar (araştırmada kullanılanlar)

- Kültür Rotaları Derneği, uygulama ve harita notları: https://cultureroutesinturkey.com/?p=23550 , https://cultureroutesinturkey.com/?p=26522
- Lycian Way Pro (App Store, son güncelleme 2021): https://appadvice.com/app/lycian-way-pro/1463190972
- TrekRight: Lycian Way: https://apps.apple.com/lk/app/id934887392?l=en-gb
- Likya Yolu kitle tahmini (TÜRSAB): https://www.dha.com.tr/gundem/doga-turizminin-en-gozdesi-likya-yolu-2832967
- Su kıtlığı (Kayaköy sonrası 15 km, sonbahar): https://www.outdoorhaber.com/wp-content/uploads/2020/03/likya-yolu-1-fethiye-kayakoy-ovacik.pdf ; https://kuluarpohod.com/en/articles/dost-pohod/likiyskaya-tropa-turcia/
- Kayıp/ölüm haberleri: https://www.evrensel.net/haber/6005949/likya-yolunda-kaybolan-turist-friederike-elisabeth-newrzella-araniyor ; https://www.istiklal.com.tr/genel/likya-yolunda-kaybolan-alman-turistin-cansiz-bedeni-bulundu-1109618h ; https://www.yenicaggazetesi.com/alman-turist-yuruyus-sirasinda-antalyada-kayboldu-1083858h.htm ; https://www.ensonhaber.com/likya-yolunu-ortaya-cikaran-yazar-ayni-yerde-kayboldu.html ; https://www.benguturk.com/asayis/muglada-likya-yolunda-mahsur-kalan-3-kisi-kurtarildi-235950h
- FarOut su durumu ve moderasyon: https://faroutguides.com/new-in-farout-filter-flag-report-for-a-better-trail/ ; https://faroutguides.com/new-farout-feature-provides-water-status-at-a-glance/ ; https://www.garagegrowngear.com/blogs/brand-bios/farout-guides-navigation-phone-app-long-distance-hiking-trails
- Cairn Live: https://mwm.ai/apps/cairn-live/6790159651
- AllTrails Live Share: https://www.alltrails.com/press/alltrails-launches-live-share-real-time-location-sharing
- HiiKER canlı konum: https://support.hiiker.app/article/live-locator-share-your-location-with-others/
- Rakip karşılaştırmaları: https://besthike.com/2025/12/05/hiking-navigation-alltrails-v-gaia-v-komoot ; https://unstar.app/blog/alltrails-komoot-gaia-gps-onx-backcountry-farout-hiking-apps-ranked-2026
- Kaşif (Türk rota uygulaması): https://apps.apple.com/us/app/id6695737385
- Bridgefy menzil ve SDK: https://apps.apple.com/us/app/id975776347 ; https://bridgefy.notion.site/Bridgefy-SDK-Pricing-22cf443f5ef680039882cd88cedac706 ; https://docs.bridgefy.me/sdk
- Mesh mesajlaşma genel bakış (bitchat dahil): https://www.kaspersky.com/blog/mesh-messengers/54192/
- Meshtastic: https://apps.apple.com/sg/app/meshtastic/id1586432531
- Garmin inReach / Messenger: https://apps.apple.com/app/id1550351929 ; https://advnture.com/news/garmin-launches-tiny-inreach-messenger-to-let-you-send-texts-in-the-backcountry
- Apple uydu özellikleri ülke listesi: https://www.macrumors.com/2025/10/10/apple-satellite-features-which-countries/
- iOS BLE overflow area: https://developer.apple.com/forums/thread/837516 ; https://developer.apple.com/forums/thread/760431
- iOS 26 BLE arka plan: https://developer.apple.com/forums/thread/809741
- Android foreground service değişiklikleri: https://developer.android.com/develop/background-work/services/fgs/changes ; arka plan konum sınırları: https://developer.android.com/about/versions/oreo/background-location-limits
- Android BLE tarama kısıtları: https://github.com/barkinglabs/Android-Scanner-Compat-Library ; https://dev.to/ble_advertiser/how-to-keep-your-ble-scan-alive-overcoming-android-10-background-restrictions-for-persistent-5j6
- Expo Location arka plan: https://docs.expo.dev/versions/latest/sdk/location ; Transistorsoft: https://github.com/transistorsoft/react-native-background-geolocation
- Pil için native SQLite yazımı deneyimi: https://athanasopoulos.is-a.dev/blog/building-pathtrace
- MapLibre offline: https://maplibre.org/maplibre-react-native/docs/modules/offline-manager ; https://maplibre.org/maplibre-native-ffi/guides/work-offline/ ; PMTiles sınırı: https://maplibre.org/maplibre-native/android/examples/data/PMTiles/ ; https://openmaptiles.org/mobile
- Valhalla mobil: https://github.com/Rallista/valhalla-mobile ; https://wiki.openstreetmap.org/wiki/Valhalla
