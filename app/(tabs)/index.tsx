import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BleConnectScreen from '../features/home/BleConnectScreen';
import MainDashboard from '../features/home/MainDashboard';

import { useEffect } from 'react';
import { Alert } from 'react-native';
import requestBlePermissions from '../ble/permissions';

const Stack = createNativeStackNavigator();

export default function HomeStackNavigator() {
  useEffect(() => {
    const checkPermissions = async () => {
      const granted = await requestBlePermissions();
      if (!granted) {
        Alert.alert('權限不足', '請在設定中啟用藍牙和定位權限');
      }
    };

    checkPermissions();
  }, []);
  return (
    <Stack.Navigator>
      <Stack.Screen name="MainDashboard" component={MainDashboard} options={{ title: '機器人資訊' }} />
      <Stack.Screen name="BleConnect" component={BleConnectScreen} options={{ title: 'BLE 裝置連接' }} />
    </Stack.Navigator>
  );
}
