# Skillora Firebase Sync Architecture

This document describes the synchronization flow and authoritative data sources for the cross-platform Skillora ecosystem.

## Core Principle
**Firebase is the Single Source of Truth (SSOT).**
The Android application and Web application are strictly presentation clients. They do not maintain separate, authoritative databases or user pools.

## 1. Authentication
**Source of Truth:** Firebase Authentication.
**Sync Flow:**
- **Android Google Login** → Yields Firebase Auth User (`uid`).
- **Web Google Login** → Yields the exact same Firebase Auth User (`uid`).
- The canonical identity across the ecosystem is this `uid`. It is never safe to use email or client-generated IDs for primary keys.

## 2. Profile & Credits
**Source of Truth:** `users/{uid}` in Firestore.
**Sync Flow:**
- **Profile Updates:** The user's name, avatar, and department are stored in `users/{uid}`. If the Web app updates the profile, Android receives the update via Firestore snapshot, and vice versa.
- **Credits:** `users/{uid}.credits` is the *only* valid representation of a user's spendable currency. 
- *Security Consideration:* Because Credits have real application value (purchasing skills), credit balances must not be arbitrarily modified by unverified client requests. (Note: Currently Web does not independently reward credits to prevent spoofing until secure backend validation is established).

## 3. Marketplace & Upload Skill
**Source of Truth:** `skills` collection in Firestore.
**Sync Flow:**
- **Upload (Web → Android):** A user on the Web creates a skill via `createSkill()`. It writes to the `skills` collection. The Android app's Marketplace automatically populates it because it queries the same collection.
- **Upload (Android → Web):** A user on Android publishes a skill. The Web Marketplace, subscribing via `subscribeToPublishedSkills()`, instantly displays the new skill.
- *Security Consideration:* A skill's `creatorId` must always strictly match the authenticated user uploading the skill. It cannot be spoofed.

## 4. Purchasing & Enrollments
**Source of Truth:** `enrollments/{uid}_{skillId}` in Firestore.
**Sync Flow:**
- **Purchase:** When a user buys a skill, an `enrollment` document is created, and the `creditsRequired` is deducted from the user's `credits` balance (via atomic transaction).
- **Sync:** If purchased on Android, the Web app's "My Learning" tab instantly populates the skill because it subscribes to `enrollments` where `userId == uid`.
- *Security Consideration:* The `enrollment` document ID explicitly uses a composite key to ensure a user cannot be enrolled in the same skill twice.

## 5. Learning Progress
**Source of Truth:** `enrollments/{uid}_{skillId}.dayProgress` array in Firestore.
**Sync Flow:**
- **Progress Tracking:** Completing a learning day writes a timestamp to the corresponding `dayProgress` object and recalculates the overall percentage.
- **Sync:** A user can complete Day 1 on Android, put down their phone, open the Web application, and they will see Day 1 completed. If they complete Day 2 on Web, their Android app will reflect Day 2 completed. 

## 6. Leaderboard
**Source of Truth:** Live query on the `users` collection.
**Sync Flow:**
- **Scoring:** The leaderboard scores are entirely derived from `users/{uid}.totalCreditsEarned` (Credits tab) and `users/{uid}.skillsCompleted` (Skills tab).
- **Ranking:** The rank is calculated dynamically on both clients using the same 1-2-2-4 tie-breaking algorithm.
- **Sync:** Because both Android and Web use identical query parameters (`orderBy(field, "desc")`, `limit(50)`) and tie-breaking logic, the visual leaderboards match perfectly without requiring a separate, vulnerable `leaderboard` collection.
