const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
  characterId: { type: String, required: true, unique: true },
  personality: { type: String, required: true },
  messages: [
    {
      role: String,
      content: String,
    },
  ],
});

const Character = mongoose.model('Character', characterSchema);
module.exports = Character;
