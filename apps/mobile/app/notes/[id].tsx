import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { apiClient } from '../../src/lib/api-client';
import { ApiError } from '../../src/lib/api-client';
import type { NoteDetailResponse, StructuredContent } from '@interview/dto';

type SectionKey = keyof StructuredContent;

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: 'definition', label: 'Definition' },
  { key: 'whyItExists', label: 'Why It Exists' },
  { key: 'coreConcepts', label: 'Core Concepts' },
  { key: 'internalMechanics', label: 'Internal Mechanics' },
  { key: 'codeExample', label: 'Code Example' },
  { key: 'performanceConsiderations', label: 'Performance' },
  { key: 'tradeoffs', label: 'Trade-offs' },
  { key: 'commonInterviewQuestions', label: 'Interview Questions' },
  { key: 'realWorldExample', label: 'Real-World Example' },
  { key: 'commonMistakes', label: 'Common Mistakes' },
];

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [note, setNote] = useState<NoteDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const fetchNote = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    try {
      const data = await apiClient.getNote(id!) as NoteDetailResponse;
      setNote(data);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to load note';
      Alert.alert('Error', msg);
      router.back();
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchNote();
    }, [fetchNote])
  );

  const handleExpand = async () => {
    setIsExpanding(true);
    try {
      const data = await apiClient.generateDeepDive(id!) as { expansion: NoteDetailResponse['expansion'] };
      setNote((prev) => prev ? { ...prev, expansion: data.expansion, hasExpansion: true } : prev);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to generate expansion';
      Alert.alert('Error', msg);
    } finally {
      setIsExpanding(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setIsGeneratingQuiz(true);
    try {
      const data = await apiClient.generateQuiz(id!) as { id: string };
      setNote((prev) => prev ? { ...prev, hasQuiz: true } : prev);
      router.push(`/quiz/${data.id}`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to generate quiz';
      Alert.alert('Error', msg);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const renderContent = (content: string | string[]) => {
    if (Array.isArray(content)) {
      return (
        <View style={styles.bulletList}>
          {content.map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      );
    }
    return <Text style={styles.sectionText}>{content}</Text>;
  };

  const renderSection = (key: SectionKey, label: string, content?: string | string[]) => {
    if (!content || (Array.isArray(content) && content.length === 0)) return null;
    return (
      <View key={key} style={styles.section}>
        <Text style={styles.sectionLabel}>{label}</Text>
        {renderContent(content)}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!note) return null;

  const sc = note.expansion?.structuredContent;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#1a1a2e' },
          headerTintColor: '#fff',
          headerTitle: '',
          headerBackTitle: 'Notes',
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => { setIsRefreshing(true); fetchNote(false); }}
            tintColor="#6366f1"
          />
        }
      >
        <Text style={styles.topic}>{note.topic}</Text>
        <Text style={styles.date}>
          {new Date(note.createdAt).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric',
          })}
        </Text>

        <View style={styles.rawNoteCard}>
          <Text style={styles.rawNoteLabel}>Original Notes</Text>
          <Text style={styles.rawNoteText}>{note.rawNote}</Text>
        </View>

        {!note.hasExpansion ? (
          <TouchableOpacity
            style={[styles.actionButton, isExpanding && styles.actionButtonDisabled]}
            onPress={handleExpand}
            disabled={isExpanding}
          >
            {isExpanding ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>Expand with AI</Text>
            )}
          </TouchableOpacity>
        ) : (
          <>
            <View style={styles.aiHeader}>
              <Text style={styles.aiTitle}>AI Deep Dive</Text>
              <View style={styles.badgeExpand}>
                <Text style={styles.badgeText}>Generated</Text>
              </View>
            </View>
            {sc && SECTIONS.map(({ key, label }) =>
              renderSection(key, label, sc[key] as string | string[])
            )}
          </>
        )}

        <TouchableOpacity
          style={[styles.quizButton, isGeneratingQuiz && styles.quizButtonDisabled]}
          onPress={handleGenerateQuiz}
          disabled={isGeneratingQuiz}
        >
          {isGeneratingQuiz ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.quizButtonText}>
              {note.hasQuiz ? 'Retake Quiz' : 'Generate Quiz'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  centered: { flex: 1, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center' },
  topic: { fontSize: 26, fontWeight: '700', color: '#fff', marginTop: 20, marginBottom: 6 },
  date: { fontSize: 13, color: '#666', marginBottom: 20 },
  rawNoteCard: {
    backgroundColor: '#252540',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  rawNoteLabel: { fontSize: 12, color: '#888', fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  rawNoteText: { fontSize: 15, color: '#ccc', lineHeight: 22 },
  actionButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  actionButtonDisabled: { opacity: 0.6 },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  aiTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  badgeExpand: { backgroundColor: '#6366f1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 14, color: '#6366f1', fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionText: { fontSize: 15, color: '#ccc', lineHeight: 22 },
  bulletList: { gap: 6 },
  bulletRow: { flexDirection: 'row', gap: 8 },
  bullet: { color: '#6366f1', fontSize: 15, lineHeight: 22 },
  bulletText: { flex: 1, fontSize: 15, color: '#ccc', lineHeight: 22 },
  quizButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  quizButtonDisabled: { opacity: 0.6 },
  quizButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
