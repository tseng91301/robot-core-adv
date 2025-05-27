import { ThemedText } from '@/components/ThemedText';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Button, TextInput, View } from 'react-native';

import { useBle } from '../../context/BleContext';

export default function MainDashboard() {
  const {isConnected, connectedDeviceId, connectedDeviceName, disconnectFromDevice, checkConnection, sendMessage, startNotification} = useBle();
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [inputMessage, setInputMessage] = useState('');
  const [notifiedText, setNotifiedText] = useState('尚未收到資料');

  useEffect(() => {
    if (isFocused) {
      checkConnection(); // 每次返回此畫面時重新檢查
      startNotification(setNotifiedText);
    }
  }, [isFocused]);

  const disconnect = async () => {
    try {
      await disconnectFromDevice();
      Alert.alert("已斷線");
    } catch (e: any) {
      Alert.alert("斷線錯誤", e.message);
    }
  };

  const goToConnectScreen = () => {
    navigation.navigate('BleConnect'); // 確保你的 navigator 有註冊這個 screen
  };

  const handleSend = async () => {
    try {
      await sendMessage(inputMessage);
      console.log("訊息已發送", inputMessage);
      setInputMessage('');
    } catch (e: any) {
      Alert.alert("發送失敗", e.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      {isConnected ? (
        <View>
          <ThemedText style={{ marginBottom: 10 }}>✅ 已連接：{connectedDeviceName} ({connectedDeviceId})</ThemedText>
          <Button title="斷線" onPress={disconnect} />
          <TextInput
            style={{
              marginTop: 20,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 5,
              padding: 10,
            }}
            placeholder="輸入要傳送的訊息"
            value={inputMessage}
            onChangeText={setInputMessage}
            returnKeyType="send" // 這會顯示「發送」按鈕
            onSubmitEditing={handleSend} // 使用者按下鍵盤的發送鍵時觸發
            blurOnSubmit={false} // 保持焦點不變（可依需求調整）
          />
          <Button title="發送訊息" onPress={handleSend} />
          <ThemedText style={{ marginTop: 20 }}>🔄 從裝置收到的資料：</ThemedText>
          <ThemedText style={{ padding: 10, borderRadius: 8, marginVertical: 10 }}>{notifiedText}</ThemedText>
        </View>
      ) : (
        <View>
          <ThemedText style={{ marginBottom: 10 }}>❌ 尚未連接藍牙裝置</ThemedText>
          <Button title="連接裝置" onPress={goToConnectScreen} />
        </View>
      )}
    </View>
  );
}
