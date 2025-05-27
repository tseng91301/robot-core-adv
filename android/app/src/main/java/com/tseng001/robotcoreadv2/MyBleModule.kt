package com.robotcoreadv2

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothGatt
import android.bluetooth.BluetoothGattCallback
import android.bluetooth.BluetoothGattCharacteristic
import android.bluetooth.BluetoothProfile
import android.bluetooth.BluetoothGattDescriptor
import android.bluetooth.le.*
import android.content.Context
import android.os.ParcelUuid
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.*
import kotlin.collections.HashMap
import android.os.Handler
import android.os.Looper
import android.os.Build
import java.util.Timer
import java.util.TimerTask



class MyBleModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val bluetoothAdapter: BluetoothAdapter? = BluetoothAdapter.getDefaultAdapter()
    private var scanner: BluetoothLeScanner? = null

    private var connectedGatt: BluetoothGatt? = null
    private var connectedDevice: BluetoothDevice? = null
    private var targetCharacteristic: BluetoothGattCharacteristic? = null


    private val deviceMap = HashMap<String, BluetoothDevice>()

    override fun getName(): String = "MyBle"

    @ReactMethod
    fun scanDevices(promise: Promise) {
        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled) {
            promise.reject("BLE_UNAVAILABLE", "Bluetooth is not available or not enabled")
            return
        }

        scanner = bluetoothAdapter.bluetoothLeScanner
        val foundDevices = WritableNativeArray()

        val callback = object : ScanCallback() {
            override fun onScanResult(callbackType: Int, result: ScanResult) {
                val device = result.device
                val id = device.address ?: return
                deviceMap[id] = device

                val jsDevice = WritableNativeMap().apply {
                    putString("id", device.address)
                    putString("name", device.name ?: "Unknown")
                }

                foundDevices.pushMap(jsDevice)
            }

            override fun onScanFailed(errorCode: Int) {
                promise.reject("SCAN_FAILED", "BLE scan failed: $errorCode")
            }
        }

        scanner?.startScan(callback)

        // 停止掃描並回傳結果（例如掃 5 秒）
        Timer().schedule(object : TimerTask() {
            override fun run() {
                scanner?.stopScan(callback)
                promise.resolve(foundDevices)
            }
        }, 5000)
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    @ReactMethod
    fun addListener(eventName: String?) {
        // 必要但可以留空，不需要做任何事
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // 同樣可以留空
    }

    @ReactMethod
    fun connectToDevice(deviceId: String, promise: Promise) {
        val device = deviceMap[deviceId]
        if (device == null) {
            promise.reject("DEVICE_NOT_FOUND", "Device not found")
            return
        }

        // 清除先前的 GATT 連線
        connectedGatt?.disconnect()
        connectedGatt?.close()
        connectedGatt = null

        val gattCallback = object : BluetoothGattCallback() {
            override fun onConnectionStateChange(gatt: BluetoothGatt, status: Int, newState: Int) {
                Log.d("MyBle", "onConnectionStateChange: status=$status, newState=$newState")

                if (status == BluetoothGatt.GATT_SUCCESS && newState == BluetoothProfile.STATE_CONNECTED) {
                    Log.d("MyBle", "連線成功，開始探索服務")
                    connectedDevice = device

                    // 延遲 discoverServices 避免錯誤 133
                    Handler(Looper.getMainLooper()).postDelayed({
                        gatt.discoverServices()
                    }, 300)
                } else {
                    Log.d("MyBle", "連線失敗或中斷，釋放資源")
                    gatt.close()
                    promise.reject("CONNECTION_FAILED", "Connection failed with status $status")
                }
            }

            override fun onServicesDiscovered(gatt: BluetoothGatt, status: Int) {
                if (status != BluetoothGatt.GATT_SUCCESS) {
                    Log.d("MyBle", "Service 探索失敗: $status")
                    promise.reject("SERVICE_DISCOVERY_FAILED", "Service discovery failed with status $status")
                    return
                }

                val serviceUUID = UUID.fromString("6e400001-b5a3-f393-e0a9-e50e24dcca9e")
                val characteristicUUID = UUID.fromString("6e400003-b5a3-f393-e0a9-e50edfae46e4")

                val service = gatt.getService(serviceUUID)
                targetCharacteristic = service?.getCharacteristic(characteristicUUID)

                if (targetCharacteristic != null) {
                    gatt.setCharacteristicNotification(targetCharacteristic, true)

                    // 設定 CCCD descriptor 為通知模式 (0x0001)
                    val descriptor = targetCharacteristic!!.getDescriptor(UUID.fromString("00002902-0000-1000-8000-00805f9b34fb"))
                    descriptor?.let {
                        it.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
                        gatt.writeDescriptor(it)
                    }

                    Log.d("MyBle", "Characteristic 取得成功，通知啟用中")
                    promise.resolve("Connected and characteristic found")
                } else {
                    Log.d("MyBle", "找不到指定 Characteristic")
                    promise.reject("CHAR_NOT_FOUND", "Characteristic not found in service")
                }
            }

            override fun onCharacteristicChanged(gatt: BluetoothGatt, characteristic: BluetoothGattCharacteristic) {
                val value = characteristic.value ?: return
                val message = String(value)

                Log.d("MyBle", "收到 notify: $message")

                val params = WritableNativeMap().apply {
                    putString("value", message)
                }

                sendEvent("onBleNotify", params)
            }
        }

        // Android 6.0 (API 23) 以上使用 TRANSPORT_LE
        connectedGatt = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            device.connectGatt(reactContext, false, gattCallback, BluetoothDevice.TRANSPORT_LE)
        } else {
            device.connectGatt(reactContext, false, gattCallback)
        }
    }


    @ReactMethod
    fun getConnectedDevice(promise: Promise) {
        connectedDevice?.let {
            val result = WritableNativeMap().apply {
                putString("id", it.address)
                putString("name", it.name ?: "Unknown")
            }
            promise.resolve(result)
        } ?: run {
            promise.resolve(null)
        }
    }

    @ReactMethod
    fun sendData(data: String, promise: Promise) {
        val characteristic = targetCharacteristic
        if (characteristic == null) {
            promise.reject("NO_CHAR", "Characteristic not ready")
            return
        }

        characteristic.setValue(data)
        val result = connectedGatt?.writeCharacteristic(characteristic) ?: false

        if (result) {
            promise.resolve("Data sent: $data")
        } else {
            promise.reject("WRITE_FAIL", "Failed to write to characteristic")
        }
    }

    @ReactMethod
    fun disconnect(promise: Promise) {
        try {
            connectedGatt?.disconnect()
            connectedGatt?.close()
            connectedGatt = null
            connectedDevice = null
            promise.resolve("Disconnected")
        } catch (e: Exception) {
            promise.reject("DISCONNECT_ERROR", "Failed to disconnect: ${e.message}")
        }
    }
}
