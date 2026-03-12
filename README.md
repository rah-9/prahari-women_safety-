<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/shield-alert.svg" alt="Prahari Logo" width="80"/>
  <h1>Prahari (प्रहरी)</h1>
  <p><strong>A Next-Generation Women Safety & Emergency Response Network</strong></p>
</div>

---

**Prahari** is a real-time, community-driven emergency response platform designed to provide rapid assistance during critical situations. By bridging the gap between those in need and verified nearby responders, Prahari ensures that help is never more than a few minutes away.

## 🌟 Key Features

### For Users (Victims)
- **One-Tap SOS Button**: Instantly broadcast your real-time location and generate an emergency alert.
- **Live GPS Tracking**: Continuous, seamless background location updates shared exclusively with your assigned responder.
- **Safety Confirmation**: Mark yourself as safe with a "Helper Arrived" button, concluding the emergency instantly.

### For Protectors (Helpers)
- **Real-Time Map Alerts**: Visual dashboard showing incoming emergencies within your immediate vicinity.
- **Instant Routing**: Automatic Haversine-based distance calculation and turn-by-turn Leaflet routing to the victim's exact coordinates.
- **Availability Toggle**: Switch between 'Online' and 'Offline' to manage when you can receive SOS broadcasts.

### For Administrators
- **Command Center Dashboard**: Live overview of network health with highly visual, dynamic charts powered by Recharts (Live 7-Day SOS trends, Distribution pies).
- **Network Management**: Easily onboard, verify, or remove users and helpers from the system.
- **Instant Telemetry**: View a real-time log table of the latest SOS emergencies, complete with coordinates, timestamps, and status badges.

---

## 🛠️ Technology Stack

Prahari is built using the robust **MERN** stack supplemented by WebSocket technology for true real-time duplex communication.

### Frontend
- **Framework**: React 18 & Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Maps & Navigation**: `react-leaflet`, `leaflet-routing-machine`
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **WebSockets**: `socket.io-client`

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB (Mongoose with GeoJSON structuring)
- **Real-Time Engine**: Socket.IO
- **Security**: JWT Authentication, Bcrypt Password Hashing, Helmet HTTP Headers

---

## 🚀 Getting Started

Follow these instructions to set up the Prahari project locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or Atlas Cluster)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/prahari-women_safety.git
cd prahari-women_safety
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create a .env file based on the environment variables section below
touch .env

# Start the development server
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

### 4. Environment Variables (`backend/.env`)
Create a `.env` file in the `backend` directory and add the following keys:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/prahari (Or your MongoDB Atlas URI)
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:5173
```

### 5. Environment Variables (`frontend/.env`)
Create a `.env` file in the `frontend` directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🏗️ Architecture & Matching Algorithm

Prahari utilizes a highly localized **Proximity Broadcasting Algorithm** combined with WebSocket rooms.

1. **Trigger Phase**: When a user taps 'SOS', the frontend captures HTML5 Geolocation coordinates and emits a `sos:trigger` socket event.
2. **Matching Engine**: The Express backend queries MongoDB using `$near` and `$maxDistance` geospatial operators on the `Helpers` collection (filtered by `isOnline: true` and `verificationStatus: 'verified'`).
3. **Broadcasting**: The Socket.io server broadcasts the `sos:alert` event securely **only** to the socket IDs of the top 3-5 physically nearest responders.
4. **Assignment Phase**: The first responder to tap 'Accept & Respond' locks the request. The backend assigns the SOS instance to them, bridging both the User and Helper into an exclusive Socket.io Room for continuous live GPS pinging (`sos:location_update`).

---

## 🔐 System Roles & Default Demo Logic
Prahari enforces three distinct authorization levels:
- **User**: Standard emergency requesters.
- **Helper**: Verified community responders.
- **Admin**: System operators who manage the platform.

### Testing Admin Mode
A seeding script is normally available in the backend to bootstrap the admin environment.
- **Role**: Admin
- **Email**: `admin@prahari.com`
- **Password**: `admin123`

---

## 📜 License
This project is proprietary software created for emergency response management. 

<div align="center">
  <p>Built with ❤️ for a safer tomorrow.</p>
</div>
