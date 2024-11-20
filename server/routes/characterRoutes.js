// routes/characterRoutes.js
const express = require('express');
const router = express.Router();
const { createCharacter } = require('../controllers/characterController'); // 경로 확인!

// 라우트 설정
router.post('/createCharacter', createCharacter);

module.exports = router;
