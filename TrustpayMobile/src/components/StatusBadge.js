import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

const STATUS_CONFIG = {
  pending_deposit: { label: 'Pending Deposit', color: colors.yellow, bg: 'rgba(251,191,36,0.15)' },
  funded: { label: 'Funded', color: colors.primary, bg: 'rgba(16,185,129,0.15)' },
  sender_confirmed: { label: 'Sender Confirmed', color: colors.primaryLight, bg: 'rgba(129,140,248,0.15)' },
  receiver_confirmed: { label: 'Receiver Confirmed', color: colors.accent, bg: 'rgba(52,211,153,0.15)' },
  released: { label: 'Released', color: colors.emerald, bg: 'rgba(52,211,153,0.15)' },
  disputed: { label: 'Disputed', color: colors.destructive, bg: 'rgba(239,68,68,0.15)' },
  cancelled: { label: 'Cancelled', color: colors.textMuted, bg: 'rgba(100,116,139,0.15)' },
};

export default function StatusBadge({ status, size = 'md' }) {
  const config = STATUS_CONFIG[status] || { label: status || 'Unknown', color: colors.textMuted, bg: 'rgba(100,116,139,0.15)' };
  const fontSize = size === 'sm' ? 11 : size === 'lg' ? 14 : 12;
  const px = size === 'sm' ? 8 : size === 'lg' ? 14 : 10;
  const py = size === 'sm' ? 3 : size === 'lg' ? 6 : 4;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg, paddingHorizontal: px, paddingVertical: py }]}>
      <Text style={[styles.text, { color: config.color, fontSize }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
});
