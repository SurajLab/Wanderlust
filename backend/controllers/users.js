const User = require("../models/user");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../utils/mailer");

module.exports.signup = async (req, res) => {
  console.error('[SIGNUP] Called with body:', req.body);
  let { username, email, password } = req.body;

  if (!username || !email || !password) {
    console.error('[SIGNUP] Missing required fields');
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  // Password strength validation
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error: "Password must be at least 6 characters with one uppercase letter and one special character."
    });
  }

  try {
    // Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      if (existingUser.isVerified) {
        // Verified account — block registration
        if (existingUser.username === username) {
          return res.status(400).json({ error: "Username already taken. Please choose another." });
        }
        return res.status(400).json({ error: "An account with this email already exists. Please log in." });
      } else {
        // Unverified account — delete it and allow re-registration
        await User.deleteOne({ _id: existingUser._id });
        console.error('[SIGNUP] Deleted old unverified account for:', username);
      }
    }

    console.error('[SIGNUP] Creating new user');
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = new User({
      email,
      username,
      isVerified: false,
      verificationToken,
      verificationTokenExpiry,
    });

    console.error('[SIGNUP] Calling User.register');
    const registeredUser = await new Promise((resolve, reject) => {
      User.register(newUser, password, (err, user) => {
        if (err) {
          console.error('[SIGNUP] Register error:', err.message);
          reject(err);
        } else {
          console.error('[SIGNUP] Register success');
          resolve(user);
        }
      });
    });

    sendVerificationEmail(email, username, verificationToken).catch((err) => {
      console.error('[SIGNUP] Failed to send verification email:', err.message);
    });

    console.error('[SIGNUP] Sending success response');
    res.status(201).json({
      message: "Account created! Please check your email to verify your account before logging in.",
      requiresVerification: true,
    });
  } catch (err) {
    console.error('[SIGNUP] Caught error:', err.message, err.stack);
    res.status(400).json({ error: err.message });
  }
};

module.exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Verification token is required." });
  }

  try {
    // Case 1: token is valid and unused — normal flow
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    });

    if (user) {
      user.isVerified = true;
      user.verificationToken = null;
      user.verificationTokenExpiry = null;
      await user.save();
      return res.json({ message: "Email verified successfully! You can now log in." });
    }

    // Case 2: token not found — Gmail may have pre-fetched the link and already
    // consumed the token. Check if any user was verified in the last 60 seconds.
    const justVerified = await User.findOne({
      isVerified: true,
      verificationToken: null,
      updatedAt: { $gt: new Date(Date.now() - 60 * 1000) },
    });

    if (justVerified) {
      return res.json({ message: "Email verified successfully! You can now log in." });
    }

    // Case 3: genuinely invalid or expired token
    return res.status(400).json({
      error: "Invalid or expired verification link. Please sign up again or request a new link.",
    });

  } catch (err) {
    console.error('[VERIFY] Error:', err.message);
    res.status(500).json({ error: "Verification failed. Please try again." });
  }
};

module.exports.resendVerification = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: "If that email exists, a verification link has been sent." });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "This account is already verified. Please log in." });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = verificationTokenExpiry;
    await user.save();

    await sendVerificationEmail(email, user.username, verificationToken);

    res.json({ message: "A new verification link has been sent to your email." });
  } catch (err) {
    console.error('[RESEND] Error:', err.message);
    res.status(500).json({ error: "Failed to resend verification email." });
  }
};

module.exports.login = (req, res) => {
  res.json({
    message: "Welcome back!",
    user: { _id: req.user._id, username: req.user.username, email: req.user.email },
  });
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ message: "Logged out successfully" });
  });
};

module.exports.getCurrentUser = (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({
      user: {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        isVerified: req.user.isVerified,
      },
    });
  }
  res.json({ user: null });
};