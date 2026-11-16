# Altyapı

```bash
cp ../.env.example ../.env   # JWT_SECRET vb. doldurun
docker compose up -d --build
```

- `db`: PostGIS 16. Veri AB'de bir VPS'te (Hetzner) kalır; yedekleme için `pg_dump` cron'u ekleyin.
- `api`: Bun + Elysia; başlangıçta migration uygular.
- `tiles`: PMTiles ve veri paketlerini HTTP Range ile sunar.

Üretimde önüne Caddy/Traefik koyup TLS alın; API ve tiles alt alan adları ayrı olsun.
