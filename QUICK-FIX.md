# 🎯 Quick Fix Guide - 3 Minutes

## Problem: "Failure to create session"

### ✅ Quick Solution (Copy-Paste This):

1. **Open:** `firebase-config.js`

2. **Replace with this template:**
```javascript
const firebaseConfig = {
    apiKey: "YOUR_KEY_FROM_FIREBASE_CONSOLE",
    authDomain: "pingo-eb6e3.firebaseapp.com",
    databaseURL: "https://pingo-eb6e3-default-rtdb.firebaseio.com",
    projectId: "pingo-eb6e3",
    storageBucket: "pingo-eb6e3.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);
```

3. **Get your keys:**
   - Go to: https://console.firebase.google.com
   - Select project: **pingo-eb6e3**
   - Click gear icon ⚙️ → Project settings
   - Scroll to "Your apps" → Web app
   - Copy the values

4. **Set database rules:**
   - Firebase Console → Realtime Database → Rules
   - Paste this:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
   - Click "Publish"

5. **Test it:**
   - Open: `firebase-test.html`
   - Should see all green ✅
   - If not, check console errors (F12)

---

## 🐛 Debug in Browser

1. Open `pingo-multiplayer.html`
2. Press **F12** (open console)
3. Look for these messages:

**✅ Good signs:**
```
✅ Firebase SDK loaded
✅ Firebase database initialized
Session created successfully!
```

**❌ Bad signs:**
```
Firebase not configured!
PERMISSION_DENIED
Error creating session
```

If you see bad signs → Read FIREBASE-FIX.md for detailed steps

---

## 📱 Test Multiplayer

**Device 1:**
1. Open index.html → Select Schiphol
2. Create session "Test"
3. Get code: "ABC123"

**Device 2 (or incognito):**
1. Open index.html → Select Schiphol  
2. Join with code: "ABC123"
3. Should see "Players online: 2"

**Mark 3 complete rows on Device 1:**
- Device 1: Shows "PINGO!" modal ✅
- Device 2: Shows "Another player got PINGO!" message ✅

---

## Still broken? 

Run `firebase-test.html` and look for first ❌ red error.
That tells you exactly what's wrong!
