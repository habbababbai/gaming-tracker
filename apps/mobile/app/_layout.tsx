import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AppProviders } from '@/providers/app-providers';

export default function RootLayout() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: 1,
      },
    },
  });
  return (
    <AppProviders>
      <QueryClientProvider client={queryClient}>
        <Stack>
          <Stack.Screen name="index" options={{ title: 'Search' }} />
          <Stack.Screen name="games/[id]" options={{ title: 'Game' }} />
        </Stack>
        <StatusBar style="auto" />
      </QueryClientProvider>
    </AppProviders>
  );
}
