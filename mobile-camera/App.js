import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { StatusBar } from 'expo-status-bar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [backendUrl, setBackendUrl] = useState('http://192.168.1.100:8000'); // Customizable backend URL
  const [isStreaming, setIsStreaming] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Standby // Ready to Stream');
  const [statusColor, setStatusColor] = useState('#cac5cc');
  const [showSettings, setShowSettings] = useState(true);
  
  // Analytics heuristic states
  const [detectedWorkers, setDetectedWorkers] = useState(2);
  const [activityScore, setActivityScore] = useState(68);
  const [frameCount, setFrameCount] = useState(0);

  const cameraRef = useRef(null);
  const streamIntervalRef = useRef(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  // Update simulated worker detection values to simulate live ML processing
  useEffect(() => {
    let interval;
    if (isStreaming) {
      interval = setInterval(() => {
        // Dynamic worker fluctuation between 1 and 3
        setDetectedWorkers(prev => {
          const change = Math.random();
          if (change < 0.15 && prev > 1) return prev - 1;
          if (change > 0.85 && prev < 4) return prev + 1;
          return prev;
        });

        // Dynamic activity score fluctuation
        setActivityScore(prev => {
          const change = (Math.random() - 0.5) * 20;
          return Math.max(10, Math.min(100, Math.round(prev + change)));
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isStreaming]);

  const startStreaming = () => {
    if (!backendUrl.trim()) {
      alert('Please enter a valid backend URL.');
      return;
    }
    
    // Clean trailing slash
    const formattedUrl = backendUrl.trim().replace(/\/$/, '');
    setBackendUrl(formattedUrl);
    setIsStreaming(true);
    setShowSettings(false);
    setStatusMessage('Transmitting live security feed...');
    setStatusColor('#9cd2b8');
  };

  const stopStreaming = () => {
    setIsStreaming(false);
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
    setStatusMessage('Standby // Stream Terminated');
    setStatusColor('#ffb4ab');
  };

  // Perform frame capture, resize/compress, and POST to backend
  useEffect(() => {
    if (isStreaming) {
      const captureFrame = async () => {
        if (!cameraRef.current) return;
        try {
          // Take picture with lowest resolution for maximum performance
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.3,
            skipProcessing: true
          });

          // Compress and downscale using Expo ImageManipulator to 480px width for fast upload
          const manipulated = await ImageManipulator.manipulateAsync(
            photo.uri,
            [{ resize: { width: 480 } }],
            { compress: 0.4, format: ImageManipulator.SaveFormat.JPEG, base64: true }
          );

          const base64Image = `data:image/jpeg;base64,${manipulated.base64}`;

          // Send to Django backend API
          const response = await fetch(`${backendUrl}/api/camera/frame`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image: base64Image,
              activity_score: activityScore,
              worker_count: detectedWorkers,
              device_id: 'mobile-cam-01'
            })
          });

          if (response.ok) {
            setFrameCount(prev => prev + 1);
            setStatusMessage(`Feed active // Frame #${frameCount + 1} transmitted`);
            setStatusColor('#9cd2b8');
          } else {
            setStatusMessage(`Stream Error: Server responded with status ${response.status}`);
            setStatusColor('#ffb4ab');
          }
        } catch (err) {
          setStatusMessage(`Connection Error: Check IP or same WiFi network`);
          setStatusColor('#ffb4ab');
        }
      };

      // Capture frame immediately and then every 3 seconds
      captureFrame();
      streamIntervalRef.current = setInterval(captureFrame, 3000);
    } else {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
      }
    }

    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
    };
  }, [isStreaming, backendUrl, activityScore, detectedWorkers, frameCount]);

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#9cd2b8" />
        <Text style={styles.permissionText}>Accessing device camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.permissionText, { color: '#ffb4ab' }]}>No Access to Camera</Text>
        <Text style={styles.subPermissionText}>Please grant camera permissions in settings to run the security cam feed.</Text>
        <TouchableOpacity style={[styles.primaryButton, { marginTop: 20, paddingHorizontal: 20 }]} onPress={requestPermission}>
          <Text style={styles.buttonText}>GRANT PERMISSION</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Camera Preview */}
      <CameraView style={styles.camera} facing="back" ref={cameraRef}>
        <View style={styles.hudOverlay}>
          {/* Header HUD */}
          <View style={styles.headerHud}>
            <View style={styles.recBadge}>
              <View style={[styles.dot, { backgroundColor: isStreaming ? '#ff1a1a' : '#7f7f7f' }]} />
              <Text style={styles.recText}>{isStreaming ? 'REC LIVE' : 'STANDBY'}</Text>
            </View>
            <Text style={styles.camLabel}>CAM 05 // MOBILE_SEC</Text>
          </View>

          {/* Left Telemetry sidebar HUD */}
          <View style={styles.leftTelemetry}>
            <Text style={styles.telemetryTitle}>RESOLUTION</Text>
            <Text style={styles.telemetryVal}>480p JPEG</Text>
            
            <Text style={[styles.telemetryTitle, { marginTop: 12 }]}>BANDWIDTH</Text>
            <Text style={styles.telemetryVal}>{isStreaming ? '12.5 KB/s' : '0.0 KB/s'}</Text>
            
            <Text style={[styles.telemetryTitle, { marginTop: 12 }]}>FRAME UPTIME</Text>
            <Text style={styles.telemetryVal}>{frameCount} frames</Text>
          </View>

          {/* Core Analytics HUD (at bottom of viewfinder) */}
          <View style={styles.analyticsHud}>
            <Text style={styles.analyticsTitle}>● ON-DEVICE WORKER CLASSIFICATION</Text>
            
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.analyticsLabel}>WORKER COUNT</Text>
                <Text style={styles.analyticsVal}>{isStreaming ? detectedWorkers : '--'}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.analyticsLabel}>ACTIVITY SCORE</Text>
                <Text style={[styles.analyticsVal, { color: '#22d3ee' }]}>
                  {isStreaming ? `${activityScore}%` : '--'}
                </Text>
              </View>
            </View>

            <View style={styles.progressBarBg}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: isStreaming ? `${activityScore}%` : '0%' }
                ]} 
              />
            </View>
          </View>
        </View>
      </CameraView>

      {/* Control Panel Bottom Drawer */}
      <View style={styles.controlPanel}>
        {/* Status indicator bar */}
        <View style={styles.statusBar}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusMessage}</Text>
        </View>

        {showSettings ? (
          <View style={styles.settingsContainer}>
            <Text style={styles.settingsLabel}>OppSync Server Target URL:</Text>
            <TextInput
              style={styles.textInput}
              value={backendUrl}
              onChangeText={setBackendUrl}
              placeholder="e.g. http://192.168.1.100:8000"
              placeholderTextColor="rgba(255,255,255,0.3)"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.helpText}>
              Phone and PC must be on the same local network (WiFi). Ensure your PC firewall allows incoming connections on port 8000.
            </Text>

            <TouchableOpacity style={styles.primaryButton} onPress={startStreaming}>
              <Text style={styles.buttonText}>START LIVE BROADCAST</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.activeContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={() => setShowSettings(true)}>
              <Text style={styles.buttonText}>SHOW CONNECTION SETTINGS</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: '#93000a', marginTop: 10 }]} 
              onPress={stopStreaming}
            >
              <Text style={[styles.buttonText, { color: '#ffb4ab' }]}>STOP BROADCAST</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0b',
  },
  camera: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0b',
    padding: 20,
  },
  permissionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    textAlign: 'center',
  },
  subPermissionText: {
    color: '#cac5cc',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.6,
  },
  hudOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 20,
    justifyContent: 'space-between',
  },
  headerHud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  recText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  camLabel: {
    color: '#22d3ee',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  leftTelemetry: {
    position: 'absolute',
    left: 20,
    top: SCREEN_HEIGHT * 0.2,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#22d3ee',
  },
  telemetryTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 8,
    fontFamily: 'monospace',
  },
  telemetryVal: {
    color: '#ffffff',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  analyticsHud: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(156,210,184,0.2)',
    padding: 12,
    width: '100%',
    alignSelf: 'center',
  },
  analyticsTitle: {
    color: '#9cd2b8',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  col: {
    flex: 1,
  },
  analyticsLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 8,
    fontFamily: 'monospace',
  },
  analyticsVal: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'black',
    fontFamily: 'monospace',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22d3ee',
  },
  controlPanel: {
    backgroundColor: '#141314',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    padding: 16,
  },
  statusBar: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginBottom: 14,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  settingsContainer: {
    flexDirection: 'column',
  },
  settingsLabel: {
    color: '#cac5cc',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 8,
    color: '#ffffff',
    fontFamily: 'monospace',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  helpText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    lineHeight: 12,
    marginBottom: 14,
  },
  primaryButton: {
    backgroundColor: '#9cd2b8',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'black',
    fontFamily: 'monospace',
  },
  activeContainer: {
    flexDirection: 'column',
  }
});
