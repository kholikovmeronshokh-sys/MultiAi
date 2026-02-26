const codeTask = document.getElementById("codeTask");
const codeLang = document.getElementById("codeLang");
const codeGenerate = document.getElementById("codeGenerate");
const codeClear = document.getElementById("codeClear");
const codeOutput = document.getElementById("codeOutput");
const codeError = document.getElementById("codeError");
const codeCopy = document.getElementById("codeCopy");
const codeCopyBlock = document.getElementById("codeCopyBlock");

const setError = (message) => {
  codeError.textContent = message || "";
};

const setLoading = (isLoading) => {
  codeGenerate.disabled = isLoading;
  codeGenerate.textContent = isLoading ? "Kuting..." : "Kod yarat";
};

const escapeHtml = (text) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const extractCodeBlock = (text) => {
  const match = text.match(/```([a-zA-Z0-9+#-]*)\n([\s\S]*?)```/);
  if (!match) {
    return { language: "", code: "" };
  }
  return { language: match[1] || "", code: match[2].trim() };
};

const renderResult = (text) => {
  const { language, code } = extractCodeBlock(text);
  if (!code) {
    codeOutput.textContent = text;
    return;
  }

  const cleaned = text.replace(/```[\s\S]*?```/, "").trim();
  codeOutput.innerHTML = `
    <div class="code-output">
      <pre><code class="language-${language}">${escapeHtml(code)}</code></pre>
    </div>
    ${cleaned ? `<div class="code-explain">${escapeHtml(cleaned)}</div>` : ""}
  `;

  const codeEl = codeOutput.querySelector("code");
  if (window.hljs && codeEl) {
    window.hljs.highlightElement(codeEl);
  }
};

codeGenerate.addEventListener("click", async () => {
  const task = codeTask.value.trim();
  if (!task) {
    setError("Vazifani yozing.");
    return;
  }

  setError("");
  setLoading(true);
  codeOutput.textContent = "Yozilmoqda...";

  try {
    const res = await fetch("/api/code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task, language: codeLang.value })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || "Xatolik yuz berdi");
    }

    renderResult(data.result || "Javob bo'sh");
  } catch (err) {
    codeOutput.textContent = "Bu yerda kod va izoh chiqadi...";
    setError(err.message);
  } finally {
    setLoading(false);
  }
});

codeClear.addEventListener("click", () => {
  codeTask.value = "";
  codeOutput.textContent = "Bu yerda kod va izoh chiqadi...";
  setError("");
});

codeCopy.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(codeOutput.textContent);
    codeCopy.textContent = "Nusxa olindi";
    setTimeout(() => {
      codeCopy.textContent = "Nusxa olish";
    }, 1500);
  } catch {
    setError("Nusxa olish imkoni bo'lmadi");
  }
});

codeCopyBlock.addEventListener("click", async () => {
  try {
    const codeEl = codeOutput.querySelector("code");
    const block = codeEl ? codeEl.textContent.trim() : "";
    if (!block) {
      setError("Kod blok topilmadi.");
      return;
    }
    await navigator.clipboard.writeText(block);
    codeCopyBlock.textContent = "Nusxa olindi";
    setTimeout(() => {
      codeCopyBlock.textContent = "Faqat kod";
    }, 1500);
  } catch {
    setError("Nusxa olish imkoni bo'lmadi");
  }
});
