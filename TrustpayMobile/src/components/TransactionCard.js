import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import StatusBadge from './StatusBadge';

function formatAmount(amount) {
  if (amount === null || amount === undefined) return '0.00';
  return Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function TransactionCard({ transaction, onPress, currentUserEmail }) {
  const isSender = transaction.sender_email === currentUserEmail;
  const counterparty = isSender
    ? (transaction.receiver_name || transaction.receiver_email || 'Unknown')
    : (transaction.sender_name || transaction.sender_email || 'Unknown');
  const sign = isSender ? '-' : '+';
  const amountColor = isSender ? colors.destructive : colors.emerald;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={styles.card}>
      <View style={styles.iconContainer}>
        <Feather name={isSender ? 'arrow-up-right' : 'arrow-down-left'} size={20} color={isSender ? colors.destructive : colors.emerald} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{transaction.title || 'Transaction'}</Text>
        <Text style={styles.counterparty} numberOfLines={1}>{counterparty}</Text>
        <Text style={styles.date}>{formatDate(transaction.created_at)}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {sign} £{formatAmount(transaction.amount)}
        </Text>
        <StatusBadge status={transaction.status} size="sm" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(26,26,46,0.8)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  counterparty: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 2,
  },
  date: {
    color: colors.textMuted,
    fontSize: 12,
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
});
