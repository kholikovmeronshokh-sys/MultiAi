const ideaTopic = document.getElementById("ideaTopic");
const ideaTone = document.getElementById("ideaTone");
const ideaCount = document.getElementById("ideaCount");
const ideaCountLabel = document.getElementById("ideaCountLabel");
const ideaGenerate = document.getElementById("ideaGenerate");
const ideaClear = document.getElementById("ideaClear");
const ideaOutput = document.getElementById("ideaOutput");
const ideaError = document.getElementById("ideaError");
const ideaCopy = document.getElementById("ideaCopy");

const setError = (message) => {
  ideaError.textContent = message || "";
};

const setLoading = (isLoading) => {
  ideaGenerate.disabled = isLoading;
  ideaGenerate.textContent = isLoading ? "Kuting..." : "G'oya yarat";
};

const updateCountLabel = () => {
  ideaCountLabel.textContent = ideaCount.value;
};

updateCountLabel();
ideaCount.addEventListener("input", updateCountLabel);

ideaGenerate.addEventListener("click", async () => {
  const topic = ideaTopic.value.trim();
  if (!topic) {
    setError("Mavzuni yozing.");
    return;
  }

  setError("");
  setLoading(true);
  ideaOutput.textContent = "Yozilmoqda...";

  try {
    const res = await fetch("/api/idea", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic,
        tone: ideaTone.value,
        count: Number(ideaCount.value)
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || "Xatolik yuz berdi");
    }

    ideaOutput.textContent = data.ideas || "Javob bo'sh";
  } catch (err) {
    ideaOutput.textContent = "Bu yerda g'oyalar chiqadi...";
    setError(err.message);
  } finally {
    setLoading(false);
  }
});

ideaClear.addEventListener("click", () => {
  ideaTopic.value = "";
  ideaOutput.textContent = "Bu yerda g'oyalar chiqadi...";
  setError("");
});

ideaCopy.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(ideaOutput.textContent);
    ideaCopy.textContent = "Nusxa olindi";
    setTimeout(() => {
      ideaCopy.textContent = "Nusxa olish";
    }, 1500);
  } catch {
    setError("Nusxa olish imkoni bo'lmadi");
  }
});
