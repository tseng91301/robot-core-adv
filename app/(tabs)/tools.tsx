import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AccelerometerSensor from '../features/tools/AccelerometerSensor';

const Stack = createNativeStackNavigator();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AccelerometerSensor" component={AccelerometerSensor} options={{ title: '3-Axis Accelerometer Sensor' }} />
    </Stack.Navigator>
  );
}
