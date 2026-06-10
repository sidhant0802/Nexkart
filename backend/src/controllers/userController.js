const UserService = require("../services/UserService");
const UserError = require("../exceptions/UserError");

const getUserProfileByJwt = async (req, res) => {
  try {
    const user = await req.user;
    return res.status(200).json(user);
  } catch (err) {
    handleErrors(err, res);
  }
};

const getUserByEmail = async (req, res) => {
  const { email } = req.query;
  try {
    const user = await UserService.findUserByEmail(email);
    return res.status(200).json(user);
  } catch (err) {
    handleErrors(err, res);
  }
};

// ✅ UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const jwt = req.headers.authorization?.split(" ")[1];
    const updated = await UserService.updateUserProfile(jwt, req.body);
    return res.status(200).json(updated);
  } catch (err) {
    handleErrors(err, res);
  }
};

// ✅ CHANGE PASSWORD
const changePassword = async (req, res) => {
  try {
    const jwt = req.headers.authorization?.split(" ")[1];
    const { currentPassword, newPassword } = req.body;
    const result = await UserService.changePassword(jwt, currentPassword, newPassword);
    return res.status(200).json(result);
  } catch (err) {
    handleErrors(err, res);
  }
};

// ✅ ADD ADDRESS
const addAddress = async (req, res) => {
  try {
    const jwt = req.headers.authorization?.split(" ")[1];
    const updated = await UserService.addAddress(jwt, req.body);
    return res.status(200).json(updated);
  } catch (err) {
    handleErrors(err, res);
  }
};

// ✅ UPDATE ADDRESS
const updateAddress = async (req, res) => {
  try {
    const jwt = req.headers.authorization?.split(" ")[1];
    const updated = await UserService.updateAddress(jwt, req.params.id, req.body);
    return res.status(200).json(updated);
  } catch (err) {
    handleErrors(err, res);
  }
};

// ✅ DELETE ADDRESS
const deleteAddress = async (req, res) => {
  try {
    const jwt = req.headers.authorization?.split(" ")[1];
    const updated = await UserService.deleteAddress(jwt, req.params.id);
    return res.status(200).json(updated);
  } catch (err) {
    handleErrors(err, res);
  }
};

const handleErrors = (err, res) => {
  if (err instanceof UserError) {
    return res.status(404).json({ message: err.message });
  }
  return res.status(500).json({ message: err.message || "Internal Server Error" });
};

module.exports = {
  getUserProfileByJwt,
  getUserByEmail,
  updateProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
};