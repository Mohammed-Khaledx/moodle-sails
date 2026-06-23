import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { usePushNotifications } from './src/hooks/usePushNotifications';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CourseDetailsScreen from './src/screens/CourseDetailsScreen';
import ActivityViewScreen from './src/screens/ActivityViewScreen';
import NotificationDetailScreen from './src/screens/NotificationDetailScreen';

const navigationRef = createNavigationContainerRef<any>();
const Stack = createNativeStackNavigator();

export default function App() {
  const { tappedNotification, setTappedNotification } = usePushNotifications();
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('moodle_user_token')
      .then(token => {
        setInitialRoute(token ? 'Dashboard' : 'Login');
      })
      .catch(() => setInitialRoute('Login'));
  }, []);

  // FIXED INTERACTION LISTENER
  useEffect(() => {
    if (tappedNotification && navigationRef.isReady()) {
      console.log('✈️ Routing framework executing transition to explicit text notification panel...');
      
      // ALWAYS point raw text push dispatches to NotificationDetail screen
      navigationRef.navigate('NotificationDetail', { alertData: tappedNotification });
      
      setTappedNotification(null); 
    }
  }, [tappedNotification]);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F7FA' }}>
        <ActivityIndicator size="large" color="#0B4F70" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="CourseDetails" component={CourseDetailsScreen} />
        <Stack.Screen name="ActivityView" component={ActivityViewScreen} />
        <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}