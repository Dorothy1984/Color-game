const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startOverlay = document.getElementById('start-overlay');
const streamAudio = document.getElementById('stream-audio');
const dripAudio = document.getElementById('drip-audio');
const bubbles = document.querySelectorAll('.bubble');

let animationObjects = []; // 存儲水滴和漣漪
let isAudioStarted = false;

// 設置畫布和彩虹/小溪佈局參數
let rainbowParams = {
    centerX: 0,
    centerY: 0,
    radius: 0,
    width: 60,
    colors: ['#ff4d4d', '#ffa64d', '#ffff4d', '#4dff4d', '#4dffff', '#4d4dff', '#b34dff'] // 紅到紫
};

let streamParams = {
    y: 0,
    height: 0
};

// --- 初始化與佈局 ---
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 計算彩虹和小溪的位置 (彩虹在半空，小溪在底部)
    rainbowParams.centerX = canvas.width / 2;
    rainbowParams.centerY = canvas.height * 0.6; // 彩虹底部中心
    rainbowParams.radius = canvas.width * 0.35; // 彩虹半徑

    streamParams.y = canvas.height * 0.75;
    streamParams.height = canvas.height * 0.25;

    positionBubbles(); // 重新計算按鈕位置
}

// 精確定位七個按鈕到彩虹的各個顏色弧度上
function positionBubbles() {
    const startAngle = Math.PI; // 180度 (左側)
    const endAngle = 0; // 0度 (右側)
    const totalAngle = startAngle - endAngle; // 弧度總長

    // 彩虹共有7層，我們取每一層的中心弧度
    rainbowParams.colors.forEach((color, index) => {
        const bubble = bubbles[index];
        const bubbleRadius = rainbowParams.radius + (index * (rainbowParams.width / 7)) - (rainbowParams.width / 2); // 取層中心

        // 均勻分佈按鈕在弧度上 (紅左紫右)
        const angle = startAngle - (index / (rainbowParams.colors.length - 1)) * totalAngle;

        const x = rainbowParams.centerX + bubbleRadius * Math.cos(angle);
        const y = rainbowParams.centerY + bubbleRadius * Math.sin(angle); // 注意：sin 在此處需要微調位置

        bubble.style.left = `${x - 25}px`; // 減去按鈕半徑
        bubble.style.top = `${y - 25}px`;
    });
}

// --- 繪圖邏輯 ---

// 繪製背景彩虹
function drawRainbow() {
    ctx.save();
    ctx.lineWidth = rainbowParams.width / 7; // 每一層的寬度
    ctx.lineCap = 'round';

    rainbowParams.colors.forEach((color, index) => {
        ctx.beginPath();
        const currentRadius = rainbowParams.radius + (index * ctx.lineWidth);
        ctx.arc(rainbowParams.centerX, rainbowParams.centerY, currentRadius, Math.PI, 0); // 繪製半圓弧
        ctx.strokeStyle = color;
        ctx.stroke();
    });
    ctx.restore();
}

// 繪製小溪
function drawStream() {
    ctx.save();
    ctx.fillStyle = '#b3e5fc'; // 柔和的水藍色
    ctx.fillRect(0, streamParams.y, canvas.width, streamParams.height);

    // 加一點裝飾性的波紋效果
    ctx.beginPath();
    ctx.moveTo(0, streamParams.y);
    for (let x = 0; x < canvas.width; x += 20) {
        ctx.lineTo(x, streamParams.y + Math.sin(x * 0.03 + (Date.now() * 0.001)) * 5);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fillStyle = 'rgba(179, 229, 252, 0.8)';
    ctx.fill();
    ctx.restore();
}

function startAudio() {
    if (isAudioStarted) return;

    // 1. 強制讓 Audio 標籤重新加載最新的檔案
    streamAudio.load(); 

    // 2. 恢復 Web Audio 上下文 (針對 Chrome/Safari)
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
        const context = new AudioContext();
        context.resume();
    }

    // 3. 嘗試播放
    streamAudio.play()
        .then(() => {
            console.log("溪流背景音播放成功！");
            isAudioStarted = true;
            startOverlay.classList.add('hidden');
        })
        .catch(e => {
            console.error("播放被攔截或失敗:", e);
            // 備案：如果還是失敗，讓使用者知道
            startOverlay.innerHTML = "<h1>請再點擊一次</h1><p>瀏覽器正在請求音訊權限</p>";
     });
}
function playDripSound() {
    dripAudio.currentTime = 0;
    dripAudio.play().catch(e => console.error("Drip failed:", e));
}

// --- 動畫粒子系統 (水滴與漣漪) ---

class Droplet {
    constructor(startX, startY, endY, color) {
        this.x = startX;
        this.y = startY;
        this.endY = endY;
        this.color = color;
        this.speed = 5 + Math.random() * 2;
        this.size = 6;
        this.type = 'droplet';
    }

    update() {
        this.y += this.speed;
        if (this.y >= this.endY) {
            // 滴落到溪水，轉化為漣漪
            this.type = 'ripple';
            this.y = this.endY; // 修正位置
            this.size = 20; // 漣漪初始大小
            this.opacity = 1;
            this.expandSpeed = 2;
            playDripSound(); // 播放水滴聲
        }
    }

    draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
}

class Ripple {
    // 雖然和 Droplet 共享 animationObjects，但行為不同，這裡不寫成 constructor，而是從 Droplet 轉化
    constructor() {} // 這裡不初始化
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 清除畫布

    // 1. 繪製靜態背景 (彩虹和小溪)
    drawRainbow();
    drawStream();

    // 2. 繪製動態對象
    animationObjects.forEach((obj, index) => {
        if (obj.type === 'droplet') {
            obj.update();
            obj.draw();
        } else if (obj.type === 'ripple') {
            // 漣漪邏輯
            obj.size += obj.expandSpeed;
            obj.opacity -= 0.015;

            ctx.save();
            ctx.globalAlpha = obj.opacity;
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, obj.size, 0, Math.PI * 2);
            ctx.lineWidth = 4;
            ctx.strokeStyle = obj.color;
            ctx.stroke();
            ctx.restore();

            if (obj.opacity <= 0) {
                animationObjects.splice(index, 1); // 漣漪消失
            }
        }
    });

    requestAnimationFrame(animate);
}

// --- 互動邏輯 ---

// 初始化
window.addEventListener('resize', resize);
startOverlay.addEventListener('click', startAudio);
resize();
animate();

// 點擊按鈕
bubbles.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const color = btn.getAttribute('data-color');
        
        // 獲取按鈕在螢幕上的位置
        const rect = btn.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height; // 從按鈕底部滴落

        // 產生一滴水滴
        animationObjects.push(new Droplet(startX, startY, streamParams.y, color));
    });
});
