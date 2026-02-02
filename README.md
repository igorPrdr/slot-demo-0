# 🎰 React x PixiJS Slot Machine

A high-performance, mobile-first slot machine game built with **React**, **PixiJS**, and **GSAP**.

This project demonstrates the integration of a DOM-based UI (React) with a WebGL rendering engine (PixiJS) to create a smooth, casino-style gaming experience.

🔗 **[Play the Live Demo](https://igorPrdr.github.io/slot-demo-0/)**

![Project Screenshot](public/screenshot.png)

## ✨ Key Features

### 🎮 Game Mechanics
- **Physics-Based Reels:** Uses **GSAP** to handle spin acceleration, braking, and "elastic" stopping effects.
- **"Teaser" Stops:** Implements custom logic to occasionally stop reels slightly off-center (overshoot/undershoot) and gently correct them, adding suspense and realism.
- **Motion Blur:** Dynamic PixiJS blur filters applied based on reel speed.
- **Mock Backend:** Simulates server-side logic with weighted probability tables (Tier 1-4 wins) and win-line calculation.
- **Debug Mode:** Includes an "Always Win" toggle for testing payout animations.

### 📱 UI & UX
- **Mobile-First Design:** Fully responsive interface using CSS `clamp()` and flexible layouts to adapt to any screen size (from iPhone SE to Desktop).
- **Juicy Interactions:** Buttons feature CSS-based "bouncy" animations (scale overshoot) for satisfying feedback.
- **Hybrid Rendering:** - **PixiJS (WebGL):** Handles the high-speed rendering of reels and symbols (60FPS).
- **React (DOM):** Handles the game HUD (Balance, Bet Controls, Spin Button) for accessibility and ease of layout.

## 🛠 Tech Stack

- **Framework:** React 19 (TypeScript)
- **Compiler:** React Compiler (Babel Plugin)
- **Build Tool:** Vite 7
- **Rendering:** PixiJS v8
- **Animation:** GSAP (GreenSock) v3
- **Deployment:** GitHub Pages

