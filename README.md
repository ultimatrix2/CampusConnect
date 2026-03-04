<a href="https://weekendofcode.computercodingclub.in/"> <img src="https://i.postimg.cc/njCM24kx/woc.jpg" height=30px> </a>
<div align="center">
   
# CampusConnect

CampusConnect is a full-stack college networking platform designed to bridge the gap between freshers and seniors. It fosters mentorship, collaboration, and real-time communication within the college community. The app integrates competitive coding platform data (Codeforces & LeetCode), offers a profile-matching algorithm for mentor–mentee pairing, provides a real-time chat system, a community post feed, and a collaborative code editor.

</div>

---

<div align="center">

![React](https://img.shields.io/badge/React-000000?style=for-the-badge&logo=react&logoColor=61DAFB) 
![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-311B92?style=for-the-badge&logo=redux&logoColor=white) 
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-004D40?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8) 
![Socket.io Client](https://img.shields.io/badge/Socket.io%20Client-212121?style=for-the-badge&logo=socketdotio&logoColor=white) 
![Axios](https://img.shields.io/badge/Axios-311B92?style=for-the-badge&logo=axios&logoColor=white) 
![Monaco Editor](https://img.shields.io/badge/Monaco%20Editor-1E1E1E?style=for-the-badge&logo=visualstudiocode&logoColor=007ACC) 
![Chart.js](https://img.shields.io/badge/Chart.js-B71C1C?style=for-the-badge&logo=chartdotjs&logoColor=white) 
![Calendar Heatmap](https://img.shields.io/badge/Heatmap-212121?style=for-the-badge&logo=github&logoColor=yellow) 
![Node.js](https://img.shields.io/badge/Node.js-1B5E20?style=for-the-badge&logo=node.js&logoColor=white) 
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) 
![MongoDB](https://img.shields.io/badge/MongoDB-1B5E20?style=for-the-badge&logo=mongodb&logoColor=white) 
![bcrypt](https://img.shields.io/badge/bcrypt-1A237E?style=for-the-badge) 
![Google OAuth](https://img.shields.io/badge/Google%20OAuth-B71C1C?style=for-the-badge&logo=google&logoColor=white) 
![Cloudinary](https://img.shields.io/badge/Cloudinary-311B92?style=for-the-badge&logo=cloudinary&logoColor=white) 
![Nodemon](https://img.shields.io/badge/Nodemon-1B5E20?style=for-the-badge&logo=nodemon&logoColor=white)

</div>

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Feature Details](#feature-details)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Screenshots](#screenshots)
- [Contributors](#contributors)
- [Future Scope](#future-scope)

---

## Features

- **Authentication** — JWT-based sign-up/login with MNNIT email validation and Google OAuth2 integration.
- **Real-Time Chat** — One-on-one messaging with text, emojis, and file attachments powered by Socket.io.
- **Community Posts** — Create posts with images, videos, documents, and auto-generated link previews. Supports comments with threaded replies, likes, and hashtags.
- **Profile Matching** — Cosine-similarity algorithm that suggests mentor–mentee connections based on shared skills and rating differences.
- **Connections** — Send, accept, and reject connection requests with real-time notifications.
- **Coding Platform Integration** — Fetches and displays Codeforces and LeetCode stats (ratings, problems solved, contest history) with auto-updating leaderboards.
- **Collaborative Code Editor (CodeLab)** — Room-based real-time code editing with Monaco Editor and language selection.
- **Notifications** — Real-time alerts for connection requests, messages, and comments.
- **Activity Heatmap & Charts** — Visual data representation of coding activity and rating progression.

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Redux Toolkit** | Global state management |
| **React Router v7** | Client-side routing |
| **Tailwind CSS** | Utility-first styling |
| **Radix UI** | Accessible UI component primitives (Dialog, Dropdown, Tabs, Tooltip, etc.) |
| **Socket.io Client** | Real-time WebSocket communication |
| **Axios** | HTTP requests to backend APIs |
| **Monaco Editor** | In-browser code editor (CodeLab feature) |
| **Chart.js / react-chartjs-2** | Rating and performance charts |
| **react-calendar-heatmap** | Coding activity heatmap |
| **react-markdown + remark-gfm** | Markdown rendering in posts |
| **react-syntax-highlighter** | Code block syntax highlighting |
| **Lucide React** | Icon library |
| **react-hot-toast / react-toastify** | Toast notifications |
| **emoji-picker-react** | Emoji picker in chat |
| **Craco** | Create React App configuration override |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express.js** | REST API framework |
| **MongoDB + Mongoose** | NoSQL database and ODM |
| **Socket.io** | Real-time bidirectional communication (chat, code sync, notifications) |
| **JSON Web Tokens (JWT)** | Stateless authentication |
| **bcryptjs** | Password hashing |
| **Google Auth Library** | Google OAuth2 sign-in |
| **Cloudinary** | Cloud-based image/video/file storage |
| **Multer** | File upload middleware |
| **node-cron** | Scheduled jobs (auto-update coding platform ratings) |
| **Axios** | HTTP client for external API calls (Codeforces, LeetCode) |
| **Cheerio / jsdom** | HTML parsing for link preview extraction |
| **Validator** | Input data validation |
| **dotenv** | Environment variable management |
| **Nodemon** (dev) | Auto-restart server on file changes |

---

## Folder Structure

```
CampusConnect/
├── Backend/
│   ├── config/
│   │   ├── cloudinary.js           # Cloudinary SDK configuration
│   │   ├── multer.js               # Multer file-upload setup
│   │   └── socket.js               # Socket.io initialization and event handlers
│   ├── controllers/
│   │   ├── authController.js       # Register, login, JWT generation
│   │   ├── userController.js       # Profile CRUD, fetch all users
│   │   ├── chatController.js       # Send, retrieve, edit, delete messages
│   │   ├── postController.js       # Create, edit, like, delete posts
│   │   ├── commentController.js    # Comments and threaded replies
│   │   ├── matchController.js      # Profile matching (cosine similarity)
│   │   ├── connectionController.js # Connection request lifecycle
│   │   ├── notificationController.js # Real-time notifications
│   │   ├── googleAuthController.js # Google OAuth2 handler
│   │   ├── linkPreviewController.js# Extract metadata from URLs
│   │   └── platformController/
│   │       ├── codeforcesController.js # Codeforces stats via API
│   │       └── leetcodeController.js   # LeetCode stats via GraphQL
│   ├── cron/
│   │   └── updateRatings.js        # Scheduled job: update coding ratings every 6 hours
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT token verification
│   │   └── upload.middleware.js    # Multer config for different upload types
│   ├── models/
│   │   ├── User.js                 # User schema (profile, skills, social links, ratings)
│   │   ├── Chat.js                 # Messages and chat participants
│   │   ├── Post.js                 # Community posts with media and link previews
│   │   ├── Comment.js              # Comments with nested replies
│   │   ├── ConnectionRequest.js    # Mentor–mentee connection requests
│   │   ├── Notification.js         # Real-time notification records
│   │   ├── Room.js                 # CodeLab collaboration sessions
│   │   └── Report.js              # Content moderation reports
│   ├── routes/
│   │   ├── authRoutes.js           # /api/auth — register, login, Google OAuth
│   │   ├── userRoutes.js           # /api/user — profile operations
│   │   ├── chatRoutes.js           # /api/chat — messaging
│   │   ├── postRoutes.js           # /api/post — community posts
│   │   ├── commentRoutes.js        # /api/comment — comments
│   │   ├── matchRoutes.js          # /api/match — profile matching
│   │   ├── connectionRoutes.js     # /api/connection — connection requests
│   │   ├── notificationRoutes.js   # /api/notification — notifications
│   │   ├── codeSessionRoutes.js    # /api/code — collaborative coding rooms
│   │   └── routeCodeforces.js      # /api/codeforces — Codeforces data
│   ├── utils/
│   │   └── cloudinaryUpload.js     # Cloud upload helper
│   ├── server.js                   # Express app entry point, MongoDB connection, Socket.io init
│   └── package.json
│
├── Frontend/
│   ├── public/                     # Static assets
│   ├── src/
│   │   ├── App.js                  # Route configuration
│   │   ├── index.js                # React entry point
│   │   ├── socket.js               # Socket.io client setup
│   │   ├── chartSetup.js           # Chart.js global configuration
│   │   ├── Pages/
│   │   │   ├── Chat.jsx            # Real-time messaging UI
│   │   │   ├── Community.jsx       # Post feed with comments
│   │   │   ├── Profile.jsx         # User profile editor
│   │   │   ├── OtherProfile.jsx    # View other user profiles
│   │   │   ├── ProfileMatching.jsx # Match suggestions
│   │   │   ├── CodeLab.jsx         # Collaborative code editor
│   │   │   ├── UsersList.jsx       # Browse all users
│   │   │   └── Search.jsx          # Search functionality
│   │   ├── Components/
│   │   │   ├── Home.jsx            # Dashboard
│   │   │   ├── Login.jsx           # Auth form
│   │   │   ├── Navbar.jsx          # Top navigation bar
│   │   │   ├── Sidebar.jsx         # Left sidebar navigation
│   │   │   ├── DashboardLayout.jsx # Main layout wrapper
│   │   │   ├── CodeforcesLeaderboard.jsx # Codeforces rankings
│   │   │   ├── LeetcodeLeaderboard.jsx   # LeetCode rankings
│   │   │   ├── RatingChart.jsx     # Performance graph
│   │   │   ├── ActivityHeatmap.jsx # Contribution calendar heatmap
│   │   │   ├── ProblemStatsCard.jsx# Problem stats visualization
│   │   │   ├── NotificationDropdown.jsx  # Notification bell
│   │   │   ├── MatchCard.jsx       # Match profile card
│   │   │   ├── ContestRankingCard.jsx    # Contest stats
│   │   │   ├── RatingBadge.jsx     # Rating display badge
│   │   │   ├── TopicAnalysis.jsx   # Skills/topics chart
│   │   │   ├── AwardsSection.jsx   # Achievements section
│   │   │   ├── EditProfileDialog.jsx     # Profile edit modal
│   │   │   ├── CodeLab/            # Code editor sub-components
│   │   │   └── ui/                 # Reusable Radix UI components
│   │   ├── redux/
│   │   │   ├── store.js            # Redux store configuration
│   │   │   └── userSlice.js        # User state slice
│   │   ├── lib/                    # Utility functions
│   │   ├── chatApiCalls/           # Chat API helper functions
│   │   └── Assests/                # Images and static assets
│   ├── tailwind.config.js          # Tailwind CSS customization
│   ├── craco.config.js             # Craco configuration overrides
│   ├── postcss.config.js           # PostCSS configuration
│   └── package.json
│
├── assets/                         # Project-level assets (screenshots)
└── README.md
```

---

## Feature Details

### 1. Authentication & Security

- **JWT Authentication** — Users receive a JSON Web Token on login (30-day expiration) stored in localStorage. All protected routes verify the token via `authMiddleware`.
- **Email Validation** — Registration is restricted to `@mnnit.ac.in` email addresses.
- **Password Security** — Passwords are hashed using bcryptjs with 10 salt rounds.
- **Google OAuth2** — Users can sign in with their Google account via the Google Auth Library.

### 2. Real-Time Chat

- One-on-one direct messaging between connected users.
- Supports **text messages, emojis, and file attachments** (uploaded via Cloudinary).
- **Edit and delete** sent messages.
- Messages are marked as read/unread.
- Chat history can be cleared per-user (tracked via `clearedAt` timestamps).
- **Socket.io events:** `join-chat`, `send-message`, `edit-message`, `delete-chat`, `receive-message`.

### 3. Community Posts

- Create posts with **text, images, videos, and documents**.
- **Automatic link preview** extraction (fetches meta title, description, and image from URLs using Cheerio).
- **Hashtag support** with trending tag aggregation.
- **Like/unlike** posts.
- **Threaded comments** — comment on posts and reply to other comments with nested replies.
- Built-in **bad word content filter** for moderation.
- **Markdown rendering** with GitHub Flavored Markdown and syntax-highlighted code blocks.

### 4. Profile Matching

- **Cosine similarity algorithm** compares user skill tags to find the best mentor–mentee matches.
- Filters by common skills, rating differences (mentors typically have higher ratings), and excludes already-connected users.
- Prevents duplicate connection requests.

### 5. Connection System

- **Send connection request** → status: Pending
- **Accept request** → both users added to each other's connections list
- **Reject request** → request deleted; can be resent later
- Real-time notifications for connection activity.

### 6. Coding Platform Integration

- **Codeforces** — Fetches user statistics (rating, max rating, problems solved, hacks) via the Codeforces REST API.
- **LeetCode** — Fetches user statistics (problems solved by difficulty, ranking) via the LeetCode GraphQL API.
- **Auto-update** — A cron job runs every 6 hours to refresh all users' coding platform ratings.
- **Leaderboards** — Ranked tables for both platforms, sortable and searchable.
- **Charts & Heatmaps** — Rating progression charts (Chart.js) and activity heatmaps (react-calendar-heatmap).

### 7. Collaborative Code Editor (CodeLab)

- **Room-based sessions** — Users create or join a coding room with a unique room ID.
- **Real-time code sync** — Powered by Monaco Editor and Socket.io; all participants see edits instantly.
- **Language selection** — Choose from supported programming languages.
- **Host–participant model** — Room creator acts as host.

### 8. Notifications

- Real-time in-app notifications for connection requests, messages, and community activity.
- Notification types: `connection_request`, `info`, `alert`.
- Mark individual or all notifications as read.
- Delivered via Socket.io and persisted in MongoDB.

### 9. File Uploads

- **Cloudinary** handles all media storage (profile pictures, resumes, post attachments).
- **Multer** middleware processes uploads before forwarding to Cloudinary.
- Supported file types: images, videos, PDFs, and documents.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas)
- [Cloudinary](https://cloudinary.com/) account (for file uploads)
- [Google Cloud Console](https://console.cloud.google.com/) project (for Google OAuth2)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ultimatrix2/CampusConnect.git
   cd CampusConnect
   ```

2. **Install backend dependencies**

   ```bash
   cd Backend
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd ../Frontend
   npm install
   ```

4. **Set up environment variables** (see [Environment Variables](#environment-variables))

5. **Run the backend**

   ```bash
   cd Backend
   npm run dev
   ```

6. **Run the frontend** (in a separate terminal)

   ```bash
   cd Frontend
   npm start
   ```

7. The frontend will be available at `http://localhost:3000` and the backend API at `http://localhost:5001` (or your configured port).

---

## Environment Variables

Create a `.env` file in the `Backend/` directory with the following variables:

| Variable | Description |
|---|---|
| `PORT` | Server port (default: `5001`) |
| `MONGO_URL` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID |

---

## Screenshots

* **Profile**

  ![Profile](assets/images/profile.png)

* **LeaderBoard**

  ![LeaderBoard](assets/images/LeaderBoard.png)

* **Community**

  ![Community](assets/images/community.png)

* **Profile Matching**

  ![Profile matching](assets/images/profilematch.png)

* **Chat**

  ![Chat](assets/images/chat.png)

* **Code Arena**

  ![Code Arena](assets/images/codearena.png)

---


### Made at:

<a href="https://weekendofcode.computercodingclub.in/"> <img src="https://i.postimg.cc/Z9fC676j/devjam.jpg" height=30px> </a>
