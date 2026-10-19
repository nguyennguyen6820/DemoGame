# NEXUS GAMES // Cyberpunk Gaming Portal & Facebook Login

A futuristic, high-performance Cyberpunk web gaming portal featuring **Facebook Login (Meta for Developers OAuth 2.0 & JavaScript SDK v19.0)**, sandbox account testing, interactive Web Audio synthesizer, and a playable in-browser Canvas Arcade mini-game.

---

## 🌟 Key Features

- **Facebook Login Integration**:
  - Official Meta JavaScript SDK v19.0 integration (`public_profile`, `email`).
  - In-app Meta App ID configuration modal tab.
  - One-click Sandbox / Test Accounts simulator (`Alex Rivera`, `Sarah Jenkins`, `Ryu Tanaka`) for instant testing on `localhost`.
  - Automatic `localStorage` user session management (Avatar, Level, VIP rank, Cyber Credits).
- **Cyberpunk UI & Visuals**:
  - Curated neon palette, glassmorphism (`backdrop-filter`), polygonal clip-paths, scanlines, and animated particle grid.
  - Google Fonts: Orbitron, Rajdhani, and Inter.
- **Game Library**:
  - Real-time search and genre filter (Action RPG, Cyber Ninja, Mecha Shooter, Neon Racing, Strategy).
  - Favorites/wishlist persistence.
- **Web Audio Synthesizer**:
  - Native Web Audio API sound effects for UI hover, clicks, and laser firing without external audio files.
- **Playable Arcade Mini-Game**:
  - Interactive HTML5 Canvas laser shooter with mouse aiming, particle explosions, and real-time score tracking.

---

## 🚀 Getting Started

### 1. Run with Node.js
Clone the repository and launch the built-in lightweight static server:
```bash
git clone https://github.com/nguyennguyen6820/DemoGame.git
cd DemoGame
node server.js
```
Open [http://localhost:3456](http://localhost:3456) in your browser.

### 2. Or Open Directly
You can also open `index.html` directly in any modern web browser or serve via any static HTTP server (e.g. `npx serve`, Python `http.server`, or VS Code Live Server).

---

## ⚙️ Connecting Your Meta Facebook App ID

1. Create a new App on [Meta for Developers](https://developers.facebook.com/).
2. Add the **Facebook Login** product.
3. Add your domain URL (e.g., `http://localhost:3456/`) to **Valid OAuth Redirect URIs**.
4. In the portal UI, click **LOGIN WITH FACEBOOK** > **META APP ID**, enter your App ID, and click **SAVE & RE-INITIALIZE SDK**.

---

## 📄 License
MIT License. Created for demonstration and game development purposes.
