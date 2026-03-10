const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startOverlay = document.getElementById('start-overlay');
const dripAudio = document.getElementById('drip-audio');
const bubbles = document.querySelectorAll('.bubble');
const clearBtn = document.getElementById('clear-btn');
const saveBtn = document.getElementById('save-btn');

let isDrawing = false;
let currentRGB = '255, 77, 77'; 
let lastX = 0;
let lastY = 0;

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // 重新繪製白色背景，否則存圖會變透明
    ctx.fillStyle = '#fdfdfd';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
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
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

// 事件監聽
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const { x, y } = getCoords(e);
    lastX = x; lastY = y;
});
window.addEventListener('mousemove', (e) => {
    const { x, y } = getCoords(e);
    draw(x, y);
});
window.addEventListener('mouseup', () => isDrawing = false);

// 觸控
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDrawing = true;
    const { x, y } = getCoords(e);
    lastX = x; lastY = y;
}, { passive: false });
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const { x, y } = getCoords(e);
    draw(x, y);
}, { passive: false });

// 儲存功能
saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'my-watercolor-painting.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// 清空功能
clearBtn.addEventListener('click', () => {
    if(confirm('確定要清空畫板嗎？')) initCanvas();
});

// 顏色切換
bubbles.forEach(btn => {
    btn.addEventListener('click', () => {
        const hex = btn.getAttribute('data-color');
        currentRGB = hexToRgb(hex);
        bubbles.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        dripAudio.currentTime = 0;
        dripAudio.play().catch(() => {});
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
