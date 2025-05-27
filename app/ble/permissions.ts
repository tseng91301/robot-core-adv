// app/ble/permissions.ts
import { Platform } from 'react-native';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';

export default async function requestBlePermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const permissions = [
      PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
      PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    ];

    for (const permission of permissions) {
      const result = await request(permission);
      if (result !== RESULTS.GRANTED) {
        console.warn(`${permission} not granted`);
        return false;
      }
    }

    return true;
  }

  return true; // iOS 或 Web 預設通過（你可另外加 iOS 邏輯）
}
