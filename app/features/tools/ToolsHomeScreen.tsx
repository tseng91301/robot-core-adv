import { ThemedText } from '@/components/ThemedText';
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

const tools = [
  { name: 'Accelerometer, Gyroscope', screen: 'AccelerometerSensor' },
  { name: 'Python Interactive Interpreter', screen: 'PythonTester'},
  { name: 'Python External Storage Executer', screen: 'PyExecuteKernel'}
];

const ToolsHomeScreen = ({ navigation }: { navigation: any }) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={tools}
        keyExtractor={(item) => item.screen}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate(item.screen)}
          >
            <ThemedText style={styles.buttonText}>{item.name}</ThemedText>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

export default ToolsHomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  button: {
    padding: 16,
    backgroundColor: '#2146c2',
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: { color: '#fff', fontSize: 16 },
});
