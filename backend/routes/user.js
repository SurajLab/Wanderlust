const express = require("express");
const router = express.Router();
const passport = require("passport");
const userController = require("../controllers/users");
const User = require("../models/user");

router.post("/signup", (req, res, next) => {
  userController.signup(req, res).catch(next);
});

// Verify email via token from link
router.get("/verify-email", (req, res, next) => {
  userController.verifyEmail(req, res).catch(next);
});

// Resend verification email
router.post("/resend-verification", (req, res, next) => {
  userController.resendVerification(req, res).catch(next);
});

router.post(
  "/login",
  passport.authenticate("local", { failWithError: true }),
  // Block unverified users from logging in
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user.isVerified) {
        req.logout((err) => { if (err) console.error(err); });
        return res.status(403).json({
          error: "Please verify your email before logging in. Check your inbox or request a new link.",
          requiresVerification: true,
          email: user.email,
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  },
  userController.login,
  (err, req, res, next) => {
    res.status(401).json({ error: "Invalid username or password" });
  }
);

router.post("/logout", userController.logout);
router.get("/me", userController.getCurrentUser);

module.exports = router;
