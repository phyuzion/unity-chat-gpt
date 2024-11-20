require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const characterRoutes = require('./routes/characterRoutes');

const app = express();
app.use(bodyParser.json());

// MongoDB 연결
connectDB();

// 라우트 설정
app.use('/api', characterRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
