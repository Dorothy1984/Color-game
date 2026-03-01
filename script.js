// 1. 元素獲取
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startOverlay = document.getElementById('start-overlay');
const streamAudio = document.getElementById('stream-audio');
const dripAudio = document.getElementById('drip-audio');
const bubbles = document.querySelectorAll('.bubble');

// 2. 狀態變數
let animationObjects = []; 
let isAudioStarted = false;

// 3. 佈局參數
let rainbowParams = {
    centerX: 0,
    centerY: 0,
    radius: 0,
    width: 60,
    colors: ['#ff4d4d', '#ffa64d', '#ffff4d', '#4dff4d', '#4dffff', '#4d4dff', '#b34dff']
};

let streamParams = {
    y: 0,
    height: 0
};

// --- 初始化與佈局 ---
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    rainbowParams.centerX = canvas.width / 2;
    rainbowParams.centerY = canvas.height * 0.6; 
    rainbowParams.radius = canvas.width * 0.35; 

    streamParams.y = canvas.height * 0.75;
    streamParams.height = canvas.height * 0.25;

    positionBubbles();
}

function positionBubbles() {
    const startAngle = Math.PI;
    const endAngle = 0;
    const totalAngle = startAngle - endAngle;

    rainbowParams.colors.forEach((color, index) => {
        const bubble = bubbles[index];
        const bubbleRadius = rainbowParams.radius + (index * (rainbowParams.width / 7)) - (rainbowParams.width / 2);
        const angle = startAngle - (index / (rainbowParams.colors.length - 1)) * totalAngle;

        const x = rainbowParams.centerX + bubbleRadius * Math.cos(angle);
        const y = rainbowParams.centerY + bubbleRadius * Math.sin(angle);

        bubble.style.left = `${x - 25}px`;
        bubble.style.top = `${y - 25}px`;
    });
}

// --- 繪圖邏輯 ---
function drawRainbow() {
    ctx.save();
    ctx.lineWidth = rainbowParams.width / 7;
    ctx.lineCap = 'round';

    rainbowParams.colors.forEach((color, index) => {
        ctx.beginPath();
        const currentRadius = rainbowParams.radius + (index * ctx.lineWidth);
        ctx.arc(rainbowParams.centerX, rainbowParams.centerY, currentRadius, Math.PI, 0);
        ctx.strokeStyle = color;
        ctx.stroke();
    });
    ctx.restore();
}

function drawStream() {
    ctx.save();
    ctx.fillStyle = '#b3e5fc';
    ctx.fillRect(0, streamParams.y, canvas.width, streamParams.height);

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

// --- 音訊核心邏輯 ---
function startAudio() {
    if (isAudioStarted) return;

    // A. 喚醒 AudioContext
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
        const context = new AudioContext();
        if (context.state === 'suspended') context.resume();
    }

    // B. 背景音處理：設置音量漸增防止被攔截
    streamAudio.volume = 0;
    streamAudio.load(); 
    
    streamAudio.play()
        .then(() => {
            console.log("背景音啟動成功");
            isAudioStarted = true;
            startOverlay.classList.add('hidden');
            
            // 平滑淡入音量
            let vol = 0;
            const fadeIn = setInterval(() => {
                if (vol < 0.4) {
                    vol += 0.02;
                    streamAudio.volume = vol;
                } else {
                    clearInterval(fadeIn);
                }
            }, 100);
        })
        .catch(e => {
            console.error("播放攔截:", e);
            startOverlay.innerHTML = "<h1>請再次點擊螢幕</h1><p>以開啟小溪流聲</p>";
        });
}

function playDripSound() {
    dripAudio.currentTime = 0;
    dripAudio.play().catch(e => console.log("等待互動後播放水滴"));
}

// --- 動畫系統 ---
class Droplet {
    constructor(startX, startY, endY, color) {
        this.x = startX;
        this.y = startY;
        this.endY = endY;
        this.color = color;
        this.speed = 6;
        this.size = 5;
        this.type = 'droplet';
    }

    update() {
        this.y += this.speed;
        if (this.y >= this.endY) {
            this.type = 'ripple';
            this.y = this.endY;
            this.size = 10;
            this.opacity = 1;
            playDripSound();
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

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRainbow();
    drawStream();

    animationObjects.forEach((obj, index) => {
        if (obj.type === 'droplet') {
            obj.update();
            obj.draw();
        } else {
            // 漣漪邏輯
            obj.size += 1.5;
            obj.opacity -= 0.015;
            ctx.save();
            ctx.globalAlpha = obj.opacity;
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, obj.size, 0, Math.PI * 2);
            ctx.lineWidth = 3;
            ctx.strokeStyle = obj.color;
            ctx.stroke();
            ctx.restore();
            if (obj.opacity <= 0) animationObjects.splice(index, 1);
        }
    });
    requestAnimationFrame(animate);
}

// --- 事件綁定 ---
window.addEventListener('resize', resize);
startOverlay.addEventListener('click', startAudio);

bubbles.forEach(btn => {
    btn.addEventListener('click', () => {
        const color = btn.getAttribute('data-color');
        const rect = btn.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height;
        animationObjects.push(new Droplet(startX, startY, streamParams.y, color));
    });
});

// 啟動
resize();
animate();
