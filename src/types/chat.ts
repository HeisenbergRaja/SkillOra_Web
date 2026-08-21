import { Timestamp } from 'firebase/firestore';

export interface Chat {
  chatId: string;
  skillId: string;
  skillTitle: string;
  studentId: string;
  publisherId: string;
  lastMessage: string;
  lastMessageAt?: Timestamp | null;
  studentUnreadCount: number;
  publisherUnreadCount: number;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
  // Supplement information for UI
  otherParticipantName: string;
  otherParticipantPhotoUrl?: string | null;
}

export interface ChatMessage {
  messageId: string;
  senderId: string;
  receiverId: string;
  text: string;
  sentAt?: Timestamp | null;
  isRead: boolean;
}
