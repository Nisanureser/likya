# Patika — çalışma notları

- Bun workspaces monorepo. Paket yöneticisi `bun`; `npm`/`pnpm` kullanma.
- Dil: kod İngilizce, yorumlar ve kullanıcıya dönük metinler Türkçe (EN çevirileri i18n'de).
- Şema değişince: `packages/shared/src/enums.ts` → `packages/db/src/schema` → `bun run db:generate` → migration'ı gözden geçir → `bun run db:migrate`.
- API testleri yerel Postgres'e bağlanır (`DATABASE_URL`); testten önce `db:migrate` + `db:seed`.
- Konum verisi gizlilik kuralları README'de; başkalarına ham konum döndüren kod yazma.
- Mobil tasarım kararları `docs/tasarim-turu.md` §5'te; tıklanabilir prototip `docs/prototip/`. Ekranlar prototipe birebir yazılır; token'lar `apps/mobile/src/ui/theme.ts`, ortak bileşenler `apps/mobile/src/ui/`.
- Mobil: Expo Go çalışmaz, dev client gerekir (`bunx expo run:ios`). CocoaPods için `LANG=en_US.UTF-8` şart (Ruby 4 + pod 1.17 encoding hatası).
