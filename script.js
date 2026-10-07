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
  const moduleSize = detectModuleSize(source);
  const border = Math.max(1, Math.round(moduleSize * 4));

  const output = document.createElement("canvas");
  output.width = source.width + border * 2;
  output.height = source.height + border * 2;

  const context = output.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, output.width, output.height);
  context.drawImage(source, border, border);

  saveDataURL(output.toDataURL("image/png"));
}

function detectModuleSize(source) {
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(source, 0, 0);

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const firstPixel = 0;

  let maxRun = 1;

  // The top-left QR finder pattern is 7 modules wide.
  // Measure its first foreground run to estimate the size of one module.
  for (let y = 0; y < Math.min(canvas.height, 20); y++) {
    const rowStart = y * canvas.width * 4;

    let run = 0;

    for (let x = 0; x < canvas.width; x++) {
      const i = rowStart + x * 4;

      if (
        pixels[i] === pixels[firstPixel] &&
        pixels[i + 1] === pixels[firstPixel + 1] &&
        pixels[i + 2] === pixels[firstPixel + 2] &&
        pixels[i + 3] === pixels[firstPixel + 3]
      ) {
        run++;
      } else {
        break;
      }
    }

    maxRun = Math.max(maxRun, run);
  }

  return maxRun / 7;
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
