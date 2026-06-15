const adminOnly = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
  }
  next();
};

module.exports = { adminOnly };