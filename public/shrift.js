const fontInput = document.getElementById("fontInput");
const fontGrid = document.getElementById("fontGrid");
const fontFill = document.getElementById("fontFill");
const fontClear = document.getElementById("fontClear");
const fontCopyAll = document.getElementById("fontCopyAll");

const fonts = [
  { name: "Playfair Display", family: "'Playfair Display', serif" },
  { name: "Montserrat", family: "'Montserrat', sans-serif" },
  { name: "Raleway", family: "'Raleway', sans-serif" },
  { name: "Oswald", family: "'Oswald', sans-serif" },
  { name: "Lora", family: "'Lora', serif" },
  { name: "Merriweather", family: "'Merriweather', serif" },
  { name: "Fira Sans", family: "'Fira Sans', sans-serif" },
  { name: "Roboto Slab", family: "'Roboto Slab', serif" },
  { name: "PT Serif", family: "'PT Serif', serif" },
  { name: "Nunito", family: "'Nunito', sans-serif" },
  { name: "Quicksand", family: "'Quicksand', sans-serif" },
  { name: "Josefin Sans", family: "'Josefin Sans', sans-serif" },
  { name: "Archivo", family: "'Archivo', sans-serif" },
  { name: "Source Serif 4", family: "'Source Serif 4', serif" },
  { name: "Zilla Slab", family: "'Zilla Slab', serif" },
  { name: "Work Sans", family: "'Work Sans', sans-serif" },
  { name: "Space Grotesk", family: "'Space Grotesk', sans-serif" },
  { name: "Crimson Text", family: "'Crimson Text', serif" },
  { name: "Vollkorn", family: "'Vollkorn', serif" },
  { name: "Libre Baskerville", family: "'Libre Baskerville', serif" },
  { name: "Georgia", family: "Georgia, serif" },
  { name: "Palatino", family: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" },
  { name: "Garamond", family: "Garamond, 'Times New Roman', serif" },
  { name: "Verdana", family: "Verdana, Geneva, sans-serif" },
  { name: "Trebuchet", family: "'Trebuchet MS', sans-serif" }
];

const renderFonts = (text) => {
  fontGrid.innerHTML = "";
  fonts.forEach((font) => {
    const card = document.createElement("div");
    card.className = "font-card";
    card.innerHTML = `
      <div class="font-card-header">
        <strong>${font.name}</strong>
        <button class="ghost small">Nusxa olish</button>
      </div>
      <div class="font-meta">Aa Bb Cc 123 | O'zbekcha matn</div>
      <div class="font-sample"></div>
    `;
    const sample = card.querySelector(".font-sample");
    sample.style.fontFamily = font.family;
    sample.style.fontWeight = "600";
    sample.textContent = text;
    card.querySelector("button").addEventListener("click", async () => {
      await navigator.clipboard.writeText(text);
    });
    fontGrid.appendChild(card);
  });
};

const updateText = () => {
  const value = fontInput.value.trim() || "Namuna: AI Summary - ozbekcha shrift";
  renderFonts(value);
};

fontInput.addEventListener("input", updateText);

fontFill.addEventListener("click", () => {
  fontInput.value = "Namuna: AI Summary - ozbekcha shrift";
  updateText();
});

fontClear.addEventListener("click", () => {
  fontInput.value = "";
  updateText();
});

fontCopyAll.addEventListener("click", async () => {
  const value = fontInput.value.trim() || "Namuna: AI Summary - ozbekcha shrift";
  const block = fonts.map((f) => `${f.name}: ${value}`).join("\n\n");
  await navigator.clipboard.writeText(block);
});

updateText();
