// React Native Component: PythonTesterScreen.js
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Linking, NativeModules, PermissionsAndroid, Platform, View } from 'react-native';
import RNFS from 'react-native-fs';
import { WebView } from 'react-native-webview';

const {FtpServerModule} = NativeModules;

const PYTHON_DIR = `${RNFS.ExternalStorageDirectoryPath}/Documents/robot-core-adv/python`;
const DEFAULT_SCRIPT = `def main():\n    print("Hello from default script!")\nmain()`;

// 檢查資料夾是否存在，否則建立並寫入預設腳本
async function ensurePythonDirAndDefaultScript() {
  const exists = await RNFS.exists(PYTHON_DIR);
  if (!exists) {
    await RNFS.mkdir(PYTHON_DIR);
    await RNFS.writeFile(`${PYTHON_DIR}/main.py`, DEFAULT_SCRIPT, 'utf8');
    console.log('✅ 已建立 python 資料夾與 main.py');
  } else {
    console.log('📁 Python 資料夾已存在');
  }
  const pkgF = await RNFS.exists(`${PYTHON_DIR}/packages.txt`);
  if (!pkgF) {
    await RNFS.writeFile(`${PYTHON_DIR}/packages.txt`, "", 'utf8');
    console.log('✅ 已建立 packages.txt');
  } else {
    console.log('📁 packages.txt 已存在');
  }
}

const PythonFromExternalStorageScreen = () => {
  const webViewRef = useRef(null);
  const [pyScripts, setPyScripts] = useState([]);
  const [pyPackages, setPyPackages] = useState([]);

  // 請求 Android 檔案存取權限
  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 30) {
        console.log("Need to open special storage settings...")
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        console.log('granted:', granted);
        if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            '權限被永久拒絕',
            '請前往設定頁面手動開啟儲存空間存取權限',
            [
              { text: '取消', style: 'cancel' },
              { text: '前往設定', onPress: () => Linking.openSettings() }
            ]
          );
          return false;
        }
      }
      
    }
    return true;
  };
  
  useFocusEffect(
    useCallback(() => {
      // Load FTP Server
      FtpServerModule.startFtpServer("root", "robotCoreAdv", PYTHON_DIR, 34829, "");
      return () => {
        FtpServerModule.stopFtpServer();
      };
    }, [])
  )

  ensurePythonDirAndDefaultScript();

  // 讀取目錄底下的所有 .py 檔
  const loadPythonScripts = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    try {
      const files = await RNFS.readDir(PYTHON_DIR);
      const pyFiles = files.filter(f => f.name.endsWith('.py'));
      const scripts = {};
      for (let file of pyFiles) {
        const content = await RNFS.readFile(file.path);
        scripts[file.name] = content;
      }
      setPyScripts(scripts);
      const pkgFiles = await RNFS.readFile(`${PYTHON_DIR}/packages.txt`, 'utf8');
      const packages:any = pkgFiles
        .split('\n')
        .map(pkg => pkg.trim())
        .filter(pkg => pkg !== '');
      setPyPackages(packages);
    } catch (err) {
      console.error('讀取失敗:', err);
    }
  };

  useEffect(() => {
    loadPythonScripts();
  }, []);

  // 送資料到 WebView
  const onWebViewLoad = () => {

  };

  const onWebViewMessage = (event:any) => {
    const data = JSON.parse(event.nativeEvent.data);

    if (data.type === 'CONSOLE_LOG') {
      console.log('🌐 WebView Console:', data.log);
    } else if (data.type === "PYODIDE_READY") {
      console.log("Loading packages");
      webViewRef.current.postMessage(JSON.stringify({
        type: 'LOAD_PACKAGES',
        packages: pyPackages
      }));
    } else if (data.type === 'MODULE_LOADED') {
      console.log("Loading scripts");
      webViewRef.current.postMessage(JSON.stringify({
        type: 'LOAD_SCRIPTS',
        scripts: pyScripts
      }));
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webViewRef}
        source={require('@/assets/python/external-executer-webview.html')}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        onLoadEnd={onWebViewLoad}
        onMessage={onWebViewMessage}
      />
    </View>
  );
};

export default PythonFromExternalStorageScreen;