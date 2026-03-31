import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/auth-store';
import { apiClient } from '../src/lib/api-client';

export default function RootLayout() {
  const router = useRouter();
  const { init, isInitialized, token } = useAuthStore();

  useEffect(() => {
    apiClient.setUnauthorizedHandler(() => {
      useAuthStore.getState().logout();
      router.replace('/(auth)/login');
    });
  }, []);

  useEffect(() => {
    init();
  }, []);

  if (!isInitialized) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!token ? (
        <>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </>
      ) : (
        <>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="notes/new"
            options={{
              headerShown: false,
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="notes/[id]"
            options={{
              headerShown: false,
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="quiz/[id]"
            options={{
              headerShown: false,
              presentation: 'card',
            }}
          />
        </>
      )}
    </Stack>
  );
}
