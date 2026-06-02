const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { sendVerificationEmail } = require("../utils/sendEmail");
const generateOTP = require("../utils/generateOtp");
const VerificationCode = require("../models/VerificationCode");
const User = require("../models/User");
const Cart = require("../models/Cart");
const jwtProvider = require("../utils/jwtProvider");
const UserError = require("../exceptions/UserError");

class AuthService {
  // ════════════════════════════════════════════════════════
  // 1. SEND OTP (login or signup)
  // ════════════════════════════════════════════════════════
  async sendLoginOtp(email, purpose = "signup") {
    const SIGNING_PREFIX = "signing_";

    // Login OTP → user must exist
    if (email.startsWith(SIGNING_PREFIX)) {
      email = email.substring(SIGNING_PREFIX.length);
      const user = await User.findOne({ email });
      if (!user) throw new UserError("No account found with this email");
    }

    // Signup OTP → user must NOT exist
    if (purpose === "signup_check") {
      const user = await User.findOne({ email });
      if (user) throw new UserError("Account already exists. Please login.");
    }

    await VerificationCode.deleteMany({ email });

    const otp = generateOTP();
    await new VerificationCode({ otp, email }).save();

    const subject = "Nexkart - Verification Code";
    const text = `Your verification code is: ${otp}\n\nThis code expires in 10 minutes.`;
    await sendVerificationEmail(email, subject, text);
  }

  // ════════════════════════════════════════════════════════
  // 2. SIGNUP — Create user with FULL details
  // ════════════════════════════════════════════════════════
  async createUser(req) {
    const {
      email, fullName, otp, password,
      mobile, countryCode, dateOfBirth, gender,
      location,
    } = req;

    // ── Verify OTP
    const verificationCode = await VerificationCode.findOne({ email });
    if (!verificationCode || verificationCode.otp !== otp) {
      throw new UserError("Invalid or expired OTP");
    }

    // ── Check existing user
    let user = await User.findOne({ email });
    if (user) throw new UserError("Account already exists");

    // ── Hash password (use OTP as fallback if no password)
    const hashedPassword = await bcrypt.hash(password || otp, 10);

    user = new User({
      email,
      fullName,
      password:        hashedPassword,
      mobile:          mobile || "",
      countryCode:     countryCode || "+91",
      dateOfBirth:     dateOfBirth || null,
      gender:          gender || "prefer_not_to_say",
      location:        location || {},
      role:            "ROLE_CUSTOMER",
      isEmailVerified: true,
      authMethod:      password ? "both" : "otp",
      lastLogin:       new Date(),
      loginCount:      1,
    });

    await user.save();

    // Create cart
    await new Cart({ user: user._id }).save();

    // Delete used OTP
    await VerificationCode.deleteOne({ email });

    const token = jwtProvider.createJwt({ email });
    return token;
  }

  // ════════════════════════════════════════════════════════
  // 3. SIGNIN with OTP
  // ════════════════════════════════════════════════════════
  async signinWithOtp(req) {
    const { email, otp } = req;

    const user = await User.findOne({ email });
    if (!user) throw new UserError("No account found with this email");

    if (user.accountStatus === "suspended") {
      throw new UserError("Your account is suspended");
    }

    const verificationCode = await VerificationCode.findOne({ email });
    if (!verificationCode || verificationCode.otp !== otp) {
      throw new UserError("Invalid or expired OTP");
    }

    // Update login info
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    await VerificationCode.deleteOne({ email });

    const token = jwtProvider.createJwt({ email });
    return {
      message: "Login Success",
      jwt: token,
      role: user.role,
    };
  }

  // ════════════════════════════════════════════════════════
  // 4. SIGNIN with PASSWORD
  // ════════════════════════════════════════════════════════
  async signinWithPassword(req) {
    const { email, password } = req;

    const user = await User.findOne({ email }).select("+password");
    if (!user) throw new UserError("Invalid email or password");

    if (user.accountStatus === "suspended") {
      throw new UserError("Your account is suspended");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UserError("Invalid email or password");

    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    const token = jwtProvider.createJwt({ email });
    return {
      message: "Login Success",
      jwt: token,
      role: user.role,
    };
  }

  // ════════════════════════════════════════════════════════
  // 5. FORGOT PASSWORD — Send OTP
  // ════════════════════════════════════════════════════════
  async forgotPasswordRequest(email) {
    const user = await User.findOne({ email });
    if (!user) throw new UserError("No account found with this email");

    await VerificationCode.deleteMany({ email });
    const otp = generateOTP();
    await new VerificationCode({ otp, email }).save();

    const subject = "Nexkart - Password Reset Code";
    const text = `Your password reset code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, please ignore this email.`;
    await sendVerificationEmail(email, subject, text);

    return { message: "Reset code sent to your email" };
  }

  // ════════════════════════════════════════════════════════
  // 6. RESET PASSWORD with OTP
  // ════════════════════════════════════════════════════════
  async resetPassword(req) {
    const { email, otp, newPassword } = req;

    if (!newPassword || newPassword.length < 6) {
      throw new UserError("Password must be at least 6 characters");
    }

    const user = await User.findOne({ email });
    if (!user) throw new UserError("No account found with this email");

    const verificationCode = await VerificationCode.findOne({ email });
    if (!verificationCode || verificationCode.otp !== otp) {
      throw new UserError("Invalid or expired OTP");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.authMethod = "both";
    await user.save();

    await VerificationCode.deleteOne({ email });

    return { message: "Password reset successful. Please login." };
  }

  // ════════════════════════════════════════════════════════
  // 7. UPDATE LOCATION
  // ════════════════════════════════════════════════════════
  async updateUserLocation(email, location) {
    const user = await User.findOne({ email });
    if (!user) throw new UserError("User not found");

    user.location = { ...location, capturedAt: new Date() };
    await user.save();
    return { message: "Location updated", location: user.location };
  }
}

module.exports = new AuthService();

