import Foundation

struct DeviceInfo: Codable {
    let type: String
    let platform: String
    let model: String
    let version: String
}

struct Command: Codable {
    let type: String
    let x: Int?
    let y: Int?
    let x2: Int?
    let y2: Int?
    let text: String?
}

class DeviceManager: ObservableObject {
    static let shared = DeviceManager()

    private var webSocket: URLSessionWebSocketTask?
    private var session: URLSession?

    @Published var isConnected = false

    func connect(baseUrl: String, token: String) {
        guard let url = URL(string: baseUrl.replacingOccurrences(of: "http://", with: "ws://")
            .replacingOccurrences(of: "https://", with: "wss://") + "/ws/device") else {
            return
        }

        var request = URLRequest(url: url)
        request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        session = URLSession(configuration: .default)
        webSocket = session?.webSocketTask(with: request)
        webSocket?.resume()

        isConnected = true
        sendDeviceInfo()
        receiveMessages()
    }

    func disconnect() {
        webSocket?.cancel(with: .normalClosure, reason: nil)
        isConnected = false
    }

    private func sendDeviceInfo() {
        let info = DeviceInfo(
            type: "device_info",
            platform: "ios",
            model: UIDevice.current.model,
            version: UIDevice.current.systemVersion
        )

        if let data = try? JSONEncoder().encode(info),
           let json = String(data: data, encoding: .utf8) {
            webSocket?.send(.string(json)) { error in
                if let error = error {
                    print("Send error: \(error)")
                }
            }
        }
    }

    private func receiveMessages() {
        webSocket?.receive { [weak self] result in
            switch result {
            case .success(let message):
                switch message {
                case .string(let text):
                    self?.handleMessage(text)
                case .data(let data):
                    if let text = String(data: data, encoding: .utf8) {
                        self?.handleMessage(text)
                    }
                @unknown default:
                    break
                }
                self?.receiveMessages()
            case .failure(let error):
                print("Receive error: \(error)")
            }
        }
    }

    private func handleMessage(_ text: String) {
        guard let data = text.data(using: .utf8),
              let command = try? JSONDecoder().decode(Command.self, from: data) else {
            return
        }

        DispatchQueue.main.async {
            switch command.type {
            case "tap":
                if let x = command.x, let y = command.y {
                    self.simulateTap(x: x, y: y)
                }
            case "swipe":
                if let x1 = command.x, let y1 = command.y,
                   let x2 = command.x2, let y2 = command.y2 {
                    self.simulateSwipe(x1: x1, y1: y1, x2: x2, y2: y2)
                }
            case "screenshot":
                self.captureScreenshot()
            default:
                break
            }
        }
    }

    private func simulateTap(x: Int, y: Int) {
        // iOS Accessibility API for simulating taps
        // Requires accessibility permissions
    }

    private func simulateSwipe(x1: Int, y1: Int, x2: Int, y2: Int) {
        // iOS Accessibility API for simulating swipes
    }

    private func captureScreenshot() {
        // iOS screenshot capture via ReplayKit or UIGraphicsImageRenderer
    }
}
