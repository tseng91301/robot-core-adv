import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Camera, useCameraDevices, useFrameProcessor } from 'react-native-vision-camera';

import { useIsFocused } from '@react-navigation/native';
import { loadTensorflowModel, TensorflowModel } from 'react-native-fast-tflite';
import { useResizePlugin } from 'vision-camera-resize-plugin';

async function loadModel() {
  try {
    const model = await loadTensorflowModel(
      require('../../assets/models/yolo11n_float32.tflite'),
      'android-gpu'
    );
    return model;
  } catch (error) {
    console.error('Failed to load model:', error);
  }
}

export default function ImgDetection() {
  const cameraRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(false);
  const devices = useCameraDevices();
  const device = devices[0];
  const actualModel = useRef<TensorflowModel>(null);

  useEffect(() => {
    const requestPermission = async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    };
    requestPermission();
  }, []);

  useEffect(() => {
    const initModel = async () => {
      const model = await loadModel(); // <-- 正確使用 await
      if (model) actualModel.current = model; // 儲存起來
      console.log('Model loaded:', model);
    };
    initModel();
  }, []);

  const isFocused = useIsFocused();

  const { resize } = useResizePlugin()

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet'
      if (actualModel == null) {
        // model is still loading...
        return
      }

      const resized = resize(frame, {
        scale: {
          width: 320,
          height: 320,
        },
        pixelFormat: 'rgb',
        dataType: 'uint8',
      })

      console.log(resized[500])

      const result = actualModel.current.runSync([resized])
      const num_detections = result[3]?.[0] ?? 0
      console.log('Result: ' + num_detections)
    },
    [actualModel]
  )

  if (!device || !hasPermission) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <View ref={cameraRef} collapsable={false} style={StyleSheet.absoluteFill}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isFocused && hasPermission}
          frameProcessor={frameProcessor}
          pixelFormat="yuv"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  button: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
});
