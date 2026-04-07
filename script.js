(() => {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  const overlay = document.getElementById('start-overlay');

  const colorEl = document.getElementById('color');
  const sizeEl  = document.getElementById('size');
  const alphaEl = document.getElementById('alpha');
  const clearBtn = document.getElementById('clear-btn');
  const downloadBtn = document.getElementById('download-btn');
  const dropAudio = document.getElementById('drop-audio');

  let isDrawing = false;
  let lastX = 0, lastY = 0;
  let dpr = Math.max(1, window.devicePixelRatio || 1);

  // 調整畫布尺寸（支援高 DPI）
  function resizeCanvas() {
    dpr = Math.max(1, window.devicePixelRatio || 1);
    const cssW = canvas.clientWidth || window.innerWidth;
    const cssH = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // 之後用 CSS 座標繪圖
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // 統一使用 Pointer Events，全面支援滑鼠/觸控/手寫筆
  function onPointerDown(e) {
    // 若有啟動遮罩，先關閉，避免擋住後續事件
    if (!overlay.classList.contains('hidden')) {
      hideOverlay();
    }

    isDrawing = true;
    const { x, y } = getPos(e);

    lastX = x; lastY = y;

    // 輕微水彩暈染起筆點
    drawDot(x, y);

    // 可選：起筆時播放輕微水滴聲
    try { if (dropAudio) { dropAudio.currentTime = 0; dropAudio.play().catch(() => {}); } } catch {}

    // 阻止瀏覽器手勢捲動
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!isDrawing) return;
    const { x, y } = getPos(e);
    drawStroke(lastX, lastY, x, y);
    lastX = x; lastY = y;
    e.preventDefault();
  }

  function onPointerUp(e) {
    isDrawing = false;
    e.preventDefault();
  }

  function getPos(e) {
    // 以 CSS 像素回傳相對於畫布的座標
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { x, y };
  }

  function drawDot(x, y) {
    const size = Number(sizeEl.value) || 12;
    ctx.save();
    ctx.globalAlpha = Number(alphaEl.value) || 0.3;
    ctx.fillStyle = colorEl.value;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawStroke(x1, y1, x2, y2) {
    const size = Number(sizeEl.value) || 12;
    const a = Number(alphaEl.value) || 0.3;

    ctx.save();
    ctx.strokeStyle = colorEl.value;
    ctx.lineWidth = size;
    ctx.globalAlpha = a;

    // 主要筆劃
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // 淡淡的水彩暈邊（加一層較大的半透明筆劃以柔化）
    ctx.globalAlpha = Math.max(0, a - 0.15);
    ctx.lineWidth = size * 1.8;
    ctx.stroke();

    ctx.restore();
  }

  // 綁定畫布事件（非常重要：要綁在 canvas 上）
  canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
  window.addEventListener('pointermove', onPointerMove, { passive: false });
  window.addEventListener('pointerup', onPointerUp, { passive: false });
  window.addEventListener('pointercancel', onPointerUp, { passive: false });
  window.addEventListener('pointerleave', onPointerUp, { passive: false });

  // 工具按鈕
  clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
  });

  downloadBtn.addEventListener('click', () => {
    // 將目前內容以 CSS 像素輸出
    const w = canvas.width, h = canvas.height;
    // 轉存成 1:1 圖片，避免下載到高 DPI 尺寸
    const tmp = document.createElement('canvas');
    tmp.width = Math.round(w / dpr);
    tmp.height = Math.round(h / dpr);
    const tctx = tmp.getContext('2d');
    tctx.drawImage(canvas, 0, 0, tmp.width, tmp.height);

    const a = document.createElement('a');
    a.download = `watercolor-${Date.now()}.png`;
    a.href = tmp.toDataURL('image/png');
    a.click();
  });

  // 啟動遮罩：任一互動即關閉
  function hideOverlay() {
    overlay.classList.add('hidden');
    // 待過場結束後，徹底移除以避免誤擋
    overlay.addEventListener('transitionend', () => overlay.classList.add('done'), { once: true });
  }
  overlay.addEventListener('click', hideOverlay);
  overlay.addEventListener('pointerdown', hideOverlay);

})();
      
