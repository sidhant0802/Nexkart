const User = require("../models/User");
const Address = require("../models/Address");
const bcrypt = require("bcrypt");
const jwtProvider = require("../utils/jwtProvider");
const UserError = require("../exceptions/UserError");

class UserService {
  // ─────────────────────────────────────────────
  async findUserProfileByJwt(jwt) {
    const email = jwtProvider.getEmailFromJwt(jwt);
    const user = await User.findOne({ email }).populate("addresses");
    if (!user) throw new UserError(`User does not exist with email ${email}`);
    return user;
  }

  // ─────────────────────────────────────────────
  async findUserByEmail(email) {
    const user = await User.findOne({ email });
    if (!user) throw new UserError(`User does not exist with email ${email}`);
    return user;
  }

  // ─────────────────────────────────────────────
  // ✅ UPDATE PROFILE (name, dob, gender, location)
  // Email & mobile NOT editable here
  async updateUserProfile(jwt, data) {
    const email = jwtProvider.getEmailFromJwt(jwt);
    const user = await User.findOne({ email });
    if (!user) throw new UserError("User not found");

    const allowedFields = [
      "fullName", "dateOfBirth", "gender",
      "profileImage", "location",
    ];

    allowedFields.forEach((f) => {
      if (data[f] !== undefined) user[f] = data[f];
    });

    await user.save();
    return await User.findById(user._id).populate("addresses");
  }

  // ─────────────────────────────────────────────
  // ✅ CHANGE PASSWORD
  async changePassword(jwt, currentPassword, newPassword) {
    const email = jwtProvider.getEmailFromJwt(jwt);
    const user = await User.findOne({ email }).select("+password");
    if (!user) throw new UserError("User not found");

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new UserError("Current password is incorrect");

    if (newPassword.length < 6)
      throw new UserError("Password must be at least 6 characters");

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return { message: "Password updated successfully" };
  }

  // ─────────────────────────────────────────────
  // ✅ ADD ADDRESS
  async addAddress(jwt, addressData) {
    const email = jwtProvider.getEmailFromJwt(jwt);
    const user = await User.findOne({ email });
    if (!user) throw new UserError("User not found");

    const address = new Address(addressData);
    await address.save();

    user.addresses.push(address._id);
    await user.save();

    return await User.findById(user._id).populate("addresses");
  }

  // ─────────────────────────────────────────────
  // ✅ UPDATE ADDRESS
  async updateAddress(jwt, addressId, addressData) {
    const email = jwtProvider.getEmailFromJwt(jwt);
    const user = await User.findOne({ email });
    if (!user) throw new UserError("User not found");

    const address = await Address.findByIdAndUpdate(
      addressId, addressData, { new: true }
    );
    if (!address) throw new UserError("Address not found");

    return await User.findById(user._id).populate("addresses");
  }

  // ─────────────────────────────────────────────
  // ✅ DELETE ADDRESS
  async deleteAddress(jwt, addressId) {
    const email = jwtProvider.getEmailFromJwt(jwt);
    const user = await User.findOne({ email });
    if (!user) throw new UserError("User not found");

    user.addresses = user.addresses.filter(
      (id) => id.toString() !== addressId
    );
    await user.save();
    await Address.findByIdAndDelete(addressId);

    return await User.findById(user._id).populate("addresses");
  }
}

module.exports = new UserService();