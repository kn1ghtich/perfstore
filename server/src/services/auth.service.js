const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');

async function register({ email: rawEmail, password, name }) {
  const email = rawEmail.trim().toLowerCase();

  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Email уже зарегистрирован');
    err.status = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, 12);
  let user;
  try {
    user = await User.create({ email, password_hash, name });
  } catch (err) {
    if (err.code === 11000) {
      const e = new Error('Email уже зарегистрирован');
      e.status = 409;
      throw e;
    }
    throw err;
  }

  const token = generateToken(user);
  return { user: _serialize(user), token };
}

async function login({ email: rawEmail, password }) {
  const email = rawEmail.trim().toLowerCase();
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const token = generateToken(user);
  return { user: _serialize(user), token };
}

async function getProfile(userId) {
  const user = await User.findById(userId).select('-password_hash');
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return _serialize(user);
}

async function updateProfile(userId, fields) {
  const allowed = ['name', 'first_name', 'last_name', 'phone', 'city', 'delivery_address', 'payment_method', 'avatar'];
  const update = {};
  for (const key of allowed) {
    if (fields[key] !== undefined) update[key] = fields[key];
  }

  const user = await User.findByIdAndUpdate(userId, update, { new: true }).select('-password_hash');
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return _serialize(user);
}

function _serialize(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    first_name: user.first_name,
    last_name: user.last_name,
    phone: user.phone,
    city: user.city,
    delivery_address: user.delivery_address,
    payment_method: user.payment_method,
    avatar: user.avatar,
    role: user.role || 'user',
    created_at: user.created_at,
  };
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role || 'user' },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

module.exports = { register, login, getProfile, updateProfile };
