/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Upload API types
 */
export interface UploadRequest {
  image: string; // base64 encoded image
  filename?: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  imageId?: string;
  processedUrl?: string;
}

export interface GeneratedCode {
  component: string;
  styles: string;
  metadata: {
    title: string;
    description: string;
    imageId: string;
  };
}

/**
 * Authentication API types
 */
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    email: string;
    name: string;
  };
  token?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
