import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMoodleSiteInfo, getUserCourses } from '../services/moodle';

const BRAND = { primary: '#0B4F70', secondary: '#3A86C8', accent: '#D4A373', background: '#F4F7FA', surface: '#FFFFFF', text: '#1E293B', textMuted: '#64748B', border: '#E2E8F0' };

export default function DashboardScreen({ navigation }: any) {
  const [courses, setCourses] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState({ name: 'Student', id: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const [isTokenDead, setIsTokenDead] = useState(false);

  const syncWorkspaceData = async () => {
    // If we already know the token is dead, do not execute any network calls
    if (isTokenDead) return;
    
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('moodle_user_token');
      if (!token) {
        navigation.replace('Login');
        return;
      }
      
      const siteInfo = await getMoodleSiteInfo(token);
      setUserProfile({ name: siteInfo.fullname, id: siteInfo.userid });
      
      const enrolledCourses = await getUserCourses(token, siteInfo.userid);
      setCourses(Array.isArray(enrolledCourses) ? enrolledCourses : []);
    } catch (e: any) {
      console.error('Failed to sync courses directory:', e.message);
      
      if (e.message === 'MOODLE_INVALID_TOKEN') {
        setIsTokenDead(true); // Hard stop further executions immediately
        await AsyncStorage.clear(); // Wipe everything clean
        
        // Break out of stack context safely
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }, 500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { syncWorkspaceData(); }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('moodle_user_token');
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.headerLogoText}>SAILS HUB</Text>
          <Text style={styles.userWelcomeText}>Welcome, {userProfile.name}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Exit</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>My Enrolled Courses</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color={BRAND.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={syncWorkspaceData} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>You are not currently enrolled in active course configurations inside Moodle.</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.courseCard} 
              onPress={() => navigation.navigate('CourseDetails', { courseId: item.id, courseName: item.fullname })}
            >
              <View style={styles.cardHeaderGraphic}>
                <Text style={styles.courseCodeText}>{item.shortname || 'EDU'}</Text>
              </View>
              <View style={styles.cardPadding}>
                <Text style={styles.courseTitle} numberOfLines={2}>{item.fullname}</Text>
                {item.progress !== null && (
                  <Text style={styles.progressText}>Progress: {Math.round(item.progress)}%</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background, paddingHorizontal: 16, paddingTop: 60 },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottomWidth: 1, borderColor: BRAND.border, marginBottom: 20 },
  headerLogoText: { fontSize: 20, fontWeight: '900', color: BRAND.primary, letterSpacing: 1 },
  userWelcomeText: { fontSize: 13, color: BRAND.textMuted, fontWeight: '600', marginTop: 2 },
  logoutButton: { backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  logoutButtonText: { color: '#EF4444', fontWeight: '700', fontSize: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: BRAND.text, marginBottom: 16, letterSpacing: 0.5 },
  courseCard: { backgroundColor: BRAND.surface, width: '48%', borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: BRAND.border, overflow: 'hidden' },
  cardHeaderGraphic: { height: 75, backgroundColor: BRAND.primary, justifyContent: 'center', alignItems: 'center' },
  courseCodeText: { color: '#FFF', fontWeight: '800', fontSize: 14, letterSpacing: 1 },
  cardPadding: { padding: 12 },
  courseTitle: { fontSize: 13, fontWeight: '700', color: BRAND.text, height: 36, lineHeight: 18 },
  progressText: { fontSize: 11, color: BRAND.secondary, fontWeight: '700', marginTop: 8 },
  emptyText: { textAlign: 'center', color: BRAND.textMuted, marginTop: 40, fontSize: 14, paddingHorizontal: 20, lineHeight: 20 }
});