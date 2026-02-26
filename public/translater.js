const translateInput = document.getElementById("translateInput");
const translateBtn = document.getElementById("translateBtn");
const translateClear = document.getElementById("translateClear");
const translateCopyAll = document.getElementById("translateCopyAll");
const translateOutput = document.getElementById("translateOutput");
const translateError = document.getElementById("translateError");
const langGrid = document.getElementById("langGrid");

const languages = [
  "Uzbek",
  "English",
  "Russian",
  "Arabic",
  "Turkish",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Chinese",
  "Japanese",
  "Korean",
  "Hindi",
  "Urdu",
  "Persian",
  "Indonesian",
  "Kazakh",
  "Ukrainian",
  "Azerbaijani"
];

const setError = (message) => {
  translateError.textContent = message || "";
};

const setLoading = (isLoading) => {
  translateBtn.disabled = isLoading;
  translateBtn.textContent = isLoading ? "Kuting..." : "Tarjima qil";
};

const renderLanguages = () => {
  langGrid.innerHTML = "";
  languages.forEach((lang, index) => {
    const label = document.createElement("label");
    label.className = "lang-item";
    label.innerHTML = `
      <input type="checkbox" value="${lang}" ${index < 20 ? "checked" : ""} />
      <span>${lang}</span>
    `;
    langGrid.appendChild(label);
  });
};

renderLanguages();

const getSelectedLanguages = () => {
  return Array.from(langGrid.querySelectorAll("input:checked")).map((el) => el.value);
};

const renderTranslations = (translations) => {
  translateOutput.innerHTML = "";
  Object.entries(translations).forEach(([lang, text]) => {
    const card = document.createElement("div");
    card.className = "translate-card";
    card.innerHTML = `
      <div class="translate-card-header">
        <strong>${lang}</strong>
        <button class="ghost small">Nusxa olish</button>
      </div>
      <div class="translate-text"></div>
    `;
    card.querySelector(".translate-text").textContent = text;
    card.querySelector("button").addEventListener("click", async () => {
      await navigator.clipboard.writeText(text);
    });
    translateOutput.appendChild(card);
  });
};

translateBtn.addEventListener("click", async () => {
  const text = translateInput.value.trim();
  if (!text) {
    setError("Matn kiriting.");
    return;
  }

  const selected = getSelectedLanguages();
  if (selected.length === 0) {
    setError("Kamida bitta tilni tanlang.");
    return;
  }

  setError("");
  setLoading(true);
  translateOutput.innerHTML = "";

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, languages: selected })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || "Xatolik yuz berdi");
    }

    const raw = data.result || "{}";
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { Result: raw };
    }

    renderTranslations(parsed);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
});

translateClear.addEventListener("click", () => {
  translateInput.value = "";
  translateOutput.innerHTML = "";
  setError("");
});

translateCopyAll.addEventListener("click", async () => {
  const blocks = Array.from(translateOutput.querySelectorAll(".translate-card")).map(
    (card) => {
      const lang = card.querySelector("strong")?.textContent || "";
      const text = card.querySelector(".translate-text")?.textContent || "";
      return `${lang}: ${text}`.trim();
    }
  );

  if (blocks.length === 0) {
    setError("Avval tarjima qiling.");
    return;
  }

  await navigator.clipboard.writeText(blocks.join("\n\n"));
});
