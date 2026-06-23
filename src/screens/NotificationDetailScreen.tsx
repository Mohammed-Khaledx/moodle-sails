import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const BRAND = { primary: '#0B4F70', secondary: '#3A86C8', background: '#F4F7FA', surface: '#FFFFFF', text: '#1E293B', textMuted: '#64748B', border: '#E2E8F0' };

export default function NotificationDetailScreen({ route, navigation }: any) {
  const { alertData } = route.params;

  // Dynamically extract ticket ID from the body text if present (e.g., "ticket #4")
  const ticketMatch = alertData.body?.match(/#(\d+)/);
  const ticketId = ticketMatch ? ticketMatch[1] : null;

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>ALERTS & DISPATCHES</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.backButtonText}>← Dashboard</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.alertTitle}>{alertData.title || 'System Broadcast'}</Text>
        <Text style={styles.alertTime}>Received Context ID: {alertData.messageid || 'N/A'}</Text>
        
        <View style={styles.divider} />

        <Text style={styles.alertBody}>{alertData.body || 'No message content context provided.'}</Text>

        {ticketId && (
          <View style={styles.ticketBadge}>
            <Text style={styles.ticketBadgeText}>Detected Action Layer: Ticket #{ticketId}</Text>
          </View>
        )}

        <View style={styles.metaContainer}>
          <Text style={styles.metaText}>Course Context: {alertData.courseid}</Text>
          <Text style={styles.metaText}>App ID: {alertData.app}</Text>
        </View>
      </View>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.background, paddingHorizontal: 16, paddingTop: 60 },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottomWidth: 1, borderColor: BRAND.border, marginBottom: 24 },
  headerTitle: { fontSize: 14, fontWeight: '900', color: BRAND.primary, letterSpacing: 1 },
  backButton: { backgroundColor: BRAND.border, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  backButtonText: { color: BRAND.primary, fontWeight: '700', fontSize: 12 },
  card: { backgroundColor: BRAND.surface, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: BRAND.border, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }, android: { elevation: 2 } }) },
  alertTitle: { fontSize: 18, fontWeight: '800', color: BRAND.text },
  alertTime: { fontSize: 11, color: BRAND.textMuted, marginTop: 4, fontWeight: '600' },
  divider: { height: 1, backgroundColor: BRAND.border, marginVertical: 16 },
  alertBody: { fontSize: 15, color: BRAND.text, lineHeight: 22, fontWeight: '500' },
  ticketBadge: { backgroundColor: '#E0F2FE', padding: 10, borderRadius: 8, marginTop: 16, borderWidth: 1, borderColor: '#BAE6FD' },
  ticketBadgeText: { color: BRAND.primary, fontWeight: '700', fontSize: 12, textAlign: 'center' },
  metaContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, paddingTop: 12, borderTopWidth: 1, borderTopColor: BRAND.border },
  metaText: { fontSize: 11, color: BRAND.textMuted, fontWeight: '600' }
});