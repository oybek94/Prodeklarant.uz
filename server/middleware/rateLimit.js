const rateLimit = require('express-rate-limit');

// Umumiy javob shakli (boshqa endpoint'lar JSON {error} qaytaradi)
const handler = (req, res) => {
  res.status(429).json({ error: 'Juda ko\'p so\'rov. Birozdan keyin qayta urinib ko\'ring.' });
};

const common = {
  standardHeaders: true,
  legacyHeaders: false,
  handler,
};

// Login — brute-force'ga qarshi: 15 daqiqada 10 urinish
const loginLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  max: 10,
});

// Contact — spam'ga qarshi: 10 daqiqada 5 ta xabar
const contactLimiter = rateLimit({
  ...common,
  windowMs: 10 * 60 * 1000,
  max: 5,
});

// Translate — qimmat OpenAI chaqiruvlari: 10 daqiqada 20 ta
const translateLimiter = rateLimit({
  ...common,
  windowMs: 10 * 60 * 1000,
  max: 20,
});

module.exports = { loginLimiter, contactLimiter, translateLimiter };
