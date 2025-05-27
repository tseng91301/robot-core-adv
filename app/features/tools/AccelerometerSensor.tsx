import { ThemedText } from '@/components/ThemedText';
import { Accelerometer } from 'expo-sensors';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

export default function AccelerometerSensor() {
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    // 設定監聽器
    const subscription = Accelerometer.addListener(accelerometerData => {
      setData(accelerometerData);
    });

    // 設定更新頻率
    Accelerometer.setUpdateInterval(10); // 每 10 毫秒更新一次

    return () => subscription.remove(); // 清除監聽
  }, []);

  return (
    <View>
      <ThemedText>X: {data.x.toFixed(2)}</ThemedText>
      <ThemedText>Y: {data.y.toFixed(2)}</ThemedText>
      <ThemedText>Z: {data.z.toFixed(2)}</ThemedText>
    </View>
  );
}
