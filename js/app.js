/**
 * NEXUS GAMING PORTAL - MAIN APPLICATION CONTROLLER
 * Handles Game catalog, Filtering, Web Audio Synthesizer, Mini-Game Arcade, and UI interactivity
 * Fully localized in English.
 */

class NexusGamePortal {
  constructor() {
    this.audioEnabled = false;
    this.audioCtx = null;
    this.activeFilter = 'all';
    this.searchQuery = '';
    this.favorites = JSON.parse(localStorage.getItem('nexus_favorites') || '[]');

    this.games = [
      {
        id: 'neo-nexus',
        title: 'Neo Nexus: Rise from the Wires',
        genre: 'rpg',
        genreLabel: 'Action RPG',
        image: 'assets/images/hero.jpg',
        rating: '4.9',
        players: '84,230',
        badge: 'FEATURED',
        badgeColor: 'pink',
        desc: 'Step into Neo-Tokyo 2099 to wage war against rogue quantum AI syndicates and corrupt megacorporations.',
        tags: ['Cyberpunk', 'Ray Tracing', 'Co-op RPG', 'Open World']
      },
      {
        id: 'shadow-protocol',
        title: 'Shadow Protocol: Cyber Ninja',
        genre: 'action',
        genreLabel: 'Stealth Action',
        image: 'assets/images/ninja.jpg',
        rating: '4.8',
        players: '62,810',
        badge: 'TRENDING',
        badgeColor: 'cyan',
        desc: 'Infiltrate neon-drenched sky-districts armed with high-frequency dual plasma katanas and tactical stealth augments.',
        tags: ['Stealth', 'Katana Combat', 'Parkour', 'Hardcore']
      },
      {
        id: 'mecha-strike',
        title: 'Mecha Strike: Quantum Front',
        genre: 'shooter',
        genreLabel: 'Sci-Fi Shooter',
        image: 'assets/images/mecha.jpg',
        rating: '4.7',
        players: '91,400',
        badge: 'ESPORTS',
        badgeColor: 'yellow',
        desc: 'Pilot colossal walking warframes armed with heavy plasma beam cannons in intense 5v5 competitive team combat.',
        tags: ['Mecha', '5v5 Arena', 'Crossplay', 'Tactical FPS']
      },
      {
        id: 'neon-velocity',
        title: 'Neon Velocity: Cyber Sprint',
        genre: 'racing',
        genreLabel: 'Neon Racing',
        image: 'assets/images/racer.jpg',
        rating: '4.9',
        players: '45,190',
        badge: 'NEW',
        badgeColor: 'green',
        desc: 'Break sound barriers on anti-gravity skyways with customizable hypercars set to adrenaline synthwave tracks.',
        tags: ['Hyper Racing', 'Synthwave', 'Anti-Gravity', 'PvP']
      },
      {
        id: 'aether-void',
        title: 'Aether Void: Stellar Odyssey',
        genre: 'strategy',
        genreLabel: 'Sci-Fi Strategy',
        image: 'assets/images/hero.jpg',
        rating: '4.6',
        players: '33,720',
        badge: 'BETA',
        badgeColor: 'cyan',
        desc: 'Command interstellar battlefleets, harvest wormhole energy nodes, and build galactic trade alliances.',
        tags: ['Space RTS', 'Fleet Command', 'Multiplayer', 'Economy']
      },
      {
        id: 'cyber-arena-hacker',
        title: 'Cyber Grid: Hacker Warfare',
        genre: 'action',
        genreLabel: 'Tactical Cyber',
        image: 'assets/images/ninja.jpg',
        rating: '4.7',
        players: '28,900',
        badge: 'UPDATE',
        badgeColor: 'pink',
        desc: 'Breach secure global mainframe ICE firewalls, deploy counter-malware, and out-hack rival operatives.',
        tags: ['Cyber Warfare', 'Turn-Based', 'Deckbuilder', 'PvP']
      }
    ];

    this.init();
  }

  init() {
    this.renderGamesGrid();
    this.initFilterControls();
    this.initSearch();
    this.initCountdown();
    this.initAudioSynthesizer();
    this.initCanvasArcadeGame();
  }

  /* Audio FX using Web Audio API */
  initAudioSynthesizer() {
    const audioBtn = document.getElementById('audio-toggle-btn');
    if (!audioBtn) return;

    audioBtn.addEventListener('click', () => {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.audioEnabled = !this.audioEnabled;
      audioBtn.innerHTML = this.audioEnabled 
        ? `<span>🔊</span> AUDIO: ON` 
        : `<span>🔇</span> AUDIO: OFF`;
      
      if (this.audioEnabled) {
        this.playUiSound('confirm');
      }
    });

    // Attach subtle sound to buttons
    document.addEventListener('mouseover', (e) => {
      if (!this.audioEnabled || !this.audioCtx) return;
      if (e.target.closest('button') || e.target.closest('.nav-link') || e.target.closest('.cyber-card')) {
        this.playUiSound('hover');
      }
    });
  }

  playUiSound(type = 'hover') {
    if (!this.audioEnabled || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;

      if (type === 'hover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'confirm') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'laser') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1500, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.12);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      }
    } catch (e) {
      // Audio context policy
    }
  }

  /* Game Catalog Filter & Search */
  initFilterControls() {
    const tabs = document.querySelectorAll('.filter-tab-btn');
    tabs.forEach(btn => {
      btn.addEventListener('click', () => {
        tabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.dataset.filter || 'all';
        this.renderGamesGrid();
        this.playUiSound('confirm');
      });
    });
  }

  initSearch() {
    const searchInput = document.getElementById('game-search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderGamesGrid();
    });
  }

  getFilteredGames() {
    return this.games.filter(game => {
      const matchFilter = this.activeFilter === 'all' || game.genre === this.activeFilter;
      const matchSearch = !this.searchQuery || 
        game.title.toLowerCase().includes(this.searchQuery) ||
        game.desc.toLowerCase().includes(this.searchQuery) ||
        game.genreLabel.toLowerCase().includes(this.searchQuery) ||
        game.tags.some(t => t.toLowerCase().includes(this.searchQuery));
      return matchFilter && matchSearch;
    });
  }

  renderGamesGrid() {
    const grid = document.getElementById('games-grid-container');
    if (!grid) return;

    const filtered = this.getFilteredGames();

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 12px;">🔍</div>
          <div style="font-family: var(--font-display); font-size: 1.2rem; color: #fff;">NO GAMES FOUND MATCHING YOUR CRITERIA</div>
          <p style="margin-top: 8px;">Try searching for another keyword or clear the active filter.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(game => {
      const isFav = this.favorites.includes(game.id);
      return `
        <article class="cyber-card" data-id="${game.id}">
          <div class="card-media">
            <img class="card-img" src="${game.image}" alt="${game.title}" loading="lazy" />
            <div class="card-overlay"></div>
            <div class="card-badges">
              <span class="badge-neon badge-neon-${game.badgeColor}">${game.badge}</span>
            </div>
            <button class="card-fav-btn ${isFav ? 'active' : ''}" 
                    title="${isFav ? 'Remove from wishlist' : 'Add to wishlist'}" 
                    onclick="nexusGamePortal.toggleFavorite('${game.id}', event)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
          </div>
          
          <div class="card-body">
            <div class="card-meta-line">
              <span class="card-genre">${game.genreLabel}</span>
              <span class="card-rating">★ ${game.rating}</span>
            </div>
            <h3 class="card-title">${game.title}</h3>
            <p class="card-desc">${game.desc}</p>
            
            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:16px;">
              ${game.tags.map(t => `<span style="font-size:0.75rem; background:rgba(255,255,255,0.06); padding:2px 8px; border-radius:2px; color:#8ea3c4;">#${t}</span>`).join('')}
            </div>

            <div class="card-footer-action">
              <div class="player-counter">
                <span>●</span> ${game.players} Active
              </div>
              <button class="btn-cyber btn-cyber-primary" style="padding: 8px 16px; font-size: 0.85rem;" onclick="nexusGamePortal.launchGame('${game.id}')">
                PLAY NOW
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  toggleFavorite(gameId, event) {
    if (event) event.stopPropagation();
    const index = this.favorites.indexOf(gameId);
    if (index > -1) {
      this.favorites.splice(index, 1);
      nexusAuth.showToast('Removed from wishlist!', 'facebook');
    } else {
      this.favorites.push(gameId);
      nexusAuth.showToast('Added to your favorite wishlist!', 'success');
      this.playUiSound('confirm');
    }
    localStorage.setItem('nexus_favorites', JSON.stringify(this.favorites));
    this.renderGamesGrid();
  }

  /* Launch Game or Check Auth */
  launchGame(gameId) {
    const game = this.games.find(g => g.id === gameId) || this.games[0];

    // Check if user is authenticated via Facebook
    if (!nexusAuth.currentUser) {
      // Prompt Facebook login
      nexusAuth.showToast(`Please connect your Facebook account to play "${game.title}"!`, 'facebook');
      nexusAuth.openLoginModal('fb');
      return;
    }

    // User is logged in, open the interactive Cyber Arcade Canvas game
    this.openGameModal(game);
  }

  openGameModal(game) {
    const modal = document.getElementById('game-play-modal');
    if (!modal) return;

    document.getElementById('game-modal-title').textContent = game.title;
    document.getElementById('game-modal-user').textContent = nexusAuth.currentUser.name;
    modal.classList.add('show');

    // Start mini arcade canvas
    this.startArcadeMiniGame();
  }

  closeGameModal() {
    const modal = document.getElementById('game-play-modal');
    if (modal) modal.classList.remove('show');
    if (this.arcadeAnimationId) {
      cancelAnimationFrame(this.arcadeAnimationId);
      this.arcadeAnimationId = null;
    }
  }

  /* Interactive Cyber Arcade Canvas Mini-Game */
  initCanvasArcadeGame() {
    this.arcadeCanvas = document.getElementById('arcade-canvas');
    if (!this.arcadeCanvas) return;
    this.arcadeCtx = this.arcadeCanvas.getContext('2d');
  }

  startArcadeMiniGame() {
    if (!this.arcadeCanvas) this.initCanvasArcadeGame();
    if (!this.arcadeCanvas) return;

    const canvas = this.arcadeCanvas;
    const ctx = this.arcadeCtx;
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight || 380;

    let playerX = canvas.width / 2;
    let score = 0;
    const targets = [];
    const particles = [];

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      playerX = e.clientX - rect.left;
    };

    const handleClick = () => {
      this.playUiSound('laser');
      // Create laser beam
      targets.forEach((tgt, index) => {
        if (Math.abs(tgt.x - playerX) < 40 && tgt.y > 0) {
          // Hit!
          score += 100;
          document.getElementById('arcade-score-val').textContent = score;
          
          // Explosion particles
          for (let i = 0; i < 15; i++) {
            particles.push({
              x: tgt.x,
              y: tgt.y,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              color: tgt.color,
              alpha: 1
            });
          }
          targets.splice(index, 1);
        }
      });
    };

    canvas.removeEventListener('mousemove', canvas._mouseHandler);
    canvas.removeEventListener('click', canvas._clickHandler);
    canvas._mouseHandler = handleMouseMove;
    canvas._clickHandler = handleClick;
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    let frame = 0;
    const loop = () => {
      ctx.fillStyle = 'rgba(7, 10, 22, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Spawn target
      frame++;
      if (frame % 35 === 0) {
        targets.push({
          x: Math.random() * (canvas.width - 60) + 30,
          y: -20,
          speed: 2 + Math.random() * 2.5,
          color: Math.random() > 0.5 ? '#00f3ff' : '#ff006e',
          size: 16
        });
      }

      // Update & Draw targets
      for (let i = targets.length - 1; i >= 0; i--) {
        const t = targets[i];
        t.y += t.speed;
        ctx.save();
        ctx.fillStyle = t.color;
        ctx.shadowColor = t.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (t.y > canvas.height + 30) {
          targets.splice(i, 1);
        }
      }

      // Update & Draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.03;
        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw Player Ship / Reticle
      ctx.save();
      ctx.strokeStyle = '#00f3ff';
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playerX, canvas.height - 40);
      ctx.lineTo(playerX - 25, canvas.height - 15);
      ctx.lineTo(playerX + 25, canvas.height - 15);
      ctx.closePath();
      ctx.stroke();

      // Laser guide line
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.25)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(playerX, canvas.height - 40);
      ctx.lineTo(playerX, 0);
      ctx.stroke();
      ctx.restore();

      this.arcadeAnimationId = requestAnimationFrame(loop);
    };

    loop();
  }

  /* Daily Reward */
  triggerDailyReward() {
    nexusAuth.closeDropdown();
    if (!nexusAuth.currentUser) {
      nexusAuth.openLoginModal();
      return;
    }
    const bonus = 500;
    nexusAuth.currentUser.credits = (nexusAuth.currentUser.credits || 0) + bonus;
    nexusAuth.saveSession(nexusAuth.currentUser);
    nexusAuth.showToast(`🎁 Claimed! +${bonus} Daily Cyber Credits added to your balance!`, 'success');
    this.playUiSound('confirm');
  }

  /* Countdown Timer */
  initCountdown() {
    const dElem = document.getElementById('cd-days');
    const hElem = document.getElementById('cd-hours');
    const mElem = document.getElementById('cd-mins');
    const sElem = document.getElementById('cd-secs');

    if (!dElem) return;

    let targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 4);
    targetDate.setHours(targetDate.getHours() + 14);

    const update = () => {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        dElem.textContent = String(days).padStart(2, '0');
        hElem.textContent = String(hours).padStart(2, '0');
        mElem.textContent = String(mins).padStart(2, '0');
        sElem.textContent = String(secs).padStart(2, '0');
      }
    };

    update();
    setInterval(update, 1000);
  }
}

// Global portal instance
window.nexusGamePortal = new NexusGamePortal();
