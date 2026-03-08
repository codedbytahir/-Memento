/**
 * Centralized type definitions for API request and response structures.
 * It re-exports session-related types to provide a clean and consistent interface for backend communication.
 */
import { CreateSessionRequest, CreateSessionResponse, ProcessRequest, ProcessResponse, EmailRequest, EmailResponse, StatusResponse } from './session';

export type {
  CreateSessionRequest,
  CreateSessionResponse,
  ProcessRequest,
  ProcessResponse,
  EmailRequest,
  EmailResponse,
  StatusResponse,
};
