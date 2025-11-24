export type Priority = 'info' | 'warning' | 'critical';

export interface AppNotification {
  id: string;
  room: string;
  title: string;
  body: string;
  priority: Priority;
  sender: string;
  createdAt: string;
}

export interface Ack<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
