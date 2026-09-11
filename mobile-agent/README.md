# Aries Mobile Agent

Native mobile agents for Android and iOS that connect to the Aries backend for device management, screen capture, and remote control.

## Android Agent

### Requirements
- Android Studio Hedgehog (2023.1.1) or later
- Kotlin 1.9+
- Android SDK 34

### Setup
1. Open `mobile-agent/android/` in Android Studio
2. Sync Gradle
3. Configure `BASE_URL` and `TOKEN` in the app settings
4. Run on device or emulator

### Features
- WebSocket connection to Aries backend
- Device registration and status reporting
- Screen capture (screenshot)
- Remote command execution (tap, swipe, type)
- Foreground service for persistent connection

### Permissions
- `INTERNET` — Connect to backend
- `FOREGROUND_SERVICE` — Keep connection alive
- `RECORD_AUDIO` — Screen capture (if needed)
- Accessibility Service — For command execution

## iOS Agent

### Requirements
- Xcode 15.0+
- iOS 16.0+
- Swift 5.9+

### Setup
1. Open `mobile-agent/ios/` in Xcode
2. Configure signing and provisioning
3. Set `serverUrl` and `token` in the app
4. Run on device

### Features
- WebSocket connection to Aries backend
- Device registration and status reporting
- Screen capture (UIGraphicsImageRenderer)
- Remote command execution (via Accessibility API)
- Background session support

### Permissions
- Network access (NSAppTransportSecurity)
- Screen capture (ReplayKit for recording)
- Accessibility (for automated controls)

## Architecture

```
Mobile Agent
├── WebSocketClient     — Real-time communication with backend
├── DeviceManager       — Device registration and status
├── ScreenCapture       — Screenshot capture
├── CommandExecutor     — Execute remote commands
└── DeviceService       — Background service (Android)
```

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/devices` | POST | Register device |
| `/api/devices/:id/status` | PATCH | Update device status |
| `/api/devices/:id/logs` | GET | Fetch device logs |
| `/ws/device` | WebSocket | Real-time commands |

## Configuration

### Environment Variables
- `BASE_URL` — Backend server URL (default: `http://localhost:8000`)
- `TOKEN` — JWT authentication token

### Backend Setup
Ensure the backend is running with device endpoints enabled:
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

## Development Notes

### Android
- Uses OkHttp for WebSocket connections
- Accessibility Service required for automated tap/swipe
- Foreground service keeps connection alive in background

### iOS
- Uses URLSession WebSocket API
- ReplayKit for screen capture
- SwiftUI for the UI
- Combine for state management

### Security
- JWT token required for all API calls
- WebSocket connections use WSS in production
- Device credentials stored in Keychain (iOS) or EncryptedSharedPreferences (Android)
