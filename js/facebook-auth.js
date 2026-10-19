/**
 * NEXUS GAMING PORTAL - FACEBOOK AUTHENTICATION CONTROLLER
 * Supports both Official Facebook JavaScript SDK and interactive Sandbox/Simulation Mode
 * Gracefully handles unconfigured App ID to avoid Facebook's PLATFORM__INVALID_APP_ID error popup.
 */

class FacebookAuthManager {
  constructor() {
    this.currentUser = null;
    this.fbSdkLoaded = false;
    this.appId = localStorage.getItem('nexus_fb_app_id') || '';
    this.STORAGE_KEY = 'nexus_user_session';

    this.mockAccounts = [
      {
        id: 'fb_1020304050',
        name: 'Alex "Viper" Rivera',
        email: 'alex.rivera.gamer@meta.com',
        picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
        level: 42,
        credits: 18500,
        vipTier: 'VIP 4 CYBER',
        winRate: '78%'
      },
      {
        id: 'fb_9876543210',
        name: 'Sarah "CyberNeon" Jenkins',
        email: 'sarah.jenkins99@meta.com',
        picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
        level: 35,
        credits: 12400,
        vipTier: 'VIP 2 ELITE',
        winRate: '69%'
      },
      {
        id: 'fb_5544332211',
        name: 'Ryu "Ronin" Tanaka',
        email: 'ryu.tanaka.mecha@nexus.io',
        picture: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&h=200&q=80',
        level: 58,
        credits: 46200,
        vipTier: 'VIP 5 LEGEND',
        winRate: '86%'
      }
    ];

    this.init();
  }

  init() {
    this.loadSavedSession();
    this.updateAppIdStatusBadge();

    if (this.hasValidAppId()) {
      this.initFacebookSDK();
    }

    this.renderAuthState();
  }

  hasValidAppId() {
    return Boolean(this.appId && this.appId.trim() && this.appId !== '1082938179928374');
  }

  updateAppIdStatusBadge() {
    const statusBox = document.getElementById('fb-app-status-box');
    if (!statusBox) return;

    if (this.hasValidAppId()) {
      statusBox.innerHTML = `
        <div style="background:rgba(5, 255, 161, 0.1); border:1px solid rgba(5, 255, 161, 0.4); border-radius:4px; padding:12px; margin-bottom:16px;">
          <div style="color:var(--neon-green); font-weight:700; font-size:0.85rem; display:flex; align-items:center; gap:6px;">
            <span>●</span> META APP ID CONFIGURED: <span style="font-family:monospace; color:#fff;">${this.escapeHtml(this.appId)}</span>
          </div>
          <div style="font-size:0.78rem; color:var(--text-muted); margin-top:4px;">
            Ready for live authentication. Make sure this domain is added to Valid OAuth Redirect URIs.
          </div>
        </div>
      `;
    } else {
      statusBox.innerHTML = `
        <div style="background:rgba(255, 190, 11, 0.12); border:1px solid rgba(255, 190, 11, 0.4); border-radius:4px; padding:12px; margin-bottom:16px;">
          <div style="color:var(--neon-yellow); font-weight:700; font-size:0.85rem; display:flex; align-items:center; gap:6px;">
            <span>⚠️</span> NO REAL FACEBOOK APP ID CONFIGURED YET
          </div>
          <div style="font-size:0.8rem; color:#cfd8ea; margin-top:4px; line-height:1.4;">
            Facebook requires a registered <strong>App ID</strong> from <a href="https://developers.facebook.com" target="_blank" style="color:var(--neon-cyan);">Meta for Developers</a> to log in with real accounts.
          </div>
          <div style="display:flex; gap:10px; margin-top:10px;">
            <button class="btn-cyber btn-cyber-primary" style="padding:6px 12px; font-size:0.8rem;" onclick="nexusAuth.switchModalTab('sandbox')">
              ⚡ USE TEST ACCOUNTS (INSTANT PLAY)
            </button>
            <button class="btn-cyber" style="padding:6px 12px; font-size:0.8rem; border:1px solid rgba(255,255,255,0.3);" onclick="nexusAuth.switchModalTab('config')">
              ⚙️ ENTER REAL APP ID
            </button>
          </div>
        </div>
      `;
    }
  }

  loadSavedSession() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (raw) {
      try {
        this.currentUser = JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse saved user session', e);
        this.currentUser = null;
      }
    }
  }

  saveSession(userData) {
    this.currentUser = userData;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
    this.renderAuthState();
    window.dispatchEvent(new CustomEvent('nexus:auth-changed', { detail: { user: userData } }));
  }

  clearSession() {
    this.currentUser = null;
    localStorage.removeItem(this.STORAGE_KEY);
    this.renderAuthState();
    window.dispatchEvent(new CustomEvent('nexus:auth-changed', { detail: { user: null } }));
  }

  initFacebookSDK() {
    window.fbAsyncInit = () => {
      if (typeof FB !== 'undefined') {
        try {
          FB.init({
            appId: this.appId,
            cookie: true,
            xfbml: true,
            version: 'v19.0'
          });
          this.fbSdkLoaded = true;
          console.log('[Nexus FB SDK] Facebook SDK initialized with App ID:', this.appId);

          if (!this.currentUser) {
            FB.getLoginStatus((response) => {
              if (response.status === 'connected') {
                this.fetchFacebookProfile(response.authResponse.accessToken);
              }
            });
          }
        } catch (err) {
          console.warn('[Nexus FB SDK] Could not init real FB SDK:', err);
        }
      }
    };

    if (!document.getElementById('facebook-jssdk')) {
      const js = document.createElement('script');
      js.id = 'facebook-jssdk';
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      js.async = true;
      js.defer = true;
      document.head.appendChild(js);
    }
  }

  loginWithOfficialFacebook() {
    if (!this.hasValidAppId()) {
      // Do NOT trigger FB.login to prevent Facebook PLATFORM__INVALID_APP_ID error popup!
      this.showToast('Please enter your Facebook App ID first, or switch to Test Accounts!', 'error');
      this.switchModalTab('config');
      return;
    }

    if (typeof FB !== 'undefined' && this.fbSdkLoaded) {
      FB.login((response) => {
        if (response.authResponse) {
          this.fetchFacebookProfile(response.authResponse.accessToken);
        } else {
          console.warn('[Nexus FB SDK] Facebook Login cancelled or error occurred.');
          this.showToast('Facebook Login cancelled or domain not whitelisted in Meta Console.', 'error');
        }
      }, { scope: 'public_profile,email' });
    } else {
      this.showToast('Connecting to Facebook SDK...', 'facebook');
      this.initFacebookSDK();
    }
  }

  fetchFacebookProfile(accessToken) {
    FB.api('/me', { fields: 'id,name,email,picture.width(200).height(200)' }, (res) => {
      if (res && !res.error) {
        const user = {
          id: res.id,
          name: res.name,
          email: res.email || `${res.id}@facebook.com`,
          picture: (res.picture && res.picture.data && res.picture.data.url) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
          level: 1,
          credits: 1000,
          vipTier: 'VIP 1 ROOKIE',
          winRate: '50%',
          authProvider: 'facebook_real',
          accessToken: accessToken
        };
        this.saveSession(user);
        this.closeLoginModal();
        this.showToast(`Welcome ${user.name}! Facebook Login successful.`, 'success');
      } else {
        this.showToast('Could not retrieve profile from Facebook Graph API.', 'error');
      }
    });
  }

  loginWithMockAccount(index) {
    const account = this.mockAccounts[index] || this.mockAccounts[0];
    const user = {
      ...account,
      authProvider: 'facebook_sandbox',
      loginTime: new Date().toISOString()
    };
    this.saveSession(user);
    this.closeLoginModal();
    this.showToast(`Successfully logged in with Facebook: ${user.name}!`, 'success');
  }

  loginWithCustomData(name, email, avatarUrl) {
    const user = {
      id: 'fb_' + Math.floor(100000000 + Math.random() * 900000000),
      name: name.trim() || 'Cyber Operative',
      email: email.trim() || 'operative@nexus.net',
      picture: avatarUrl || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200',
      level: 15,
      credits: 5000,
      vipTier: 'VIP 2 ELITE',
      winRate: '65%',
      authProvider: 'facebook_custom'
    };
    this.saveSession(user);
    this.closeLoginModal();
    this.showToast(`Connected Facebook account: ${user.name}`, 'success');
  }

  logout() {
    if (this.currentUser && this.currentUser.authProvider === 'facebook_real' && typeof FB !== 'undefined') {
      try {
        FB.logout();
      } catch (e) {
        console.warn('FB.logout warning', e);
      }
    }
    const name = this.currentUser ? this.currentUser.name : 'User';
    this.clearSession();
    this.closeDropdown();
    this.showToast(`Logged out from Facebook account (${name}).`, 'facebook');
  }

  renderAuthState() {
    const authContainer = document.getElementById('navbar-auth-section');
    if (!authContainer) return;

    if (this.currentUser) {
      authContainer.innerHTML = `
        <div class="user-profile-badge" id="user-badge-btn" onclick="nexusAuth.toggleDropdown()">
          <div class="user-avatar-wrap">
            <img class="user-avatar-img" src="${this.currentUser.picture}" alt="${this.currentUser.name}" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'" />
            <div class="fb-badge-icon">f</div>
          </div>
          <div class="user-info-text">
            <div class="user-name-display">${this.escapeHtml(this.currentUser.name)}</div>
            <div class="user-meta-sub">
              <span>LV.${this.currentUser.level || 1}</span>
              <span class="user-vip-tag">${this.currentUser.vipTier || 'VIP'}</span>
              <span>⚡ ${Number(this.currentUser.credits || 0).toLocaleString()} C</span>
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:4px; opacity:0.7"><path d="m6 9 6 6 6-6"/></svg>
        </div>

        <div class="user-dropdown-menu" id="user-dropdown-menu">
          <div class="dropdown-header">
            <div style="font-weight:700; color:#fff; font-size:0.95rem">${this.escapeHtml(this.currentUser.name)}</div>
            <div class="dropdown-fb-id">FB ID: ${this.currentUser.id}</div>
            <div style="font-size:0.75rem; color:#05ffa1; margin-top:4px;">● Facebook Account Synced</div>
          </div>
          <button class="dropdown-item" onclick="nexusAuth.openProfileModal()">
            <span>👤</span> Operative Dossier & Wallet
          </button>
          <button class="dropdown-item" onclick="nexusAuth.openAppIdConfigModal()">
            <span>⚙️</span> Meta Facebook App ID Settings
          </button>
          <button class="dropdown-item" onclick="nexusGamePortal.triggerDailyReward()">
            <span>🎁</span> Daily Check-In Bonus (+500 Credits)
          </button>
          <button class="dropdown-item danger" onclick="nexusAuth.logout()">
            <span>🚪</span> Disconnect & Log Out
          </button>
        </div>
      `;
    } else {
      authContainer.innerHTML = `
        <button class="btn-cyber btn-cyber-fb" id="btn-open-login" onclick="nexusAuth.openLoginModal()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          LOGIN WITH FACEBOOK
        </button>
      `;
    }
  }

  toggleDropdown() {
    const menu = document.getElementById('user-dropdown-menu');
    if (menu) {
      menu.classList.toggle('show');
    }
  }

  closeDropdown() {
    const menu = document.getElementById('user-dropdown-menu');
    if (menu) {
      menu.classList.remove('show');
    }
  }

  openLoginModal(defaultTab = 'fb') {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.add('show');
      this.updateAppIdStatusBadge();
      this.switchModalTab(defaultTab);
    }
  }

  closeLoginModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('show');
    }
  }

  switchModalTab(tabName) {
    const tabFb = document.getElementById('tab-content-fb');
    const tabSandbox = document.getElementById('tab-content-sandbox');
    const tabConfig = document.getElementById('tab-content-config');
    const tabBtns = document.querySelectorAll('.modal-tab-btn');

    tabBtns.forEach(b => b.classList.remove('active'));

    if (tabFb) tabFb.style.display = 'none';
    if (tabSandbox) tabSandbox.style.display = 'none';
    if (tabConfig) tabConfig.style.display = 'none';

    const activeBtn = document.getElementById(`tab-btn-${tabName}`);
    if (activeBtn) activeBtn.classList.add('active');

    if (tabName === 'fb' && tabFb) tabFb.style.display = 'block';
    if (tabName === 'sandbox' && tabSandbox) tabSandbox.style.display = 'block';
    if (tabName === 'config' && tabConfig) {
      tabConfig.style.display = 'block';
      const input = document.getElementById('cfg-fb-app-id');
      if (input) input.value = this.appId;
    }
  }

  openProfileModal() {
    this.closeDropdown();
    if (!this.currentUser) return;
    const modal = document.getElementById('profile-modal');
    if (modal) {
      document.getElementById('profile-modal-avatar').src = this.currentUser.picture;
      document.getElementById('profile-modal-name').textContent = this.currentUser.name;
      document.getElementById('profile-modal-email').textContent = this.currentUser.email;
      document.getElementById('profile-modal-fbid').textContent = this.currentUser.id;
      document.getElementById('profile-modal-level').textContent = this.currentUser.level;
      document.getElementById('profile-modal-credits').textContent = Number(this.currentUser.credits).toLocaleString();
      document.getElementById('profile-modal-vip').textContent = this.currentUser.vipTier;
      document.getElementById('profile-modal-winrate').textContent = this.currentUser.winRate || '75%';
      modal.classList.add('show');
    }
  }

  closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.classList.remove('show');
  }

  openAppIdConfigModal() {
    this.closeDropdown();
    this.openLoginModal('config');
  }

  saveCustomAppId() {
    const input = document.getElementById('cfg-fb-app-id');
    if (input) {
      const val = input.value.trim();
      if (!val) {
        this.showToast('Please enter a valid numeric Meta App ID!', 'error');
        return;
      }
      this.appId = val;
      localStorage.setItem('nexus_fb_app_id', this.appId);
      this.showToast(`Meta App ID (${this.appId}) saved! Reloading Facebook SDK...`, 'success');
      setTimeout(() => {
        location.reload();
      }, 900);
    }
  }

  showToast(message, type = 'success') {
    let container = document.getElementById('cyber-toasts');
    if (!container) {
      container = document.createElement('div');
      container.id = 'cyber-toasts';
      container.className = 'cyber-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `cyber-toast ${type}`;
    let icon = '⚡';
    if (type === 'facebook') icon = '🔵';
    if (type === 'error') icon = '⚠️';
    if (type === 'success') icon = '✅';

    toast.innerHTML = `
      <div style="font-size:1.2rem;">${icon}</div>
      <div style="font-size:0.9rem; font-weight:600;">${this.escapeHtml(message)}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }
}

// Global instance
window.nexusAuth = new FacebookAuthManager();

// Close dropdown on outside click
document.addEventListener('click', (e) => {
  const badge = document.getElementById('user-badge-btn');
  const menu = document.getElementById('user-dropdown-menu');
  if (menu && badge && !badge.contains(e.target) && !menu.contains(e.target)) {
    menu.classList.remove('show');
  }
});
