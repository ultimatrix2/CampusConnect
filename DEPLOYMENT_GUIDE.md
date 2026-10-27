# 🚀 CampusConnect Deployment & Changes Guide

This document outlines all modifications made to prepare **CampusConnect** for cloud deployment, along with a complete step-by-step guide to hosting both the backend and frontend **100% for free**.

---

## 📌 Summary of Changes Made

To deploy without altering your application's architecture or features, the following adjustments were made:

### 1. Centralized Backend URL in Frontend
- **Problem**: 15+ frontend components and pages had `http://localhost:5001` hardcoded. In production, this would make the browser try to contact the user's local computer instead of your cloud server.
- **Solution**:
  - Created [`Frontend/src/config.js`](Frontend/src/config.js) which exports `API_BASE_URL`.
  - It dynamically reads `process.env.REACT_APP_API_URL`.
  - If `REACT_APP_API_URL` is not provided (e.g. running on your laptop), it safely defaults to `http://localhost:5001`.
  - All occurrences across components (`Login.jsx`, `Chat.jsx`, `Community.jsx`, `Profile.jsx`, `socket.js`, `RoomDialog.jsx`, `userSlice.js`, etc.) now import and use `API_BASE_URL`.

### 2. Configured Dynamic CORS in Backend
- **Problem**: [`Backend/server.js`](Backend/server.js) and [`Backend/config/socket.js`](Backend/config/socket.js) only allowed origins from `http://localhost:3000`. When deployed on Vercel or Render, all API calls and WebSockets would be rejected with a CORS error.
- **Solution**:
  - Updated Express CORS in [`Backend/server.js`](Backend/server.js) to allow `CLIENT_URL` (your deployed frontend URL) as well as `http://localhost:3000`.
  - Updated Socket.IO CORS in [`Backend/config/socket.js`](Backend/config/socket.js) to reflect incoming connection origins while preserving `credentials: true`.

### 3. Added SPA (Single Page Application) Routing Support
- **Problem**: When a user directly visits or refreshes a React Router URL (like `/community`, `/chat`, `/profile`), cloud hosting servers return a `404 Not Found` because the physical file doesn't exist on disk.
- **Solution**:
  - Added [`Frontend/vercel.json`](Frontend/vercel.json) (for Vercel rewrites to `/index.html`).
  - Added [`Frontend/public/_redirects`](Frontend/public/_redirects) (for Netlify/static hosting rewrites).

---

## 📂 Exact Files Modified & Added

| File | Action | Purpose |
| :--- | :--- | :--- |
| `Frontend/src/config.js` | **Added** | Centralizes `API_BASE_URL` with `REACT_APP_API_URL` and `localhost:5001` fallback. |
| `Frontend/vercel.json` | **Added** | Prevents 404 errors on browser refresh for React Router. |
| `Frontend/public/_redirects` | **Added** | SPA redirect rule for Netlify/static hosts. |
| `Backend/server.js` | **Modified** | Updated CORS middleware to allow dynamic `CLIENT_URL`. |
| `Backend/config/socket.js` | **Modified** | Updated Socket.io CORS to accept production frontend domains. |
| `Frontend/src/socket.js` | **Modified** | Switched connection URL from hardcoded localhost to `API_BASE_URL`. |
| `Frontend/src/chatApiCalls/index.js` | **Modified** | Base URL now points to `API_BASE_URL`. |
| `Frontend/src/chatApiCalls/chat.js` | **Modified** | Uses `API_BASE_URL`. |
| `Frontend/src/redux/userSlice.js` | **Modified** | Uses `API_BASE_URL`. |
| `Frontend/src/Components/Login.jsx` | **Modified** | Uses `API_BASE_URL` for login, registration, and Google auth. |
| `Frontend/src/Pages/Community.jsx` | **Modified** | Uses `API_BASE_URL` for posts, likes, comments, and profile avatars. |
| `Frontend/src/Pages/Chat.jsx` | **Modified** | Uses `API_BASE_URL` for chats, messages, attachments, and clear chat. |
| `Frontend/src/Pages/Profile.jsx` | **Modified** | Uses `API_BASE_URL` for profile info, LeetCode, and Codeforces data. |
| `Frontend/src/Pages/OtherProfile.jsx` | **Modified** | Uses `API_BASE_URL` for fetching user profile and coding stats. |
| `Frontend/src/Pages/ProfileMatching.jsx` | **Modified** | Uses `API_BASE_URL` for match discovery. |
| `Frontend/src/Components/MatchCard.jsx` | **Modified** | Uses `API_BASE_URL` for connection requests. |
| `Frontend/src/Components/NotificationDropdown.jsx` | **Modified** | Uses `API_BASE_URL` for notifications and accepting requests. |
| `Frontend/src/Components/EditProfileDialog.jsx` | **Modified** | Uses `API_BASE_URL` for profile and resume updates. |
| `Frontend/src/Components/LeetcodeLeaderboard.jsx` | **Modified** | Uses `API_BASE_URL` for leaderboard data. |
| `Frontend/src/Components/CodeforcesLeaderboard.jsx` | **Modified** | Uses `API_BASE_URL` for Codeforces rankings. |
| `Frontend/src/Components/CodeLab/RoomDialog.jsx` | **Modified** | Uses `API_BASE_URL` for creating/joining collaborative rooms. |

---

## 🛠️ Step-by-Step Free Deployment Tutorial

### Step 1: Ensure MongoDB Atlas Allows Connections
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/) and sign in.
2. In the left navigation bar, go to **Network Access** (under *Security*).
3. Check if IP address `0.0.0.0/0` is listed:
   - If not, click **Add IP Address** → choose **Allow Access From Anywhere (`0.0.0.0/0`)** → click **Confirm**.
   *(This ensures your cloud backend can reach your database).*

---

### Step 2: Push Your Changes to GitHub
Run in your terminal:
```bash
git add .
git commit -m "chore: prepare codebase for cloud deployment"
git push origin <your-branch-name>
```

---

### Step 3: Deploy Backend on Render (Free)
1. Sign in to [Render](https://render.com/) with GitHub.
2. Click **New +** → **Web Service**.
3. Choose your repository: `ultimatrix2/CampusConnect`.
4. Configure the service:
   - **Name**: `campusconnect-backend` (or any unique name)
   - **Region**: Choose the closest region (e.g., *Singapore* or *Frankfurt*)
   - **Root Directory**: `Backend` *(Required: tells Render to build inside the Backend folder)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Select **Free**
5. Scroll down to **Environment Variables** and add the following keys from your `.env`:
   - `PORT`: `5001`
   - `MONGO_URL`: `mongodb+srv://CampusConnect:CampusConnect1234@cluster0.gyq2u.mongodb.net/CampusConnect?retryWrites=true&w=majority`
   - `JWT_SECRET`: `{{))))""}}`
   - `CLOUDINARY_CLOUD_NAME`: `dninrjwql`
   - `CLOUDINARY_API_KEY`: `447418868783874`
   - `CLOUDINARY_API_SECRET`: `srB_8I80MA897kYHV4iBjWZQ6M0`
   - `CLIENT_URL`: `*` *(We will update this with your frontend URL once frontend is deployed)*
6. Click **Deploy Web Service**.
7. Wait ~2 minutes until Render logs show `MongoDB connected` and `🚀 Server running on port 5001`.
8. Copy your Render backend URL at the top (e.g. `https://campusconnect-backend.onrender.com`).

---

### Step 4: Deploy Frontend on Vercel (Free)
1. Sign in to [Vercel](https://vercel.com/) with GitHub.
2. Click **Add New...** → **Project**.
3. Import your `CampusConnect` repository.
4. In the configuration window:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: Click **Edit** and choose `Frontend`.
   - **Build and Output Settings**: Leave defaults (`npm run build` and `build`).
5. Expand **Environment Variables** and add:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://campusconnect-backend.onrender.com` *(Paste your Render URL without any trailing slash)*
6. Click **Deploy**.
7. Vercel will build and deploy your site in ~1 minute. Copy your live frontend URL (e.g., `https://campus-connect.vercel.app`).

---

### Step 5: Secure CORS with Frontend URL
1. Return to your [Render Dashboard](https://dashboard.render.com/).
2. Click on your `campusconnect-backend` service → **Environment**.
3. Edit `CLIENT_URL` and change it from `*` to your Vercel URL (e.g., `https://campus-connect.vercel.app`).
4. Click **Save Changes**. Render will automatically redeploy with the updated CORS setting.

---

### 💡 Local Development Note
You can still run the project locally whenever you want!
- Running `npm start` inside `Backend` will listen on port 5001.
- Running `npm start` inside `Frontend` will automatically fall back to `http://localhost:5001` without requiring any extra setup.
