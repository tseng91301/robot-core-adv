import React from 'react';
import { WebView } from 'react-native-webview';

export default function PythonTester() {
  return (
    <WebView
      originWhitelist={['*']}
      source={require('@/assets/python/test-web-view.html')}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      onMessage={(event) => {
        const message = event.nativeEvent.data;
        if (message.startsWith("MOTOR:")) {
          const speed = parseInt(message.split(":")[1]);
          console.log("Received speed:", speed);
          // 呼叫 Native module 控制馬達
          // NativeModules.MotorControl.setSpeed(speed);
        }
      }}
    />
  );
}
