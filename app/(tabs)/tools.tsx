import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AccelerometerSensor from '../features/tools/AccelerometerSensor';
import ToolsHomeScreen from '../features/tools/ToolsHomeScreen';

const Stack = createNativeStackNavigator();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ToolsHome" component={ToolsHomeScreen} options={{ title: 'Tools' }} />
      <Stack.Screen name="AccelerometerSensor" component={AccelerometerSensor} options={{ title: 'Accelerometer Sensor, Gyroscope' }} />
    </Stack.Navigator>
  );
}
