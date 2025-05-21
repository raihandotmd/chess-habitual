# Chess.com Habits Reminder

<p align="center">
  <img src="icons/icon128.png" alt="Chess Habits Reminder Logo" width="128" height="128">
</p>

A lightweight browser extension to help you build stronger chess habits—based on the _"Building Habits"_ video series by GM Aman Hambleton (Chessbrah).

Perfect for players looking to improve with structured reminders tailored to their ELO level.

---

## 🧠 Features

- 🎯 **Level-based habits**: Tailored habits for four ELO ranges (0–2000+)
- 🧾 **Expandable explanations**: Tap any habit to learn the "why"
- 🧲 **Draggable reminders**: Move the habit box anywhere on the Chess.com board
- 🧩 **Fully customizable**: Toggle reminders on/off anytime
- 🧼 **Minimal design**: Seamlessly blends into your chess workflow

---

## 📦 Installation

> 🔔 **Note:** Chrome and Firefox versions are coming soon!

### 🔨 Manual Installation (Development Mode)

#### 🧩 Chrome

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select the project directory
5. The extension icon should appear in your toolbar

#### 🦊 Firefox

(WIP) - not tested yet!

---

## 🚀 Usage

1. Click the **Chess Habits Reminder** icon in your browser toolbar
2. Select your **ELO level**
3. Browse and expand habit items to understand them
4. Check "Show reminder on Chess.com"
5. Go to [Chess.com](https://www.chess.com)—the habit box will appear
6. Drag the reminder to your preferred location
7. Minimize ( `-` ) or close ( `×` ) it when needed

---

## 🧩 Levels Overview

| Level     | ELO Range | Focus |
|-----------|------------|-------|
| **Level 1** | 0–700      | Learn basic piece movement, avoid blunders, develop pieces, no tactics or gambits |
| **Level 2** | 700–1100   | Basic tactics and faster play, limited premoves, focus on piece coordination |
| **Level 3** | 1100–1550  | Active chess, basic openings, aggressive ideas without sacrifices |
| **Level 4** | 1550–2000+ | Endgames, advanced tactics, strategic trades, checkmate patterns, pawn structures |

---

## 📁 Project Structure

```

chess-habits-reminder/
├── manifest.json        # Extension config
├── data/              
│   ├── data.js          # Habit definitions
├── popup/
│   ├── popup.html       # Popup UI
│   ├── popup.css        # Popup styling
│   └── popup.js         # Popup logic
├── content/
│   ├── content.js       # Integration with Chess.com
│   └── content.css      # In-game reminder styling
└── icons/
├── icon16.png       # Icon (small)
├── icon48.png       # Icon (medium)
└── icon128.png      # Icon (large)

```

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork this repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request 🚀

---

## 📜 License

Licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- Based on the [Building Habits series](https://www.youtube.com/playlist?list=PL8N8j2e7RpPnpqbISqi1SJ9_wrnNU3rEm) by GM Aman Hambleton (Chessbrah)
- Thanks to [Chess.com](https://chess.com) for their platform
- Huge appreciation to all contributors and users!
---

Made with ♟️ by **project.raihan**
