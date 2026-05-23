import '@/i18n';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

import { AppProviders } from '@/providers/app-providers';

export default function RootLayout() {
  const { t } = useTranslation();

  return (
    <AppProviders>
      <Stack>
        <Stack.Screen name="index" options={{ title: t('screens.search') }} />
        <Stack.Screen name="games/[id]" options={{ title: t('screens.game') }} />
      </Stack>
      <StatusBar style="auto" />
    </AppProviders>
  );
}
