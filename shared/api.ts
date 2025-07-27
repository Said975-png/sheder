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
 * Orders API types
 */
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
}

export interface OrderFormData {
  fullName: string;
  phone: string;
  description: string;
  referenceUrl?: string;
}

export interface OrderRequest {
  items: OrderItem[];
  formData: OrderFormData;
  total: number;
}

export interface OrderResponse {
  success: boolean;
  message: string;
}

/**
 * Chat API types
 */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChatRequest {
  messages: ChatMessage[];
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Contract API types
 */
export interface ContractData {
  id: string;
  userId: string;
  clientName: string;
  clientEmail: string;
  projectType: string;
  projectDescription: string;
  price: number;
  createdAt: string;
  status: "draft" | "active" | "completed" | "cancelled";
  fileName: string;
  fileUrl?: string;
}

export interface CreateContractRequest {
  projectType: string;
  projectDescription: string;
  clientName: string;
  clientEmail: string;
  estimatedPrice: number;
}

export interface CreateContractResponse {
  success: boolean;
  message: string;
  contractId?: string;
  contractUrl?: string;
  error?: string;
}

/**
 * Booking/Reservation API types
 */
export interface BookingData {
  id: string;
  userId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceType: string;
  serviceDescription: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  serviceType: string;
  serviceDescription: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
}

export interface CreateBookingResponse {
  success: boolean;
  message: string;
  bookingId?: string;
  error?: string;
}

export interface GetBookingsResponse {
  success: boolean;
  bookings?: BookingData[];
  error?: string;
}

export interface UpdateBookingRequest {
  bookingId: string;
  status?: BookingData["status"];
  preferredDate?: string;
  preferredTime?: string;
  notes?: string;
}

export interface UpdateBookingResponse {
  success: boolean;
  message: string;
  error?: string;
}
