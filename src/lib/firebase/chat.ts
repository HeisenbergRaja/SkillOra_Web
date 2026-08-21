import { db } from './config';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  runTransaction, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot,
  where,
  increment
} from 'firebase/firestore';
import { Chat, ChatMessage } from '@/types/chat';

const CHATS_COLLECTION = 'chats';

export const generateChatId = (skillId: string, studentId: string, publisherId: string): string => {
  return `${skillId}_${studentId}_${publisherId}`;
};

export const getOrCreateChat = async (
  skillId: string, 
  skillTitle: string, 
  publisherId: string, 
  studentId: string
): Promise<Chat> => {
  try {
    const chatId = generateChatId(skillId, studentId, publisherId);
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    const chatDoc = await getDoc(chatRef);

    if (chatDoc.exists()) {
      return chatDoc.data() as Chat;
    } else {
      const newChat: Partial<Chat> = {
        chatId,
        skillId,
        skillTitle,
        studentId,
        publisherId,
        lastMessage: '',
        studentUnreadCount: 0,
        publisherUnreadCount: 0,
        otherParticipantName: '',
        otherParticipantPhotoUrl: null
      };
      
      // Use set with merge to be idempotent/concurrency-safe
      await setDoc(chatRef, newChat, { merge: true });
      
      // Set timestamps separately to use serverTimestamp()
      await updateDoc(chatRef, {
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Fetch the full document to return including timestamps
      const newDoc = await getDoc(chatRef);
      return newDoc.data() as Chat;
    }
  } catch (error) {
    console.error("Error in getOrCreateChat", error);
    throw error;
  }
};

export const sendMessage = async (
  chatId: string, 
  senderId: string, 
  receiverId: string, 
  text: string
): Promise<void> => {
  try {
    const messageId = crypto.randomUUID();
    
    await runTransaction(db, async (transaction) => {
      const chatRef = doc(db, CHATS_COLLECTION, chatId);
      const chatSnapshot = await transaction.get(chatRef);
      
      if (!chatSnapshot.exists()) {
        throw new Error("Chat not found");
      }
      
      const chatData = chatSnapshot.data() as Chat;
      
      const message: Partial<ChatMessage> = {
        messageId,
        senderId,
        receiverId,
        text,
        isRead: false
      };
      
      const messageRef = doc(collection(chatRef, "messages"), messageId);
      
      // Add message
      transaction.set(messageRef, message);
      transaction.update(messageRef, { sentAt: serverTimestamp() });
      
      // Update chat parent
      const isStudentSender = senderId === chatData.studentId;
      const unreadField = isStudentSender ? "publisherUnreadCount" : "studentUnreadCount";
      
      transaction.update(chatRef, {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        [unreadField]: increment(1)
      });
    });
  } catch (error) {
    console.error("Error sending message", error);
    throw error;
  }
};

export const observeMessages = (
  chatId: string, 
  callback: (messages: ChatMessage[]) => void
): (() => void) => {
  const messagesRef = collection(db, CHATS_COLLECTION, chatId, "messages");
  const q = query(messagesRef, orderBy("sentAt", "asc"));
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => doc.data() as ChatMessage);
    callback(messages);
  });
};

export const markAsRead = async (chatId: string, isStudent: boolean): Promise<void> => {
  try {
    const unreadField = isStudent ? "studentUnreadCount" : "publisherUnreadCount";
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    await updateDoc(chatRef, { [unreadField]: 0 });
  } catch (error) {
    console.error("Error marking chat as read", error);
    throw error;
  }
};

export const observePublisherChats = (
  publisherId: string, 
  callback: (chats: Chat[]) => void
): (() => void) => {
  const chatsRef = collection(db, CHATS_COLLECTION);
  const q = query(chatsRef, where("publisherId", "==", publisherId));
  
  return onSnapshot(q, (snapshot) => {
    let chats = snapshot.docs.map(doc => doc.data() as Chat);
    
    // Filter out self-chats and sort by updatedAt descending
    chats = chats.filter(chat => chat.studentId !== chat.publisherId);
    
    chats.sort((a, b) => {
      const timeA = a.updatedAt?.toMillis() || 0;
      const timeB = b.updatedAt?.toMillis() || 0;
      return timeB - timeA;
    });
    
    callback(chats);
  });
};
