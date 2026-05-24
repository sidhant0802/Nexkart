const AuthService = require("../services/AuthService");
const UserError = require("../exceptions/UserError");

class AuthController {
  async sentLoginOtp(req, res) {
    try {
      const { email, purpose } = req.body;
      await AuthService.sendLoginOtp(email, purpose);
      return res.status(201).json({ message: "OTP sent successfully" });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async createUserHandler(req, res) {
    try {
      const token = await AuthService.createUser(req.body);
      return res.status(200).json({
        jwt: token,
        message: "Account created successfully",
        role: "ROLE_CUSTOMER",
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async signinOtp(req, res) {
    try {
      const response = await AuthService.signinWithOtp(req.body);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async signinPassword(req, res) {
    try {
      const response = await AuthService.signinWithPassword(req.body);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async forgotPassword(req, res) {
    try {
      const response = await AuthService.forgotPasswordRequest(req.body.email);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async resetPassword(req, res) {
    try {
      const response = await AuthService.resetPassword(req.body);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async updateLocation(req, res) {
    try {
      const email = req.user?.email || req.body.email;
      const response = await AuthService.updateUserLocation(email, req.body.location);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();