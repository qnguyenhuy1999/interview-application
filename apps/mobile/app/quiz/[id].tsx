import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { apiClient } from '../../src/lib/api-client';
import { ApiError } from '../../src/lib/api-client';
import type { QuizResponse, QuizQuestion, QuizGradeResponse, QuestionResult } from '@interview/dto';

type AnswerMap = Record<number, string>;

const difficultyColor: Record<string, string> = {
  easy: '#10b981',
  medium: '#f59e0b',
  hard: '#ef4444',
};

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [results, setResults] = useState<QuizGradeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<AnswerMap>({});

  const fetchQuiz = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getQuiz(id!) as QuizResponse;
      setQuiz(data);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to load quiz';
      Alert.alert('Error', msg);
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuiz();
  }, []);

  const handleSelectOption = (questionIndex: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: option }));
  };

  const handleTextAnswer = (questionIndex: number, text: string) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: text }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    const unanswered = quiz.questions.filter((_, i) => !answers[i]?.trim());
    if (unanswered.length > 0) {
      Alert.alert('Incomplete', 'Please answer all questions before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = quiz.questions.map((_, i) => ({
        questionIndex: i,
        answer: answers[i],
      }));
      const data = await apiClient.submitQuiz(id!, payload) as QuizGradeResponse;
      setResults(data);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to submit quiz';
      Alert.alert('Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const allAnswered = quiz?.questions.every((_, i) => answers[i]?.trim()) ?? false;
  const totalScore = results?.overallScore ?? 0;
  const maxScore = (quiz?.questions.length ?? 0) * 10;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading quiz...</Text>
      </View>
    );
  }

  if (!quiz) return null;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#1a1a2e' },
          headerTintColor: '#fff',
          headerTitle: 'Quiz',
          headerBackTitle: 'Back',
        }}
      />
      <View style={styles.container}>
        {results ? (
          <ScrollView contentContainerStyle={styles.resultsContainer}>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Overall Score</Text>
              <Text style={styles.scoreValue}>{totalScore}</Text>
              <Text style={styles.scoreMax}>/ {maxScore}</Text>
              <Text style={styles.scorePercent}>
                {maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0}%
              </Text>
            </View>

            {results.results.map((result: QuestionResult) => {
              const q = quiz.questions[result.questionIndex];
              return (
                <View key={result.questionIndex} style={styles.resultCard}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultQNum}>Q{result.questionIndex + 1}</Text>
                    <View style={[
                      styles.resultScoreBadge,
                      { backgroundColor: result.score >= 7 ? '#10b981' : result.score >= 4 ? '#f59e0b' : '#ef4444' },
                    ]}>
                      <Text style={styles.resultScoreText}>{result.score}/10</Text>
                    </View>
                  </View>
                  <Text style={styles.resultQuestion}>{q.question}</Text>
                  {result.missingConcepts.length > 0 && (
                    <View style={styles.gapSection}>
                      <Text style={styles.gapTitle}>Missing Concepts</Text>
                      {result.missingConcepts.map((concept, i) => (
                        <View key={i} style={styles.bulletRow}>
                          <Text style={styles.bullet}>•</Text>
                          <Text style={styles.bulletText}>{concept}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  <View style={styles.feedbackSection}>
                    <Text style={styles.gapTitle}>Feedback</Text>
                    <Text style={styles.feedbackText}>{result.feedback}</Text>
                  </View>
                </View>
              );
            })}

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => router.back()}
            >
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.questionsContainer}>
            <Text style={styles.headerCount}>
              {quiz.questions.length} questions
            </Text>

            {quiz.questions.map((q: QuizQuestion, index: number) => (
              <View key={index} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <Text style={styles.questionNum}>Q{index + 1}</Text>
                  <View style={[styles.diffBadge, { backgroundColor: difficultyColor[q.difficulty] }]}>
                    <Text style={styles.diffText}>{q.difficulty}</Text>
                  </View>
                </View>
                <Text style={styles.questionText}>{q.question}</Text>

                {q.type === 'multiple_choice' && q.options ? (
                  <View style={styles.options}>
                    {q.options.map((option, optIdx) => {
                      const selected = answers[index] === option;
                      return (
                        <TouchableOpacity
                          key={optIdx}
                          style={[styles.option, selected && styles.optionSelected]}
                          onPress={() => handleSelectOption(index, option)}
                        >
                          <View style={[styles.radio, selected && styles.radioSelected]}>
                            {selected && <View style={styles.radioDot} />}
                          </View>
                          <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                            {option}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <TextInput
                    style={styles.textAnswer}
                    placeholder="Type your answer..."
                    placeholderTextColor="#666"
                    multiline
                    textAlignVertical="top"
                    value={answers[index] ?? ''}
                    onChangeText={(text) => handleTextAnswer(index, text)}
                  />
                )}
              </View>
            ))}

            <TouchableOpacity
              style={[styles.submitButton, (!allAnswered || isSubmitting) && styles.submitDisabled]}
              onPress={handleSubmit}
              disabled={!allAnswered || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Submit Quiz</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  centered: { flex: 1, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#888', marginTop: 12, fontSize: 15 },
  questionsContainer: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 8 },
  resultsContainer: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 8 },
  headerCount: { fontSize: 14, color: '#888', marginBottom: 16 },
  questionCard: {
    backgroundColor: '#252540',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  questionNum: { fontSize: 14, fontWeight: '700', color: '#6366f1' },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  diffText: { color: '#fff', fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  questionText: { fontSize: 16, color: '#fff', fontWeight: '500', lineHeight: 24, marginBottom: 14 },
  options: { gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e38',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#333',
  },
  optionSelected: { borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)' },
  radio: {
    width: 20, height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#555',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: { borderColor: '#6366f1' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#6366f1' },
  optionText: { flex: 1, fontSize: 15, color: '#ccc' },
  optionTextSelected: { color: '#fff', fontWeight: '500' },
  textAnswer: {
    backgroundColor: '#1e1e38',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  scoreCard: { alignItems: 'center', marginBottom: 24, paddingVertical: 24 },
  scoreLabel: { fontSize: 14, color: '#888', marginBottom: 8 },
  scoreValue: { fontSize: 64, fontWeight: '700', color: '#fff' },
  scoreMax: { fontSize: 20, color: '#666', marginTop: -4 },
  scorePercent: { fontSize: 16, color: '#6366f1', fontWeight: '600', marginTop: 8 },
  resultCard: {
    backgroundColor: '#252540',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  resultQNum: { fontSize: 14, fontWeight: '700', color: '#6366f1' },
  resultScoreBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  resultScoreText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  resultQuestion: { fontSize: 15, color: '#fff', fontWeight: '500', marginBottom: 12 },
  gapSection: { marginTop: 8, marginBottom: 8 },
  gapTitle: { fontSize: 12, color: '#888', fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  bulletRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  bullet: { color: '#ef4444', fontSize: 14 },
  bulletText: { flex: 1, fontSize: 14, color: '#ccc' },
  feedbackSection: { marginTop: 8 },
  feedbackText: { fontSize: 14, color: '#aaa', lineHeight: 20 },
  doneButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  doneText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
