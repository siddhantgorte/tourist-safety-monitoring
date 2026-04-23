import { useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { tokenAtom } from '../atoms/auth';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const token = useAtomValue(tokenAtom);
  const router = useRouter();

  useEffect(() => {
    // Small delay to ensure layout is ready
    const timer = setTimeout(() => {
      if (token) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    }, 10);
    
    return () => clearTimeout(timer);
  }, [token]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
      <ActivityIndicator size="large" color="#10b981" />
    </View>
  );
}

