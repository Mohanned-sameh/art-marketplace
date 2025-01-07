const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

exports.registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Create new user
    const user = new User({ name, email, password, phoneNumber });

    // Generate Verification Token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;

    await user.save();

    // Send verification email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: user.email,
      subject: 'Account Verification Token',
      text: `Hello, ${user.name} \n\n Please verify your account using this token: ${verificationToken}`,
    };
    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error registering user', error: error.message });
  }
});

exports.verifyUser = async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined; // Remove token after verification
    await user.save();

    res.status(200).json({ message: 'Account verified successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error verifying account', error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = await user.generateAuthToken();

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    // `req.user` is populated by auth middleware
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching profile', error: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const user = req.user;

    const { name, phoneNumber, bio, profilePicture, address } = req.body;

    // Update fields
    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;
    if (profilePicture) user.profile.profilePicture = profilePicture;
    if (address) user.profile.address = address;

    await user.save();

    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error updating profile', error: error.message });
  }
};

exports.logoutUser = async (req, res) => {
  try {
    const user = req.user;

    // Clear all tokens
    user.tokens = [];
    await user.save();

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error logging out', error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching users', error: error.message });
  }
};
