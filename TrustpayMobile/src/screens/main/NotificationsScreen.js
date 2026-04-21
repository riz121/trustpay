import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { transactionApi } from '../../api/apiClient';
import { colors } from '../../theme/colors';
import GlassCard from '../../components/GlassCard';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function txIcon(status) {
  if (status === 'released') return { icon: 'check-circle', color: '#10b981' };
  if (status === 'cancelled') return { icon: 'x-circle', color: '#ef4444' };
  if (status === 'disputed') return { icon: 'alert-triangle', color: '#f59e0b' };
  if (status === 'sender_ok') return { icon: 'clock', color: '#3b82f6' };
  return { icon: 'circle', color: colors.textMuted };
}

function txLabel(status) {
  if (status === 'released') return 'Transaction completed';
  if (status === 'cancelled') return 'Transaction cancelled';
  if (status === 'disputed') return 'Dispute raised';
  if (status === 'sender_ok') return 'Awaiting confirmation';
  if (status === 'pending') return 'Awaiting deposit';
  return 'Transaction updated';
}

export default function NotificationsScreen({ navigation }) {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionApi.getAll,
  });

  const items = [...transactions]
    .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
    .slice(0, 20);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#0f0f1a' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Loading...</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="bell-off" size={40} color={colors.textMuted} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        ) : (
          <GlassCard style={styles.card}>
            {items.map((tx, i) => {
              const { icon, color } = txIcon(tx.status);
              return (
                <View key={tx.id}>
                  <TouchableOpacity
                    style={styles.item}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('TransactionDetail', { transactionId: tx.id })}
                  >
                    <View style={[styles.iconBox, { backgroundColor: `${color}18` }]}>
                      <Feather name={icon} size={18} color={color} />
                    </View>
                    <View style={styles.itemBody}>
                      <Text style={styles.itemTitle}>{txLabel(tx.status)}</Text>
                      <Text style={styles.itemDesc} numberOfLines={1}>
                        {tx.title || tx.description || `Transaction #${String(tx.id).slice(0, 8)}`}
                      </Text>
                    </View>
                    <Text style={styles.itemTime}>{timeAgo(tx.updated_at || tx.created_at)}</Text>
                  </TouchableOpacity>
                  {i < items.length - 1 && <View style={styles.divider} />}
                </View>
              );
            })}
          </GlassCard>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: '600' },
  scroll: { padding: 16, paddingBottom: 40 },
  card: { padding: 0, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  itemBody: { flex: 1 },
  itemTitle: { color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 2 },
  itemDesc: { color: colors.textMuted, fontSize: 12 },
  itemTime: { color: colors.textMuted, fontSize: 11, flexShrink: 0 },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 68 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { color: colors.textMuted, fontSize: 15 },
});
