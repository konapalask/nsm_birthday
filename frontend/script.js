/* Interactive Script for Maheedhar. V's Birthday Wishes */

document.addEventListener('DOMContentLoaded', () => {
  // --- Floating Gold Particles System ---
  initGoldParticles();

  // --- 3D Card Parallax Tilt Effect ---
  initCard3DParallax();

  // --- Live Guestbook / Wish Wall (localStorage) ---
  initGuestbook();

  // --- Audio Controller & Visualizer ---
  initAudioSystem();

  // --- Initial Confetti Shower ---
  triggerInitialConfetti();
});

// 1. Particle Canvas System
function initGoldParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');

  let particlesArray = [];
  const maxParticles = 65;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = Math.random() * 0.4 - 0.2;
      this.speedY = Math.random() * 0.6 - 0.3 - 0.15; // Slow drift upward
      this.opacity = Math.random() * 0.5 + 0.1;
      this.pulseSpeed = Math.random() * 0.02 + 0.005;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Wrap around screen boundaries
      if (this.x < 0 || this.x > canvas.width) this.x = Math.random() * canvas.width;
      if (this.y < 0) {
        this.y = canvas.height;
        this.x = Math.random() * canvas.width;
      }

      // Shimmer/pulse opacity
      this.opacity += this.pulseSpeed;
      if (this.opacity > 0.8 || this.opacity < 0.1) {
        this.pulseSpeed = -this.pulseSpeed;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(243, 229, 171, ${Math.abs(this.opacity)})`;
      ctx.shadowBlur = this.size * 2;
      ctx.shadowColor = '#D4AF37';
      ctx.fill();
    }
  }

  // Populate particles
  for (let i = 0; i < maxParticles; i++) {
    particlesArray.push(new Particle());
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.shadowBlur = 0; // Reset shadow for efficiency
    
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
      particlesArray[i].draw();
    }
    requestAnimationFrame(animate);
  }
  
  animate();
}

// 2. 3D Card Parallax Tilt Effect
function initCard3DParallax() {
  const cardContainer = document.querySelector('.perspective-container');
  const card = document.querySelector('.birthday-card-3d');

  if (!cardContainer || !card) return;

  // Track if card is flipped (3D RotateY(180deg))
  let isFlipped = false;

  // Tilt Card on Mouse Move (only if on desktop with hover capability)
  cardContainer.addEventListener('mousemove', (e) => {
    // If flipped, don't perform traditional tilt because rotation is reversed
    if (isFlipped) {
      card.style.transform = 'rotateY(180deg)';
      return;
    }

    const rect = cardContainer.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position inside element
    const y = e.clientY - rect.top;  // y position inside element
    
    // Calculate offsets from the center (values from -0.5 to 0.5)
    const offsetX = (x / rect.width) - 0.5;
    const offsetY = (y / rect.height) - 0.5;

    // Set maximum tilt angles
    const maxTiltX = 18; // Degrees tilt vertically
    const maxTiltY = 18; // Degrees tilt horizontally

    const tiltX = -(offsetY * maxTiltX);
    const tiltY = offsetX * maxTiltY;

    card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  });

  // Reset Card Tilt on Mouse Leave
  cardContainer.addEventListener('mouseleave', () => {
    if (isFlipped) {
      card.style.transform = 'rotateY(180deg)';
    } else {
      card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    }
  });

  // Toggle Flip on Click (Crucial for mobile and custom triggers)
  cardContainer.addEventListener('click', (e) => {
    // Do not flip if clicked on interactive buttons inside
    if (e.target.closest('.celebrate-btn') || e.target.closest('a')) {
      return;
    }
    
    isFlipped = !isFlipped;
    
    if (isFlipped) {
      card.classList.add('flipped');
      card.style.transform = 'rotateY(180deg)';
      // Trigger a confetti burst when card is flipped open!
      triggerConfettiBurst(0.5, 0.55);
    } else {
      card.classList.remove('flipped');
      card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    }
  });

  // Hook custom reveal button
  const celebrateBtn = document.querySelector('.celebrate-btn');
  if (celebrateBtn) {
    celebrateBtn.addEventListener('click', () => {
      triggerConfettiBurst(0.5, 0.4);
      
      // Flash card border gold glow
      card.style.boxShadow = '0 0 50px rgba(212, 175, 55, 0.6)';
      setTimeout(() => {
        card.style.boxShadow = '';
      }, 1000);
    });
  }
}

// 3. Audio Controller System
function initAudioSystem() {
  const audioBtn = document.getElementById('audioBtn');
  // High quality classical/piano instrumental background track
  const bgMusic = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3');
  bgMusic.loop = true;
  bgMusic.volume = 0.35; // Soft volume for elegant background ambiance

  if (!audioBtn) return;

  audioBtn.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play()
        .then(() => {
          audioBtn.classList.add('playing');
          document.getElementById('audioStatusText').textContent = 'Mute Music';
        })
        .catch(err => {
          console.log("Audio play failed or user interaction required:", err);
        });
    } else {
      bgMusic.pause();
      audioBtn.classList.remove('playing');
      document.getElementById('audioStatusText').textContent = 'Play Sound';
    }
  });
}

// 4. Live Guestbook / Wish Wall
function initGuestbook() {
  const wishForm = document.getElementById('wishForm');
  const wishesBoard = document.getElementById('wishesBoard');
  const wishesCountEl = document.getElementById('wishesCount');

  // Hardcoded premium initial wishes
  const defaultWishes = [
    {
      id: 'default-1',
      name: 'NSM 94 Classmates',
      batch: 'NSM 1994',
      message: 'A very happy birthday and have a great day! Wishing you a legendary year ahead filled with happiness, health, and endless success. Keep smiling!'
    },
    {
      id: 'default-2',
      name: 'Sanjay Kumar',
      batch: 'NSM 1994',
      message: 'Happy Birthday Maheedhar! May this day bring beautiful memories, robust health, and joy that lasts the entire year. Once classmates, always family! 🎂🎉'
    },
    {
      id: 'default-3',
      name: 'Priya Sharma',
      batch: 'NSM 1994',
      message: 'Wishing you an absolute blast on your birthday! Cheers to more reunions and celebrating the timeless bond we share as the NSM family!'
    }
  ];

  // Load existing wishes from localStorage or fall back to default
  let storedWishes = JSON.parse(localStorage.getItem('nsm94_maheedhar_wishes'));
  if (!storedWishes || storedWishes.length === 0) {
    storedWishes = defaultWishes;
    localStorage.setItem('nsm94_maheedhar_wishes', JSON.stringify(storedWishes));
  }

  // Render wishes board
  function renderWishes() {
    wishesBoard.innerHTML = '';
    wishesCountEl.textContent = storedWishes.length;

    storedWishes.forEach(wish => {
      const isDefault = wish.id.toString().startsWith('default');

      const card = document.createElement('div');
      card.className = 'wish-card';
      card.innerHTML = `
        <div class="wish-card-decor">“</div>
        <p class="wish-card-text">${escapeHtml(wish.message)}</p>
        <div class="wish-card-author">
          <div class="author-info">
            <span class="author-name">${escapeHtml(wish.name)}</span>
            <span class="author-batch">${escapeHtml(wish.batch)}</span>
          </div>
          ${!isDefault ? `
            <button class="delete-wish-btn" data-id="${wish.id}" title="Remove wish">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          ` : ''}
        </div>
      `;
      wishesBoard.appendChild(card);
    });

    // Hook delete buttons
    const deleteBtns = wishesBoard.querySelectorAll('.delete-wish-btn');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        deleteWish(id);
      });
    });
  }

  // Add new wish
  if (wishForm) {
    wishForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('senderName');
      const batchInput = document.getElementById('senderBatch');
      const messageInput = document.getElementById('senderMessage');

      const name = nameInput.value.trim();
      const batch = batchInput.value.trim() || 'Alumni';
      const message = messageInput.value.trim();

      if (!name || !message) return;

      const newWish = {
        id: Date.now().toString(),
        name: name,
        batch: batch,
        message: message
      };

      storedWishes.unshift(newWish);
      localStorage.setItem('nsm94_maheedhar_wishes', JSON.stringify(storedWishes));
      
      renderWishes();
      triggerConfettiBurst(0.5, 0.8);

      // Reset form
      wishForm.reset();
    });
  }

  function deleteWish(id) {
    storedWishes = storedWishes.filter(w => w.id !== id);
    localStorage.setItem('nsm94_maheedhar_wishes', JSON.stringify(storedWishes));
    renderWishes();
  }

  function escapeHtml(string) {
    return String(string).replace(/[&<>"']/g, function (s) {
      const entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };
      return entityMap[s];
    });
  }

  renderWishes();
}

// 5. Confetti Triggers
function triggerInitialConfetti() {
  setTimeout(() => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#FFF5D1', '#FFFFFF', '#AA7C11']
    });
  }, 1000);
}

function triggerConfettiBurst(originX, originY) {
  confetti({
    particleCount: 80,
    angle: 60,
    spread: 55,
    origin: { x: originX - 0.1, y: originY },
    colors: ['#D4AF37', '#FFF5D1', '#FFFFFF', '#AA7C11']
  });
  confetti({
    particleCount: 80,
    angle: 120,
    spread: 55,
    origin: { x: originX + 0.1, y: originY },
    colors: ['#D4AF37', '#FFF5D1', '#FFFFFF', '#AA7C11']
  });
}
