package com.robotcoreadv

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.stupidbeauty.ftpserver.lib.FtpServer
import com.stupidbeauty.ftpserver.lib.UserManager
import java.io.File
import java.io.IOException
import java.net.ServerSocket
import android.util.Log
import java.lang.Thread



class FtpServerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var ftpServer: FtpServer? = null
    private var userManager: UserManager = UserManager()

    override fun getName(): String {
        return "FtpServerModule"
    }

    fun isPortInUse(port: Int): Boolean {
        return try {
            // 嘗試綁定這個 port
            val socket = ServerSocket(port)
            socket.close()
            false // 沒有被佔用
        } catch (e: IOException) {
            true // 綁定失敗，代表已被佔用
        }
    }

    @ReactMethod
    fun startFtpServer(username: String, password: String, rootPath: String, port: Int, host: String = "127.0.0.1") {
        val context: Context = reactApplicationContext
        if (isPortInUse(port)) {
            Log.e("FtpServer", "Port $port is already in use. Cannot start FTP server.")
            return
        } else {
            ftpServer = FtpServer(host, port, context, true)
            val root:File = File(rootPath)
            ftpServer?.setRootDirectory(root)
            userManager.addUser(username, password)
            ftpServer?.setUserManager(userManager)
            Log.i("FtpServer", "FTP server started on port $port")
        }
        
    }

    @ReactMethod
    fun addFtpUser(username: String, password: String) {
        userManager.addUser(username, password)
    }

    @ReactMethod
    fun stopFtpServer() {
        ftpServer?.stop()
        ftpServer = null
        Log.i("FtpServer", "FTP server stopped")
        Thread.sleep(500)  // 等待釋放 port
    }
}
