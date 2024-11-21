const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, required: true }, // 'user' or 'assistant'
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  messages: [messageSchema],
});

const characterSchema = new mongoose.Schema({
  characterId: { type: String, required: true, unique: true },
  personality: { type: String, required: true },
  sessions: [sessionSchema],
});

const Character = mongoose.model('Character', characterSchema);
module.exports = Character;
