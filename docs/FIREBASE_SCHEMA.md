# Skillora Firebase Schema

This document maps the exact real-time Firestore database schema shared perfectly between the Skillora Android and Web applications.

## `users` Collection
**Purpose:** Stores canonical user profiles and core statistical/credit data.
**Document ID:** Firebase Authentication UID
**Important Fields:**
- `userId` (string) - Matches Document ID
- `name` (string) - Display Name
- `email` (string)
- `profileImageUrl` (string)
- `credits` (number) - Current spendable currency.
- `totalCreditsEarned` (number) - Lifetime accumulation, acts as the primary score for the 'Credits' Leaderboard.
- `skillsCompleted` (number) - Acts as the primary score for the 'Skills' Leaderboard.

**Security:**
- **Read:** Publicly readable (for Leaderboard and Creator details).
- **Write:** Authenticated users can only update their own document `uid == request.auth.uid`. (In production, credit increments must be protected by server-side rules or Cloud Functions).

## `skills` Collection
**Purpose:** The global marketplace catalog of uploaded content.
**Document ID:** Auto-generated Firestore ID
**Important Fields:**
- `creatorId` (string) - Refers to `users/{uid}`.
- `title` (string)
- `description` (string)
- `category` (string)
- `creditsRequired` (number) - Price to purchase.
- `status` (string) - Usually "published".
- `roadmap` (array) - Collection of objects representing the days of learning, each with `id`, `dayNumber`, `title`, and `description`.

**Security:**
- **Read:** Publicly readable for marketplace browsing.
- **Write:** Only the user matching `creatorId` can modify their own skill records.

## `enrollments` Collection
**Purpose:** Tracks when a user spends credits to buy a skill, and their ongoing learning progress.
**Document ID:** Composite key: `{userId}_{skillId}`
**Important Fields:**
- `userId` (string) - Refers to `users/{uid}`
- `skillId` (string) - Refers to `skills/{skillId}`
- `progress` (number) - Percentage completion (0-100).
- `completedDays` (number)
- `totalDays` (number)
- `roadmapCompleted` (boolean)
- `dayProgress` (array) - Objects containing `dayId`, `completed` (boolean), and `completedAt` (timestamp).

**Security:**
- **Read:** Users can only read enrollments where `userId == request.auth.uid`.
- **Write:** Users can only create/update enrollments for their own UID.

## Leaderboard (Dynamic)
The leaderboard is *not* a separate collection. It is a live query directly on the `users` collection:
- `orderBy("totalCreditsEarned", "desc")`
- `orderBy("skillsCompleted", "desc")`
Ties are resolved locally on the client using competition ranking.
