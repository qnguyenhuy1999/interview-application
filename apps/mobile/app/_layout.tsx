import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "../src/store/auth-store";

export default function RootLayout() {
  const router = useRouter();

  const init = useAuthStore((s) => s.init);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (!isInitialized) return;

    if (!token) {
      router.replace("/(auth)/login");
    } else {
      router.replace("/(tabs)");
    }
  }, [token, isInitialized]);

  if (!isInitialized) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
