/* ---------- Optimized Static Starfield (Single Canvas, No Animation) ---------- */
const cStars = document.getElementById('stars');
const sCtx = cStars.getContext('2d', { alpha: true });

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio, 2); // Cap at 2x for performance
  cStars.width = innerWidth * dpr;
  cStars.height = innerHeight * dpr;
  cStars.style.width = innerWidth + 'px';
  cStars.style.height = innerHeight + 'px';
  sCtx.scale(dpr, dpr);
  drawStars();
}

/* Reduced star count for better performance */
function drawStars() {
  sCtx.clearRect(0, 0, innerWidth, innerHeight);
  
  // Single nebula layer (reduced from multiple)
  const g1 = sCtx.createRadialGradient(
    innerWidth * 0.5, 
    innerHeight * 0.4, 
    0, 
    innerWidth * 0.5, 
    innerHeight * 0.4, 
    innerWidth * 0.6
  );
  g1.addColorStop(0, 'rgba(0,188,212,0.05)');
  g1.addColorStop(0.5, 'rgba(100,150,255,0.025)');
  g1.addColorStop(1, 'rgba(6,6,10,0)');
  sCtx.fillStyle = g1;
  sCtx.fillRect(0, 0, innerWidth, innerHeight);

  // Static stars - no animation
  const STAR_COUNT = Math.min(200, Math.max(100, Math.floor(innerWidth / 8)));
  
  for (let i = 0; i < STAR_COUNT; i++) {
    const x = Math.random() * innerWidth;
    const y = Math.random() * innerHeight;
    const r = Math.random() * 1.5 + 0.3;
    const alpha = 0.3 + Math.random() * 0.7;
    const hue = 200 + Math.random() * 80;
    
    sCtx.beginPath();
    sCtx.fillStyle = `hsla(${Math.round(hue)}, 85%, 85%, ${alpha})`;
    sCtx.arc(x, y, r, 0, Math.PI * 2);
    sCtx.fill();
  }
}

// Only redraw on resize
let resizeTimeout;
addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(resizeCanvas, 150);
});

resizeCanvas();

/* ---------- 12-Hour Flip Clock Logic ---------- */
function two(n) { 
  return String(n).padStart(2, '0'); 
}

const units = {
  hours: document.querySelector('#unit-hours .flip'),
  mins: document.querySelector('#unit-mins .flip')
};
let lastVals = { hours: '', mins: '' };

function setFace(unit, val) {
  const flip = units[unit];
  if (!flip) return;
  const front = flip.querySelector('[data-side="front"]');
  const back = flip.querySelector('[data-side="back"]');
  
  // If same, no change
  if (front.textContent === val || back.textContent === val) {
    front.textContent = val;
    back.textContent = val;
    return;
  }
  
  back.textContent = val;
  
  // Trigger flip
  flip.classList.remove('do-flip');
  void flip.offsetWidth; // Force reflow
  flip.classList.add('do-flip');

  // After animation, sync front to new value
  setTimeout(() => {
    front.textContent = val;
    back.textContent = val;
    flip.classList.remove('do-flip');
  }, 420);
}

// Optimized clock update - only check every second instead of every frame
function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const mins = now.getMinutes();
  
  // Convert to 12-hour format
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  
  const h = two(hours);
  const m = two(mins);
  
  if (h !== lastVals.hours) { 
    setFace('hours', h); 
    lastVals.hours = h; 
  }
  if (m !== lastVals.mins) { 
    setFace('mins', m); 
    lastVals.mins = m; 
  }
  
  // Update AM/PM indicator
  document.getElementById('ampm').textContent = ampm;
}

// Check clock every second instead of every frame
updateClock();
setInterval(updateClock, 1000);

/* ---------- Menu Toggle ---------- */
const menuBtn = document.getElementById('menu-btn');
const menuPanel = document.getElementById('menu-panel');
const menuClose = document.getElementById('menu-close');
const modeToggle = document.getElementById('mode-toggle');
const clockDisplay = document.getElementById('clock-display');
const pomodoroDisplay = document.getElementById('pomodoro-display');
const pomoSettings = document.getElementById('pomo-settings');

menuBtn.addEventListener('click', () => {
  menuPanel.classList.toggle('active');
});

menuClose.addEventListener('click', () => {
  menuPanel.classList.remove('active');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!menuPanel.contains(e.target) && !menuBtn.contains(e.target)) {
    menuPanel.classList.remove('active');
  }
});

/* ---------- Mode Toggle (Clock vs Pomodoro) ---------- */
modeToggle.addEventListener('change', () => {
  if (modeToggle.checked) {
    // Switch to Pomodoro mode
    clockDisplay.style.display = 'none';
    pomodoroDisplay.style.display = 'flex';
    pomoSettings.style.display = 'none';
  } else {
    // Switch to Clock mode
    clockDisplay.style.display = 'flex';
    pomodoroDisplay.style.display = 'none';
    pomoSettings.style.display = 'block';
    // Reset pomodoro if running
    if (running) {
      pauseTimer();
      resetTimer();
    }
  }
});

/* ---------- Pomodoro Timer ---------- */
const pomoTimeEl = document.getElementById('pomo-time');
const pomoModeEl = document.getElementById('pomo-mode');
const startBtn = document.getElementById('start');
const pauseBtn = document.getElementById('pause');
const resetBtn = document.getElementById('reset');
const workInput = document.getElementById('work-input');
const breakInput = document.getElementById('break-input');
const presets = document.querySelectorAll('.preset');

let workMin = parseInt(workInput.value, 10) || 25;
let breakMin = parseInt(breakInput.value, 10) || 5;

let mode = 'work'; // 'work' or 'break'
let running = false;
let remaining = workMin * 60;
let lastTick = null;
let timerId = null;
let alarmInterval = null;

/* Helpers */
function secsToMMSS(t) {
  const mm = Math.floor(t / 60);
  const ss = Math.floor(t % 60);
  return String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
}

function renderPomo() {
  pomoTimeEl.textContent = secsToMMSS(remaining);
  pomoModeEl.textContent = mode === 'work' ? 'FOCUS KA MUNA BABY!' : 'Pahinga ka muna';
}

/* Start/Pause/Reset */
function startTimer() {
  if (running) return;
  
  // Stop alarm if it's playing
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
  
  running = true;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  lastTick = performance.now();
  tick();
}

function pauseTimer() {
  running = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  if (timerId) cancelAnimationFrame(timerId);
}

function resetTimer() {
  pauseTimer();
  mode = 'work';
  remaining = (parseInt(workInput.value, 10) || 25) * 60;
  renderPomo();
}

/* Switch mode */
function switchMode() {
  mode = (mode === 'work') ? 'break' : 'work';
  remaining = (mode === 'work' ? 
    (parseInt(workInput.value, 10) || 25) : 
    (parseInt(breakInput.value, 10) || 5)) * 60;
  renderPomo();
}

/* Tick loop using rAF */
function tick(now) {
  if (!running) return;
  if (!now) now = performance.now();
  const dt = (now - lastTick) / 1000;
  lastTick = now;
  remaining -= dt;
  
  if (remaining <= 0) {
    // Play beep and switch
    playBeep();
    switchMode();
    lastTick = performance.now();
  }
  
  renderPomo();
  timerId = requestAnimationFrame(tick);
}

/* Extended beep - plays for 10 seconds or until start is clicked */
function playBeep() {
  let beepCount = 0;
  const maxBeeps = 10; // 10 beeps over ~10 seconds
  
  // Clear any existing alarm
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
  
  function singleBeep() {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const o = ac.createOscillator();
      const g = ac.createGain();
      
      o.type = 'sine';
      o.frequency.value = 880;
      
      g.gain.setValueAtTime(0.9, ac.currentTime);
      
      o.connect(g);
      g.connect(ac.destination);
      
      o.start(ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.9);
      o.stop(ac.currentTime + 0.9);
      
      if (ac.state === 'suspended') {
        ac.resume();
      }
    } catch (e) {
      console.error('Audio playback error:', e);
    }
  }
  
  // Play first beep immediately
  singleBeep();
  beepCount++;
  
  // Continue beeping every second
  alarmInterval = setInterval(() => {
    if (beepCount >= maxBeeps) {
      clearInterval(alarmInterval);
      alarmInterval = null;
      return;
    }
    singleBeep();
    beepCount++;
  }, 1000);
}

/* UI Events */
startBtn.addEventListener('click', () => {
  // Stop alarm when start is clicked
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
  
  // Read inputs fresh
  workMin = Math.max(1, Math.min(180, parseInt(workInput.value, 10) || 25));
  breakMin = Math.max(1, Math.min(60, parseInt(breakInput.value, 10) || 5));
  
  if (!running && (remaining <= 1 || remaining > 24 * 3600)) {
    remaining = workMin * 60;
  }
  startTimer();
});

pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

workInput.addEventListener('change', () => {
  workMin = Math.max(1, Math.min(180, parseInt(workInput.value, 10) || 25));
  if (!running && mode === 'work') remaining = workMin * 60;
  renderPomo();
});

breakInput.addEventListener('change', () => {
  breakMin = Math.max(1, Math.min(60, parseInt(breakInput.value, 10) || 5));
  if (!running && mode === 'break') remaining = breakMin * 60;
  renderPomo();
});

presets.forEach(btn => {
  btn.addEventListener('click', () => {
    presets.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const w = parseInt(btn.dataset.work, 10);
    const b = parseInt(btn.dataset.break, 10);
    workInput.value = w;
    breakInput.value = b;
    workInput.dispatchEvent(new Event('change'));
    breakInput.dispatchEvent(new Event('change'));
  });
});

/* Initialize */
resetTimer();
renderPomo();
pauseBtn.disabled = true;

/* Keyboard shortcuts */
document.addEventListener('keydown', (e) => {
  // Only work when in pomodoro mode
  if (modeToggle.checked) {
    if (e.code === 'Space') {
      e.preventDefault();
      if (running) pauseTimer(); 
      else startTimer();
    }
    if (e.key === 'r' || e.key === 'R') {
      resetTimer();
    }
  }
});

/* Expose for dev/debug */
window._pomo = {
  start: startTimer, 
  pause: pauseTimer, 
  reset: resetTimer, 
  switchMode: switchMode
};