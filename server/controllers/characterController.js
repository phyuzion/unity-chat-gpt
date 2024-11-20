// controllers/characterController.js
const Character = require('../models/Character');

// 캐릭터 생성 함수
exports.createCharacter = async (req, res) => {
  const { characterId, personality } = req.body;

  if (!characterId || !personality) {
    return res.status(400).json({ error: 'characterId and personality are required.' });
  }

  try {
    const newCharacter = new Character({
      characterId,
      personality,
      messages: [{ role: 'system', content: personality }],
    });

    await newCharacter.save();
    res.status(201).json({ message: `Character ${characterId} created.` });
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ error: 'Failed to create character.' });
  }
};
