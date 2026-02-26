const chatWindow = document.getElementById("chatWindow");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("send");
const clearBtn = document.getElementById("clearChat");
const chatError = document.getElementById("chatError");

let messages = [];

const setError = (message) => {
  chatError.textContent = message || "";
};

const addBubble = (text, role) => {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${role}`;
  bubble.textContent = text;
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
};

const setLoading = (isLoading) => {
  sendBtn.disabled = isLoading;
  sendBtn.textContent = isLoading ? "Kuting..." : "Yuborish";
};

const sendMessage = async () => {
  const text = chatInput.value.trim();
  if (!text) {
    setError("Xabar yozing.");
    return;
  }

  setError("");
  addBubble(text, "user");
  chatInput.value = "";
  setLoading(true);

  messages.push({ role: "user", content: text });

  try {
    const res = await fetch("/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || "Xatolik yuz berdi");
    }

    const reply = data.reply || "";
    addBubble(reply, "bot");
    messages.push({ role: "assistant", content: reply });
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

sendBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

clearBtn.addEventListener("click", () => {
  messages = [];
  chatWindow.innerHTML = "<div class=\"chat-bubble bot\">Salom! Qanday yordam bera olaman? 😊</div>";
  setError("");
});
