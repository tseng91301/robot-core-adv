import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainDashboard from './MainDashboard';
import BleConnectScreen from './BleConnectScreen';

export type HomeStackParamList = {
  MainDashboard: undefined;
  BleConnect: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="MainDashboard">
      <Stack.Screen name="MainDashboard" component={MainDashboard} options={{ title: '機器人狀態' }} />
      <Stack.Screen name="BleConnect" component={BleConnectScreen} options={{ title: '掃描藍牙裝置' }} />
    </Stack.Navigator>
  );
}
