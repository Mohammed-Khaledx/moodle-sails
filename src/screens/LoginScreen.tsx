import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

// Architectural Hooks & Services
import { usePushNotifications } from '../hooks/usePushNotifications';
import { loginToMoodle, registerDeviceWithMoodle } from '../services/moodle';

const BRAND = {
  primary: '#0B4F70',       
  secondary: '#3A86C8',     
  accent: '#D4A373',        
  background: '#F4F7FA',    
  surface: '#FFFFFF',       
  text: '#1E293B',          
  textMuted: '#64748B',     
  border: '#E2E8F0'         
};

export default function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { fcmToken } = usePushNotifications();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Authentication Failed', 'Please complete all required fields.');
      return;
    }
    
    setIsLoggingIn(true);
    try {
      // 1. Handshake with local Moodle Instance
      const userToken = await loginToMoodle(username, password);
      
      // 2. Lock down security token into local mobile storage
      await AsyncStorage.setItem('moodle_user_token', userToken);

      // 3. Register push engine if token generation cleared successfully
      if (fcmToken) {
        try {
          await registerDeviceWithMoodle(userToken, fcmToken);
        } catch (tokenErr) {
          console.warn('Push registration bypassed on background layer:', tokenErr);
        }
      }
      
      // 4. Wipe authentication history stack and drop user into workspace dashboard
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } catch (error: any) {
      Alert.alert('Access Denied', error.message || 'Invalid credentials verified against backend instance.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <View style={styles.loginContainer}>
      {/* Brand Identity Header Cluster */}
      <View style={styles.logoContainer}>
        <View style={styles.logoGraphicWrapper}>
          <View style={[styles.sailWing, { borderColor: BRAND.primary }]} />
          <View style={[styles.sailWingRight, { borderColor: BRAND.secondary }]} />
          <View style={styles.logoGoldDot} />
        </View>
        <Text style={styles.brandTitle}>SAILS</Text>
        <Text style={styles.brandSlogan}>E-LEARNING PLATFORM</Text>
      </View>

      {/* Input Credentials Form Sheet */}
      <View style={styles.formWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Moodle Username"
          placeholderTextColor={BRAND.textMuted}
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={BRAND.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity 
          style={[styles.button, isLoggingIn && styles.buttonDisabled]} 
          onPress={handleLogin} 
          disabled={isLoggingIn}
        >
          {isLoggingIn ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Establish Connection</Text>
          )}
        </TouchableOpacity>
      </View>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  loginContainer: { 
    flex: 1, 
    backgroundColor: BRAND.background, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 24 
  },
  logoContainer: { 
    alignItems: 'center', 
    marginBottom: 40 
  },
  logoGraphicWrapper: { 
    width: 70, 
    height: 70, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  sailWing: { 
    position: 'absolute', 
    width: 45, 
    height: 45, 
    borderLeftWidth: 4, 
    borderBottomWidth: 4, 
    borderRadius: 24, 
    transform: [{ rotate: '45deg' }], 
    left: 4 
  },
  sailWingRight: { 
    position: 'absolute', 
    width: 35, 
    height: 35, 
    borderRightWidth: 3, 
    borderTopWidth: 3, 
    borderRadius: 18, 
    transform: [{ rotate: '-45deg' }], 
    right: 8, 
    top: 12 
  },
  logoGoldDot: { 
    position: 'absolute', 
    width: 10, 
    height: 10, 
    backgroundColor: BRAND.accent, 
    borderRadius: 5, 
    top: 2, 
    right: 26 
  },
  brandTitle: { 
    fontSize: 32, 
    color: BRAND.primary, 
    fontWeight: '900', 
    letterSpacing: 3, 
    marginBottom: 2 
  },
  brandSlogan: { 
    fontSize: 11, 
    color: BRAND.textMuted, 
    fontWeight: '700', 
    letterSpacing: 2 
  },
  formWrapper: { 
    width: '100%', 
    backgroundColor: BRAND.surface, 
    padding: 24, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: BRAND.border,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12 },
      android: { elevation: 3 }
    })
  },
  input: { 
    width: '100%', 
    backgroundColor: BRAND.background, 
    color: BRAND.text, 
    padding: 16, 
    borderRadius: 10, 
    marginBottom: 16, 
    fontSize: 15, 
    fontWeight: '500', 
    borderWidth: 1, 
    borderColor: BRAND.border 
  },
  button: { 
    width: '100%', 
    backgroundColor: BRAND.primary, 
    padding: 16, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginTop: 4 
  },
  buttonDisabled: { 
    opacity: 0.6 
  },
  buttonText: { 
    color: BRAND.surface, 
    fontWeight: '700', 
    fontSize: 16, 
    letterSpacing: 0.5 
  }
});