# 🏡 Wanderlust – AI-Powered Vacation Rental Platform

Wanderlust is a full-stack vacation rental platform inspired by Airbnb, built with the MERN stack. It enables users to discover, create, and manage property listings with secure authentication, AI-powered recommendations, interactive maps, and cloud-based image storage.

## ✨ Features

- 🤖 **AI Trip Planner** – Recommends the best properties based on budget, destination, guests, and preferences.
- ✍️ **AI Description Generator** – Creates engaging property descriptions using Groq (Llama 3.1).
- 🔐 Secure Authentication with Passport.js & Email Verification.
- 🏡 Full CRUD operations for property listings.
- 📷 Multiple image uploads with Cloudinary.
- 🗺 Interactive maps and geocoding using Mapbox.
- ⭐ Reviews & Ratings system.
- 🔍 Search and category-based filtering.
- 📱 Fully responsive UI.

## 🛠 Tech Stack

| Frontend | Backend | Services |
|----------|----------|----------|
| React, Vite, Tailwind CSS | Node.js, Express.js, MongoDB, Mongoose | Cloudinary, Mapbox, Groq API, Brevo |

## 🚀 Getting Started

```bash
git clone https://github.com/SurajLab/Wanderlust.git
cd Wanderlust
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🔑 Environment Variables

### Backend

```env
ATLASDB_URL=
SECRET=
CLIENT_URL=
CLOUD_NAME=
CLOUD_API_KEY=
CLOUD_API_SECRET=
MAP_TOKEN=
BREVO_SMTP_KEY=
SENDER_EMAIL=
GROQ_API_KEY=
```

### Frontend

```env
VITE_MAP_TOKEN=
```

## 📌 Roadmap

- 💳 Online Payments
- ❤️ Wishlist
- 📅 Booking Calendar
- 👤 User Dashboard
- 🌍 Multi-language Support

## 👨‍💻 Author

**Suraj Agrawal**

⭐ If you found this project useful, consider giving it a star.
