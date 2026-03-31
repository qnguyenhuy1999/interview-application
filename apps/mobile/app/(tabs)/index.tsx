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
import type { NoteResponse } from '@interview/dto';

export default function NotesListScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNotes = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    try {
      const data = await apiClient.getNotes() as NoteResponse[];
      setNotes(data);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to load notes';
      Alert.alert('Error', msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotes();
    }, [fetchNotes])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchNotes(false);
  };

  const handleDelete = async (note: NoteResponse) => {
    Alert.alert(
      'Delete Note',
      `Delete "${note.topic}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.deleteNote(note.id);
              setNotes((prev) => prev.filter((n) => n.id !== note.id));
            } catch (err) {
              const msg = err instanceof ApiError ? err.message : 'Failed to delete';
              Alert.alert('Error', msg);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderNote = ({ item }: { item: NoteResponse }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/notes/${item.id}`)}
      onLongPress={() => handleDelete(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.topic} numberOfLines={1}>{item.topic}</Text>
        <View style={styles.badges}>
          {item.hasExpansion && (
            <View style={[styles.badge, styles.badgeExpand]}>
              <Text style={styles.badgeText}>AI</Text>
            </View>
          )}
          {item.hasQuiz && (
            <View style={[styles.badge, styles.badgeQuiz]}>
              <Text style={styles.badgeText}>Quiz</Text>
            </View>
          )}
        </View>
      </View>
      <Text style={styles.rawNote} numberOfLines={2}>{item.rawNote}</Text>
      <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>No notes yet</Text>
      <Text style={styles.emptySubtitle}>
        Create your first note to start studying
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Notes</Text>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={renderNote}
        contentContainerStyle={notes.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={isLoading ? null : renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#6366f1"
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/notes/new')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  title: { fontSize: 28, fontWeight: '700', color: '#fff' },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  emptyContainer: { flex: 1 },
  card: {
    backgroundColor: '#252540',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  topic: { fontSize: 17, fontWeight: '600', color: '#fff', flex: 1 },
  badges: { flexDirection: 'row', gap: 6 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  badgeExpand: { backgroundColor: '#6366f1' },
  badgeQuiz: { backgroundColor: '#10b981' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  rawNote: { fontSize: 14, color: '#aaa', marginBottom: 8 },
  date: { fontSize: 12, color: '#666' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#fff', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: '#666', textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '400', marginTop: -2 },
});
