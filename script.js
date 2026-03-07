const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startOverlay = document.getElementById('start-overlay');
const dripAudio = document.getElementById('drip-audio');
const bubbles = document.querySelectorAll('.bubble');
const clearBtn = document.getElementById('clear-btn');

let isDrawing = false;
let currentColor = '#ff4d4d'; // 預設紅色
let lastX = 0;
let lastY = 0;

// 初始化畫布
function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // 給畫布一個底色（紙張感）
    ctx.fillStyle = '#fdfdfd';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 繪圖邏輯：使用模糊圓點模擬水彩
function draw(e) {
    if (!isDrawing) return;

    const x = e.clientX || e.touches[0].clientX;
    const y = e.clientY || e.touches[0].clientY;

    ctx.save();
    // 模擬水彩疊色效果
    ctx.globalCompositeOperation = 'multiply'; 
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    
    // 畫筆樣式：半透明且邊緣模糊
    ctx.strokeStyle = currentColor + '33'; // 加入透明度 (HEX + 33)
    ctx.lineWidth = 30;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 15;
    ctx.shadowColor = currentColor;
    ctx.stroke();
    ctx.restore();

    [lastX, lastY] = [x, y];
}

// 互動事件
function handleStart(e) {
    isDrawing = true;
    [lastX, lastY] = [e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY];
}

canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('mousemove', draw);
window.addEventListener('mouseup', () => isDrawing = false);

// 觸控支援
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleStart(e); });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); });

// 切換顏色與播放聲音
bubbles.forEach(btn => {
    btn.addEventListener('click', () => {
        // 更新當前顏色
        currentColor = btn.getAttribute('data-color');
        
        // 切換按鈕樣式
        bubbles.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // 播放水滴聲
        dripAudio.currentTime = 0;
        dripAudio.play().catch(() => {});

        // 視覺特效：在隨機位置滴下一滴大水彩
        const dropX = Math.random() * canvas.width;
        const dropY = Math.random() * canvas.height;
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.beginPath();
        ctx.arc(dropX, dropY, 40, 0, Math.PI * 2);
        ctx.fillStyle = currentColor + '22';
        ctx.filter = 'blur(10px)';
        ctx.fill();
        ctx.restore();
    });
});

// 清空畫板
clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    initCanvas();
});

// 啟動遮罩
startOverlay.addEventListener('click', () => {
    startOverlay.style.display = 'none';
    // 解決部分瀏覽器音訊啟動問題
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) new AudioContext().resume();
});

window.addEventListener('resize', initCanvas);
initCanvas();
// 預設選中第一個
bubbles[0].classList.add('active');
