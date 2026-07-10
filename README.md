# TravelStay

A premium, consumer-grade travel and accommodation platform. TravelStay allows users to discover, list, and book unique stays around the world.


## 🌟 Architecture

TravelStay is built using a modern decoupled architecture (MERN stack):

### Frontend (React + Vite)
- **Framework**: React 18, Vite
- **Routing**: React Router DOM v6
- **State & Data**: React Context API, Axios (configured for Cross-Origin cookies)
- **Animations**: Framer Motion (for buttery smooth page transitions, layout animations, and 3D tilts)
- **Styling**: Custom CSS Variables Design System (Vanilla CSS, no bulky UI frameworks)
- **Icons**: Lucide React

### Backend (Node.js + Express)
- **Framework**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT & Passport.js (Secure HTTP-Only Cookies with `SameSite=None`)
- **Security**: CSRF Protection (`csurf`), Helmet, Express Mongo Sanitize
- **File Upload**: Multer with Cloudinary integration

## 🚀 Features

- **Premium UI/UX**: Custom cursor, skeleton loading shimmers, 3D tilt cards, and abstract glassmorphism elements.
- **Fluid Animations**: Page transitions and interactive micro-animations powered by Framer Motion.
- **User Authentication**: Secure signup and login using encrypted HTTP-only cookies. Cross-origin authentication supported.
- **Dynamic Listings**: View properties in Grid or List modes. Full pagination support.
- **Create Listings**: A beautiful 5-step animated wizard for hosting new properties with live image previews.
- **Reviews**: Leave ratings and reviews on properties.

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account
- Cloudinary account

## 🔧 Installation & Local Development

Because the project is decoupled, you must run both the backend and frontend servers simultaneously.

### 1. Backend Setup

```bash
# Clone the repository
git clone https://github.com/yashasvi37/TravelStay.git
cd TravelStay

# Install dependencies
npm install

# Create environment variables
touch .env
```

Add the following to your backend `.env`:
```env
NODE_ENV=development
PORT=3001
SECRET=your-super-secret-key-here
CLOUD_NAME=your-cloudinary-cloud-name
CLOUD_API_KEY=your-cloudinary-api-key
CLOUD_API_SECRET=your-cloudinary-api-secret
ATLAS_DB=mongodb+srv://username:password@cluster.mongodb.net/travelstay
```

Start the backend server:
```bash
npm start
# Server will run on http://localhost:3001
```

### 2. Frontend Setup

In a new terminal window:

```bash
cd TravelStay/frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
# Frontend will run on http://localhost:5173
```

## 🚀 Deployment

The application is built to be deployed on modern cloud platforms.

### Frontend Deployment (Vercel)
The frontend is optimized for deployment on Vercel.
1. Import the `/frontend` directory to a new Vercel project.
2. In Vercel Project Settings > General > Build & Development Settings, ensure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Make sure to configure CORS settings appropriately in the backend to accept requests from your new Vercel domain.

### Backend Deployment (Render)
The backend is configured to run on Render via the `render.yaml` blueprint.
1. Connect your repository to Render.
2. Add your environment variables in the Render Dashboard (make sure `NODE_ENV=production`).
3. Ensure the `trust proxy` setting is enabled in `app.js` so secure cookies work behind Render's load balancer.

## 👨‍💻 Authors

- **Yashasvi Sharma** - [@yashasvi37](https://github.com/yashasvi37)

## 📝 License

This project is licensed under the ISC License.
