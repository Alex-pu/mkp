# Polls Mobile App

React Native mobile client for the existing Polls backend, built with Expo and TypeScript.

## Features

- Public poll browsing and voting
- Admin login with persisted session
- Poll creation, editing, assignment, activation, and deletion
- Assigned private poll voting
- Poll analytics with recent open-text responses
- Facebook/WhatsApp report submission and summary views
- User management for super admins

## Setup

```bash
npm install
npm start
```

## API configuration

Set `EXPO_PUBLIC_API_URL` before starting Expo.

Examples:

- Android emulator: `http://10.0.2.2:5002/api`
- iOS simulator: `http://localhost:5002/api`
- Physical device: `http://<your-local-ip>:5002/api`

PowerShell example:

```powershell
$env:EXPO_PUBLIC_API_URL="http://10.0.2.2:5002/api"
npm start
```

## Scripts

- `npm start` — start Expo
- `npm run android` — run Android native build
- `npm run ios` — run iOS native build
- `npm run web` — run Expo web preview
- `npm run typecheck` — run TypeScript validation