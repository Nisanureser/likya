import { z } from "zod";
import { AGE_BANDS, EXPERIENCE_LEVELS, LOCALES } from "../enums";

export const profileSchema = z.object({
  nickname: z.string().min(2).max(32),
  avatarKey: z.string().max(200).nullable().optional(),
  ageBand: z.enum(AGE_BANDS).nullable().optional(),
  experience: z.enum(EXPERIENCE_LEVELS).nullable().optional(),
  languages: z.array(z.string().length(2)).max(8).default([]),
  about: z.string().max(500).nullable().optional(),
  canHelp: z.array(z.string().max(32)).max(10).default([]),
  locale: z.enum(LOCALES).default("tr"),
  visibility: z
    .object({
      /** Canlı haritada görünür (varsayılan kapalı). */
      shareLocation: z.boolean().default(false),
      /** Yalnız kadınlara görünür seçeneği. */
      womenOnly: z.boolean().default(false),
      /** Gece 21:00–07:00 arası otomatik gizle. */
      hideAtNight: z.boolean().default(true),
    })
    .default({ shareLocation: false, womenOnly: false, hideAtNight: true }),
});
export type ProfileInput = z.infer<typeof profileSchema>;
