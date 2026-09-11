package com.aries.agent

import android.util.Log
import okhttp3.*
import java.util.concurrent.TimeUnit

class WebSocketClient(
    private val baseUrl: String,
    private val token: String
) {
    private var webSocket: WebSocket? = null
    private val client = OkHttpClient.Builder()
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .build()

    fun connect() {
        val wsUrl = baseUrl.replace("http://", "ws://").replace("https://", "wss://")
        val request = Request.Builder()
            .url("$wsUrl/ws/device")
            .addHeader("Authorization", "Bearer $token")
            .build()

        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                Log.d("AriesAgent", "Connected to server")
                sendDeviceInfo()
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                Log.d("AriesAgent", "Received: $text")
                handleMessage(text)
            }

            override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
                webSocket.close(1000, null)
                Log.d("AriesAgent", "Disconnected: $reason")
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Log.e("AriesAgent", "Connection failed: ${t.message}")
            }
        })
    }

    private fun sendDeviceInfo() {
        val info = """{
            "type": "device_info",
            "platform": "android",
            "model": "${android.os.Build.MODEL}",
            "version": "${android.os.Build.VERSION.RELEASE}"
        }"""
        webSocket?.send(info)
    }

    private fun handleMessage(text: String) {
        // Parse incoming commands and execute
        // Command types: tap, swipe, type, screenshot, status
    }

    fun sendMessage(message: String) {
        webSocket?.send(message)
    }

    fun disconnect() {
        webSocket?.close(1000, "Client disconnect")
    }
}
