import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '@/constants/colors';
import { fontSizes } from '@/constants/fonts';
import { layout } from '@/constants/layout';

export default function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('notFound.title') }} />
      <View style={styles.container}>
        <Text style={styles.message}>{t('notFound.message')}</Text>
        <Link href="/" style={styles.link}>
          {t('notFound.goHome')}
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: layout.notFound.gap,
    backgroundColor: colors.background,
  },
  message: {
    fontSize: fontSizes.base,
    color: colors.text,
  },
  link: {
    fontSize: fontSizes.base,
    color: colors.text,
  },
});
