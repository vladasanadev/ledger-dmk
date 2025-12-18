# Ledger DMK Tutorial

A minimal tutorial project demonstrating how to use the [Ledger Device Management Kit (DMK)](https://developers.ledger.com/docs/device-interaction/beginner/init_dmk) with WebHID in the browser.

## 🎯 What This Project Does

This is a **beginner-friendly starter** that shows how to:

1. **Initialize the DMK** as a singleton
2. **Discover** connected Ledger devices
3. **Connect** to a device and get a session ID
4. **Display** device information
5. **Disconnect** cleanly

## 🖼️ UI Preview

The app features a **cyberpunk neon aesthetic** with:
- Dark background with animated grid perspective effect
- Neon pink (`#ff00ff`) and cyan (`#00ffff`) color scheme
- Glowing text effects with flickering animations
- Floating particle effects
- Scanline overlay for retro CRT feel
- Orbitron + JetBrains Mono typography
- Terminal-style status messages

## 📁 Project Structure

```
ledger-dmk/
├── index.html          # UI with neon cyberpunk styling
├── src/
│   ├── dmk.js          # DMK singleton instance
│   └── main.js         # Discovery & connection logic
├── package.json        # Dependencies
├── vite.config.js      # Vite dev server config
└── README.md           # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ installed
- **Chrome** or **Edge** browser (WebHID required)
- **Ledger device** (Nano S, Nano X, Nano S Plus, Flex, or Stax)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage

1. Open **http://localhost:3000** in Chrome or Edge
2. **Plug in** your Ledger device via USB
3. **Unlock** your device (enter PIN)
4. Click **"[ CONNECT ]"** button
5. **Select** your device in the browser popup
6. ✅ You're connected!

## 📖 Code Walkthrough

### 1. DMK Initialization (`src/dmk.js`)

Following the [official docs](https://developers.ledger.com/docs/device-interaction/beginner/init_dmk):

```javascript
import {
  ConsoleLogger,
  DeviceManagementKitBuilder,
} from "@ledgerhq/device-management-kit";
import { webHidTransportFactory } from "@ledgerhq/device-transport-kit-web-hid";

// Singleton pattern - initialize only once!
export const dmk = new DeviceManagementKitBuilder()
  .addLogger(new ConsoleLogger())      // Logs to browser console
  .addTransport(webHidTransportFactory) // WebHID for USB communication
  .build();
```

### 2. Device Discovery (`src/main.js`)

```javascript
// Start discovering - returns an RxJS Observable
// Note: Pass empty object {} to startDiscovering
const subscription = dmk.startDiscovering({}).subscribe({
  next: (device) => {
    console.log("Found device:", device);
    // Connect to discovered device
  },
  error: (error) => {
    console.error("Discovery error:", error);
  }
});

// Stop discovery when done
subscription.unsubscribe();
```

### 3. Connecting to Device

```javascript
// Connect returns a session ID
// Note: Pass the whole device object, not just the ID
const sessionId = await dmk.connect({ device });

// Get connected device info
const connectedDevice = dmk.getConnectedDevice({ sessionId });
console.log("Model:", connectedDevice.modelId);
```

### 4. Disconnecting

```javascript
await dmk.disconnect({ sessionId: currentSessionId });
```

## 🔄 What Happens After Connection?

Currently, after connecting, the app:

| Action | Result |
|--------|--------|
| Shows status | "connection_established // access_granted" (cyan glow) |
| Displays info | Device model + Session ID |
| Enables disconnect | "[ DISCONNECT ]" button appears |

### Next Steps You Can Add:

Once connected, you can extend this to:

1. **Get device info** - firmware version, battery, etc.
2. **Open apps** - Bitcoin, Ethereum, etc.
3. **Sign transactions** - using Device Signer Kits
4. **Get addresses** - derive wallet addresses

## 🛠️ Extending This Tutorial

### Add Ethereum Signing

```bash
npm install @ledgerhq/device-signer-kit-ethereum
```

```javascript
import { SignerEthBuilder } from "@ledgerhq/device-signer-kit-ethereum";

// After connecting...
const signer = new SignerEthBuilder({ dmk, sessionId }).build();
const address = await signer.getAddress("44'/60'/0'/0/0");
```

### Add Device Commands

```javascript
// Get device OS version
const command = new GetOsVersionCommand();
const result = await dmk.sendCommand({ sessionId, command });
console.log("OS Version:", result);
```

## ⚠️ Important Notes

1. **WebHID Browser Support**: Only works in Chrome, Edge, and Opera. Not Firefox/Safari.
2. **User Gesture Required**: WebHID needs a button click to prompt for device access.
3. **Device Must Be Unlocked**: Enter your PIN before clicking Connect.
4. **HTTPS Required**: In production, WebHID only works over HTTPS (localhost is exempt).

## 📚 Resources

- [DMK Documentation](https://developers.ledger.com/docs/device-interaction/beginner/init_dmk)
- [Connecting to Devices](https://developers.ledger.com/docs/device-interaction/beginner/discover_and_connect)
- [Device Signer Kits](https://developers.ledger.com/docs/device-interaction/explanation/signers)
- [WebHID API](https://developer.mozilla.org/en-US/docs/Web/API/WebHID_API)

## 📝 License

ISC
