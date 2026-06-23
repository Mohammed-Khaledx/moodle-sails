import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';

export default function ActivityViewScreen({ route, navigation }: any) {
  const { url, title } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Text style={styles.closeText}>✕ Exit Task</Text>
        </TouchableOpacity>
      </View>
      
      <WebView 
        source={{ uri: url }} 
        style={{ flex: 1 }} 
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', paddingTop: 50 },
  headerBar: { height: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', px: 16, borderBottomWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 16 },
  title: { fontSize: 14, fontWeight: '700', color: '#1E293B', flex: 1, marginRight: 10 },
  closeButton: { backgroundColor: '#EF4444', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  closeText: { color: '#FFF', fontWeight: '700', fontSize: 11 }
});