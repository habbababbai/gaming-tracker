import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppProviders } from '@/providers/app-providers';

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Search' }} />
        <Stack.Screen name="games/[id]" options={{ title: 'Game' }} />
      </Stack>
      <StatusBar style="auto" />
    </AppProviders>
  );
}
