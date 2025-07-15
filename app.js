/* === Elements === */
const disp   = document.getElementById('display');
const pad    = document.getElementById('keypad');
const theme  = document.getElementById('toggle-theme');
const voice  = document.getElementById('voice-btn');
const expPDF = document.getElementById('export-btn');
const ctx    = document.getElementById('graph');

/* === Keys === */
const KEYS = [
  "7","8","9","/",
  "4","5","6","*",
  "1","2","3","-",
  "0",".","=","+",
  "(",")","C","^"
];
KEYS.forEach(k => {
  const btn = document.createElement('button');
  btn.textContent = k;
  btn.onclick = () => press(k);
  pad.appendChild(btn);
});

/* === History === */
const history = [];

/* === Press handling === */
function press(key) {
  if (key === "C") {
    disp.value = "";
    return;
  }
  if (key === "=") {
    evaluate();
    return;
  }
  disp.value += key;
}

/* === Calculation & Graph === */
let chart;
function evaluate() {
  try {
    const expr = disp.value.replace(/\^/g, "**");
    const result = eval(expr);
    disp.value = result;
    history.push(`${expr} = ${result}`);
    plotGraph(expr);
  } catch {
    disp.value = "Error";
  }
}
function plotGraph(expr) {
  if (!chart) {
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'f(x)',
          data: [],
          borderColor: '#1e90ff',
          fill: false
        }]
      },
      options: {
        responsive: true,
        animation: false,
        scales: { x: { ticks: { stepSize: 2 } } }
      }
    });
  }

  const xs = [], ys = [];
  for (let x = -10; x <= 10; x += 0.5) {
    xs.push(x);
    try { ys.push(Function("x", `return ${expr}`)(x)); }
    catch { ys.push(null); }
  }
  chart.data.labels = xs;
  chart.data.datasets[0].data = ys;
  chart.update();
}

/* === Voice input === */
voice.onclick = () => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return alert("Voice recognition not supported.");
  const rec = new SR();
  rec.lang = "en-US";
  rec.start();
  rec.onresult = e => {
    disp.value += e.results[0][0].transcript.replace(/\s+/g, "");
  };
};

/* === Export to PDF === */
expPDF.onclick = () => {
  const { jsPDF } = window.jspdf;
  if (!jsPDF) return alert("jsPDF not loaded.");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setFontSize(14);
  doc.text("Calculator History", 40, 50);
  doc.setFontSize(11);
  history.slice(-100).forEach((line, i) => {
    doc.text(line, 40, 70 + i * 16);
  });
  doc.save("history.pdf");
};

/* === Theme === */
theme.onclick = () => {
  document.body.classList.toggle("dark");
  theme.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
};
