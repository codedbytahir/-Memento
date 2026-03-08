/**
 * Centralized configuration for AWS SDK clients used throughout the application.
 * It initializes Bedrock, DynamoDB, S3, and SES clients with region and credential settings from environment variables.
 */
import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import { SESClient } from '@aws-sdk/client-ses';
import { SQSClient } from '@aws-sdk/client-sqs';

const config = {
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
};

export const bedrockClient = new BedrockRuntimeClient(config);

export const ddbClient = new DynamoDBClient(config);
export const docClient = DynamoDBDocumentClient.from(ddbClient);

export const s3Client = new S3Client(config);

export const sesClient = new SESClient(config);

export const sqsClient = new SQSClient(config);

export const RESOURCE_NAMES = {
  SESSIONS_TABLE: process.env.SESSIONS_TABLE || 'memento-sessions-ts',
  IMAGES_BUCKET: process.env.IMAGES_BUCKET || 'memento-images-raw-tahir-99',
  PDF_BUCKET: process.env.PDF_BUCKET || 'memento-pdfs-final-tahir-99',
  PROCESSING_QUEUE_URL: process.env.PROCESSING_QUEUE_URL || '',
  SES_FROM_EMAIL: process.env.SES_FROM_EMAIL || '',
};

export const MODEL_IDS = {
  NOVA_LITE: process.env.NOVA_LITE_MODEL_ID || 'us.amazon.nova-lite-v1:0',
  NOVA_SONIC: process.env.NOVA_SONIC_MODEL_ID || 'us.amazon.nova-sonic-v1:0',
};
