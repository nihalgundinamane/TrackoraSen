# Firebase Setup Guide for TrackoraSen

## 5-minute setup for cross-device sync

### Step 1: Create Firebase project
1. Go to https://console.firebase.google.com
2. Click "Add project" → name it "trackorasen"
3. Disable Google Analytics (not needed) → Create project

### Step 2: Enable Google sign-in
1. Build → Authentication → Get started
2. Sign-in method tab → Google → Enable → Save

### Step 3: Create Firestore database
1. Build → Firestore Database → Create database
2. Choose "Start in production mode" → Next
3. Pick any region → Enable

### Step 4: Set Firestore security rules
1. Firestore → Rules tab → Replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /userdata/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
2. Publish

### Step 5: Get your config
1. Project Settings (gear icon) → Your apps → Add app → Web (</>)
2. Register app → Copy the firebaseConfig object values

### Step 6: Add to your project
Create a `.env` file in the root of the project:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### Step 7: For Render deployment
In Render → your service → Environment → Add environment variables
(same keys and values as the .env file above)

### Done!
- `npm start` locally
- Push to GitHub → Render auto-deploys
- Sign in with Google on the site → your data syncs everywhere
