const Character = require('../models/Character');
const axios = require('axios');

// 캐릭터 생성
exports.createCharacter = async (req, res) => {
  const { characterId, personality } = req.body;

  if (!characterId || !personality) {
    return res.status(400).json({ error: 'characterId and personality are required.' });
  }

  try {
    const newCharacter = new Character({
      characterId,
      personality,
    });

    await newCharacter.save();
    res.status(201).json({ message: `Character ${characterId} created.` });
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ error: 'Failed to create character.' });
  }
};


exports.chatWithAI = async (req, res) => {
  const { characterId, sessionId, userMessage } = req.method === 'POST' ? req.body : req.query;

  if (!characterId || !sessionId || !userMessage) {
    return res.status(400).json({ error: 'characterId, sessionId, and userMessage are required.' });
  }

  try {
    const character = await Character.findOne({ characterId });

    if (!character) {
      return res.status(404).json({ error: 'Character not found.' });
    }

    // 세션 확인
    let session = character.sessions.find((s) => s.sessionId === sessionId);
    if (!session) {
      session = { sessionId, messages: [] };
      character.sessions.push(session);
    }

    // 이전 대화 기록 구성
    const messages = [
      { role: 'system', content: character.personality },
      ...session.messages.map((msg) => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: userMessage },
    ];

    // OpenAI API 스트리밍 요청
    const openaiRequest = await axios({
      method: 'post',
      url: 'https://api.openai.com/v1/chat/completions',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      data: {
        model: 'gpt-4',
        stream: true,
        messages,
      },
      responseType: 'stream',
    });

    // 스트리밍 응답 설정
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let assistantResponse = '';
    let buffer = '';

    openaiRequest.data.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n').filter((line) => line.trim() !== '');

      for (const line of lines) {
        if (line.includes('[DONE]')) {
          res.end();
          return;
        }

        if (line.startsWith('data: ')) {
          try {
            const jsonString = line.replace(/^data: /, '').trim();
            const parsed = JSON.parse(jsonString);
            const content = parsed.choices[0]?.delta?.content || '';

            if (content) {
              assistantResponse += content;
              res.write(`data: ${content}\n\n`);
            }
          } catch (err) {
            console.error(`Error parsing line: ${line}`, err);
          }
        }
      }

      buffer = buffer.endsWith('\n') ? '' : buffer.split('\n').slice(-1)[0];
    });

    openaiRequest.data.on('end', async () => {
      try {
        session.messages.push(
          { role: 'user', content: userMessage },
          { role: 'assistant', content: assistantResponse }
        );
        await character.save();
        console.log('Conversation saved to database.');
      } catch (error) {
        console.error('Error saving conversation to database:', error);
      }
      res.end();
    });

    openaiRequest.data.on('error', (error) => {
      console.error('Streaming error:', error);
      res.status(500).json({ error: 'Streaming failed.' });
    });
  } catch (error) {
    console.error('Error in chatWithAI:', error);
    res.status(500).json({ error: 'Chat failed.' });
  }
};
