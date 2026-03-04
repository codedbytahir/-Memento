export interface Session {
  sessionId: string;
  email: string;
  status: 'started' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  transcript?: string[];
  editedStory?: string;
  matchedImages?: string[];
  pdfUrl?: string;
  ttl: number;
}

export interface CreateSessionRequest {
  email: string;
  images: string[];
}

export interface CreateSessionResponse {
  sessionId: string;
}

export interface ProcessRequest {
  sessionId: string;
  transcript: string;
}

export interface ProcessResponse {
  status: Session['status'];
  editedStory?: string;
  matchedImages?: string[];
  error?: string;
}

export interface EmailRequest {
  sessionId: string;
}

export interface EmailResponse {
  sent: boolean;
  error?: string;
}

export interface StatusResponse {
  sessionId: string;
  status: Session['status'];
  progress?: number;
  pdfUrl?: string;
}
