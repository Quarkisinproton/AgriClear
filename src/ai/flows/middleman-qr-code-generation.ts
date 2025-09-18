'use server';
/**
 * @fileOverview Generates QR codes for produce batches, allowing consumers to
 * easily access product information by scanning the QR code.
 *
 * - generateQrCode - A function that generates QR codes for produce batches.
 */

import { generateQrCode as generateQrCodeFromLib } from '@/services/qr-code-service';
import type { GenerateQrCodeInput, GenerateQrCodeOutput } from '@/ai/schemas/middleman-qr-code-schemas';


export async function generateQrCode(input: GenerateQrCodeInput): Promise<GenerateQrCodeOutput> {
  const qrCodeDataUri = await generateQrCodeFromLib(input.productId);
  return { qrCodeDataUri };
}
