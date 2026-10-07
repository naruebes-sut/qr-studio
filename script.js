const qrText = document.getElementById("qrText");
const size = document.getElementById("size");
const errorLevel = document.getElementById("errorLevel");
const foreground = document.getElementById("foreground");
const background = document.getElementById("background");
const foregroundHex = document.getElementById("foregroundHex");
const backgroundHex = document.getElementById("backgroundHex");
const qrCode = document.getElementById("qrCode");
const emptyState = document.getElementById("emptyState");
const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const clearBtn = document.getElementById("clearBtn");
const statusText = document.getElementById("statusText");

let currentQR = null;

const correctionMap = {
  L: QRCode.CorrectLevel.L,
  M: QRCode.CorrectLevel.M,
  Q: QRCode.CorrectLevel.Q,
  H: QRCode.CorrectLevel.H
};

function updateColorLabels() {
  foregroundHex.textContent = foreground.value.toUpperCase();
  backgroundHex.textContent = background.value.toUpperCase();
}

function generateQR() {
  const value = qrText.value.trim();

  if (!value) {
    qrCode.innerHTML = "";
    emptyState.classList.remove("hidden");
    downloadBtn.disabled = true;
    statusText.textContent = "Waiting";
    currentQR = null;
    return;
  }

  qrCode.innerHTML = "";

  currentQR = new QRCode(qrCode, {
    text: value,
    width: Number(size.value),
    height: Number(size.value),
    colorDark: foreground.value,
    colorLight: background.value,
    correctLevel: correctionMap[errorLevel.value]
  });

  emptyState.classList.add("hidden");
  downloadBtn.disabled = false;
  statusText.textContent = "Generated";
}

function downloadPNG() {
  const canvas = qrCode.querySelector("canvas");
  const image = qrCode.querySelector("img");

  if (canvas) {
    downloadWithWhiteBorder(canvas);
  } else if (image) {
    const source = new Image();
    source.onload = () => downloadWithWhiteBorder(source);
    source.src = image.src;
  }
}

function downloadWithWhiteBorder(source) {
  const border = 32;
  const output = document.createElement("canvas");
  output.width = source.width + border * 2;
  output.height = source.height + border * 2;

  const context = output.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, output.width, output.height);
  context.drawImage(source, border, border);

  saveDataURL(output.toDataURL("image/png"));
}

function saveDataURL(dataURL) {
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = "qr-code.png";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

generateBtn.addEventListener("click", generateQR);
downloadBtn.addEventListener("click", downloadPNG);

clearBtn.addEventListener("click", () => {
  qrText.value = "";
  qrText.focus();
  generateQR();
});

[foreground, background].forEach(input => {
  input.addEventListener("input", updateColorLabels);
});

[qrText, size, errorLevel, foreground, background].forEach(input => {
  input.addEventListener("change", () => {
    if (qrText.value.trim()) generateQR();
  });
});

qrText.addEventListener("input", () => {
  if (!qrText.value.trim()) generateQR();
});

updateColorLabels();
generateQR();
