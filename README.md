# Patika — Likya Yolu yürüyüşçü dayanışma uygulaması

> Çalışma adı "Patika"; ürün adı kararlaştırılınca paket adları (`@patika/*`, `com.patika.app`) değiştirilir.

Ürün analizi ve yol haritası: `docs/urun-analizi.md`. Mimari kararlar: `docs/mimari.md`.

## Yapı

```
apps/api            Bun + Elysia API (auth, rota/POI, ihtiyaç, güvenlik, varlık, senkron)
apps/mobile         Expo (dev client) + expo-router + SQLite outbox + MapLibre
packages/shared     Alan sabitleri, zod şemaları, coğrafi yardımcılar (snap, patika mesafesi)
packages/db         Drizzle şeması + PostGIS tipleri + migration + seed
tools/data-pipeline OSM → etaplar, POI'ler; PMTiles üretim notları
infra               Docker Compose, Dockerfile, nginx (PMTiles)
docs                Analiz ve mimari
```

## Geliştirme

Gereksinimler: Bun 1.4+, PostgreSQL 16 + PostGIS (yerel ya da `infra/docker-compose.yml`).

```bash
bun install
cp .env.example .env
bun run db:migrate
bun run db:seed          # örnek etap/POI (veri hattı çıktısı varsa onu kullanır)
bun run api              # http://localhost:3000 — OpenAPI: /openapi
bun test                 # shared + api testleri (api testleri yerel Postgres ister)
```

Mobil (gerçek cihaz/dev client gerekir; Expo Go desteklenmez):

```bash
cd apps/mobile
bunx expo prebuild
bunx expo run:android   # veya run:ios
```

Gerçek rota verisi için: `bun run data:stages` (Overpass'tan OSM ilişkisi) ardından `bun run db:seed`.

## Temel ilkeler (koda gömülü)

- Konum paylaşımı varsayılan kapalı; başkalarına yalnız 250 m hücreye yuvarlanmış konum gider (`coarsen`).
- Ham konum izi sunucuya gitmez; yalnız `last_known` (güvenlik) ve rızayla.
- POI durumu ekleme-yalnız raporlardan türetilir; çakışma yok, tazelik ve yakınlık ağırlıklı.
- İhtiyaç durum makinesi: open → offered → accepted → completed | expired | cancelled.
- Her yazma outbox'tan geçer; sunucu ULID + version ile idempotent.
- Acil ekranın ilk adımı 112'dir; uygulama arama-kurtarmanın yerine geçmez.
