import { SendRawEmailCommand } from '@aws-sdk/client-ses';
import { sesClient, RESOURCE_NAMES } from './config';

export async function sendBiographyEmail(
  toEmail: string,
  pdfBase64: string,
  fileName: string = 'memento-biography.pdf'
): Promise<boolean> {
  const boundary = `_NextPart_${Date.now()}`;

  const rawEmail = [
    `From: ${RESOURCE_NAMES.SES_FROM_EMAIL}`,
    `To: ${toEmail}`,
    `Subject: Your Memento Biography is Ready`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    'Your biography has been preserved. Please find the PDF version attached to this email.',
    '',
    'Thank you for using Memento.',
    '',
    `--${boundary}`,
    `Content-Type: application/pdf; name="${fileName}"`,
    `Content-Description: ${fileName}`,
    `Content-Disposition: attachment; filename="${fileName}"; size=${Math.round(pdfBase64.length * 0.75)}`,
    'Content-Transfer-Encoding: base64',
    '',
    pdfBase64,
    `--${boundary}--`
  ].join('\n');

  try {
    const command = new SendRawEmailCommand({
      RawMessage: {
        Data: Buffer.from(rawEmail),
      },
    });

    await sesClient.send(command);
    return true;
  } catch (error) {
    console.error('Error sending email with SES:', error);
    return false;
  }
}
