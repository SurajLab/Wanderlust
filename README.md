# Wanderlust

Wanderlust is a feature-rich, full-stack web application designed for browsing, creating, and managing vacation rental listings. It provides a seamless user experience with a modern tech stack, incorporating a Node.js backend and a React frontend.

## Features

-   **User Authentication**: Secure user registration with password strength validation, login, and logout functionality using Passport.js.
-   **Email Verification**: New users receive a verification email (sent via Brevo) to activate their accounts.
-   **CRUD for Listings**: Authenticated users can create, read, update, and delete their own property listings.
-   **Image Uploads**: Supports multiple image uploads for listings, with storage managed by Cloudinary.
-   **AI-Powered Content**: Automatically generate engaging property descriptions using the Groq API (Llama 3.1).
-   **Interactive Maps**: Displays property locations on an interactive map using Mapbox, including geocoding for addresses.
-   **Reviews and Ratings**: Users can leave star ratings and comments on listings they've experienced.
-   **Search & Filtering**: Search for listings by location, title, or country, and filter by property type.
-   **Responsive UI**: A modern, responsive user interface built with React and styled with Tailwind CSS.

## Tech Stack

The project is divided into two main parts: a `backend` REST API and a `frontend` single-page application.

| Category          | Technology                                                                                                                              
| ----------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Backend**       | Node.js,Express.js,MongoDB,Passport.js (Local Strategy), Express-Session, Joi, Cloudinary, Mapbox SDK, Brevo, Groq API   
| **Frontend**      | React, Vite, React Router, Tailwind CSS, Axios, Mapbox GL JS                                                                        
| **Dev & Build**   | Vite, Nodemon, PostCSS                                                                                                   


## Project Structure
.
├── backend/        # Express.js REST API
│   ├── controllers/  # Route logic
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API route definitions
│   ├── public/       # Static assets (not used by React frontend)
│   ├── utils/        # Utility helpers (e.g., mailer)
│   └── app.js        # Main server entry point
└── frontend/       # React SPA
    ├── src/
    │   ├── components/ # Reusable React components
    │   ├── context/    # Global state management (Auth, Toast)
    │   ├── pages/      # Route-level components
    │   ├── utils/      # API client
    │   └── App.jsx     # Main application component with routing
    └── vite.config.js  # Vite configuration
```

## Getting Started

Follow these steps to get a local copy of Wanderlust up and running on your machine.

### Prerequisites

-   Node.js (v22.x or later)
-   npm
-   MongoDB (A local instance or a cloud-based URI from MongoDB Atlas)

### 1. Clone the Repository

```bash
git clone https://github.com/surajlab/wanderlust.git
cd wanderlust
```

### 2. Backend Setup

The backend server handles all data, authentication, and business logic.

a. **Navigate to the backend directory and install dependencies:**

```bash
cd backend
npm install
```

b. **Set up Environment Variables:**

Create a `.env` file in the `backend` directory and add the following variables. Replace the placeholder values with your actual credentials.

```env
# MongoDB Connection
# Use your MongoDB Atlas connection string or a local one
ATLASDB_URL=mongodb://127.0.0.1:27017/wanderlust

# Session Secret
SECRET=averylongandstrongsecret

# Client URL (for CORS and email links)
CLIENT_URL=http://localhost:5173

# Cloudinary (for image storage)
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

# Mapbox (for geocoding)
MAP_TOKEN=your_mapbox_access_token

# Brevo (for sending verification emails)
BREVO_SMTP_KEY=your_brevo_smtp_key
SENDER_EMAIL=noreply@yourdomain.com

# Groq API (for AI description generation)
GROQ_API_KEY=your_groq_api_key
```

c. **Start the Backend Server:**

The server will run on `http://localhost:8080`.

```bash
npm run dev
```

### 3. Frontend Setup

The frontend is a React application built with Vite.

a. **In a new terminal window, navigate to the frontend directory and install dependencies:**

```bash
cd frontend
npm install
```

b. **Set up Environment Variables:**

Create a `.env` file in the `frontend` directory. This is needed to give the client-side code access to your Mapbox token.

```env
VITE_MAP_TOKEN=your_mapbox_access_token
```

c. **Start the Frontend Development Server:**

The app will be available at `http://localhost:5173`. The Vite server is configured to proxy API requests from `/api` to the backend server at `http://localhost:8080`.

```bash
npm run dev
```

You can now access the Wanderlust application in your browser at `http://localhost:5173`.
