# Veri hattı

OSM → etaplar, POI'ler ve harita karoları.

```bash
bun run stages            # Overpass'tan rota ilişkisini çek, etaplara böl → data/out/likya-yolu.stages.json
bun run stages --refresh  # önbelleği yok say
bun run pois              # koridordaki OSM POI'lerini çıkar → data/out/likya-yolu.pois.json
```

Ardından `bun run db:seed` (kökten) etapları veritabanına yazar.

## Harita karoları (PMTiles)

Planetiler ile rota koridorunu kapsayan vektör karolar üretilir; mobil uygulama bunu
MapLibre offline pack / mbtiles olarak indirir. Üretim makinesinde (Java 21+):

```bash
# Türkiye OSM kesiti (Geofabrik) → koridor bbox ile sınırlı PMTiles
java -Xmx4g -jar planetiler.jar --download --area=turkey \
  --bounds=28.9,36.1,30.8,36.9 --maxzoom=15 \
  --output=data/tiles/likya-yolu.pmtiles
```

Arazi gölgesi/kontur için terrain-RGB karoları ayrı bir adımdır (bkz. docs/mimari.md).
PMTiles sunucu tarafında HTTP range isteği destekleyen herhangi bir nesne depoda durabilir.
