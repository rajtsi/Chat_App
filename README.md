# Realtime Chat Application

A full-stack realtime chat application built using React, Node.js, Socket.IO, Prisma, PostgreSQL, and WebRTC.

Supports:

* Authentication
* Realtime messaging
* Online presence
* Message seen status
* Realtime sidebar updates
* 1-to-1 direct messaging
* WebRTC video calling
* Profile management
* Avatar uploads

---

# Tech Stack

## Frontend

* React
* Vite
* Tailwind CSS
* Axios
* Socket.IO Client

## Backend

* Node.js
* Express.js
* Socket.IO
* Prisma ORM
* PostgreSQL
* JWT Authentication

## Media & Realtime

* WebRTC
* Cloudinary

---

# Features

## Authentication

* JWT based authentication
* Login / Signup
* Protected socket connections

## Messaging

* Realtime direct messaging
* Automatic sidebar conversation reordering
* Persistent chat history
* Seen status support
* Realtime unread indicators

## Presence

* Online/offline user tracking
* Live presence updates using Socket.IO

## Video Calling

* 1-to-1 WebRTC video calls
* Camera + microphone streaming
* ICE candidate exchange
* SDP offer/answer flow

## Profile System

* Avatar upload
* Bio update
* Profile modal UI

---

# Database Design

## Main Models

* User
* Conversation
* ConversationMember
* Message

## Important Architecture Decisions

### ConversationMember

Used as a scalable membership mapping table between:

* users
* conversations

This architecture supports:

* DMs
* future room/group scalability
* per-user conversation state

### lastMessageAt

Stored inside `Conversation` for:

* fast sidebar sorting
* latest activity ordering

### lastSeenAt

Stored inside `ConversationMember` for:

* unread message detection
* per-user conversation state

### seenAt

Stored inside `Message` for:

* precise realtime seen ticks

---

# Database Indexing

## Conversation Index

```prisma
@@index([lastMessageAt(sort: Desc)])
```

Optimizes:

* inbox/sidebar sorting
* latest active conversation queries

## Message Index

```prisma
@@index([conversationId, createdAt(sort: Asc)])
```

Optimizes:

* chronological message fetching
* chat history loading

---

# Realtime Architecture

## Socket.IO Events

### Messaging

* `message:send`
* `message:new`
* `message:seen`

### Presence

* `presence:update`

### WebRTC

* `webrtc:offer`
* `webrtc:answer`
* `webrtc:ice-candidate`
* `webrtc:busy-signal`

---

# WebRTC Flow

1. User initiates call
2. Offer generated
3. Offer sent through Socket.IO
4. Receiver accepts
5. Answer returned
6. ICE candidates exchanged
7. Peer-to-peer media connection established

Socket.IO is used only for signaling.

Actual media flows directly between peers through WebRTC.

---

# Project Structure

## Backend
```text
server/
├── src/
│   ├── controllers/
|   ├── services/
│   ├── repositories/
│   ├── routes/
│   ├── sockets/
│   ├── middleware/
│   └── utils/
|   └── config/
├── Prisma/
```

## Frontend

```text
client/
├── src/
│   ├── api/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── socket/
│   └── config/
```

---

# Environment Variables

## Backend `.env`

```env
DATABASE_URL=

JWT_SECRET=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=
```

## Frontend `.env`

```env
VITE_API_URL=http://localhost:3000

VITE_SOCKET_URL=http://localhost:3000
```

---

# Installation

## Clone Repository

```bash
git clone <repo-url>
```

---

# Backend Setup

```bash
cd server

npm install
```

## Prisma Migration

```bash
npx prisma migrate dev
```

## Start Backend

```bash
npm run dev
```

---

# Frontend Setup

```bash
cd client

npm install
```

## Start Frontend

```bash
npm run dev
```

---

# Future Improvements

* Group chat support
* Typing indicators
* Media/file sharing
* Push notifications
* Redis socket scaling
* Mobile responsive optimization

---

# Current Scope

Currently supports:

* Direct messaging (DM)
* 1-to-1 video calls

Group chat functionality is not yet enabled in the frontend.
