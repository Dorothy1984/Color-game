const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startOverlay = document.getElementById('start-overlay');
const dripAudio = document.getElementById('drip-audio');
const bubbles = document.querySelectorAll('.bubble');
const clearBtn = document.getElementById('clear-btn');
const saveBtn = document.getElementById('save-btn');

let isDrawing = false;
let currentRGB = '255, 77, 77'; 
let lastX = 0, lastY = 0;

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = '#fdfdfd';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
}

function draw(x, y) {
    if (!isDrawing) return;
    ctx.save();
    ctx.globalCompositeOperation = 'multiply'; 
    ctx.beginPath();
    ctx.lineWidth = 25;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = `rgba(${currentRGB}, 0.15)`; 
    ctx.shadowBlur = 8;
    ctx.shadowColor = `rgba(${currentRGB}, 0.3)`;
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();
    lastX = x; lastY = y;
}

function getCoords(e) {
    if (e.touches && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
}

canvas.addEventListener('mousedown', (e) => { isDrawing = true; const c = getCoords(e); lastX = c.x; lastY = c.y; });
window.addEventListener('mousemove', (e) => { const c = getCoords(e); draw(c.x, c.y); });
window.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); isDrawing = true; const c = getCoords(e); lastX = c.x; lastY = c.y; }, { passive: false });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); const c = getCoords(e); draw(c.x, c.y); }, { passive: false });

saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'my-watercolor.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

clearBtn.addEventListener('click', () => { if(confirm('確定要清空畫板嗎？')) initCanvas(); });

bubbles.forEach(btn => {
    btn.addEventListener('click', () => {
        currentRGB = hexToRgb(btn.getAttribute('data-color'));
        bubbles.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        dripAudio.currentTime = 0;
        dripAudio.play().catch(() => {});
    });// 在 script.js 的 bubbles.forEach 循環內加入：
bubbles.forEach(btn => {
    // 將 aria-label 的標籤改為：
    btn.setAttribute('aria-label', btn.innerText + "色筆刷"); // 讓 VoiceOver 讀出「紅色筆刷」
    // 修改為：
    btn.setAttribute('aria-label', btn.innerText + "色"); // 讓 VoiceOver 讀出「紅色」即可
});
});

startOverlay.addEventListener('click', () => {
    startOverlay.style.display = 'none';
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) new AudioContext().resume();
});

window.addEventListener('resize', initCanvas);
initCanvas();
bubbles[0].classList.add('active');
