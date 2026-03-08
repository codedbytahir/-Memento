/**
 * TypeScript declaration file for environment variables and global process types.
 * It ensures type safety when accessing AWS credentials, resource identifiers, and application feature flags.
 */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      AWS_SESSION_TOKEN?: string;
      AWS_REGION: string;

      NEXT_PUBLIC_DEV_MODE: 'true' | 'false';
      ENABLE_VOICE: 'true' | 'false';
      ENABLE_EMBEDDINGS: 'true' | 'false';

      SESSIONS_TABLE: string;
      CONNECTIONS_TABLE: string;
      IMAGES_BUCKET: string;
      PDF_BUCKET: string;
      PROCESSING_QUEUE_URL: string;
      WEBSOCKET_URL: string;

      SES_FROM_EMAIL: string;

      NOVA_LITE_MODEL_ID: string;
      NOVA_SONIC_MODEL_ID: string;
      NOVA_EMBEDDINGS_MODEL_ID: string;

      NEXT_PUBLIC_APP_URL: string;
    }
  }
}

export {};
