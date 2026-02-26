const tagInput = document.getElementById("tagInput");
const tagCount = document.getElementById("tagCount");
const tagCountLabel = document.getElementById("tagCountLabel");
const tagGenerate = document.getElementById("tagGenerate");
const tagClear = document.getElementById("tagClear");
const tagOutput = document.getElementById("tagOutput");
const tagError = document.getElementById("tagError");
const tagCopy = document.getElementById("tagCopy");

const setError = (message) => {
  tagError.textContent = message || "";
};

const setLoading = (isLoading) => {
  tagGenerate.disabled = isLoading;
  tagGenerate.textContent = isLoading ? "Kuting..." : "Heshteg yarat";
};

const updateCountLabel = () => {
  tagCountLabel.textContent = tagCount.value;
};

updateCountLabel();

tagCount.addEventListener("input", updateCountLabel);

tagGenerate.addEventListener("click", async () => {
  const text = tagInput.value.trim();
  if (!text) {
    setError("Mavzu yozing.");
    return;
  }

  setError("");
  setLoading(true);
  tagOutput.textContent = "Yozilmoqda...";

  try {
    const res = await fetch("/api/hashtags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, count: Number(tagCount.value) })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || "Xatolik yuz berdi");
    }

    tagOutput.textContent = data.hashtags || "Javob bo'sh";
  } catch (err) {
    tagOutput.textContent = "#heshteglar bu yerda chiqadi...";
    setError(err.message);
  } finally {
    setLoading(false);
  }
});

tagClear.addEventListener("click", () => {
  tagInput.value = "";
  tagOutput.textContent = "#heshteglar bu yerda chiqadi...";
  setError("");
});

tagCopy.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(tagOutput.textContent);
    tagCopy.textContent = "Nusxa olindi";
    setTimeout(() => {
      tagCopy.textContent = "Nusxa olish";
    }, 1500);
  } catch {
    setError("Nusxa olish imkoni bo'lmadi");
  }
});
