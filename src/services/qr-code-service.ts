'use server';

import QRCode from 'qrcode';

/**
 * Generates a QR code for the given data.
 * @param data The data to encode in the QR code.
 * @returns A promise that resolves with the QR code as a data URI (PNG format).
 */
export async function generateQrCode(data: string): Promise<string> {
  try {
    // The QR code will just contain the product ID directly.
    const qrCodeDataUri = await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 1,
        width: 256
    });
    return qrCodeDataUri;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw new Error('Could not generate QR code.');
  }
}
