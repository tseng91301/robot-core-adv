import React, { useState } from 'react';
import { ActivityIndicator, Alert, Button, NativeModules, ScrollView, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useNavigation } from '@react-navigation/native';
import { useBle } from '../../context/BleContext';
const { MyBle } = NativeModules;

export default function BleConnectScreen() {
  const [devices, setDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const navigation = useNavigation();

  const { connect } = useBle();

  const scan = async () => {
    setIsScanning(true);
    setDevices([]);
    try {
      const results = await MyBle.scanDevices();
      setDevices(results);
      setIsScanning(false);
    } catch (e: any) {
      Alert.alert('掃描錯誤', e.message);
      setIsScanning(false);
    }
  };

  const _connectToDevice = async (id: string, name:string) => {
    try {
      console.log('Connecting to device:', id);
      await connect(id, name); // 假設你有此方法
      Alert.alert('連接成功', `已連接裝置：${name}, ID: ${id}`);
      navigation.goBack();
    } catch (error) {
      console.error('連接失敗', error);
      Alert.alert('連接失敗', '請確認裝置是否開啟');
    }
  };

  return (
    <View style={{ padding: 20, flex: 1 }}>
      <Button title={isScanning ? '掃描中...' : '掃描裝置'} onPress={scan} disabled={isScanning} />
      {isScanning && <ActivityIndicator style={{ marginTop: 10 }} />}
      <ScrollView style={{ marginTop: 20 }}>
        {devices.map((dev: any, idx) => {
          if (!dev.name || dev.name === "Unknown") return null;
          return (
            <View key={idx} style={{ marginVertical: 10 }}>
              <ThemedText>{dev.name} ({dev.id})</ThemedText>
              <Button title="連接" onPress={() => _connectToDevice(dev.id, dev.name)} />
            </View>
          )
        })}
      </ScrollView>
    </View>
  );
}