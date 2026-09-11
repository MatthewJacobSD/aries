import SwiftUI

struct ContentView: View {
    @State private var isConnected = false
    @State private var serverUrl = "http://localhost:8000"
    @State private var token = ""

    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Image(systemName: isConnected ? "checkmark.circle.fill" : "xmark.circle.fill")
                    .font(.system(size: 60))
                    .foregroundColor(isConnected ? .green : .red)

                Text(isConnected ? "Connected" : "Disconnected")
                    .font(.title2)
                    .fontWeight(.semibold)

                Text("Aries Agent for iOS")
                    .font(.subheadline)
                    .foregroundColor(.secondary)

                if !isConnected {
                    TextField("Server URL", text: $serverUrl)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .padding(.horizontal, 40)

                    SecureField("Token", text: $token)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .padding(.horizontal, 40)
                }

                Button(action: toggleConnection) {
                    Text(isConnected ? "Disconnect" : "Connect")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(isConnected ? Color.red : Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                }
                .padding(.horizontal, 40)

                Spacer()
            }
            .navigationTitle("Aries Agent")
        }
    }

    private func toggleConnection() {
        if isConnected {
            DeviceManager.shared.disconnect()
            isConnected = false
        } else {
            DeviceManager.shared.connect(baseUrl: serverUrl, token: token)
            isConnected = true
        }
    }
}
