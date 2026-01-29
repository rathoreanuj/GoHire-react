const User = require('../models/user');
const bcrypt = require('bcrypt');
const { generateToken } = require('../config/jwt');

const signup = async (req, res) => {
  const { firstName, lastName, email, phone, gender, password, confirmPassword } = req.body;

  try {
    if (!firstName || !lastName || !email || !phone || !gender || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters long' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      gender,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({
      message: 'Signup successful! Please login.',
      success: true
    });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    });
    
    res.status(200).json({
      message: 'Login successful!',
      success: true,
      token,
      user: {
        id: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

const logout = async (req, res) => {
  // With JWT, logout is handled on the client side by removing the token
  // Optionally, you can implement token blacklisting here if needed
  res.json({ message: 'Logout successful', success: true });
};

const getCurrentUser = async (req, res) => {
  try {
    // User info is now attached to req by the auth middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findOne({ userId: req.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        gender: user.gender
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  signup,
  login,
  logout,
  getCurrentUser
};

