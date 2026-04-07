const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startOverlay = document.getElementById('start-overlay');
const dripAudio = document.getElementById('drip-audio');
const bubbles = document.querySelectorAll('.bubble');

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
    ctx.strokeStyle = `rgba(${currentRGB}, 0.2)`; 
    ctx.shadowBlur = 8;
    ctx.shadowColor = `rgba(${currentRGB}, 0.4)`;
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();
    lastX = x; lastY = y;
}

// 事件綁定
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    lastX = e.clientX; lastY = e.clientY;
});
window.addEventListener('mousemove', (e) => {
    draw(e.clientX, e.clientY);
});
window.addEventListener('mouseup', () => isDrawing = false);

// 觸控支援
canvas.addEventListener('touchstart', (e) => {
    isDrawing = true;
    lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
}, { passive: false });
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    draw(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });

// 顏色與語音標籤
bubbles.forEach(btn => {
    btn.setAttribute('aria-label', btn.innerText + "色");
    btn.addEventListener('click', () => {
        currentRGB = hexToRgb(btn.getAttribute('data-color'));
        bubbles.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        dripAudio.currentTime = 0;
        dripAudio.play().catch(() => {});
    });
});

startOverlay.addEventListener('click', () => {
    startOverlay.style.display = 'none';
    if (window.AudioContext || window.webkitAudioContext) {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        context.resume();
    }
});

window.addEventListener('resize', initCanvas);
initCanvas();
bubbles[0].classList.add('active');
