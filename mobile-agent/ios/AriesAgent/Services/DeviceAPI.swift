import Foundation

struct DeviceRegistration: Codable {
    let name: String
    let platform: String
    let serial: String
    let creator_id: String
    let status: String
}

struct DeviceResponse: Codable {
    let id: String
    let name: String
    let platform: String
    let serial: String
    let status: String
}

class DeviceAPI {
    static let shared = DeviceAPI()

    private let baseUrl = "http://localhost:8000"

    func registerDevice(token: String, name: String, serial: String) async throws -> DeviceResponse {
        var request = URLRequest(url: URL(string: "\(baseUrl)/api/devices")!)
        request.httpMethod = "POST"
        request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")

        let body = DeviceRegistration(
            name: name,
            platform: "ios",
            serial: serial,
            creator_id: "",
            status: "online"
        )
        request.httpBody = try JSONEncoder().encode(body)

        let (data, _) = try await URLSession.shared.data(for: request)
        return try JSONDecoder().decode(DeviceResponse.self, from: data)
    }

    func updateStatus(token: String, deviceId: String, status: String) async throws {
        var request = URLRequest(url: URL(string: "\(baseUrl)/api/devices/\(deviceId)/status")!)
        request.httpMethod = "PATCH"
        request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")

        let body = ["status": status]
        request.httpBody = try JSONEncoder().encode(body)

        _ = try await URLSession.shared.data(for: request)
    }
}
