import { ThemedText } from '@/components/ThemedText';
import { DarkTheme, LightTheme } from '@/styles/theme';
import { useFocusEffect } from '@react-navigation/native';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { Grid, LineChart, YAxis } from 'react-native-svg-charts';

const MAX_POINTS = 50;

function useSensor(sensor: any, interval = 100) {
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });
  const [history, setHistory] = useState({ x: [], y: [], z: [] });
  const [subscription, setSubscription] = useState<any>(null);

  const start = () => {
    sensor.setUpdateInterval(interval);
    const sub = sensor.addListener((sensorData: any) => {
      setData(sensorData);
      setHistory((prev: any) => ({
        x: [...prev.x.slice(-MAX_POINTS), sensorData.x],
        y: [...prev.y.slice(-MAX_POINTS), sensorData.y],
        z: [...prev.z.slice(-MAX_POINTS), sensorData.z],
      }));
    });
    setSubscription(sub);
  };

  const stop = () => {
    subscription?.remove();
    setSubscription(null);
  };

  return { data, history, start, stop };
}

export default function AccelerometerGyroscopeSensor() {
  const {
    data: accData,
    history: accHistory,
    start: startAcc,
    stop: stopAcc,
  } = useSensor(Accelerometer, 10);

  const {
    data: gyroData,
    history: gyroHistory,
    start: startGyro,
    stop: stopGyro,
  } = useSensor(Gyroscope, 10);

  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : LightTheme;

  useFocusEffect(
    useCallback(() => {
      startAcc();
      startGyro();
      return () => {
        stopAcc();
        stopGyro();
      };
    }, [])
  );

  const renderChart = (history: any, title: string) => (
    <View style={styles.chartContainer}>
      <ThemedText style={styles.chartTitle}>{title}</ThemedText>
      <View style={{ flexDirection: 'row', height: 150 }}>
        <YAxis
          data={[...history.x, ...history.y, ...history.z]}
          contentInset={{ top: 10, bottom: 10 }}
          svg={{ fill: theme.text, fontSize: 10 }}
          numberOfTicks={5}
        />
        <LineChart
          style={{ flex: 1, marginLeft: 10 }}
          data={history.x}
          svg={{ stroke: 'red' }}
          contentInset={{ top: 10, bottom: 10 }}
        >
          <Grid />
        </LineChart>
        <LineChart
          style={StyleSheet.absoluteFill}
          data={history.y}
          svg={{ stroke: 'green' }}
          contentInset={{ top: 10, bottom: 10 }}
        />
        <LineChart
          style={StyleSheet.absoluteFill}
          data={history.z}
          svg={{ stroke: 'blue' }}
          contentInset={{ top: 10, bottom: 10 }}
        />
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText style={styles.title}>3-Axis Accelerometer</ThemedText>
      <ThemedText style={styles.value}>
        X: {accData.x.toFixed(3)} Y: {accData.y.toFixed(3)} Z: {accData.z.toFixed(3)}
      </ThemedText>

      <ThemedText style={styles.title}>Gyroscope</ThemedText>
      <ThemedText style={styles.value}>
        X: {gyroData.x.toFixed(3)} Y: {gyroData.y.toFixed(3)} Z: {gyroData.z.toFixed(3)}
      </ThemedText>

      {renderChart(accHistory, 'Accelerometer')}
      {renderChart(gyroHistory, 'Gyroscope')}

      <ThemedText>X → Red, Y → Green, Z → Blue</ThemedText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 80,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
  },
  chartContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  chartTitle: {
    fontSize: 16,
    marginBottom: 5,
  },
});
