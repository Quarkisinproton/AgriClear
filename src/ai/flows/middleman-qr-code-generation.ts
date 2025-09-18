'use server';
/**
 * @fileOverview Generates QR codes for produce batches, allowing consumers to
 * easily access product information by scanning the QR code.
 *
 * - generateQrCode - A function that generates QR codes for produce batches.
 * - GenerateQrCodeInput - The input type for the generateQrCode function.
 * - GenerateQrCodeOutput - The return type for the generateQrCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQrCodeInputSchema = z.object({
  productId: z.string().describe('The unique ID of the product batch.'),
});
export type GenerateQrCodeInput = z.infer<typeof GenerateQrCodeInputSchema>;

const GenerateQrCodeOutputSchema = z.object({
  qrCodeDataUri: z
    .string()
    .describe(
      'The QR code as a data URI (PNG format) that encodes the product ID.'
    ),
});
export type GenerateQrCodeOutput = z.infer<typeof GenerateQrCodeOutputSchema>;

export async function generateQrCode(input: GenerateQrCodeInput): Promise<GenerateQrCodeOutput> {
  return generateQrCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQrCodePrompt',
  input: {schema: GenerateQrCodeInputSchema},
  output: {schema: GenerateQrCodeOutputSchema},
  prompt: `You are a QR code generation expert. You will create a QR code
that encodes the product ID provided. The QR code should be returned as a
data URI (PNG format). Only expose the product ID in the QR code.

Product ID: {{{productId}}}
`,
});

const generateQrCodeFlow = ai.defineFlow(
  {
    name: 'generateQrCodeFlow',
    inputSchema: GenerateQrCodeInputSchema,
    outputSchema: GenerateQrCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
