# Skillora Chat Architecture

## Overview
Skillora implements a fully synchronized, cross-platform real-time chat system between Web and Android using Firebase Firestore. 

The architecture guarantees that both platforms access the exact same underlying conversation data by strictly matching:
- Firebase Auth UID for User Identities
- Deterministic Conversation IDs
- Unified Firestore Collections
- Strict Subcollection Topologies

---

## 1. Firebase Collections
There is exactly one authoritative location for chat data in the Firebase project:

### Parent Collection: `chats`
Contains conversation metadata and unread counts.
**Document ID Algorithm:** `${skillId}_${studentId}_${publisherId}`

### Subcollection: `chats/{chatId}/messages`
Contains individual messages within the conversation.
**Document ID:** Random UUID generated client-side.

> [!WARNING]
> No platform-specific duplicates (e.g. `webChats`, `messagesWeb`) are permitted.

---

## 2. Learner Chat Architecture
**Entry Point (Web):** `My Learning` -> `[Skill]` -> `Chat Creator`
**Route:** `/chat?skillId=[skillId]`

- The learner opens the chat. The Web App knows the current user is the student (`studentId = currentUserId`).
- The `publisherId` is fetched from the `Skill` metadata.
- A deterministic `chatId` is computed.
- The UI initializes a real-time `onSnapshot` listener over `chats/{chatId}/messages`.

---

## 3. Creator Chat Architecture
**Entry Point (Web):** `Profile` -> `Learner Chats`
**Route:** `/chat/list` -> `/chat?skillId=[skillId]&studentId=[studentId]`

- The Creator accesses a centralized list of all active conversations.
- Web runs a query over `chats` where `publisherId == currentUserId`.
- Clicking a learner conversation passes both the `skillId` and `studentId` via URL search parameters.
- The same Chat Window component resolves the deterministic ID and observes messages.

---

## 4. Message Schema & Behavior
A sent message updates Firebase atomically across two nodes using a `runTransaction` batch:
1. Inserts the `ChatMessage` into `chats/{chatId}/messages`.
2. Updates `lastMessage`, `lastMessageAt`, and increments the opposite participant's `unreadCount` on the parent `Chat` document.

**Message Properties:**
```typescript
interface ChatMessage {
  messageId: string;
  senderId: string;
  receiverId: string;
  text: string;
  sentAt?: Timestamp | null;
  isRead: boolean;
}
```

---

## 5. Security Rules
For security, Firestore rules MUST enforce the following on the `chats` collection:

1. **Read Authorization:**
   ```javascript
   allow read: if request.auth != null && (request.auth.uid == resource.data.studentId || request.auth.uid == resource.data.publisherId);
   ```

2. **Write Authorization:**
   ```javascript
   allow write: if request.auth != null && (request.auth.uid == request.resource.data.studentId || request.auth.uid == request.resource.data.publisherId);
   ```

No user should be able to access a conversation document unless their authenticated UID securely matches one of the participant fields.

---

## 6. Flow Integration

### Web -> Android
- **Web App** securely writes `ChatMessage` utilizing `serverTimestamp()`.
- **Android App** has an active `SnapshotListener` observing `orderBy("sentAt", ASCENDING)`.
- Android receives the payload exactly as it expects and renders the UI immediately.

### Android -> Web
- **Android App** sends a message utilizing its transaction loop.
- **Web App** receives an update via `onSnapshot` on `chats/{chatId}/messages`.
- The React state reconciles the new array and scrolls gracefully to the bottom.
