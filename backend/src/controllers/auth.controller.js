const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email déjà utilisé.' });
    const isAdmin = email === process.env.ADMIN_EMAIL;
    const user = await User.create({ name, email, passwordHash: password, isAdmin });
    res.status(201).json({ token: generateToken(user._id), user });
  } catch {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }
    res.json({ token: generateToken(user._id), user });
  } catch {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

const getMe = async (req, res) => res.json({ user: req.user });

module.exports = { register, login, getMe };