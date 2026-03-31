import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '../../src/lib/api-client';
import { ApiError } from '../../src/lib/api-client';
import type { NoteResponse } from '@interview/dto';

const createSchema = z.object({
  topic: z.string().min(1, 'Topic is required').max(100, 'Topic too long'),
  rawNote: z.string().min(1, 'Note content is required').max(2000, 'Note too long'),
});

type CreateForm = z.infer<typeof createSchema>;

export default function CreateNoteScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { topic: '', rawNote: '' },
  });

  const onSubmit = async (data: CreateForm) => {
    setIsSubmitting(true);
    try {
      await apiClient.createNote(data.topic, data.rawNote) as NoteResponse;
      router.back();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to create note';
      Alert.alert('Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Note</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        <Controller
          control={control}
          name="topic"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.field}>
              <Text style={styles.label}>Topic</Text>
              <TextInput
                style={[styles.input, errors.topic && styles.inputError]}
                placeholder="e.g., TypeScript Generics"
                placeholderTextColor="#666"
                maxLength={100}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
              {errors.topic && <Text style={styles.error}>{errors.topic.message}</Text>}
            </View>
          )}
        />

        <Controller
          control={control}
          name="rawNote"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.field}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea, errors.rawNote && styles.inputError]}
                placeholder="Write your key points, concepts, and thoughts..."
                placeholderTextColor="#666"
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                maxLength={2000}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
              {errors.rawNote && <Text style={styles.error}>{errors.rawNote.message}</Text>}
            </View>
          )}
        />

        <TouchableOpacity
          style={[styles.submit, isSubmitting && styles.submitDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Create Note</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  cancel: { color: '#6366f1', fontSize: 16 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  form: { flex: 1 },
  formContent: { paddingHorizontal: 24, paddingBottom: 40 },
  field: { marginBottom: 20 },
  label: { fontSize: 14, color: '#ccc', marginBottom: 8, fontWeight: '500' },
  input: {
    backgroundColor: '#252540',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: { minHeight: 160, paddingTop: 14 },
  inputError: { borderColor: '#e74c3c' },
  error: { color: '#e74c3c', fontSize: 12, marginTop: 4 },
  submit: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
