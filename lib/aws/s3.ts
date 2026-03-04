import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, RESOURCE_NAMES } from './config';

export async function uploadImage(sessionId: string, index: number, imageBase64: string): Promise<string> {
  const buffer = Buffer.from(imageBase64.split(',')[1] || imageBase64, 'base64');
  const key = `sessions/${sessionId}/image-${index}.jpg`;

  const command = new PutObjectCommand({
    Bucket: RESOURCE_NAMES.IMAGES_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg',
  });

  await s3Client.send(command);
  return key;
}

export async function uploadPDF(sessionId: string, pdfBlob: Blob): Promise<string> {
  const buffer = Buffer.from(await pdfBlob.arrayBuffer());
  const key = `sessions/${sessionId}/biography.pdf`;

  const command = new PutObjectCommand({
    Bucket: RESOURCE_NAMES.PDF_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'application/pdf',
  });

  await s3Client.send(command);
  return key;
}

export async function getPresignedUrl(key: string, bucket: string = RESOURCE_NAMES.PDF_BUCKET): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 * 24 }); // 24 hours
}
