# PLOT TWIST 🇵🇰
### *Pakistan's Property Game*
**Roll. Buy. Build. Plot.**

---

## 🎯 Overview
**PLOT TWIST 🇵🇰** is a free, browser-based, real-time multiplayer property trading board game set across Pakistan. It combines the familiar accessibility of the classic Monopoly / Richup game loop with an authentic, satirical Pakistani identity:

- **Pakistani Cities & Locations:** Rawalpindi &rarr; Lahore &rarr; Peshawar &rarr; Multan &rarr; Faisalabad &rarr; Murree &rarr; Karachi &rarr; Islamabad (*F-6 / F-7 the ultimate flex*).
- **Rupee Currency (Rs):** Monopolistic small denominations (Rs 1, 5, 10, 20, 50, 100, 500) with starting cash of Rs 1,500 and Rs 200 Salary on START (*Salary Aa Gayi*).
- **Pakistani Corners:** *Salary Aa Gayi* (START), *Thana / Quetta Café* (Jail / Just Visiting), *Hira Mandi* (Free Parking Rest Space), and *Met a Lahori, Went the Wrong Way* (Go to Thana).
- **Custom Player Tokens:** 🛺 Rickshaw, ☕ Chai Cup, 🩴 Peshawari Chappal, 🏏 Cricket Bat, 🚙 V8 Land Cruiser, 📱 EasyPaisa Phone, 🐐 Bakra, 🏍️ CD 70 Motorcycle.
- **Original Pakistani Card Decks:** *😂 Scene On Hai* and *🇵🇰 Pakistan Zindabad* featuring 29 unique cards (*Raja Has Arrived, Khokhar Royalty, Biryani Debate, NADRA Queue, Army Checkpoint, Cousin in Govt*, etc.).
- **Smart AI Bots:** Play solo against personality bots like *Plot Uncle* ("Beta trust me, buy this plot") or *Lahori Burger* ("OMG aesthetic plot bro!").
- **Rich Multiplayer:** 2 to 8 players, room code generation (`plot-twist.com/?room=AB72KD`), host rule customization, live auctions, two-way trading, mortgaging, and procedural sound effects.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### 1. Install Dependencies
In the root directory, run:
```bash
npm run install:all
```
*(Or install in `server` and `client` individually via `cd server && npm install`, `cd ../client && npm install`)*

---

### 2. Run in Development Mode
Run both the authoritative game server and Vite React client simultaneously with:
```bash
npm run dev
```

- **Frontend Client:** [http://localhost:5173](http://localhost:5173)
- **Authoritative Backend Server:** [http://localhost:3001](http://localhost:3001)

You can also run them in separate terminals:
```bash
# Terminal 1: Authoritative Game Server
npm run dev:server

# Terminal 2: React Frontend
npm run dev:client
```

---

## 🏗️ Architecture & Project Structure

```
d:\Monopoly PK/
├── shared/                     # Shared TypeScript contracts & static game data
│   ├── types.ts                # GameState, Player, Property, Card, Trade, Settings, Events
│   ├── boardData.ts            # 40 board spaces, prices, rents, color groups
│   ├── cardsData.ts            # 29 finalized Scene On Hai & Pakistan Zindabad cards
│   ├── tokensData.ts           # 8 Pakistani player tokens
│   └── defaultSettings.ts      # Host rule settings defaults & bot personalities
├── server/                     # Authoritative Node.js + Socket.IO server
│   ├── src/
│   │   ├── engine/
│   │   │   ├── GameRoom.ts     # Authoritative turn loop, dice, rent, bankruptcy, building
│   │   │   ├── AuctionEngine.ts# Live bidding & timer countdown
│   │   │   ├── TradeEngine.ts  # 2-player give vs receive trade negotiation
│   │   │   ├── CardEngine.ts   # Execution of 29 Pakistani card effects
│   │   │   ├── BotAI.ts        # Easy/Normal/Hard AI bot decision makers
│   │   │   └── RoomManager.ts  # Room registry, room code generation & socket mapping
│   │   └── server.ts           # Express + HTTP + Socket.IO server on port 3001
├── client/                     # Modern React + Vite + Tailwind CSS + Lucide
│   ├── src/
│   │   ├── audio/SoundEffects.ts # Procedural Web Audio FX (dice, cash, horn, jail, fanfare)
│   │   ├── components/
│   │   │   ├── Board/          # 40-tile square board with houses, tokens & zoom
│   │   │   ├── Lobby/          # Create game, Room code, Host rules, Bot selector
│   │   │   ├── ActionPanel/    # Dynamic action buttons (Roll, Buy, Build, Mortgage, Trade)
│   │   │   ├── Modals/         # Title Deed, Card Draw, Trade, Auction, Game Over
│   │   │   ├── SidePanel/      # Tycoon leaderboard, event log & Pakistani banter
│   │   │   └── Splash/         # Main menu, Rem mascot dev badge, How to play guide
│   │   ├── hooks/useGameSocket.ts # Socket.IO client synchronization hook
│   │   └── App.tsx
├── package.json
└── README.md
```

---

## 🛠️ How to Customize & Extend

### 1. How to Add or Edit Properties
Open [`shared/boardData.ts`](shared/boardData.ts):
```typescript
{
  index: 39,
  name: 'F-7',
  urduName: 'ایف سیون اسلام آباد',
  type: 'PROPERTY',
  cityGroup: 'ISLAMABAD',
  colorHex: '#1E40AF',
  price: 400,
  rent: 50,
  rentWithSet: 100,
  rentWith1House: 200,
  rentWith2Houses: 600,
  rentWith3Houses: 1400,
  rentWith4Houses: 1700,
  rentWithHotel: 2000,
  houseCost: 200,
  hotelCost: 200,
  mortgageValue: 200,
}
```

### 2. How to Add or Edit Cards
Open [`shared/cardsData.ts`](shared/cardsData.ts):
```typescript
{
  id: 30,
  deck: 'SCENE_ON_HAI',
  title: 'QUICK CHAI BREAK',
  urduTitle: 'کڑک چائے',
  description: 'You stopped at a roadside Dhaba for a quick cup of Doodh Patti.',
  actionText: 'PAY Rs 20 TO THE BANK',
  illustration: '☕',
  actionType: 'PAY_TO_BANK',
  amount: 20,
}
```
Card effects are processed authoritatively in [`server/src/engine/CardEngine.ts`](server/src/engine/CardEngine.ts).

### 3. How to Change Game Rules
Host rule defaults can be adjusted in [`shared/defaultSettings.ts`](shared/defaultSettings.ts), and can be customized per room in real time by the host in the pre-game lobby:
- Starting Money (Default: Rs 1,500)
- Salary on START (Default: Rs 200)
- Auctions (Enabled / Disabled / Forced)
- Mortgage & 10% Interest
- Even Building Rule
- Max Houses (32) & Hotels (12)
- Thana Bail & Max Turns
- Hira Mandi (Free Parking) Mode: `NONE` / `POT` / `FIXED`

---

## 🌐 Environment Variables
You can configure the backend URL in `client/.env`:
```env
VITE_SERVER_URL=http://localhost:3001
```
And server port in `server/.env`:
```env
PORT=3001
```

---

## 📦 Production Build
To create optimized production builds for both client and server:
```bash
npm run build
```
To run the built server in production:
```bash
npm run start
```
