const axios = require('axios');
const Character = require('./models/Character');

const restoreConversations = async () => {
  try {
    console.log('Starting restoration process...');

    // 1. 모든 캐릭터 데이터 가져오기
    const characters = await Character.find({});

    if (characters.length === 0) {
      console.log('No characters found to restore.');
      return;
    }

    // 2. 각 캐릭터의 세션 복원
    for (const character of characters) {
      console.log(`Restoring character: ${character.characterId}`);

      for (const session of character.sessions) {
        console.log(`Restoring session: ${session.sessionId}`);

        // 세션의 메시지 구성
        const messages = [
          { role: 'system', content: character.personality }, // 퍼스널리티
          ...session.messages.map((msg) => ({ role: msg.role, content: msg.content })),
        ];

        // OpenAI API 호출 (선택적, 학습 컨텍스트 전달)
        await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4',
            messages,
          },
          {
            headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
          }
        );

        console.log(`Session ${session.sessionId} restored for character ${character.characterId}`);
      }
    }

    console.log('Restoration process completed.');
  } catch (error) {
    console.error('Error during restoration:', error);
  }
};

module.exports = restoreConversations;
