// 檔案: app/context/BleContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';
const { MyBle } = NativeModules;

type BleContextType = {
  isConnected: boolean;
  setIsConnected: (value: boolean) => void;
  connectedDeviceId: string | null;
  setConnectedDeviceId: (id: string | null) => void;
  connectedDeviceName: string | null;
  setConnectedDeviceName: (name: string | null) => void;
  connect: (deviceId: string, deviceName: string) => Promise<boolean>;
  disconnectFromDevice: () => Promise<void>;
  checkConnection: () => Promise<boolean>;
  connectedDevice: any;
  setConnectedDevice: (device: any) => void;
  sendMessage: (text: string) => Promise<void>;
  startNotification: (callback: (text: string) => void) => () => void;
};

const BleContext = createContext<BleContextType | undefined>(undefined);

export const BleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDeviceId, setConnectedDeviceId] = useState<string | null>(null);
  const [connectedDeviceName, setConnectedDeviceName] = useState<string | null>(null);
  const [connectedDevice, setConnectedDevice] = useState<any>(null);

  const checkConnection = async () => {
    try {
      const device = await MyBle.getConnectedDevice();
      if (device && device.id === connectedDeviceId) {
        return true;
      } else {
        disconnectFromDevice();
        return false;
      }
    } catch (error) {
      console.error("Error checking BLE connection:", error);
      disconnectFromDevice();
      return false;
    }
  };

  const connect = async (deviceId: string, deviceName: string) => {
    try {
      await MyBle.connectToDevice(deviceId);
      setConnectedDeviceId(deviceId);
      setConnectedDeviceName(deviceName);
      setIsConnected(true);
      return true;
    } catch (error) {
      console.error('連線失敗:', error);
      disconnectFromDevice();
      return false;
    }
  };

  const disconnectFromDevice = async () => {
    try {
      await MyBle.disconnect();
      setConnectedDeviceId(null);
      setConnectedDeviceName(null);
      setConnectedDevice(null);
      setIsConnected(false);
    } catch (error) {
      console.error('斷線失敗:', error);
    }
  };

  const startNotification = (callback: (text: string) => void) => {
    const eventEmitter = new NativeEventEmitter(NativeModules.MyBle);
    const subscription = eventEmitter.addListener('onBleNotify', (event) => {
      if (event?.value) {
        callback(event.value); // 把通知值交給 dashboard 傳進來的 setNotifiedText 處理
      }
    });

    // 可選：提供中斷機制
    return () => {
      subscription.remove();
    };
  };


  const sendMessage = async (text: string) => {
    checkConnection();
    if (isConnected) {
      await MyBle.sendData(text); // 或 writeWithoutResponse
    } else {
      throw new Error("Connection Failed");
    }
  };


  return (
    <BleContext.Provider value={{ 
      isConnected, 
      setIsConnected, 
      connectedDeviceId, 
      setConnectedDeviceId, 
      connectedDeviceName, 
      setConnectedDeviceName, 
      connect, 
      disconnectFromDevice,
      checkConnection,
      connectedDevice,
      setConnectedDevice,
      sendMessage,
      startNotification
      }}>
      {children}
    </BleContext.Provider>
  );
};

export const useBle = () => {
  const context = useContext(BleContext);
  if (!context) {
    throw new Error('useBle 必須在 BleProvider 中使用');
  }
  return context;
};

export default BleContext;