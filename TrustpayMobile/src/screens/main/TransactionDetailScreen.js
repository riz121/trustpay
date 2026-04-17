import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { transactionApi } from '../../api/apiClient';
import StatusBadge from '../../components/StatusBadge';
import GlassCard from '../../components/GlassCard';
import { colors } from '../../theme/colors';

function formatAmount(amount) {
  return Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return dateStr; }
}

export default function TransactionDetailScreen({ navigation, route }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { transactionId, transaction: initialData } = route.params || {};
  const [disputeModalVisible, setDisputeModalVisible] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  const { data: txData, isLoading } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => transactionApi.getById(transactionId),
    initialData: initialData ? initialData : undefined,
    // Keep previous data during refetch to prevent blank screen
    placeholderData: (prev) => prev,
    enabled: !!transactionId,
  });

  const transaction = Array.isArray(txData) ? txData[0] : txData;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['transaction', transactionId] });
  };

  const confirmMutation = useMutation({
    mutationFn: () => transactionApi.confirmEscrow(transactionId),
    onSuccess: () => {
      invalidate();
      Alert.alert('Success', 'Transaction confirmed successfully!');
    },
    onError: (e) => Alert.alert('Error', e.message || 'Failed to confirm transaction'),
  });

  const cancelMutation = useMutation({
    mutationFn: () => transactionApi.cancelEscrow(transactionId),
    onSuccess: () => {
      invalidate();
      Alert.alert('Success', 'Transaction cancelled.');
      navigation.goBack();
    },
    onError: (e) => Alert.alert('Error', e.message || 'Failed to cancel transaction'),
  });

  const disputeMutation = useMutation({
    mutationFn: () => transactionApi.disputeEscrow(transactionId, disputeReason),
    onSuccess: () => {
      invalidate();
      setDisputeModalVisible(false);
      Alert.alert('Dispute Filed', 'Your dispute has been submitted for review.');
    },
    onError: (e) => Alert.alert('Error', e.message || 'Failed to file dispute'),
  });

  const handleConfirm = () => {
    Alert.alert(
      'Confirm Transaction',
      'Are you sure you want to confirm and release funds?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => confirmMutation.mutate() },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Transaction',
      'Are you sure you want to cancel this transaction?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: () => cancelMutation.mutate() },
      ]
    );
  };

  const handleDispute = () => {
    if (!disputeReason.trim()) {
      Alert.alert('Reason Required', 'Please provide a reason for the dispute.');
      return;
    }
    disputeMutation.mutate();
  };

  if (isLoading && !transaction) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Transaction not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isSender = transaction.sender_email === user?.email;
  const isReceiver = transaction.receiver_email === user?.email;
  const isActive = ['pending_deposit', 'funded', 'sender_confirmed', 'receiver_confirmed'].includes(transaction.status);
  const isSenderConfirmed = transaction.status === 'sender_confirmed' || transaction.status === 'receiver_confirmed' || transaction.status === 'released';
  const isReceiverConfirmed = transaction.status === 'receiver_confirmed' || transaction.status === 'released';
  const canConfirm = isActive && ((isSender && !isSenderConfirmed) || (isReceiver && !isReceiverConfirmed));
  const canCancel = isActive && !['disputed', 'released', 'cancelled'].includes(transaction.status);
  const canDispute = isActive && !['disputed', 'released', 'cancelled'].includes(transaction.status);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#0f0f1a' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction Detail</Text>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Amount Card */}
        <LinearGradient colors={['#1a1a2e', '#0f0f1a']} style={styles.amountCard}>
          <Text style={styles.amountLabel}>Transaction Amount</Text>
          <Text style={styles.amountValue}>AED {formatAmount(transaction.amount)}</Text>
          <View style={styles.statusRow}>
            <StatusBadge status={transaction.status} size="lg" />
          </View>
          {transaction.title && <Text style={styles.txTitle}>{transaction.title}</Text>}
        </LinearGradient>

        {/* Parties */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Parties</Text>
          <View style={styles.partyRow}>
            <View style={styles.partyIcon}>
              <Feather name="user" size={18} color={colors.primary} />
            </View>
            <View style={styles.partyInfo}>
              <View style={styles.partyLabelRow}>
                <Text style={styles.partyRole}>Sender</Text>
                {isSenderConfirmed && (
                  <View style={styles.confirmedBadge}>
                    <Feather name="check" size={12} color={colors.emerald} />
                    <Text style={styles.confirmedText}>Confirmed</Text>
                  </View>
                )}
              </View>
              <Text style={styles.partyName}>{transaction.sender_name || transaction.sender_email || 'Unknown'}</Text>
              {transaction.sender_email && transaction.sender_name && (
                <Text style={styles.partyEmail}>{transaction.sender_email}</Text>
              )}
            </View>
            {isSender && <View style={styles.youBadge}><Text style={styles.youText}>You</Text></View>}
          </View>

          <View style={styles.partySeparator}>
            <View style={styles.partySeparatorLine} />
            <Feather name="arrow-down" size={16} color={colors.textMuted} />
            <View style={styles.partySeparatorLine} />
          </View>

          <View style={styles.partyRow}>
            <View style={[styles.partyIcon, { backgroundColor: 'rgba(167,139,250,0.15)' }]}>
              <Feather name="user" size={18} color={colors.accent} />
            </View>
            <View style={styles.partyInfo}>
              <View style={styles.partyLabelRow}>
                <Text style={styles.partyRole}>Receiver</Text>
                {isReceiverConfirmed && (
                  <View style={styles.confirmedBadge}>
                    <Feather name="check" size={12} color={colors.emerald} />
                    <Text style={styles.confirmedText}>Confirmed</Text>
                  </View>
                )}
              </View>
              <Text style={styles.partyName}>{transaction.receiver_name || transaction.receiver_email || 'Unknown'}</Text>
              {transaction.receiver_email && transaction.receiver_name && (
                <Text style={styles.partyEmail}>{transaction.receiver_email}</Text>
              )}
            </View>
            {isReceiver && <View style={styles.youBadge}><Text style={styles.youText}>You</Text></View>}
          </View>
        </GlassCard>

        {/* Details */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <DetailRow label="Transaction ID" value={String(transaction.id || transaction._id || 'N/A')} />
          <DetailRow label="Created" value={formatDate(transaction.created_at)} />
          {transaction.release_date && (
            <DetailRow label="Release Date" value={formatDate(transaction.release_date)} />
          )}
          {transaction.notes && (
            <DetailRow label="Notes" value={transaction.notes} multiline />
          )}
        </GlassCard>

        {/* Actions */}
        {(canConfirm || canCancel || canDispute) && (
          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>

            {canConfirm && (
              <TouchableOpacity
                onPress={handleConfirm}
                activeOpacity={0.8}
                disabled={confirmMutation.isPending}
                style={{ marginBottom: 10 }}
              >
                <LinearGradient colors={['#059669', '#34d399']} style={styles.actionBtn}>
                  {confirmMutation.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Feather name="check-circle" size={18} color="#fff" />
                      <Text style={styles.actionBtnText}>Confirm & Release</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}

            {canDispute && (
              <TouchableOpacity
                onPress={() => setDisputeModalVisible(true)}
                activeOpacity={0.8}
                style={[styles.actionBtnOutline, { borderColor: colors.yellow, marginBottom: 10 }]}
              >
                <Feather name="alert-triangle" size={18} color={colors.yellow} />
                <Text style={[styles.actionBtnOutlineText, { color: colors.yellow }]}>File Dispute</Text>
              </TouchableOpacity>
            )}

            {canCancel && (
              <TouchableOpacity
                onPress={handleCancel}
                activeOpacity={0.8}
                disabled={cancelMutation.isPending}
                style={[styles.actionBtnOutline, { borderColor: colors.destructive }]}
              >
                {cancelMutation.isPending ? (
                  <ActivityIndicator color={colors.destructive} />
                ) : (
                  <>
                    <Feather name="x-circle" size={18} color={colors.destructive} />
                    <Text style={[styles.actionBtnOutlineText, { color: colors.destructive }]}>Cancel Transaction</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </GlassCard>
        )}
      </ScrollView>

      {/* Dispute Modal */}
      <Modal
        visible={disputeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDisputeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>File a Dispute</Text>
              <TouchableOpacity onPress={() => setDisputeModalVisible(false)}>
                <Feather name="x" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Please describe the reason for your dispute. Our team will review it within 24 hours.
            </Text>
            <TextInput
              style={styles.disputeInput}
              placeholder="Describe the issue..."
              placeholderTextColor={colors.textMuted}
              value={disputeReason}
              onChangeText={setDisputeReason}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <TouchableOpacity
              onPress={handleDispute}
              disabled={disputeMutation.isPending}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['#d97706', '#fbbf24']} style={styles.disputeSubmitBtn}>
                {disputeMutation.isPending ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <Feather name="alert-triangle" size={18} color="#000" />
                    <Text style={styles.disputeSubmitText}>Submit Dispute</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DetailRow({ label, value, multiline }) {
  return (
    <View style={detailStyles.row}>
      <Text style={detailStyles.label}>{label}</Text>
      <Text style={[detailStyles.value, multiline && detailStyles.multiline]}>{value}</Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: { marginBottom: 14 },
  label: { color: colors.textMuted, fontSize: 13, marginBottom: 4 },
  value: { color: colors.text, fontSize: 15, fontWeight: '500' },
  multiline: { lineHeight: 22 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorText: { color: colors.textMuted, fontSize: 16 },
  backLink: { padding: 12 },
  backLinkText: { color: colors.primary, fontSize: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { padding: 4 },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: '600' },
  scroll: { padding: 16, paddingBottom: 40 },
  amountCard: { borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  amountLabel: { color: colors.textMuted, fontSize: 14, marginBottom: 8 },
  amountValue: { color: colors.text, fontSize: 38, fontWeight: '800', marginBottom: 14 },
  statusRow: { marginBottom: 10 },
  txTitle: { color: colors.textSecondary, fontSize: 15, textAlign: 'center', marginTop: 8 },
  section: { marginBottom: 16 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 16 },
  partyRow: { flexDirection: 'row', alignItems: 'center' },
  partyIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(99,102,241,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  partyInfo: { flex: 1 },
  partyLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  partyRole: { color: colors.textMuted, fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  partyName: { color: colors.text, fontSize: 16, fontWeight: '600' },
  partyEmail: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  youBadge: { backgroundColor: 'rgba(99,102,241,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  youText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  confirmedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(52,211,153,0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  confirmedText: { color: colors.emerald, fontSize: 11, fontWeight: '600' },
  partySeparator: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  partySeparatorLine: { flex: 1, height: 1, backgroundColor: colors.border },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, padding: 14 },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  actionBtnOutline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, padding: 14, borderWidth: 1.5 },
  actionBtnOutlineText: { fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1a1a2e', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderTopWidth: 1, borderColor: colors.border },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { color: colors.text, fontSize: 20, fontWeight: '700' },
  modalSubtitle: { color: colors.textMuted, fontSize: 14, marginBottom: 16, lineHeight: 22 },
  disputeInput: { backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 12, padding: 14, color: colors.text, fontSize: 15, height: 120, marginBottom: 16 },
  disputeSubmitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, padding: 16 },
  disputeSubmitText: { color: '#000', fontSize: 16, fontWeight: '700' },
});
