const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startOverlay = document.getElementById('start-overlay');
const dripAudio = document.getElementById('drip-audio');
const bubbles = document.querySelectorAll('.bubble');
const clearBtn = document.getElementById('clear-btn');

let isDrawing = false;
let currentColor = '#ff4d4d'; 
let currentRGB = '255, 77, 77'; // 預設紅色的 RGB 值
let lastX = 0;
let lastY = 0;

// 初始化畫布
function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = '#fdfdfd';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 將 Hex 顏色轉為 RGB 供 rgba 使用
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
}

// 繪圖核心邏輯
function draw(x, y) {
    if (!isDrawing) return;

    ctx.save();
    // 使用正片疊底模擬水彩疊色
    ctx.globalCompositeOperation = 'multiply'; 
    
    ctx.beginPath();
    ctx.lineWidth = 25;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // 設置柔和筆觸
    ctx.strokeStyle = `rgba(${currentRGB}, 0.2)`; 
    ctx.shadowBlur = 10;
    ctx.shadowColor = `rgba(${currentRGB}, 0.5)`;

    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();

    lastX = x;
    lastY = y;
}

// 處理不同裝置的座標
function getCoords(e) {
    if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
}

// 事件監聽
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const { x, y } = getCoords(e);
    lastX = x;
    lastY = y;
});

window.addEventListener('mousemove', (e) => {
    const { x, y } = getCoords(e);
    draw(x, y);
});

window.addEventListener('mouseup', () => isDrawing = false);

// 觸控支援
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDrawing = true;
    const { x, y } = getCoords(e);
    lastX = x;
    lastY = y;
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const { x, y } = getCoords(e);
    draw(x, y);
}, { passive: false });

// 切換顏色
bubbles.forEach(btn => {
    btn.addEventListener('click', () => {
        const hex = btn.getAttribute('data-color');
        currentColor = hex;
        currentRGB = hexToRgb(hex);
        
        bubbles.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // 播放聲音
        dripAudio.currentTime = 0;
        dripAudio.play().catch(() => {});

        // 隨機滴落視覺效果
        const dropX = Math.random() * canvas.width;
        const dropY = Math.random() * canvas.height;
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.beginPath();
        ctx.arc(dropX, dropY, 30, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${currentRGB}, 0.1)`;
        ctx.filter = 'blur(8px)';
        ctx.fill();
        ctx.restore();
    });
});

clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    initCanvas();
});

startOverlay.addEventListener('click', () => {
    startOverlay.style.display = 'none';
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
        const context = new AudioContext();
        context.resume();
    }
});

window.addEventListener('resize', initCanvas);
initCanvas();
bubbles[0].classList.add('active');
