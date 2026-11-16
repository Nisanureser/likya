/** Başkalarına gösterilen konumun yuvarlanacağı hücre boyutu (metre). */
export const COARSE_LOCATION_CELL_M = 250;

/** Varlık (presence) kaydının güncelleme gelmezse düşeceği süre (saniye). */
export const PRESENCE_TTL_SECONDS = 2 * 60 * 60;

/** Rotadan sapma uyarısı için dik uzaklık eşiği (metre). */
export const OFF_TRACK_THRESHOLD_M = 60;

/** Sapma uyarısının tetiklenmesi için eşiğin üstünde kalınması gereken süre (saniye). */
export const OFF_TRACK_GRACE_SECONDS = 120;

/** Canlı haritada gösterilecek yürüyüşçüler için yarıçap (metre). */
export const NEARBY_RADIUS_M = 5000;

/** Ham konum izinin sunucuda saklanma süresi (gün). MVP'de sunucuya iz gönderilmez. */
export const LAST_KNOWN_RETENTION_DAYS = 30;

/** Senkronizasyon: tek seferde gönderilecek en fazla outbox kaydı. */
export const SYNC_BATCH_SIZE = 200;

/** Likya Yolu varsayılan trail slug'ı. */
export const DEFAULT_TRAIL_SLUG = "likya-yolu";
