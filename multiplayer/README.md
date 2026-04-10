# 🎉 PINGO Game - Multiplayer Edition

A multiplayer PINGO (like BINGO) game that allows groups to play with their own custom images. Built with vanilla JavaScript and Firebase.

## Features

✅ **Free Group Games** - Create unlimited game rooms  
✅ **Custom Images** - Each group uploads their own 25 images  
✅ **Real-time Sync** - All players see updates instantly  
✅ **Mobile Friendly** - Works on iOS, Android, and desktop  
✅ **No Backend Required** - Runs on GitHub Pages + Firebase Free Tier  
✅ **Image Validation** - Enforces square images, format, and size requirements  
✅ **Shuffle & Reset** - Players can shuffle their boards independently  
✅ **Win Detection** - Automatically detects and announces winners  

## Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "pingo-game")
4. Disable Google Analytics (optional, not needed)
5. Click "Create project"

### 2. Enable Firebase Services

#### Realtime Database:
1. In Firebase Console, go to **Build > Realtime Database**
2. Click "Create Database"
3. Select a location (choose closest to your users)
4. Start in **Test Mode** (we'll secure it in step 3)
5. Click "Enable"

#### Storage:
1. Go to **Build > Storage**
2. Click "Get started"
3. Start in **Test Mode**
4. Click "Next" and "Done"

### 3. Configure Security Rules

#### Realtime Database Rules:
Go to **Realtime Database > Rules** and paste:

```json
{
  "rules": {
    "groups": {
      "$groupCode": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

**Note:** These rules allow anyone to read/write. For production, you should add proper authentication.

#### Storage Rules:
Go to **Storage > Rules** and paste:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /groups/{groupCode}/{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

Click "Publish" for both rule sets.

### 4. Get Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon `</>`
5. Register your app with a nickname (e.g., "pingo-web")
6. Copy the `firebaseConfig` object

### 5. Update firebase-config.js

Replace the placeholder values in `firebase-config.js` with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 6. Deploy to GitHub Pages

1. Push all files to your GitHub repository
2. Go to repository Settings > Pages
3. Under "Source", select "main" branch
4. Click "Save"
5. Your game will be live at: `https://YOUR_USERNAME.github.io/REPOSITORY_NAME/multiplayer/`

## How to Play

### For Group Admins:
1. Click "Create New Group"
2. Enter a group name
3. Share the **Group Code** with players
4. Upload exactly 25 images (square-shaped, PNG/JPG, max 2MB each)
5. Click "Start Game"
6. Play along with others!

### For Players:
1. Get the Group Code from your admin
2. Click "Join Existing Group"
3. Enter the code
4. Wait for admin to start the game
5. Click "Shuffle" to randomize your board
6. Click images to mark them as called
7. First to get 5 in a row wins!

## Win Patterns

Players win by marking 5 cells in:
- Any horizontal row
- Any vertical column  
- Either diagonal

## Image Requirements

- **Format:** PNG or JPG
- **Dimensions:** Square (1:1 aspect ratio recommended)
- **Size:** Maximum 2MB per image
- **Quantity:** Exactly 25 images per group

## Browser Compatibility

- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Safari (Desktop & iOS)
- ✅ Firefox (Desktop & Mobile)
- ✅ Samsung Internet

## Troubleshooting

### "Firebase not loaded" error
- Check that `firebase-config.js` has valid credentials
- Make sure Firebase CDN scripts load (check browser console)

### Images not uploading
- Verify images are square-shaped
- Check file sizes are under 2MB
- Ensure Firebase Storage is enabled

### Players can't join
- Verify Realtime Database rules are published
- Check that group code is correct (case-sensitive)

### Game not syncing
- Confirm databaseURL in config is correct
- Check browser console for errors

## Firebase Free Tier Limits

- **Realtime Database:** 1GB storage, 10GB/month downloads
- **Storage:** 5GB storage, 1GB/day downloads
- **Perfect for:** ~50-100 active groups with moderate usage

## Cost Estimate

With normal usage (10-20 groups playing regularly):
- **Monthly Cost:** $0 (stays within free tier)

## Future Enhancements

- User authentication
- Admin controls to "call" images for all players
- Game history and statistics
- Custom win patterns
- Sound effects
- Dark mode

## License

MIT License - Free to use and modify

---

**Enjoy your PINGO game! 🎉**
