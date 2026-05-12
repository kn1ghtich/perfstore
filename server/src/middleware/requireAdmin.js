const User = require('../models/User');

async function requireAdmin(req, res, next) {
  try {
    // Always check DB role (token may be issued before role change)
    const user = await User.findById(req.user.id).select('role');
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ только для администраторов' });
    }
    req.user.role = 'admin';
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = requireAdmin;
