import Foundation
import UIKit

class ScreenCapture {
    static let shared = ScreenCapture()

    func captureScreenshot() -> Data? {
        guard let window = UIApplication.shared.windows.first else {
            return nil
        }

        let renderer = UIGraphicsImageRenderer(bounds: window.bounds)
        let image = renderer.image { context in
            window.layer.render(in: context.cgContext)
        }

        return image.jpegData(compressionQuality: 0.8)
    }

    func captureBase64() -> String? {
        guard let data = captureScreenshot() else {
            return nil
        }
        return data.base64EncodedString()
    }
}
