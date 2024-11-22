const BASE_URL = "https://unity-chat-gpt-server.onrender.com/api";

// Function for creating a character
async function createCharacter() {
    const characterId = document.getElementById("create-character-id").value;
    const personality = document.getElementById("create-character-personality").value;

    if (!characterId || !personality) {
        alert("Character ID and personality are required!");
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/createCharacter`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ characterId, personality }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create character.");
        }

        const result = await response.json();
        document.getElementById("create-character-result").innerText =
            result.message || "Character created successfully!";
    } catch (error) {
        document.getElementById("create-character-result").innerText = `Error: ${error.message}`;
        console.error("Error:", error);
    }
}


async function chatWithAI() {
    const chatBox = document.getElementById("chat-box");
    const characterId = document.getElementById("chat-character-id").value;
    const sessionId = document.getElementById("chat-session-id").value;
    const userMessage = document.getElementById("chat-user-message").value;

    if (!characterId || !sessionId || !userMessage) {
        alert("Character ID, Session ID, and your message are required!");
        return;
    }

    // 사용자 메시지 출력
    chatBox.innerHTML += `<div class="message user"><strong>You:</strong> ${userMessage}</div>`;

    try {
        const response = await fetch("https://unity-chat-gpt-server.onrender.com/api/chatWithAI", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ characterId, sessionId, userMessage }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to chat with AI.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = ""; // 스트리밍 데이터 조각들 저장
        let currentResponse = ""; // 현재까지의 응답 저장

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n").filter((line) => line.trim() !== "");

            for (const line of lines) {
                if (line === "data: [DONE]") {
                    console.log("Streaming complete.");
                    return;
                }

                if (line.startsWith("data: ")) {
                    const content = line.replace(/^data: /, "").trim();
                    currentResponse += content;

                    // 화면에 업데이트
                    const lastMessage = document.querySelector(".message.ai:last-child");
                    if (lastMessage) {
                        lastMessage.innerHTML = `<strong>AI:</strong> ${currentResponse}`;
                    } else {
                        chatBox.innerHTML += `<div class="message ai"><strong>AI:</strong> ${currentResponse}</div>`;
                    }
                    chatBox.scrollTop = chatBox.scrollHeight; // 자동 스크롤
                }
            }

            // 남은 데이터 정리
            buffer = buffer.endsWith("\n") ? "" : lines.slice(-1)[0];
        }
    } catch (error) {
        console.error("Error during chat:", error);
        chatBox.innerHTML += `<div class="message ai"><strong>Error:</strong> ${error.message}</div>`;
    }
}
