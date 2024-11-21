const express = require('express');
const router = express.Router();
const { createCharacter, chatWithAI } = require('../controllers/characterController');

// 캐릭터 생성
router.post('/createCharacter', createCharacter);

// 대화 API
router.post('/chatWithAI', chatWithAI);

module.exports = router;
