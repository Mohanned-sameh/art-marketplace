const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 100,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      match: /^[0-9]{10,14}$/,
    },
    role: {
      type: String,
      enum: ['buyer', 'seller', 'admin'],
      default: 'buyer',
    },
    profile: {
      bio: {
        type: String,
        trim: true,
        maxlength: 500,
        required: false,
        default: '',
      },
      profilePicture: { type: String, trim: true, default: 'default.jpg' },
      address: {
        city: {
          type: String,
          trim: true,
          maxlength: 50,
          required: false,
          default: '',
        },
        street: {
          type: String,
          trim: true,
          maxlength: 50,
          required: false,
          default: '',
        },
        buildingNumber: {
          type: String,
          trim: true,
          maxlength: 50,
          required: false,
          default: '',
        },
        nearestLandmark: {
          type: String,
          trim: true,
          maxlength: 50,
          required: false,
          default: '',
        },
      },
    },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    tokens: [
      {
        token: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    const saltRounds = 10;
    user.password = await bcrypt.hash(user.password, saltRounds);
  }
  next();
});

UserSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

UserSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Email or password is incorrect');
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Email or password is incorrect');
  }
  return user;
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
