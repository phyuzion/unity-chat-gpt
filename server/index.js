require('dotenv').config();
const express = require('express');
const cors = require('cors'); // CORS 패키지 추가
const connectDB = require('./config/db');
const restoreConversations = require('./restoreConversations');
const characterRoutes = require('./routes/characterRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// DB 연결
connectDB();

// 서버 재시작 시 복원
restoreConversations();

// CORS 설정 (모든 도메인 허용)
app.use(cors());

// JSON 파싱 미들웨어
app.use(express.json());

// 라우터 설정
app.use('/api', characterRoutes);

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
