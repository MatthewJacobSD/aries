package com.aries.agent

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build

class AriesAgentApp : Application() {
    companion object {
        const val CHANNEL_ID = "aries_agent_service"
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Aries Agent Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps the agent connected to Aries"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }
}
