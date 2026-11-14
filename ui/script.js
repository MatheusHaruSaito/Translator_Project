const apiUrl = "http://localhost:3000";


const LANGS = [
  ["pt", "Português"],
  ["en", "Inglês"],
  ["es", "Espanhol"],
  ["fr", "Francês"],
  ["de", "Alemão"],
  ["it", "Italiano"],
  ["ja", "Japonês"],
  ["zh", "Chinês"],
  ["ko", "Coreano"],
  ["ru", "Russo"],
];

const $ = (id) => document.getElementById(id);


const fromSel = $("from"),
  toSel = $("to"),
  text = $("text"),
  out = $("out"),
  go = $("go");

fromSel.add(new Option("Detectar idioma", ""));
for (const [code, name] of LANGS) {
  fromSel.add(new Option(name, code));
  toSel.add(new Option(name, code));
}
toSel.value = "en";

$("from").addEventListener("change", ()=>{
  if($("from").value == ""){
    $("swap").disabled = true
  }
  else{
    $("swap").disabled = false
  }
})

text.addEventListener("input", () => {
  $("count").textContent = text.value.length + "/2000";
});
text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) translateNow();
});
go.addEventListener("click", translateNow);

$("swap").addEventListener("click", () => {
  if (!fromSel.value) return;
  [fromSel.value, toSel.value] = [toSel.value, fromSel.value];
  if (out.dataset.result) {
    text.value = out.dataset.result;
    text.dispatchEvent(new Event("input"));
  }
});

$("copy").addEventListener("click", async () => {
  if (!out.dataset.result) return;
  try {
    await navigator.clipboard.writeText(out.dataset.result);
    $("copy").textContent = "Copiado";
  } catch {
    $("copy").textContent = "Não foi possível copiar";
  }
  setTimeout(() => ($("copy").textContent = "Copiar"), 1500);
});

function show(msg, kind) {
  out.textContent = msg;
  out.className = "out" + (kind ? " " + kind : "");
  out.dataset.result = kind ? "" : msg;
}

// Resposta do Azure Translator: [{ detectedLanguage, translations: [{ text, to }] }]
function parse(data) {
  const item = Array.isArray(data) ? data[0] : data;
  const text = item?.translations?.[0]?.text;
  if (typeof text === "string") {
    return { text, detected: item.detectedLanguage?.language || "" };
  }
  return {
    text: typeof data === "string" ? data : JSON.stringify(data, null, 2),
    detected: "",
  };
}

async function translateNow() {
  const msg = text.value.trim();
  if (!msg) {
    show("Digite um texto para traduzir.", "empty");
    return;
  }

  const base = apiUrl;
  const params = new URLSearchParams({ to: toSel.value });
  if (fromSel.value) params.set("from", fromSel.value);
  const url = `${base}/translate/${encodeURIComponent(msg)}?${params}`;

  go.disabled = true;
  go.textContent = "Traduzindo…";
  $("meta").textContent = "";
  const t0 = performance.now();
  try {
    const res = await fetch(url);
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
      throw new Error(data.error || `Erro ${res.status} no servidor.`);
    const { text: translated, detected } = parse(data);
    show(translated);
    const name = LANGS.find(([c]) => c === detected)?.[1] || detected;
    const parts = [];
    if (!fromSel.value && name) parts.push(`Detectado: ${name}`);
    parts.push(`${Math.round(performance.now() - t0)} ms`);
    $("meta").textContent = parts.join(" · ");
  } catch (e) {
    const net = e instanceof TypeError;
    show(
      net
        ? "Não foi possível conectar à API. Confira se o servidor está rodando e se o endereço está correto."
        : e.message,
      "err",
    );
  } finally {
    go.disabled = false;
    go.textContent = "Traduzir";
  }
}
