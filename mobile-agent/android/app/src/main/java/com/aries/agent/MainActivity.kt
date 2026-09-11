package com.aries.agent

import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var statusText: TextView
    private lateinit var connectBtn: Button
    private lateinit var disconnectBtn: Button

    private var isRunning = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        statusText = findViewById(R.id.statusText)
        connectBtn = findViewById(R.id.connectBtn)
        disconnectBtn = findViewById(R.id.disconnectBtn)

        connectBtn.setOnClickListener {
            startAgentService()
        }

        disconnectBtn.setOnClickListener {
            stopAgentService()
        }

        updateUI()
    }

    private fun startAgentService() {
        val intent = android.content.Intent(this, DeviceService::class.java)
        startForegroundService(intent)
        isRunning = true
        updateUI()
    }

    private fun stopAgentService() {
        val intent = android.content.Intent(this, DeviceService::class.java)
        stopService(intent)
        isRunning = false
        updateUI()
    }

    private fun updateUI() {
        statusText.text = if (isRunning) "Connected" else "Disconnected"
        connectBtn.isEnabled = !isRunning
        disconnectBtn.isEnabled = isRunning
    }
}
