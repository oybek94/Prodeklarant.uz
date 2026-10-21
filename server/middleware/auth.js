const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/** Token to'g'ri bo'lsa true (xato qaytarmaydi) — ommaviy endpointlarda admin'ga ko'proq ma'lumot berish uchun. */
function isAdminRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  try {
    jwt.verify(authHeader.substring(7), JWT_SECRET);
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = authMiddleware;
module.exports.isAdminRequest = isAdminRequest;
