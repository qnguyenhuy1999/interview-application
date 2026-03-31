import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { apiClient } from '../../src/lib/api-client';
import { ApiError } from '../../src/lib/api-client';
import type { ReviewQueueResponse, KnowledgeGapResponse } from '@interview/dto';

const weaknessColor = (level: number) => {
  if (level <= 1) return '#10b981';
  if (level <= 3) return '#f59e0b';
  return '#ef4444';
};

const weaknessLabel = (level: number) => {
  if (level <= 1) return 'Familiar';
  if (level <= 3) return 'Learning';
  return 'Weak';
};

export default function ReviewScreen() {
  const router = useRouter();
  const [items, setItems] = useState<KnowledgeGapResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchQueue = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    try {
      const data = await apiClient.getReviewQueue() as ReviewQueueResponse;
      setItems(data.items);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to load review queue';
      Alert.alert('Error', msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchQueue();
    }, [fetchQueue])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchQueue(false);
  };

  const renderItem = ({ item }: { item: KnowledgeGapResponse }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/notes/${item.noteId}`)}
    >
      <View style={styles.cardLeft}>
        <Text style={styles.topic} numberOfLines={1}>{item.topic}</Text>
        <View style={styles.meta}>
          <View style={[styles.weakBadge, { backgroundColor: weaknessColor(item.weaknessLevel) }]}>
            <Text style={styles.weakText}>{weaknessLabel(item.weaknessLevel)}</Text>
          </View>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>🎉</Text>
      <Text style={styles.emptyTitle}>All caught up!</Text>
      <Text style={styles.emptySubtitle}>
        No topics due for review.{'\n'}Complete quizzes to add items here.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Review</Text>
        {items.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{items.length} due</Text>
          </View>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={items.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={isLoading ? null : renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#6366f1"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: { fontSize: 28, fontWeight: '700', color: '#fff' },
  countBadge: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  emptyContainer: { flex: 1 },
  card: {
    backgroundColor: '#252540',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLeft: { flex: 1 },
  topic: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  weakBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  weakText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  statusText: { color: '#666', fontSize: 12 },
  chevron: { color: '#555', fontSize: 24, fontWeight: '300' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '600', color: '#fff', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22 },
});
