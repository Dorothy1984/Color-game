const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('intention-overlay');
let particles = [];

// 初始化畫布大小
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// --- 音訊邏輯 (Web Audio API) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 1); // 漸強
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 4); // 漸弱

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 4);
}

// --- 水墨粒子邏輯 ---
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 20 + 10;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
        this.opacity = 0.8;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.size += 1.5; // 模擬擴散
        this.opacity -= 0.005;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.filter = 'blur(30px)'; // 關鍵：水墨感
        ctx.fill();
        ctx.restore();
    }
}

function animate() {
    // 留下一點殘影效果，讓水墨感更重
    ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, index) => {
        p.update();
        p.draw();
        if (p.opacity <= 0) particles.splice(index, 1);
    });
    requestAnimationFrame(animate);
}
animate();

// --- 互動邏輯 ---
document.querySelectorAll('.bubble').forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const color = btn.getAttribute('data-color');
        const freq = btn.getAttribute('data-freq');
        const msg = btn.getAttribute('data-msg');

        // 1. 播放頻率
        playTone(freq);

        // 2. 產生擴散粒子
        for (let i = 0; i < 15; i++) {
            particles.push(new Particle(window.innerWidth / 2, window.innerHeight / 2, color));
        }

        // 3. 顯示文字
        overlay.innerText = msg;
        overlay.style.opacity = 1;
        setTimeout(() => {
            overlay.style.opacity = 0;
        }, 3000); // 3秒後開始淡出，總計約5秒完成
    });
});
