# 🎮 PINGO Session-Based Multiplayer Setup

Your PINGO game now supports **multiple groups playing simultaneously** with separate sessions!

## 📁 New File Structure

```
C:\Projects\PINGO\
├── index.html (main menu - shows available games)
├── session-setup.html (NEW - choose solo or multiplayer)
├── gesplitste.html (single-player game)
├── pingo-multiplayer.html (NEW - multiplayer game with sessions)
├── firebase-config.js (Firebase credentials)
├── Schiphol/ (your images)
│   ├── 1.jpg
│   ├── ...
│   └── gimme.jpg
└── ... other game folders
```

## 🚀 How It Works Now

### Player Flow:

1. **Open `index.html`**
   - Select a game (e.g., "Schiphol") from dropdown
   
2. **Redirects to `session-setup.html`**
   - Choose **Solo Play** → Go directly to single-player game
   - Choose **Multiplayer** → Create or join a session

3. **Multiplayer Options:**
   - **Create Session**: Enter name → Get a session code (e.g., "A7X9K2")
   - **Join Session**: Enter code from friend → Join their game

4. **Play Together:**
   - All players in same session see when someone wins
   - Each player can shuffle their own board independently
   - Real-time player count
   - Sync win notifications

## ✨ Features

### Solo Play:
- Play alone without sessions
- No Firebase needed
- Same as before

### Multiplayer:
- **Session Codes**: Each group gets unique code (e.g., "J4K8P2")
- **Multiple Sessions**: Different groups can play same game simultaneously
- **Real-time Sync**: Win notifications appear for all players in session
- **Independent Boards**: Each player shuffles their own board
- **Player Count**: See how many people are online in your session
- **Local Images**: Uses your existing image folders (no upload needed!)

## 🔧 Firebase Setup Required

You need to configure Firebase to enable multiplayer sessions.

### Quick Setup:

1. **Go to** [Firebase Console](https://console.firebase.google.com/)

2. **Create Project** (if you haven't already)

3. **Enable Realtime Database:**
   - Build → Realtime Database → Create Database
   - Start in **Test Mode**

4. **Get Configuration:**
   - Project Settings → Your apps → Web app
   - Copy the config

5. **Update `firebase-config.js`:**
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "your-project.firebaseapp.com",
       databaseURL: "https://your-project-default-rtdb.firebaseio.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "123456789",
       appId: "1:123456789:web:abc123"
   };
   firebase.initializeApp(firebaseConfig);
   ```

6. **Set Database Rules:**
   ```json
   {
     "rules": {
       "sessions": {
         "$sessionCode": {
           ".read": true,
           ".write": true
         }
       }
     }
   }
   ```

## 🎮 Usage Examples

### Scenario 1: Family Game Night
```
Group A:
1. Dad creates session "Family Night"
2. Gets code: "F4M1LY"
3. Shares code with family
4. Everyone joins with same code
5. Play Schiphol game together!

Group B (at same time):
1. Creates different session "Friends"
2. Gets code: "FR13ND"
3. Plays Schiphol game separately
```

### Scenario 2: Solo Practice
```
Player:
1. Selects game from menu
2. Clicks "Solo Play"
3. Plays without session
4. No Firebase needed
```

## 🔥 Firebase Cost

**Free Tier Includes:**
- 1GB storage
- 10GB/month downloads
- 100 simultaneous connections

**Perfect for:**
- 20-30 concurrent groups
- Unlimited solo players
- Most casual use cases

**Estimated monthly cost:** $0 (free tier sufficient)

## 📱 Mobile Support

Works on:
- ✅ iPhone/iPad Safari
- ✅ Android Chrome
- ✅ Desktop browsers
- ✅ Tablets

## 🎯 Key Differences

### Single Player (`gesplitste.html`):
- No session codes
- No Firebase required
- Play alone
- Fast loading

### Multiplayer (`pingo-multiplayer.html`):
- Session-based rooms
- Firebase required
- Play with others
- Win notifications sync across all players

## 🐛 Troubleshooting

### "Firebase not loaded"
- Check `firebase-config.js` exists
- Verify configuration is correct
- Check internet connection

### "Session not found"
- Verify session code is correct (case-sensitive)
- Check if creator left the session
- Try creating a new session

### Images not loading
- Ensure folder name matches exactly
- Check images are named 1-24.jpg + gimme.jpg
- Verify both .jpg and .JPG work

### Players not seeing each other
- Check Firebase Realtime Database rules
- Verify all players using same session code
- Check Firebase console for errors

## 🎨 Customization

### Add More Games:
Just create new folders:
```
MyNewGame/
├── 1.jpg
├── 2.jpg
├── ...
├── 24.jpg
└── gimme.jpg
```
Refresh menu → Appears automatically!

### Change Session Code Length:
In `session-setup.html`, modify:
```javascript
function generateSessionCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 chars
}
```

### Adjust Win Patterns:
In `pingo-multiplayer.html`, modify `winPatterns` array in `checkForWin()`

## 📊 Session Management

Sessions automatically clean up when:
- All players leave
- You can manually delete old sessions from Firebase Console

## 🚀 Next Steps

1. **Test Solo Mode**: Pick a game → Solo Play
2. **Test Multiplayer**: Create session → Join from another device/browser
3. **Add More Games**: Create new image folders
4. **Share**: Give friends your GitHub Pages URL + session codes!

---

**Enjoy your multiplayer PINGO games! 🎉**

Questions? Check the Firebase Console for session activity and player counts.
