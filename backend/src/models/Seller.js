const mongoose = require('mongoose');
const UserRoles = require('../domain/UserRole');
const AccountStatus = require('../domain/AccountStatus');

const sellerSchema = new mongoose.Schema({
  sellerName: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  businessDetails: {
    businessName: {
      type: String,
      required: true,
    },
    businessEmail:   { type: String },
    businessMobile:  { type: String },
    businessAddress: { type: String },
    logo:            { type: String },
    banner:          { type: String },
  },
  codEnabled:   { type: Boolean, default: false },
  codMaxAmount: { type: Number,  default: 5000 },

  // ✅ NEW — seller sets return window (default 7 days from delivery)
  returnWindowDays: { type: Number, default: 7 },

  bankDetails: {
    accountNumber: {
      type: String,
      required: true,
    },
    accountHolderName: {
      type: String,
      required: true,
    },
    ifscCode: {
      type: String,
      required: true,
    },
  },
  pickupAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
  },
  GSTIN: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: [UserRoles.CUSTOMER, UserRoles.SELLER, UserRoles.ADMIN],
    default: UserRoles.SELLER,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  accountStatus: {
    type: String,
    enum: [
      AccountStatus.PENDING_VERIFICATION,
      AccountStatus.ACTIVE,
      AccountStatus.SUSPENDED,
      AccountStatus.DEACTIVATED,
      AccountStatus.BANNED,
      AccountStatus.CLOSED,
    ],
    default: AccountStatus.PENDING_VERIFICATION,
  },
}, { timestamps: true });

const Seller = mongoose.model('Seller', sellerSchema);
module.exports = Seller;