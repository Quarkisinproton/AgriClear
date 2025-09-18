/**
 * @fileOverview Defines the data schemas and types for QR code generation.
 *
 * - GenerateQrCodeInput - The input type for the generateQrCode function.
 * - GenerateQrCodeOutput - The return type for the generateQrCode function.
 */

import { z } from 'zod';

export const GenerateQrCodeInputSchema = z.object({
  productId: z.string().describe('The unique ID of the product batch.'),
});
export type GenerateQrCodeInput = z.infer<typeof GenerateQrCodeInputSchema>;

export const GenerateQrCodeOutputSchema = z.object({
  qrCodeDataUri: z
    .string()
    .describe(
      'The QR code as a data URI (PNG format) that encodes the product ID.'
    ),
});
export type GenerateQrCodeOutput = z.infer<typeof GenerateQrCodeOutputSchema>;
