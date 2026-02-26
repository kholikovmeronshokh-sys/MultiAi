const input = document.getElementById("input");
const output = document.getElementById("output");
const errorBox = document.getElementById("error");
const summarizeBtn = document.getElementById("summarize");
const clearBtn = document.getElementById("clear");
const copyBtn = document.getElementById("copy");
const count = document.getElementById("count");
const mode = document.getElementById("mode");
const bioName = document.getElementById("bioName");
const bioVibe = document.getElementById("bioVibe");
const bioKeywords = document.getElementById("bioKeywords");
const bioGenerate = document.getElementById("bioGenerate");
const bioClear = document.getElementById("bioClear");
const bioOutput = document.getElementById("bioOutput");
const bioError = document.getElementById("bioError");
const bioCopy = document.getElementById("bioCopy");

const setLoading = (isLoading) => {
  summarizeBtn.disabled = isLoading;
  summarizeBtn.textContent = isLoading ? "Kuting..." : "Qisqartir";
};

const setError = (message) => {
  errorBox.textContent = message || "";
};

const updateCount = () => {
  count.textContent = `${input.value.length} belgi`;
};

input.addEventListener("input", updateCount);
updateCount();

summarizeBtn.addEventListener("click", async () => {
  setError("");
  const text = input.value.trim();
  if (!text) {
    setError("Matn kiriting.");
    return;
  }

  setLoading(true);
  output.textContent = "Yozilmoqda...";

  try {
    const res = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, mode: mode.value })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || "Xatolik yuz berdi");
    }

    output.textContent = data.summary || "Javob bo'sh";
  } catch (err) {
    output.textContent = "Bu yerda qisqa xulosa chiqadi...";
    setError(err.message);
  } finally {
    setLoading(false);
  }
});

clearBtn.addEventListener("click", () => {
  input.value = "";
  output.textContent = "Bu yerda qisqa xulosa chiqadi...";
  setError("");
  updateCount();
});

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(output.textContent);
    copyBtn.textContent = "Nusxa olindi";
    setTimeout(() => {
      copyBtn.textContent = "Nusxa olish";
    }, 1500);
  } catch {
    setError("Nusxa olish imkoni bo'lmadi");
  }
});

const setBioLoading = (isLoading) => {
  bioGenerate.disabled = isLoading;
  bioGenerate.textContent = isLoading ? "Kuting..." : "Bio yarat";
};

const setBioError = (message) => {
  bioError.textContent = message || "";
};

bioGenerate.addEventListener("click", async () => {
  setBioError("");
  setBioLoading(true);
  bioOutput.textContent = "Yozilmoqda...";

  try {
    const res = await fetch("/api/bio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: bioName.value,
        vibe: bioVibe.value,
        keywords: bioKeywords.value
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || "Xatolik yuz berdi");
    }

    bioOutput.textContent = data.bio || "Javob bo'sh";
  } catch (err) {
    bioOutput.textContent = "Bu yerda bio chiqadi...";
    setBioError(err.message);
  } finally {
    setBioLoading(false);
  }
});

bioClear.addEventListener("click", () => {
  bioName.value = "";
  bioVibe.value = "";
  bioKeywords.value = "";
  bioOutput.textContent = "Bu yerda bio chiqadi...";
  setBioError("");
});

bioCopy.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(bioOutput.textContent);
    bioCopy.textContent = "Nusxa olindi";
    setTimeout(() => {
      bioCopy.textContent = "Nusxa olish";
    }, 1500);
  } catch {
    setBioError("Nusxa olish imkoni bo'lmadi");
  }
});
