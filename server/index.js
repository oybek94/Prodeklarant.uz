const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const uploadRoutes = require('./routes/upload');
const translateRoutes = require('./routes/translate');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://prodeklarant.uz',
  'https://www.prodeklarant.uz',
  'http://prodeklarant.uz',
  'http://www.prodeklarant.uz',
];
if (process.env.CORS_ORIGIN) {
  allowedOrigins.push(...process.env.CORS_ORIGIN.split(',').map((s) => s.trim()));
}
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/translate', translateRoutes);

const distPath = path.join(__dirname, '..', 'dist');
const indexHtml = path.join(distPath, 'index.html');
if (fs.existsSync(indexHtml)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(indexHtml);
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
