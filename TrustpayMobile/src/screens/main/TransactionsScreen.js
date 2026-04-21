import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { transactionApi } from '../../api/apiClient';
import TransactionCard from '../../components/TransactionCard';
import { colors } from '../../theme/colors';

const STATUS_FILTERS = ['all', 'pending_deposit', 'funded', 'released', 'disputed', 'cancelled'];

export default function TransactionsScreen({ navigation }) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: transactions, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionApi.getAll,
  });

  const filtered = useMemo(() => {
    if (!transactions) return [];
    let list = [...transactions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (statusFilter !== 'all') {
      list = list.filter((tx) => tx.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (tx) =>
          (tx.title || '').toLowerCase().includes(q) ||
          (tx.receiver_email || '').toLowerCase().includes(q) ||
          (tx.sender_email || '').toLowerCase().includes(q) ||
          (tx.receiver_name || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [transactions, statusFilter, search]);

  const filterLabel = (f) => {
    if (f === 'all') return 'All';
    return f.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          {navigation.canGoBack() ? (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Feather name="arrow-left" size={22} color={colors.text} />
            </TouchableOpacity>
          ) : <View style={{ width: 36 }} />}
          <Text style={styles.headerTitle}>Transactions</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('NewTransaction')}
            style={styles.addBtn}
          >
            <Feather name="plus" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <Feather name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.clearSearch}>
              <Feather name="x" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Status Filters */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_FILTERS}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filtersContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setStatusFilter(item)}
              style={[styles.filterChip, statusFilter === item && styles.filterChipActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, statusFilter === item && styles.filterChipTextActive]}>
                {filterLabel(item)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id || item._id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
          }
          renderItem={({ item }) => (
            <TransactionCard
              transaction={item}
              currentUserEmail={user?.email}
              onPress={() =>
                navigation.navigate('TransactionDetail', {
                  transactionId: item.id || item._id,
                  transaction: item,
                })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="inbox" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No transactions found</Text>
              <Text style={styles.emptySubtitle}>
                {search || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first transaction'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerSafe: { backgroundColor: '#0f0f1a', borderBottomWidth: 1, borderBottomColor: colors.border },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.text, fontSize: 24, fontWeight: '700' },
  addBtn: { padding: 4 },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBg, borderRadius: 12, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.inputBorder },
  searchIcon: { marginLeft: 14, marginRight: 8 },
  searchInput: { flex: 1, color: colors.text, fontSize: 15, padding: 12, paddingLeft: 0 },
  clearSearch: { padding: 12 },
  filtersContent: { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: 'rgba(16,185,129,0.2)', borderColor: colors.primary },
  filterChipText: { color: colors.textMuted, fontSize: 13, fontWeight: '500' },
  filterChipTextActive: { color: colors.primary },
  listContent: { padding: 16, paddingBottom: 32 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: colors.textMuted, fontSize: 15 },
  emptyState: { padding: 48, alignItems: 'center', gap: 10 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '600' },
  emptySubtitle: { color: colors.textMuted, fontSize: 14, textAlign: 'center' },
});
