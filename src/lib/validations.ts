import { z } from "zod";

/**
 * Validasi IANA timezone string.
 * Menggunakan Intl.supportedValuesOf jika tersedia, fallback ke try-catch.
 */
function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Schema untuk request body POST /api/streak/checkin
 */
export const checkinSchema = z.object({
  timezone: z
    .string()
    .min(1, "Timezone tidak boleh kosong")
    .refine(isValidTimezone, {
      message: "Timezone tidak valid. Gunakan format IANA (contoh: Asia/Jakarta)",
    }),
});

/**
 * Schema untuk query params GET /api/streak/history
 */
export const historyQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(365)
    .default(30),
});

export type CheckinInput = z.infer<typeof checkinSchema>;
export type HistoryQuery = z.infer<typeof historyQuerySchema>;
