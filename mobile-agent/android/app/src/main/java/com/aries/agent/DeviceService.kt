package com.aries.agent

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.os.IBinder
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.*

class DeviceService : Service() {

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var webSocketClient: WebSocketClient? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        startForeground(1, createNotification())
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val baseUrl = intent?.getStringExtra("BASE_URL") ?: "http://10.0.2.2:8000"
        val token = intent?.getStringExtra("TOKEN") ?: ""

        connectToServer(baseUrl, token)
        return START_STICKY
    }

    private fun connectToServer(baseUrl: String, token: String) {
        webSocketClient = WebSocketClient(baseUrl, token)
        webSocketClient?.connect()
    }

    private fun createNotification(): Notification {
        val pendingIntent = PendingIntent.getActivity(
            this, 0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, AriesAgentApp.CHANNEL_ID)
            .setContentTitle("Aries Agent")
            .setContentText("Connected to workspace")
            .setSmallIcon(android.R.drawable.ic_menu_manage)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }

    override fun onDestroy() {
        super.onDestroy()
        webSocketClient?.disconnect()
        scope.cancel()
    }
}
