if (process.env.NODE_ENV != "production") {
  require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const cors = require("cors");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const aiRouter = require("./routes/ai.js");

const dburl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err && (err.stack || err));
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason && (reason.stack || reason));
});

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));

app.use((req, res, next) => {
  console.log('[REQUEST]', req.method, req.url);
  if (req.body && Object.keys(req.body).length > 0) {
    const bodyStr = JSON.stringify(req.body);
    console.log('[BODY]', bodyStr.slice(0, 200));
  }
  next();
});

console.log('[APP] Creating MongoDB session store...');
const store = MongoStore.create({
  mongoUrl: dburl,
  touchAfter: 24 * 3600,
});
console.log('[APP] MongoDB session store created');
store.on("error", (err) => console.log("ERROR in mongo session store", err));

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  },
};

app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

console.log('Session middleware initialized.');

app.get('/api/test', (req, res) => {
  console.log('TEST ENDPOINT CALLED');
  res.json({ ok: true });
});

// Routes
app.use("/api/listings", listingRouter);
app.use("/api/listings/:id/reviews", reviewRouter);
app.use("/api/users", userRouter);
app.use("/api/ai", aiRouter);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error('[ERROR HANDLER]', err);
  console.error('[STACK]', err?.stack);
  const { statusCode = 500, message = "Something went wrong" } = err || {};
  const payload = { error: message || String(err) };
  res.status(statusCode).json(payload);
});

async function main() {
  await mongoose.connect(dburl);
  console.log("Connected to DB");
}

main()
  .then(() => {
    app.listen(8080, () => {
      console.log("Server running at http://localhost:8080");
    });
  })
  .catch(err => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });