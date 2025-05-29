import React from 'react';
import { WebView } from 'react-native-webview';

export default function PythonTester() {
  const onWebViewMessage = (event:any) => {
    const data = JSON.parse(event.nativeEvent.data);

    if (data.type === 'CONSOLE_LOG') {
      console.log('🌐 WebView Console:', data.log);
    } else if (data.type === 'MOTOR') {
      console.log(`Motor Speed: ${data.spd}`)
    }
  };

  return (
    <WebView
      originWhitelist={['*']}
      // source={require('@/android/app/src/main/assets/python/test-web-view.html')}
      source={{uri: 'file:///android_asset/python/test-web-view.html'}}
      allowFileAccess={true}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      onMessage={onWebViewMessage}
    />
  );
}
