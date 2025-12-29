🌍 Wanderlust
Full-Stack Travel Listing Platform (MERN-Style MVC App)

A production-ready full-stack web application that allows users to explore travel destinations, create listings, upload images, add map locations, and write reviews.
Built using Node.js, Express, MongoDB, and EJS, following industry-standard MVC architecture.

🔗 Live Demo: https://wanderlust-h5lw.onrender.com/listings

📘 Documentation: https://deepwiki.com/SurajLab/Wanderlust  

🚀 Why This Project Matters

          This project demonstrates end-to-end full-stack development skills, including:
          
          Secure authentication & authorization
          
          Clean MVC architecture
          
          Database modeling with relationships
          
          Third-party API integration
          
          Cloud-based image storage
          
          Real-world request & session handling
Designed to reflect how modern production apps are built.

🧩 Core Features

        🔐 User authentication (Passport.js)
        
        🏡 CRUD operations for travel listings
        
        💬 Review & rating system
        
        🖼️ Image upload with Cloudinary
        
        🗺️ Interactive maps using Mapbox
        
        🧠 Data validation & error handling
        
        🔒 Role-based access control
🛠️ Tech Stack
      
      Backend
      
              Node.js
              
              Express.js
              
              MongoDB
              
              Mongoose
      
      Frontend
      
              EJS
                
              Bootstrap
      
      Auth & Security
      
              Passport.js
              
              Express-Session
              
              connect-mongo
      
              bcrypt
      
      External Services
      
              Cloudinary (image hosting)
              
              Mapbox (maps & geocoding)
              
              Multer (file uploads)
              
              Joi (schema validation)
🏗️ System Architecture
Built using the MVC (Model–View–Controller) pattern:
      
      Client → Views (EJS)
      → Routes (Express)
      → Controllers
      → Models (MongoDB)
      → Response
This ensures scalability, maintainability, and clean separation of concerns.

📊 Database Design
      Entities

            User
              
            Listing
              
            Review
      
      Relationships
      
            One user → many listings
            
            One listing → many reviews
            
            Reviews belong to both user and listing

🔐 Authentication & Authorization

        Secure login & signup using Passport Local Strategy
        
        Password hashing for data safety
        
        Sessions stored in MongoDB
        
        Only content owners can edit or delete their data

🗺️ Map & Location Handling

        User-entered addresses converted to geo-coordinates
        
        Mapbox renders interactive markers
        
        Locations stored as GeoJSON in MongoDB
🖼️ Image Upload Pipeline

        Form Upload
           → Multer
           → Cloudinary
           → CDN URL stored in DB
No local storage → better performance & scalability.

🔄 Request Lifecycle

          Request
           → Middleware
           → Session
           → Auth Check
           → Controller
           → Response / Error Handler
Implements real-world Express request handling.

📦 Environment Configuration

          ATLASDB_URL=MongoDB_URI
          SECRET=Session_Secret
          CLOUD_NAME=Cloudinary_Name
          CLOUD_API_KEY=Cloudinary_Key
          CLOUD_API_SECRET=Cloudinary_Secret
          MAP_TOKEN=Mapbox_Token
Runs on port 8080.

🎯 Skills Demonstrated

          Full-stack development

          RESTful API design
          
          MVC architecture
          
          Authentication & sessions
          
          Database schema design
          
          Third-party API integration
          
          Clean, maintainable code

👨‍💻 Author: 
        Suraj Kumar Agrawal





