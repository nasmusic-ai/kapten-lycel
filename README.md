# 🌐 Kapten/Lycel Wifi Management System v3.5

A high-performance, aesthetically driven, and fully offline-capable wifi voucher portal. Built for the Kapten and Lycel networks, this system provides a seamless experience for users to redeem vouchers, explore network plans, and enjoy a curated audio environment.

## 🚀 Key Features

- **Offline-First Architecture**: 100% operational without internet after initial load.
- **Voucher Validation**: Secure numeric code verification against a local `codes.json` database.
- **Consumption Logic**: Persistent "Burning" of codes using `LocalStorage` to prevent double-spending.
- **Multi-View Navigation**:
    - **Portal**: The core voucher redemption engine.
    - **Plans**: Interactive showcase of available network promotions.
    - **History**: Local session log of all previously burned vouchers.
    - **Studio**: Integrated audio engine with playlist management, shuffle, and loop modes.
- **Premium UI/UX**: 
    - Dynamic glass-morphism design.
    - High-fidelity background and logo integration.
    - Smooth animations (float, shimmer, scan lines, radar pulses).
    - Mobile-optimized touch interface.

## 🛠️ Tech Stack

- **Core**: React 19 + TypeScript
- **Styling**: Tailwind CSS (JIT)
- **Icons**: Lucide React
- **Audio**: Custom HTML5 Audio Wrapper
- **Persistence**: Browser LocalStorage API

## 🏃 Quick Start

Because this app uses `fetch()` to load the database, it must be served via a web server (to satisfy CORS requirements).

1. **Deploy Files**: Place all files in your web server directory.
2. **Launch**:
   - **VS Code**: Right-click `index.html` -> "Open with Live Server".
   - **Python**: `python -m http.server 8000`
   - **Node**: `npx serve .`
3. **Access**: Navigate to `http://localhost:8000` (or your assigned port).

## ⚙️ Configuration & Customization

### 1. Managing Vouchers (`codes.json`)
Modify `codes.json` to add or update valid keys:
```json
{
  "inputCode": "123456",
  "outputCode": "WIFI_KEY_789"
}
```

### 2. Audio Playlist (`App.tsx`)
The `PLAYLIST` constant in `App.tsx` manages the Studio tracks. You can replace the URLs with your own `.mp3` files:
```typescript
{ id: '6', name: 'Your Track', url: 'https://your-domain.com/track.mp3' }
```

### 3. Visual Branding
- **Background**: Update `BACKGROUND_IMAGE_URL` in `App.tsx`.
- **Logo**: Update `LOGO_IMAGE_URL` in `App.tsx`.
- **Promos**: Edit the `PROMOS` array to reflect current pricing.

### 4. Developer Mode / Reset
To clear all "burned" codes and reset the history:
- Use the **Trash Icon** in the History tab.
- **Manual Reset**: Open DevTools (F12) -> Application -> Local Storage -> Clear `kapten_lycel_used_codes`.

## 📄 Privacy & Security
- **Zero-Knowledge**: No data is sent to external servers. All validation happens locally.
- **Persistence**: Usage history is stored locally on the user's device only.

---
*Developed for Kapten/Lycel Network Services. All rights reserved.*