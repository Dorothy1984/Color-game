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

// 繪圖核心
function draw(x, y) {
    if (!isDrawing) return;
    ctx.save();
    ctx.globalCompositeOperation = 'multiply'; 
    ctx.beginPath();
    ctx.lineWidth = 25;
    ctx.lineCap = 'round';
    ctx.strokeStyle = `rgba(${currentRGB}, 0.2)`; 
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();
    lastX = x; lastY = y;
}

// 滑鼠事件
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    lastX = e.clientX; lastY = e.clientY;
});
window.addEventListener('mousemove', (e) => draw(e.clientX, e.clientY));
window.addEventListener('mouseup', () => isDrawing = false);

// 觸控事件
canvas.addEventListener('touchstart', (e) => {
    isDrawing = true;
    const touch = e.touches[0];
    lastX = touch.clientX; lastY = touch.clientY;
}, { passive: false });
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    draw(touch.clientX, touch.clientY);
}, { passive: false });

// 顏色按鈕
bubbles.forEach(btn => {
    btn.setAttribute('aria-label', btn.innerText + "色");
    btn.addEventListener('click', (e) => {
        e.stopPropagation(); // 防止點擊按鈕觸發畫布動作
        currentRGB = hexToRgb(btn.getAttribute('data-color'));
        bubbles.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        dripAudio.currentTime = 0;
        dripAudio.play().catch(() => {});
    });
});

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
}

// 啟動按鈕
startOverlay.addEventListener('click', () => {
    startOverlay.style.display = 'none'; // 徹底移除遮罩
    initCanvas(); // 重新初始化畫布大小
    const context = new (window.AudioContext || window.webkitAudioContext)();
    context.resume();
});

window.addEventListener('resize', initCanvas);
initCanvas();
