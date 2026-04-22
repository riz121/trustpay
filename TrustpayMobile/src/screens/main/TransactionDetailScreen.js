import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Modal,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStripe } from '@stripe/stripe-react-native';
import { useAuth } from '../../context/AuthContext';
import { transactionApi, disputeApi, paymentApi } from '../../api/apiClient';
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
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [disputeModalVisible, setDisputeModalVisible] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeFile, setDisputeFile] = useState(null);
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const { data: myDisputes = [] } = useQuery({
    queryKey: ['my-disputes'],
    queryFn: disputeApi.getMyDisputes,
    enabled: !!transactionId,
  });

  // Find the dispute linked to this transaction (if any)
  const myDispute = myDisputes.find(d => d.transaction_id === String(transactionId));

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


  const handlePayNow = async () => {
    if (!transaction) return;
    setPaymentProcessing(true);
    try {
      const { clientSecret, paymentIntentId } = await paymentApi.createPaymentIntent(
        transaction.amount,
        transactionId
      );
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'TrustDepo',
        style: 'alwaysDark',
      });
      if (initError) { Alert.alert('Payment Error', initError.message); return; }

      const { error: paymentError } = await presentPaymentSheet();
      if (paymentError) {
        if (paymentError.code !== 'Canceled') Alert.alert('Payment Failed', paymentError.message);
        return;
      }

      await paymentApi.fundTransaction(transactionId, paymentIntentId);
      invalidate();
      Alert.alert('Funds Held!', 'Payment authorised. Funds are held in escrow until you release.');
    } catch (err) {
      Alert.alert('Error', err.message || 'Payment processing failed');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleConfirm = () => {
    Alert.alert(
      'Confirm & Release',
      'This will release funds to the receiver. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm & Release', onPress: () => confirmMutation.mutate() },
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

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        if (asset.size > 10 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Maximum file size is 10 MB.');
          return;
        }
        setDisputeFile({ uri: asset.uri, name: asset.name, mimeType: asset.mimeType, size: asset.size });
      }
    } catch {
      Alert.alert('Error', 'Could not pick file. Please try again.');
    }
  };

  const handleDispute = async () => {
    if (disputeReason.trim().length < 10) {
      Alert.alert('Reason Too Short', 'Please describe the issue in at least 10 characters.');
      return;
    }

    setIsSubmittingDispute(true);
    try {
      let fileUrl = null;
      if (disputeFile) {
        const uploadResult = await transactionApi.uploadDisputeFile(
          disputeFile.uri, disputeFile.name, disputeFile.mimeType
        );
        fileUrl = uploadResult?.url || null;
      }

      await transactionApi.disputeEscrow(transactionId, disputeReason, fileUrl);

      invalidate();
      setDisputeReason('');
      setDisputeFile(null);
      setIsSubmittingDispute(false);
      Alert.alert(
        'Dispute Filed',
        'Your dispute has been submitted for review. Our team will respond within 24 hours.',
        [{ text: 'OK', onPress: () => setDisputeModalVisible(false) }]
      );
    } catch (e) {
      setIsSubmittingDispute(false);
      Alert.alert('Error', e.message || 'Failed to submit dispute. Please try again.');
    }
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
  const canPayNow = transaction.status === 'pending_deposit' && isSender;
  const canConfirm = isActive && transaction.status !== 'pending_deposit' && ((isSender && !isSenderConfirmed) || (isReceiver && !isReceiverConfirmed));
  const canCancel = isActive && !['disputed', 'released', 'cancelled'].includes(transaction.status);
  const canDispute = isActive && !['disputed', 'released', 'cancelled'].includes(transaction.status) && transaction.status !== 'pending_deposit';

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
          <Text style={styles.amountValue}>£{formatAmount(transaction.amount)}</Text>
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
            <View style={[styles.partyIcon, { backgroundColor: 'rgba(52,211,153,0.15)' }]}>
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

        {/* Dispute Status Card — shown when transaction is disputed */}
        {myDispute && (
          <GlassCard style={styles.section}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Feather name="alert-triangle" size={16} color={colors.yellow} />
              <Text style={styles.sectionTitle}>Dispute Status</Text>
            </View>
            <DetailRow label="Ticket Number" value={myDispute.ticket_number || '—'} />
            <DetailRow label="Filed On" value={formatDate(myDispute.created_date)} />
            <DetailRow label="Reason" value={myDispute.reason || '—'} multiline />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 4 }}>Status</Text>
              <View style={[styles.disputeStatusBadge, disputeStatusStyle(myDispute.status).badge]}>
                <Text style={[styles.disputeStatusText, disputeStatusStyle(myDispute.status).text]}>
                  {disputeStatusLabel(myDispute.status)}
                </Text>
              </View>
            </View>
            {myDispute.resolution_notes ? (
              <DetailRow label="Resolution" value={myDispute.resolution_notes} multiline />
            ) : null}
          </GlassCard>
        )}

        {/* Fee breakdown — shown after release */}
        {transaction.status === 'released' && transaction.platform_fee > 0 && (
          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>Fee Breakdown</Text>
            <DetailRow label="Transaction Amount" value={`£${formatAmount(transaction.amount)}`} />
            <DetailRow label="Platform Fee (2%)" value={`− £${formatAmount(transaction.platform_fee)}`} />
            <View style={styles.feeDivider} />
            <DetailRow label="Seller Receives" value={`£${formatAmount(transaction.seller_amount)}`} />
          </GlassCard>
        )}

        {/* Actions */}
        {(canPayNow || canConfirm || canCancel || canDispute) && (
          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>

            {canPayNow && (
              <TouchableOpacity
                onPress={handlePayNow}
                activeOpacity={0.8}
                disabled={paymentProcessing}
                style={{ marginBottom: 10 }}
              >
                <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.actionBtn}>
                  {paymentProcessing ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Feather name="credit-card" size={18} color="#fff" />
                      <Text style={styles.actionBtnText}>Pay Now — £{formatAmount(transaction.amount)}</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}

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
        onRequestClose={() => !isSubmittingDispute && setDisputeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>File a Dispute</Text>
              <TouchableOpacity
                onPress={() => !isSubmittingDispute && setDisputeModalVisible(false)}
                disabled={isSubmittingDispute}
              >
                <Feather name="x" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Please describe the reason for your dispute. Our team will review it within 24 hours.
            </Text>
            <TextInput
              style={styles.disputeInput}
              placeholder="Describe the issue (min. 10 characters)..."
              placeholderTextColor={colors.textMuted}
              value={disputeReason}
              onChangeText={setDisputeReason}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            {/* File attachment */}
            <TouchableOpacity onPress={handlePickFile} activeOpacity={0.8} style={styles.attachBtn}>
              <Feather name="paperclip" size={16} color={colors.textSecondary} />
              <Text style={styles.attachBtnText}>
                {disputeFile ? disputeFile.name : 'Attach PDF (optional)'}
              </Text>
              {disputeFile && (
                <TouchableOpacity onPress={() => setDisputeFile(null)} style={{ marginLeft: 'auto' }}>
                  <Feather name="x" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
            {disputeFile && (
              <Text style={styles.attachHint}>
                {(disputeFile.size / 1024).toFixed(0)} KB · tap × to remove
              </Text>
            )}

            <TouchableOpacity
              onPress={handleDispute}
              disabled={isSubmittingDispute}
              activeOpacity={0.8}
              style={{ marginTop: 4 }}
            >
              <LinearGradient colors={['#d97706', '#fbbf24']} style={styles.disputeSubmitBtn}>
                {isSubmittingDispute ? (
                  <>
                    <ActivityIndicator color="#000" size="small" />
                    <Text style={styles.disputeSubmitText}>Submitting…</Text>
                  </>
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

function disputeStatusLabel(status) {
  switch (status) {
    case 'open':             return 'Open — Awaiting Review';
    case 'under_review':     return 'Under Review';
    case 'resolved_release': return 'Resolved — Funds Released';
    case 'resolved_refund':  return 'Resolved — Refund Issued';
    case 'rejected':         return 'Rejected';
    default:                 return status || 'Unknown';
  }
}

function disputeStatusStyle(status) {
  switch (status) {
    case 'open':
      return { badge: { backgroundColor: 'rgba(251,191,36,0.15)' }, text: { color: '#fbbf24' } };
    case 'under_review':
      return { badge: { backgroundColor: 'rgba(59,130,246,0.15)' }, text: { color: '#60a5fa' } };
    case 'resolved_release':
    case 'resolved_refund':
      return { badge: { backgroundColor: 'rgba(16,185,129,0.15)' }, text: { color: '#10b981' } };
    case 'rejected':
      return { badge: { backgroundColor: 'rgba(239,68,68,0.15)' }, text: { color: '#ef4444' } };
    default:
      return { badge: { backgroundColor: 'rgba(100,116,139,0.15)' }, text: { color: '#94a3b8' } };
  }
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
  partyIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(16,185,129,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  partyInfo: { flex: 1 },
  partyLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  partyRole: { color: colors.textMuted, fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  partyName: { color: colors.text, fontSize: 16, fontWeight: '600' },
  partyEmail: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  youBadge: { backgroundColor: 'rgba(16,185,129,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  youText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  confirmedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(52,211,153,0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  confirmedText: { color: colors.emerald, fontSize: 11, fontWeight: '600' },
  partySeparator: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  partySeparatorLine: { flex: 1, height: 1, backgroundColor: colors.border },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, padding: 14 },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  actionBtnOutline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, padding: 14, borderWidth: 1.5 },
  actionBtnOutlineText: { fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-start', padding: 0 },
  modalContent: { backgroundColor: '#1a1a2e', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, padding: 24, paddingTop: 56, borderBottomWidth: 1, borderColor: colors.border },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { color: colors.text, fontSize: 20, fontWeight: '700' },
  modalSubtitle: { color: colors.textMuted, fontSize: 14, marginBottom: 16, lineHeight: 22 },
  disputeInput: { backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 12, padding: 14, color: colors.text, fontSize: 15, height: 120, marginBottom: 12 },
  attachBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 6 },
  attachBtnText: { flex: 1, color: colors.textSecondary, fontSize: 14 },
  attachHint: { color: colors.textMuted, fontSize: 12, marginBottom: 12, marginLeft: 4 },
  disputeSubmitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, padding: 16 },
  disputeSubmitText: { color: '#000', fontSize: 16, fontWeight: '700' },
  disputeStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  disputeStatusText: { fontSize: 12, fontWeight: '700' },
  feeDivider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
});
