'use server';
/**
 * @fileOverview Generates QR codes for produce batches, allowing consumers to
 * easily access product information by scanning the QR code.
 *
 * - generateQrCode - A function that generates QR codes for produce batches.
 * - GenerateQrCodeInput - The input type for the generateQrCode function.
 * - GenerateQrCodeOutput - The return type for the generateQrCode function.
 */

import { generateQrCode as generateQrCodeFromLib } from '@/services/qr-code-service';
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


export async function generateQrCode(input: GenerateQrCodeInput): Promise<GenerateQrCodeOutput> {
  const qrCodeDataUri = await generateQrCodeFromLib(input.productId);
  return { qrCodeDataUri };
}
