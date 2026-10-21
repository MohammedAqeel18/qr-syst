
import { z } from "zod";

export const createQRCodeSchema = z.object({
  name: z.string().trim().min(2).max(100),

  iosUrl: z
    .string()
    .url()
    .refine((value) => {
      try {
        const url = new URL(value);

        return (
          url.protocol === "https:" &&
          url.hostname === "apps.apple.com"
        );
      } catch {
        return false;
      }
    }, "A valid Apple App Store URL is required."),

  androidUrl: z
    .string()
    .url()
    .refine((value) => {
      try {
        const url = new URL(value);

        return (
          url.protocol === "https:" &&
          url.hostname === "play.google.com"
        );
      } catch {
        return false;
      }
    }, "A valid Google Play Store URL is required."),
});

export type CreateQRCodeInput = z.infer<
  typeof createQRCodeSchema
>;
