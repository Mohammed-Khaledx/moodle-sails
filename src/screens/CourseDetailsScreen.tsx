import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCourseContents } from '../services/moodle';

const BRAND = { primary: '#0B4F70', secondary: '#3A86C8', background: '#F4F7FA', surface: '#FFFFFF', text: '#1E293B', textMuted: '#64748B', border: '#E2E8F0' };

export default function CourseDetailsScreen({ route, navigation }: any) {
  const { courseId, courseName } = route.params;
  const [sections, setSections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        const token = await AsyncStorage.getItem('moodle_user_token');
        if (token) {
          const contents = await getCourseContents(token, courseId);
          setSections(Array.isArray(contents) ? contents : []);
        }
      } catch (e) {
        console.error(e);
      } {
        setIsLoading(false);
      }
    };
    fetchSyllabus();
  }, [courseId]);

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.headerLogoText} numberOfLines={1}>{courseName.toUpperCase()}</Text>
          <Text style={styles.userWelcomeText}>Workspace ID: #{courseId}</Text>
        </View>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Close</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={BRAND.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: section }) => {
            // Filter out sections completely empty of educational elements
            if (!section.modules || section.modules.length === 0) return null;
            
            return (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionHeaderTitle}>{section.name}</Text>
                
                {section.modules.map((module: any) => (
                  <TouchableOpacity 
                    key={module.id} 
                    style={styles.moduleItemRow}
                    onPress={() => navigation.navigate('ActivityView', { url: module.url, title: module.name })}
                  >
                    <View style={styles.iconPlaceholder}>
                      <Text style={styles.iconChar}>{module.modname?.charAt(0).toUpperCase() || 'M'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.moduleName} numberOfLines={1}>{module.name}</Text>
                      <Text style={styles.moduleType}>{module.modpurpose || module.modname}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background, paddingHorizontal: 16, paddingTop: 60 },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottomWidth: 1, borderColor: BRAND.border, marginBottom: 20 },
  headerLogoText: { fontSize: 16, fontWeight: '900', color: BRAND.primary, letterSpacing: 0.5 },
  userWelcomeText: { fontSize: 12, color: BRAND.textMuted, fontWeight: '600', marginTop: 2 },
  backButton: { backgroundColor: BRAND.border, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  backButtonText: { color: BRAND.primary, fontWeight: '700', fontSize: 12 },
  sectionBlock: { marginBottom: 24 },
  sectionHeaderTitle: { fontSize: 14, fontWeight: '800', color: BRAND.secondary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  moduleItemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: BRAND.surface, padding: 12, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: BRAND.border },
  iconPlaceholder: { width: 32, height: 32, borderRadius: 6, backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  iconChar: { fontSize: 12, fontWeight: '800', color: BRAND.secondary },
  moduleName: { fontSize: 14, fontWeight: '600', color: BRAND.text },
  moduleType: { fontSize: 11, color: BRAND.textMuted, textTransform: 'capitalize', marginTop: 2 }
});