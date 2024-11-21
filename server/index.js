require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const restoreConversations = require('./restoreConversations');
const characterRoutes = require('./routes/characterRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// DB 연결
connectDB();

// 서버 재시작 시 복원
restoreConversations();

// 미들웨어 설정
app.use(express.json());
app.use('/api', characterRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
