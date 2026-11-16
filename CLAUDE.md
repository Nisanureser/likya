# Patika — çalışma notları

- Bun workspaces monorepo. Paket yöneticisi `bun`; `npm`/`pnpm` kullanma.
- Dil: kod İngilizce, yorumlar ve kullanıcıya dönük metinler Türkçe (EN çevirileri i18n'de).
- Şema değişince: `packages/shared/src/enums.ts` → `packages/db/src/schema` → `bun run db:generate` → migration'ı gözden geçir → `bun run db:migrate`.
- API testleri yerel Postgres'e bağlanır (`DATABASE_URL`); testten önce `db:migrate` + `db:seed`.
- Konum verisi gizlilik kuralları README'de; başkalarına ham konum döndüren kod yazma.
- Mobil ekran/tasarım henüz kararlaştırılmadı; `app/` altına yalnız altyapı ekle, görsel tasarım ayrı turda.
