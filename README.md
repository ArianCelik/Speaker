# Speaker

Speaker is a modern messaging application built with Electron, React, and TypeScript. It offers real-time communication with a focus on security and ease of use.

## Technology Stack

### Client
- **Framework:** Electron + React + TypeScript
- **Styling:** CSS / Bootstrap
- **State Management:** @preact/signals-react
- **Networking:** Axios, Socket.io-client


### Server
- **Runtime:** Bun
- **Framework:** Express
- **Database:** MongoDB (via MongoClient)
- **Real-time:** Socket.io
- **Security:** bcrypt, jose (JWT)

## Features

- **Real-time Messaging:** Instant sending and receiving of messages via WebSockets.
- **User Management:** Secure registration and login with JWT-based access and refresh tokens.
- **Friend System:** Add friends and manage private chat histories.
- **Emoji Support:** Integrated emoji picker for interactive chats.

## Project Structure

```Structure
Speaker/
├── client/           # Electron + React Frontend
│   ├── src/          # Source code (electron-vite structure)
│   └── package.json  # Client dependencies and scripts
├── server/           # Bun + Node.js Backend
│   ├── server.js     # Main server logic
│   ├── database.js   # MongoDB connection
│   └── package.json  # Server dependencies
└── README.md         # This file
```

## Installation & Setup

Make sure that [Bun](https://bun.sh/) is installed on your system.

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Speaker
```

### 2. Setup Server
1. Switch to the server directory: `cd server`
2. Install dependencies: `bun install`
3. Create a `.env` file (Example):
   ```env
   MONGODB_URI=mongodb://localhost:27017
   JWT_SECRET=your_super_secret
   ```
4. Add your SSL certificates in `server/certs/` (`localhost.pem` and `localhost-key.pem`).

### 3. Setup Client
1. Switch to the client directory: `cd client`
2. Install dependencies: `bun install`

## Running the Application

### Start Server
```bash
cd server
bun run start
```

### Start Client
```bash
cd client
bun run dev
```

## Build Instructions

To build the application for different platforms:

```bash
cd client
# Windows
bun run build:win

# macOS
bun run build:mac

# Linux
bun run build:linux
```

## Future Implementations

- **New Name:** Think of a better name lol.
- **Security:** End-to-end encrypted communication.
- **Group Chat:** Create groups and chat with multiple people.
- **Voice and Video Chat:** WebRTC integration for direct communication.
- **Screen Sharing:** Share your screen during a call.
- **Recording:** Option to record conversations or screen shares.

---
Developed by **Arian Celik**
